import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  AlertTriangle,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { usePWA } from '../../context/PWAContext';
import { formatThaiDate } from '../../utils/thaiDate';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    openAddTaskModal,
    openProfileModal,
    userSettings,
    searchQuery,
    setSearchQuery,
    tasks,
    timeConflict,
    dismissConflict,
    setActiveTab,
    openEditTaskModal,
  } = useWorkFlow();

  const { isInstalled, triggerInstall } = usePWA();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const urgentOrOverdue = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      (t.dueDate <= todayStr || t.priority === 'urgent' || t.priority === 'high')
  );

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E9E5F5] px-4 lg:px-6 py-3 pt-safe">
      {/* Time Conflict Alert Banner if any */}
      {timeConflict && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              {timeConflict.message}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('calendar');
                openEditTaskModal(timeConflict.task2);
              }}
              className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2 cursor-pointer"
            >
              ปรับเวลา
            </button>
            <button
              onClick={dismissConflict}
              className="p-1 hover:bg-amber-100 rounded text-amber-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile trigger & Date badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-[#F4F1FB] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-[#F8F7FC] border border-[#EBE7F7] px-3 py-1.5 rounded-xl text-xs font-medium text-[#514B62]">
            <CalendarIcon className="w-4 h-4 text-[#9B82D7]" />
            <span className="hidden sm:inline">
              {formatThaiDate(new Date(), { includeDayName: true, shortMonth: false })}
            </span>
            <span className="sm:hidden">
              {formatThaiDate(new Date(), { includeDayName: false, shortMonth: true })}
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-2 relative">
          <Search className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหางาน, แผนก, หรือบันทึก..."
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-[#F8F7FC] hover:bg-[#F4F1FB] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145] placeholder-[#9F99B0] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu((prev) => !prev)}
              className="p-2 rounded-xl text-[#676179] hover:text-[#373145] hover:bg-[#F4F1FB] relative transition-colors cursor-pointer"
              title="การแจ้งเตือนงาน"
            >
              <Bell className="w-5 h-5" />
              {urgentOrOverdue.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotificationMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E9E5F5] z-40 p-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0EDF9] mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#9B82D7]" />
                      <span className="font-semibold text-xs text-[#373145]">
                        การแจ้งเตือนสำคัญ ({urgentOrOverdue.length})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowNotificationMenu(false);
                        setActiveTab('reminders');
                      }}
                      className="text-xs text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {urgentOrOverdue.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
                        ไม่มีงานด่วนหรือเกินกำหนด ยอดเยี่ยมมาก!
                      </div>
                    ) : (
                      urgentOrOverdue.slice(0, 5).map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setShowNotificationMenu(false);
                            openEditTaskModal(t);
                          }}
                          className="p-2.5 rounded-xl bg-[#FAF9FD] hover:bg-[#F4F1FB] border border-[#EBE7F7] cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-[#373145] line-clamp-1">
                              {t.title}
                            </p>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                t.dueDate < todayStr
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-[#FFF0D9] text-amber-700'
                              }`}
                            >
                              {t.dueDate < todayStr ? 'เกินกำหนด' : 'วันนี้'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8C84A0] mt-1 flex items-center justify-between">
                            <span>{t.category}</span>
                            <span>{t.startTime ? `${t.startTime} น.` : ''}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Install App Button if not installed */}
          {!isInstalled && (
            <button
              type="button"
              onClick={triggerInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9E1FF] hover:bg-[#dfd3fd] text-[#6B46C1] text-xs font-semibold border border-[#D8CCF7] shadow-2xs transition-all cursor-pointer"
              title="ติดตั้ง WorkFlow บนมือถือหรือคอมพิวเตอร์"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="hidden sm:inline">ติดตั้งแอป</span>
            </button>
          )}

          {/* Primary Quick Add Button */}
          <button
            onClick={() => openAddTaskModal()}
            className="flex items-center gap-1.5 bg-[#9B82D7] hover:bg-[#886ec9] active:scale-[0.98] text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium shadow-xs shadow-[#9B82D7]/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่มงาน</span>
          </button>

          {/* User Profile Avatar Trigger */}
          <button
            onClick={openProfileModal}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-[#F4F1FB] border border-transparent hover:border-[#E8E2F5] transition-all cursor-pointer group"
            title="คลิกเพื่อแก้ไขข้อมูลโปรไฟล์ (ชื่อ / ตำแหน่งงาน)"
          >
            <img
              src={userSettings.avatarUrl}
              alt={userSettings.userName}
              className="w-7 h-7 rounded-full object-cover border border-[#D9D1EB] group-hover:border-[#9B82D7] transition-colors"
            />
            <span className="hidden md:inline text-xs font-semibold text-[#373145] group-hover:text-[#6B46C1] max-w-[110px] truncate transition-colors">
              {userSettings.userName.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
