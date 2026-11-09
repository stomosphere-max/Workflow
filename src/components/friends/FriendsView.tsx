import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  UserCheck,
  AlertCircle,
  LogIn,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Friend, FriendRequest, UserProfile } from '../../types';
import { FriendCalendarModal } from './FriendCalendarModal';

export const FriendsView: React.FC = () => {
  const {
    currentUser,
    userProfile,
    openAuthModal,
    friends,
    incomingRequests,
    sentRequests,
    searchUsersByUsername,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    updateUserProfileData,
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected friend for calendar modal
  const [selectedFriendForCalendar, setSelectedFriendForCalendar] = useState<Friend | null>(null);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsersByUsername(searchQuery);
        setSearchResults(results);
      } catch (err: any) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsersByUsername]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSendRequest = async (target: UserProfile) => {
    try {
      await sendFriendRequest(target);
      showFeedback('success', `ส่งคำขอเป็นเพื่อนไปยัง @${target.username} เรียบร้อยแล้ว`);
    } catch (err: any) {
      showFeedback('error', err.message || 'ไม่สามารถส่งคำขอเป็นเพื่อนได้');
    }
  };

  const handleAccept = async (req: FriendRequest) => {
    try {
      await acceptFriendRequest(req);
      showFeedback('success', `คุณและ @${req.senderUsername} เป็นเพื่อนกันแล้ว!`);
    } catch (err: any) {
      showFeedback('error', err.message || 'ไม่สามารถยอมรับคำขอได้');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      showFeedback('success', 'ปฏิเสธคำขอเรียบร้อยแล้ว');
    } catch (err: any) {
      showFeedback('error', err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      showFeedback('success', 'ยกเลิกคำขอเรียบร้อยแล้ว');
    } catch (err: any) {
      showFeedback('error', err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleUnfriend = async (friend: Friend) => {
    if (confirm(`คุณต้องการยกเลิกเป็นเพื่อนกับ @${friend.friendUsername} ใช่หรือไม่?`)) {
      try {
        await removeFriend(friend.friendUid);
        showFeedback('success', `ยกเลิกเป็นเพื่อนกับ @${friend.friendUsername} แล้ว`);
      } catch (err: any) {
        showFeedback('error', err.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  // Helper to determine friendship status of a searched user
  const getRelationStatus = (uid: string) => {
    const isFriend = friends.some((f) => f.friendUid === uid);
    if (isFriend) return 'friends';
    const isSent = sentRequests.some((r) => r.receiverId === uid);
    if (isSent) return 'sent';
    const isIncoming = incomingRequests.some((r) => r.senderId === uid);
    if (isIncoming) return 'incoming';
    return 'none';
  };

  // If user is not logged in, prompt sign in
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-br from-white via-[#FAF9FD] to-[#F1EDFB] rounded-3xl p-8 border border-[#E9E5F5] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#373145]">
              WorkFlow Social – เชื่อมต่อและทำงานร่วมกับเพื่อน
            </h2>
            <p className="text-xs text-[#827A94] mt-1.5 leading-relaxed">
              เข้าสู่ระบบเพื่อค้นหาเพื่อนร่วมงานด้วย Username, เพิ่มเพื่อน, แชร์ปฏิทินงาน และวางแผนงานร่วมกันได้อย่างไร้รอยต่อ
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#9B82D7]/30 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ / สร้างบัญชีผู้ใช้</span>
            </button>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-[#373145]">ค้นหาเพื่อนด้วย Username</h3>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              ค้นหาเพื่อนร่วมทีมได้อย่างรวดเร็วโดยไม่เปิดเผยอีเมลส่วนตัว
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#DDF3E7] text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-[#373145]">แชร์ปฏิทินงานที่ปลอดภัย</h3>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              เพื่อนสามารถดูตารางงานและกำหนดส่งที่แชร์ได้ ช่วยให้ประสานงานง่ายขึ้น
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D9] text-amber-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-[#373145]">จัดการคำขอแบบเรียลไทม์</h3>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              ยอมรับหรือปฏิเสธคำขอเป็นเพื่อนได้อย่างอิสระ พร้อมระบบแจ้งเตือน
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-4xl">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-[#373145]">เพื่อนและเครือข่ายงาน (WorkFlow Social)</h2>
          </div>
          <p className="text-xs text-[#827A94] mt-1">
            ค้นหาเพื่อนด้วย Username, จัดการคำขอ, และแชร์ปฏิทินงานร่วมกัน
          </p>
        </div>

        {/* Profile mini status & calendar sharing toggle */}
        <div className="flex items-center gap-3 bg-[#FAF9FD] p-2.5 rounded-xl border border-[#EBE7F7] self-start sm:self-center">
          <img
            src={userProfile?.photoURL || currentUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile?.username}`}
            alt="profile"
            className="w-9 h-9 rounded-full object-cover border border-[#9B82D7]"
          />
          <div className="text-xs">
            <p className="font-bold text-[#373145] leading-none">{userProfile?.displayName}</p>
            <p className="text-[11px] text-[#7C3AED] font-semibold mt-0.5">@{userProfile?.username}</p>
          </div>

          <div className="pl-2 border-l border-[#E5E1F2]">
            <label
              className="flex items-center gap-1.5 text-[11px] text-[#676179] cursor-pointer"
              title="เปิด/ปิดการอนุญาตให้เพื่อนดูปฏิทินงานของคุณ"
            >
              <input
                type="checkbox"
                checked={userProfile?.calendarSharingEnabled ?? true}
                onChange={(e) =>
                  updateUserProfileData({ calendarSharingEnabled: e.target.checked })
                }
                className="w-3.5 h-3.5 accent-[#9B82D7] rounded cursor-pointer"
              />
              <span className="hidden md:inline">แชร์ปฏิทิน</span>
            </label>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-[#E9E5F5] gap-2">
        <button
          onClick={() => setActiveSubTab('friends')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'friends'
              ? 'border-[#9B82D7] text-[#7C3AED]'
              : 'border-transparent text-[#7A748A] hover:text-[#373145]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>เพื่อนของฉัน</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#E9E1FF] text-[#7C3AED] text-[10px] font-bold">
            {friends.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'requests'
              ? 'border-[#9B82D7] text-[#7C3AED]'
              : 'border-transparent text-[#7A748A] hover:text-[#373145]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>คำขอเป็นเพื่อน</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('search')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'search'
              ? 'border-[#9B82D7] text-[#7C3AED]'
              : 'border-transparent text-[#7A748A] hover:text-[#373145]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>ค้นหาเพื่อนใหม่</span>
        </button>
      </div>

      {/* Tab 1: My Friends */}
      {activeSubTab === 'friends' && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-[#E9E5F5] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7FC] text-[#9B82D7] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 opacity-60" />
              </div>
              <p className="font-bold text-sm text-[#373145]">ยังไม่มีรายชื่อเพื่อน</p>
              <p className="text-xs text-[#827A94] max-w-sm mx-auto">
                ไปที่แท็บ &quot;ค้นหาเพื่อนใหม่&quot; เพื่อค้นหาเพื่อนร่วมงานด้วย Username แล้วส่งคำขอได้ทันที
              </p>
              <button
                onClick={() => setActiveSubTab('search')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886EC9] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>ค้นหาเพื่อนเลย</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {friends.map((f) => (
                <div
                  key={f.friendUid}
                  className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs flex items-center justify-between gap-3 hover:border-[#D8CCF7] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        f.friendPhotoURL ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${f.friendUsername}`
                      }
                      alt={f.friendDisplayName}
                      className="w-11 h-11 rounded-full object-cover border border-[#9B82D7] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#373145] truncate">
                        {f.friendDisplayName}
                      </p>
                      <p className="text-[11px] text-[#7C3AED] font-medium truncate">
                        @{f.friendUsername}
                      </p>
                      <p className="text-[10px] text-[#8C84A0] truncate">
                        เป็นเพื่อนตั้งแต่{' '}
                        {f.since ? new Date(f.since).toLocaleDateString('th-TH') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedFriendForCalendar(f)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF9FD] hover:bg-[#F1EDFB] text-[#7C3AED] text-xs font-semibold border border-[#E5DEFA] cursor-pointer transition-colors"
                      title="ดูปฏิทินงานของเพื่อน"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ดูปฏิทิน</span>
                    </button>

                    <button
                      onClick={() => handleUnfriend(f)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="ยกเลิกเป็นเพื่อน"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Friend Requests */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming requests */}
          <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs">
            <h3 className="font-bold text-xs text-[#373145] mb-3 flex items-center gap-2">
              <span>คำขอที่ได้รับ</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#7C3AED] text-[10px] font-bold">
                {incomingRequests.length}
              </span>
            </h3>

            {incomingRequests.length === 0 ? (
              <p className="text-xs text-[#8C84A0] py-3 text-center">ไม่มีคำขอเป็นเพื่อนในขณะนี้</p>
            ) : (
              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          req.senderPhotoURL ||
                          `https://api.dicebear.com/7.x/notionists/svg?seed=${req.senderUsername}`
                        }
                        alt="sender"
                        className="w-10 h-10 rounded-full object-cover border border-[#9B82D7]"
                      />
                      <div>
                        <p className="font-bold text-[#373145]">{req.senderDisplayName}</p>
                        <p className="text-[11px] text-[#7C3AED]">@{req.senderUsername}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-2xs cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ยอมรับ</span>
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent requests */}
          <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs">
            <h3 className="font-bold text-xs text-[#373145] mb-3 flex items-center gap-2">
              <span>คำขอที่ส่งไป (รอการตอบรับ)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FAF9FD] text-[#676179] text-[10px] font-bold">
                {sentRequests.length}
              </span>
            </h3>

            {sentRequests.length === 0 ? (
              <p className="text-xs text-[#8C84A0] py-3 text-center">ไม่มีคำขอที่ค้างอยู่</p>
            ) : (
              <div className="space-y-2.5">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#373145]">
                        ส่งคำขอไปยัง @{req.receiverUsername}
                      </p>
                      <p className="text-[11px] text-[#8C84A0]">
                        ส่งเมื่อ {new Date(req.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold text-xs border border-rose-200 cursor-pointer transition-colors"
                    >
                      ยกเลิกคำขอ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Search Friends */}
      {activeSubTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9F99B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเพื่อนด้วย Username (เช่น somchai_work)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-xs sm:text-sm text-[#373145]"
              />
            </div>
            <p className="text-[11px] text-[#8C84A0] mt-2">
              พิมพ์ชื่อผู้ใช้เพื่อค้นหา (ไม่ต้องใส่เครื่องหมาย @)
            </p>
          </div>

          {searching && (
            <div className="py-8 text-center text-xs text-[#8C84A0]">
              <div className="w-5 h-5 border-2 border-[#9B82D7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              กำลังค้นหา...
            </div>
          )}

          {!searching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-[#E9E5F5] text-center text-xs text-[#8C84A0]">
              ไม่พบผู้ใช้ที่ตรงกับ &quot;{searchQuery}&quot;
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {searchResults.map((user) => {
              const status = getRelationStatus(user.uid);
              return (
                <div
                  key={user.uid}
                  className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        user.photoURL ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`
                      }
                      alt={user.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-[#9B82D7] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#373145] truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-[#7C3AED] font-semibold truncate">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="text-[10px] text-[#8C84A0] truncate max-w-[180px]">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {status === 'friends' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>เป็นเพื่อนแล้ว</span>
                      </span>
                    )}

                    {status === 'sent' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFF0D9] text-amber-700 font-semibold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ส่งคำขอแล้ว</span>
                      </span>
                    )}

                    {status === 'incoming' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E9E1FF] text-[#7C3AED] font-semibold text-xs">
                        <span>ส่งคำขอมาถึงคุณ</span>
                      </span>
                    )}

                    {status === 'none' && (
                      <button
                        onClick={() => handleSendRequest(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white font-semibold text-xs shadow-xs cursor-pointer transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>เพิ่มเพื่อน</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friend Calendar Modal */}
      {selectedFriendForCalendar && (
        <FriendCalendarModal
          friend={selectedFriendForCalendar}
          onClose={() => setSelectedFriendForCalendar(null)}
        />
      )}
    </div>
  );
};
