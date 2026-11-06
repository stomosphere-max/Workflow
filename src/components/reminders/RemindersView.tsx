import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  CalendarDays,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { Task } from '../../types';
import { formatThaiDate, getRelativeDueLabel } from '../../utils/thaiDate';
import { PriorityBadge } from '../common/PriorityBadge';

export const RemindersView: React.FC = () => {
  const {
    tasks,
    updateTask,
    toggleTaskComplete,
    openEditTaskModal,
    openAddTaskModal,
  } = useWorkFlow();

  const [snoozeFeedback, setSnoozeFeedback] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Snooze function: add days to dueDate
  const handleSnooze = (task: Task, daysToAdd: number) => {
    const current = new Date(task.dueDate);
    current.setDate(current.getDate() + daysToAdd);
    const newDueDate = current.toISOString().split('T')[0];
    updateTask(task.id, { dueDate: newDueDate });

    setSnoozeFeedback(`เลื่อนกำหนดส่งของ "${task.title}" ไปอีก ${daysToAdd} วันเรียบร้อยแล้ว`);
    setTimeout(() => setSnoozeFeedback(null), 3500);
  };

  // Group tasks
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate < todayStr);
  const todayTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate === todayStr);

  const twoDaysLaterStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  })();

  const soonTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate > todayStr && t.dueDate <= twoDaysLaterStr
  );

  const importantMeetings = tasks.filter(
    (t) => t.status !== 'done' && t.isImportantMeeting
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-[#373145]">ศูนย์การแจ้งเตือนงาน</h2>
          </div>
          <p className="text-xs text-[#827A94] mt-1">
            ติดตามงานที่ใกล้ถึงกำหนด งานที่เกินกำหนด และการนัดหมายสำคัญทั้งหมดในที่เดียว
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มงานแจ้งเตือน</span>
        </button>
      </div>

      {snoozeFeedback && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center justify-between animate-in fade-in">
          <span>{snoozeFeedback}</span>
        </div>
      )}

      {/* 1. Overdue Section */}
      <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-sm text-[#373145]">
              งานที่เกินกำหนดส่ง (Overdue)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
              {overdueTasks.length} งาน
            </span>
          </div>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
            ไม่มีงานที่เกินกำหนด เยี่ยมมาก!
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map((t) => {
              const dueInfo = getRelativeDueLabel(t.dueDate);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-800">{t.title}</span>
                      <PriorityBadge priority={t.priority} size="xs" />
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold">
                        {dueInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-rose-700/80 mt-1">
                      หมวดหมู่: {t.category} | กำหนดส่งเดิม:{' '}
                      {formatThaiDate(t.dueDate, { shortMonth: true })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSnooze(t, 1)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                    >
                      +1 วัน
                    </button>
                    <button
                      onClick={() => handleSnooze(t, 3)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                    >
                      +3 วัน
                    </button>
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      เสร็จแล้ว
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Due Today Section */}
      <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-[#373145]">
              งานที่ต้องส่งหรือดำเนินการวันนี้ (Due Today)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0D9] text-amber-800 font-bold">
              {todayTasks.length} งาน
            </span>
          </div>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            ไม่มีงานที่ต้องส่งวันนี้
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-amber-200 bg-[#FFF0D9]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#373145]">{t.title}</span>
                    <PriorityBadge priority={t.priority} size="xs" />
                    {t.startTime && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#514B62] font-semibold border border-amber-200">
                        {t.startTime} - {t.endTime} น.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.category} {t.department ? `| แผนก: ${t.department}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditTaskModal(t)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => toggleTaskComplete(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold cursor-pointer"
                  >
                    ทำเสร็จแล้ว
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Due in 24-48h */}
      <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="font-bold text-sm text-[#373145]">
              งานในอีก 24 - 48 ชั่วโมง (Due Soon)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1] font-bold">
              {soonTasks.length} งาน
            </span>
          </div>
        </div>

        {soonTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            ไม่มีงานที่ใกล้กำหนดส่งในช่วงนี้
          </div>
        ) : (
          <div className="space-y-3">
            {soonTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-[#E9E5F5] bg-white hover:bg-[#FAF9FD] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-[#373145]">{t.title}</h4>
                    <PriorityBadge priority={t.priority} size="xs" />
                  </div>
                  <p className="text-[11px] text-[#8C84A0] mt-1">
                    {t.category} | ครบกำหนด: {formatThaiDate(t.dueDate, { shortMonth: true })}
                  </p>
                </div>

                <button
                  onClick={() => openEditTaskModal(t)}
                  className="text-xs text-[#7C3AED] hover:underline font-semibold cursor-pointer"
                >
                  ดูรายละเอียด
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Important Meetings */}
      {importantMeetings.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EDF9] mb-4">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-[#373145]">
              การประชุมและการนัดหมายสำคัญ ({importantMeetings.length})
            </h3>
          </div>

          <div className="space-y-3">
            {importantMeetings.map((t) => (
              <div
                key={t.id}
                onClick={() => openEditTaskModal(t)}
                className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] flex items-center justify-between cursor-pointer hover:bg-[#F4F1FB]"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#373145]">{t.title}</h4>
                  <p className="text-[11px] text-[#8C84A0] mt-1">
                    วันที่: {formatThaiDate(t.dueDate, { shortMonth: true })}{' '}
                    {t.startTime ? `เวลา ${t.startTime} - ${t.endTime} น.` : ''}
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1] font-semibold">
                  ประชุมสำคัญ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
