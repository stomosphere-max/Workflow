import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, User, Sparkles, Tag, Shield } from 'lucide-react';
import { Friend } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatThaiDate } from '../../utils/thaiDate';

interface FriendCalendarModalProps {
  friend: Friend | null;
  onClose: () => void;
}

export const FriendCalendarModal: React.FC<FriendCalendarModalProps> = ({ friend, onClose }) => {
  const { fetchFriendTasks } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friend) return;
    setLoading(true);
    fetchFriendTasks(friend.friendUid)
      .then((data) => {
        setTasks(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [friend]);

  if (!friend) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E9E1FF] relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F4F1FB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Friend Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#F0EDF9]">
          <img
            src={friend.friendPhotoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${friend.friendUsername}`}
            alt={friend.friendDisplayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#9B82D7]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#373145]">
                {friend.friendDisplayName}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#7C3AED] font-semibold">
                @{friend.friendUsername}
              </span>
            </div>
            <p className="text-xs text-[#827A94] flex items-center gap-1.5 mt-0.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#9B82D7]" />
              <span>ปฏิทินงานที่แชร์ (มุมมองแบบอ่านอย่างเดียว)</span>
            </p>
          </div>
        </div>

        {/* Calendar Tasks List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#827A94]">
              <div className="w-6 h-6 border-2 border-[#9B82D7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              กำลังโหลดปฏิทินงานของ @{friend.friendUsername}...
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#827A94] bg-[#FAF9FD] rounded-2xl border border-[#EBE7F7] p-6">
              <CalendarIcon className="w-8 h-8 text-[#9B82D7] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-[#373145]">ยังไม่มีงานที่แชร์ในปฏิทินขณะนี้</p>
              <p className="text-[11px] text-[#8C84A0] mt-1">
                เมื่อเพื่อนของคุณบันทึกงานใหม่ คุณจะสามารถดูตารางเวลาและกำหนดส่งได้ที่นี่
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-[#FAF9FD] border border-[#EBE7F7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#373145]">{task.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#E9E1FF] text-[#7C3AED]'
                        }`}
                      >
                        {task.priority === 'urgent' ? 'ด่วนมาก' : task.priority === 'high' ? 'ด่วน' : 'ปกติ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8C84A0]">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-[#9B82D7]" />
                        <span>
                          {formatThaiDate(task.dueDate, { includeDayName: true, shortMonth: true })}
                        </span>
                      </span>
                      {task.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#9B82D7]" />
                          <span>
                            {task.startTime} {task.endTime ? `- ${task.endTime}` : ''} น.
                          </span>
                        </span>
                      )}
                      {task.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#9B82D7]" />
                          <span>{task.category}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center text-[10px] font-semibold px-2.5 py-1 rounded-xl ${
                      task.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.status === 'done'
                      ? 'เสร็จสิ้น'
                      : task.status === 'in_progress'
                      ? 'กำลังทำ'
                      : 'รอดำเนินการ'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#F0EDF9] flex items-center justify-between text-[11px] text-[#8C84A0]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>เชื่อมต่อผ่านระบบ WorkFlow Social อย่างปลอดภัย</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FAF9FD] hover:bg-[#F1EDFB] text-[#7C3AED] font-semibold cursor-pointer transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
