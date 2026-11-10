export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g., 'การตลาด', 'การเงิน', 'ไอที', 'บริหาร'
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  subtasks: SubTask[];
  assignedTo?: string; // for team context
  department?: string;
  estimatedHours?: number;
  actualHours?: number;
  isImportantMeeting?: boolean;
  reminderMinutesBefore?: number; // 15, 30, 60, 1440
  isSharedWithFriends?: boolean; // share on friends calendar (default: false / private)
  canFriendsEdit?: boolean; // allow connected friends to edit details (cannot delete or change ownership)
  completedAt?: string;
  createdAt: string;
}

export interface FollowUpItem {
  id: string;
  contactName: string;
  department: string;
  taskTitle: string;
  channel: 'LINE' | 'Email' | 'โทรศัพท์' | 'พบปะพูดคุย' | 'Slack';
  dueDate: string; // YYYY-MM-DD
  lastContactDate?: string;
  status: 'waiting' | 'follow_again' | 'resolved';
  notes?: string;
  urgent: boolean;
  createdAt: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  color: string; // hex
  bgColor: string; // hex
  borderColor: string; // hex
}

export interface UserSettings {
  userName: string;
  userRole: string;
  department: string;
  avatarUrl: string;
  workStartTime: string;
  workEndTime: string;
  workingDays: number[]; // 1 = Monday ... 5 = Friday
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: string;
  priority: PriorityLevel;
  status: TaskStatus;
}

export interface UserProfile {
  uid: string;
  email?: string; // Private sensitive info kept in /users/{userId}/private/info
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  calendarSharingEnabled?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FriendRequest {
  id: string; // senderId_receiverId
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderPhotoURL: string;
  receiverId: string;
  receiverUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface Friend {
  friendUid: string;
  friendUsername: string;
  friendDisplayName: string;
  friendPhotoURL: string;
  bio?: string;
  since: string;
  calendarSharingEnabled?: boolean;
}

