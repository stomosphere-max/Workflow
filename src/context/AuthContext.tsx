import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Friend, FriendRequest, UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot_password') => void;
  closeAuthModal: () => void;

  // Auth Operations
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;

  // Friends & Social
  friends: Friend[];
  incomingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  searchUsersByUsername: (queryStr: string) => Promise<UserProfile[]>;
  sendFriendRequest: (targetUser: UserProfile) => Promise<void>;
  acceptFriendRequest: (req: FriendRequest) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  fetchFriendTasks: (friendUid: string) => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Friends state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  const openAuthModal = (mode: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or listen to user profile
        const userDocRef = doc(db, 'users', user.uid);
        let snapshot;
        try {
          snapshot = await getDoc(userDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
          return;
        }

        if (snapshot && snapshot.exists()) {
          setUserProfile({
            ...(snapshot.data() as UserProfile),
            email: user.email || (snapshot.data() as UserProfile).email || '',
          });
        } else {
          // Auto-provision profile if signing in via Google for the first time
          const rawBase = (user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '_');
          const safeBase = (rawBase.length >= 3 ? rawBase : `user_${rawBase}`).slice(0, 14);
          let chosenUsername = `${safeBase}_${Math.floor(100 + Math.random() * 900)}`;

          try {
            const checkUname = await getDoc(doc(db, 'usernames', chosenUsername));
            if (checkUname.exists()) {
              chosenUsername = `${safeBase}_${Date.now().toString().slice(-4)}`;
            }
          } catch (unameErr) {
            console.warn('Username availability check error, using generated:', unameErr);
          }

          const now = new Date().toISOString();
          const initialProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            username: chosenUsername,
            displayName: (user.displayName || 'สมาชิก WorkFlow').slice(0, 100),
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.uid}`,
            bio: 'ยินดีที่ได้รู้จัก! กำลังวางแผนงานด้วย WorkFlow',
            calendarSharingEnabled: true,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          };

          const batch = writeBatch(db);
          batch.set(userDocRef, initialProfile);
          batch.set(doc(db, 'users', user.uid, 'private', 'info'), {
            email: user.email || '',
            emailVerified: user.emailVerified || false,
          });
          batch.set(doc(db, 'usernames', chosenUsername), {
            uid: user.uid,
            username: chosenUsername,
          });

          try {
            await batch.commit();
            setUserProfile(initialProfile);
          } catch (batchErr) {
            handleFirestoreError(batchErr, OperationType.CREATE, `users/${user.uid}`);
          }
        }
      } else {
        setUserProfile(null);
        setFriends([]);
        setIncomingRequests([]);
        setSentRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time listeners for Friends & Requests when authenticated
  useEffect(() => {
    if (!currentUser) return;

    // Listen to Friends subcollection
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    const unsubFriends = onSnapshot(
      friendsRef,
      (snapshot) => {
        const loaded: Friend[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Friend);
        });
        setFriends(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/friends`);
      }
    );

    // Listen to incoming requests
    const incQuery = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsubInc = onSnapshot(
      incQuery,
      (snapshot) => {
        const list: FriendRequest[] = [];
        snapshot.forEach((d) => list.push(d.data() as FriendRequest));
        setIncomingRequests(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'friend_requests?receiverId');
      }
    );

    // Listen to sent requests
    const sentQuery = query(
      collection(db, 'friend_requests'),
      where('senderId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsubSent = onSnapshot(
      sentQuery,
      (snapshot) => {
        const list: FriendRequest[] = [];
        snapshot.forEach((d) => list.push(d.data() as FriendRequest));
        setSentRequests(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'friend_requests?senderId');
      }
    );

    return () => {
      unsubFriends();
      unsubInc();
      unsubSent();
    };
  }, [currentUser]);

  // Auth: Email login
  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    closeAuthModal();
  };

  // Auth: Email Register with unique username validation
  const registerWithEmail = async (
    email: string,
    pass: string,
    rawUsername: string,
    displayName: string
  ) => {
    const cleanUsername = rawUsername.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      throw new Error('ชื่อผู้ใช้ (Username) ต้องมีความยาว 3-20 ตัวอักษร ประกอบด้วย a-z, 0-9 และ _ เท่านั้น');
    }

    // Check if username already exists
    const usernameDocRef = doc(db, 'usernames', cleanUsername);
    const checkUsername = await getDoc(usernameDocRef);
    if (checkUsername.exists()) {
      throw new Error(`ชื่อผู้ใช้ @${cleanUsername} มีผู้อื่นใช้งานแล้ว กรุณาเลือกชื่ออื่น`);
    }

    // Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;

    const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}`;

    // Update Auth Profile
    await updateProfile(user, {
      displayName: displayName.trim(),
      photoURL: defaultAvatar,
    });

    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn('Send email verification notice:', e);
    }

    // Firestore batch writes
    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      email: email.trim(),
      username: cleanUsername,
      displayName: displayName.trim(),
      photoURL: defaultAvatar,
      bio: 'สมาชิกใหม่แห่ง WorkFlow Social',
      calendarSharingEnabled: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.uid), profile);
    batch.set(doc(db, 'users', user.uid, 'private', 'info'), {
      email: email.trim(),
      emailVerified: false,
    });
    batch.set(usernameDocRef, {
      uid: user.uid,
      username: cleanUsername,
    });

    await batch.commit();
    setUserProfile(profile);
    closeAuthModal();
  };

  // Auth: Google Login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    closeAuthModal();
  };

  // Auth: Logout
  const logoutUser = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Auth: Reset password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Auth: Resend verification
  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Update profile
  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const now = new Date().toISOString();
    const updated = {
      ...updates,
      updatedAt: now,
    };
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, updated);
      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }

    if (updates.displayName || updates.photoURL) {
      try {
        await updateProfile(currentUser, {
          displayName: updates.displayName || currentUser.displayName,
          photoURL: updates.photoURL || currentUser.photoURL,
        });
      } catch (authErr) {
        console.warn('Update Auth profile error:', authErr);
      }
    }
  };

  // Search users by username
  const searchUsersByUsername = useCallback(
    async (queryStr: string): Promise<UserProfile[]> => {
      if (!currentUser || !queryStr.trim()) return [];
      const clean = queryStr.trim().toLowerCase();

      try {
        // Query users collection
        const q = query(
          collection(db, 'users'),
          where('username', '>=', clean),
          where('username', '<=', clean + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        const results: UserProfile[] = [];
        snapshot.forEach((d) => {
          const u = d.data() as UserProfile;
          // Exclude oneself
          if (u.uid !== currentUser.uid) {
            results.push(u);
          }
        });
        return results;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users?search');
        return [];
      }
    },
    [currentUser]
  );

  // Send friend request
  const sendFriendRequest = async (targetUser: UserProfile) => {
    if (!currentUser || !userProfile) throw new Error('กรุณาเข้าสู่ระบบก่อนส่งคำขอ');
    if (targetUser.uid === currentUser.uid) throw new Error('ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้');

    const requestId = `${currentUser.uid}_${targetUser.uid}`;
    const reqRef = doc(db, 'friend_requests', requestId);

    // Check if already friends
    const friendRef = doc(db, 'users', currentUser.uid, 'friends', targetUser.uid);
    const friendSnap = await getDoc(friendRef);
    if (friendSnap.exists()) {
      throw new Error(`คุณและ @${targetUser.username} เป็นเพื่อนกันอยู่แล้ว`);
    }

    const payload: FriendRequest = {
      id: requestId,
      senderId: currentUser.uid,
      senderUsername: userProfile.username,
      senderDisplayName: userProfile.displayName,
      senderPhotoURL: userProfile.photoURL,
      receiverId: targetUser.uid,
      receiverUsername: targetUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await setDoc(reqRef, payload);
  };

  // Accept friend request
  const acceptFriendRequest = async (req: FriendRequest) => {
    if (!currentUser || !userProfile) return;
    const now = new Date().toISOString();

    const batch = writeBatch(db);

    // 1. Update request status to accepted
    const reqRef = doc(db, 'friend_requests', req.id);
    batch.update(reqRef, {
      status: 'accepted',
      updatedAt: now,
    });

    // 2. Add to sender's friends list
    const senderFriendRef = doc(db, 'users', req.senderId, 'friends', currentUser.uid);
    batch.set(senderFriendRef, {
      friendUid: currentUser.uid,
      friendUsername: userProfile.username,
      friendDisplayName: userProfile.displayName,
      friendPhotoURL: userProfile.photoURL,
      since: now,
    });

    // 3. Add to receiver's friends list
    const receiverFriendRef = doc(db, 'users', currentUser.uid, 'friends', req.senderId);
    batch.set(receiverFriendRef, {
      friendUid: req.senderId,
      friendUsername: req.senderUsername,
      friendDisplayName: req.senderDisplayName,
      friendPhotoURL: req.senderPhotoURL,
      since: now,
    });

    await batch.commit();
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId: string) => {
    const reqRef = doc(db, 'friend_requests', requestId);
    await deleteDoc(reqRef);
  };

  // Cancel sent friend request
  const cancelFriendRequest = async (requestId: string) => {
    const reqRef = doc(db, 'friend_requests', requestId);
    await deleteDoc(reqRef);
  };

  // Remove / unfriend
  const removeFriend = async (friendUid: string) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', currentUser.uid, 'friends', friendUid));
    batch.delete(doc(db, 'users', friendUid, 'friends', currentUser.uid));
    await batch.commit();
  };

  // Fetch friend's tasks for shared calendar
  const fetchFriendTasks = async (friendUid: string): Promise<any[]> => {
    try {
      const tasksRef = collection(db, 'users', friendUid, 'tasks');
      const snap = await getDocs(tasksRef);
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      return list;
    } catch (e) {
      console.warn('Fetch friend tasks:', e);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logoutUser,
        resetPassword,
        resendVerification,
        updateUserProfileData,
        friends,
        incomingRequests,
        sentRequests,
        searchUsersByUsername,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        removeFriend,
        fetchFriendTasks,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
