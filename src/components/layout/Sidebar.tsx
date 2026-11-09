import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Bell,
  Users,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  Clock,
  X,
  Edit3,
  UserCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useWorkFlow, MainNavTab } from '../../context/WorkFlowContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    openAddTaskModal,
    openProfileModal,
    stats,
    followUps,
    userSettings,
  } = useWorkFlow();

  const {
    currentUser,
    userProfile,
    openAuthModal,
    logoutUser,
    incomingRequests,
  } = useAuth();

  const pendingFollowUps = followUps.filter(
    (f) => f.status === 'waiting' || f.status === 'follow_again'
  ).length;

  const navItems: {
    id: MainNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'ภาพรวมงาน',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'ปฏิทินงาน',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'งานของฉัน',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: stats.todo + stats.inProgress,
      badgeColor: 'bg-[#E9E1FF] text-[#7C3AED]',
    },
    {
      id: 'friends',
      label: 'เพื่อน & แชร์ปฏิทิน',
      icon: <UserCheck className="w-5 h-5 text-[#9B82D7]" />,
      badge: incomingRequests.length > 0 ? incomingRequests.length : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse',
    },
    {
      id: 'reminders',
      label: 'การแจ้งเตือน',
      icon: <Bell className="w-5 h-5" />,
      badge: stats.overdue > 0 ? stats.overdue : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 animate-pulse',
    },
    {
      id: 'followup',
      label: 'งานติดตาม',
      icon: <Users className="w-5 h-5" />,
      badge: pendingFollowUps > 0 ? pendingFollowUps : undefined,
      badgeColor: 'bg-[#FFF0D9] text-amber-700',
    },
    {
      id: 'ai',
      label: 'ผู้ช่วย AI',
      icon: <Sparkles className="w-5 h-5 text-[#9B82D7]" />,
      badge: stats.urgent > 0 ? stats.urgent : undefined,
      badgeColor: 'bg-[#E9E1FF] text-[#7C3AED]',
    },
    {
      id: 'weekly',
      label: 'สรุปรายสัปดาห์',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-[#E9E5F5] flex flex-col justify-between transition-transform duration-200 ease-in-out pt-safe pb-safe ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header Brand */}
          <div className="p-5 border-b border-[#F0EDF9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9B82D7] to-[#BFA9F0] flex items-center justify-center text-white shadow-sm shadow-[#9B82D7]/30">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#373145] tracking-tight">WorkFlow</h1>
                <p className="text-xs text-[#827A94] font-medium leading-none">
                  Smart Personal Planner
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Task Button */}
          <div className="p-4 pb-2">
            <button
              onClick={() => {
                openAddTaskModal();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#9B82D7]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มงานใหม่</span>
            </button>
          </div>

          {/* Concept Banner */}
          <div className="px-4 py-2">
            <div className="bg-[#F8F7FC] border border-[#EBE7F7] rounded-xl p-3 text-xs text-[#6F6782] flex items-start gap-2.5">
              <span className="text-[#9B82D7] font-bold text-sm">💡</span>
              <p className="leading-relaxed">
                <span className="font-semibold text-[#514B62]">จัดการทุกงานให้เป็นระบบ</span>
                <br />
                ไม่ต้องจำทุกอย่างไว้ในหัว
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#E9E1FF] text-[#6B46C1] shadow-xs'
                      : 'text-[#676179] hover:bg-[#F8F7FC] hover:text-[#373145]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-[#6B46C1]' : 'text-[#8C84A0]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Working hours badge */}
          <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-[#F4F1FB] border border-[#E8E3F5]">
            <div className="flex items-center gap-2 text-xs text-[#676179] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#9B82D7]" />
              <span className="font-semibold">เวลาทำงานวันนี้</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#463F56]">
              <span>{userSettings.workStartTime} - {userSettings.workEndTime} น.</span>
              <span className="text-[#059669] bg-[#DDF3E7] px-1.5 py-0.5 rounded text-[11px] font-semibold">
                กำลังทำงาน
              </span>
            </div>
          </div>

          {/* User profile footer */}
          {currentUser ? (
            <div className="p-3.5 border-t border-[#F0EDF9] bg-[#FCFBFD] flex items-center justify-between gap-2">
              <div
                onClick={openProfileModal}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                title="คลิกเพื่อแก้ไขข้อมูลโปรไฟล์"
              >
                <img
                  src={
                    userProfile?.photoURL ||
                    currentUser.photoURL ||
                    userSettings.avatarUrl
                  }
                  alt={userProfile?.displayName || userSettings.userName}
                  className="w-9 h-9 rounded-full object-cover border border-[#D9D1EB] group-hover:border-[#9B82D7] transition-colors shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#373145] truncate group-hover:text-[#6B46C1] transition-colors">
                    {userProfile?.displayName || userSettings.userName}
                  </p>
                  <p className="text-[11px] text-[#7C3AED] truncate">
                    @{userProfile?.username || 'member'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                    logoutUser();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 border-t border-[#F0EDF9] bg-[#FAF9FD]">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full py-2 px-3 rounded-xl bg-[#E9E1FF] hover:bg-[#ded2fd] text-[#6B46C1] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
