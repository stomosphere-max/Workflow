import { CategoryDef, FollowUpItem, Task, UserSettings } from '../types';
import { toIsoDateString } from './thaiDate';

// Compute relative dates around current date
const now = new Date();
const getOffsetDateStr = (offsetDays: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return toIsoDateString(d);
};

export const INITIAL_CATEGORIES: CategoryDef[] = [
  {
    id: 'cat-marketing',
    name: 'การตลาด & แคมเปญ',
    color: '#7C3AED',
    bgColor: '#E9E1FF',
    borderColor: '#C4B5FD',
  },
  {
    id: 'cat-finance',
    name: 'การเงิน & งบประมาณ',
    color: '#059669',
    bgColor: '#DDF3E7',
    borderColor: '#A7F3D0',
  },
  {
    id: 'cat-management',
    name: 'ประชุม & กลยุทธ์',
    color: '#D97706',
    bgColor: '#FFF0D9',
    borderColor: '#FDE68A',
  },
  {
    id: 'cat-customer',
    name: 'ลูกค้า & คู่ค้า',
    color: '#DB2777',
    bgColor: '#FCE3EF',
    borderColor: '#FBCFE8',
  },
  {
    id: 'cat-hr-admin',
    name: 'ธุรการ & บุคคล',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_FOLLOW_UPS: FollowUpItem[] = [];

export const INITIAL_USER_SETTINGS: UserSettings = {
  userName: 'ศุภวิชญ์ พัฒนวรกุล (กัปตัน)',
  userRole: 'Senior Project & Operations Specialist',
  department: 'ฝ่ายบริหารโครงการและพัฒนาธุรกิจ',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  workStartTime: '08:30',
  workEndTime: '17:30',
  workingDays: [1, 2, 3, 4, 5],
  notificationsEnabled: true,
  soundEnabled: true,
};
