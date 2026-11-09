import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Flame,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Hourglass,
  Plus,
  RefreshCw,
  Building,
  Edit3,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { formatThaiDate, getRelativeDueLabel } from '../../utils/thaiDate';
import { PriorityBadge } from '../common/PriorityBadge';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    stats,
    setActiveTab,
    openAddTaskModal,
    openEditTaskModal,
    openProfileModal,
    toggleTaskComplete,
    userSettings,
  } = useWorkFlow();

  const [aiAdvice, setAiAdvice] = useState<string>('กำลังประมวลผลคำแนะนำจาก AI...');
  const [dailySlots, setDailySlots] = useState<{ timeSlot: string; taskId: string; action: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks scheduled for today
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  // Upcoming deadlines (next 3 days, not done, excluding today)
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'done' && t.dueDate > todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate < todayStr);

  // Fetch AI prioritization advice
  const fetchAiAdvice = async () => {
    if (tasks.length === 0) {
      setAiAdvice('ยินดีต้อนรับสู่ WorkFlow! ยังไม่มีรายการงานในระบบ คุณสามารถคลิกปุ่ม "เพิ่มงาน" เพื่อเริ่มต้นวางแผนงานของคุณได้ทันที');
      setDailySlots([]);
      setLoadingAi(false);
      return;
    }

    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAdvice(data.data.summary || data.data.aiAdvice);
        if (Array.isArray(data.data.dailyScheduleSuggestion)) {
          setDailySlots(data.data.dailyScheduleSuggestion);
        }
      } else {
        setAiAdvice('ระบบพร้อมช่วยคุณวิเคราะห์และจัดลำดับความสำคัญของงานตามความเร่งด่วน');
      }
    } catch (e) {
      setAiAdvice('ระบบพร้อมช่วยคุณวิเคราะห์และจัดลำดับความสำคัญของงานตามความเร่งด่วน');
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiAdvice();
  }, [tasks.length]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Welcome & Quick Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-[#FCFBFD] to-[#F5F2FB] p-6 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E9E1FF] text-[#7C3AED] inline-block mb-2">
            ภาพรวมงานประจำวัน
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#373145]">
              สวัสดีครับ, {userSettings.userName.split(' ')[0]} 👋
            </h2>
            <button
              onClick={openProfileModal}
              className="p-1 rounded-lg text-slate-400 hover:text-[#6B46C1] hover:bg-[#E9E1FF]/50 transition-colors cursor-pointer"
              title="แก้ไขโปรไฟล์ (ชื่อ / ตำแหน่งงาน)"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#8C84A0] mt-0.5">
            {userSettings.userRole} | {userSettings.department}
          </p>
          <p className="text-xs sm:text-sm text-[#736B85] mt-1">
            วันนี้คุณมีงานที่ต้องทำ <span className="font-bold text-[#9B82D7]">{todayTasks.length}</span> งาน 
            {overdueTasks.length > 0 && (
              <span className="text-rose-600 font-semibold ml-1">
                (มีงานเกินกำหนด {overdueTasks.length} งาน)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9FD] border border-[#E0D9F2] text-[#6B46C1] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#9B82D7]" />
            <span>เปิดผู้ช่วย AI</span>
          </button>
          <button
            onClick={() => openAddTaskModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] active:scale-[0.98] text-white text-xs font-semibold shadow-sm shadow-[#9B82D7]/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานใหม่</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-[#736B85]">งานทั้งหมด</span>
            <ListTodo className="w-4 h-4 text-[#9B82D7]" />
          </div>
          <div className="text-2xl font-bold text-[#373145]">{stats.total}</div>
          <div className="text-[11px] text-[#8C84A0] mt-1">ทุกหมวดหมู่</div>
        </div>

        {/* Done */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-[#736B85]">เสร็จแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.done}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            สำเร็จ {stats.completionRate}%
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-[#736B85]">กำลังทำ</span>
            <Clock className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-bold text-[#7C3AED]">{stats.inProgress}</div>
          <div className="text-[11px] text-[#8C84A0] mt-1">กำลังดำเนินการ</div>
        </div>

        {/* Todo */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-[#736B85]">รอดำเนินการ</span>
            <Hourglass className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-[#4E4760]">{stats.todo}</div>
          <div className="text-[11px] text-[#8C84A0] mt-1">ยังไม่ได้เริ่ม</div>
        </div>

        {/* Overdue */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          stats.overdue > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-[#E9E5F5]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#736B85]">เกินกำหนด</span>
            <AlertTriangle className={`w-4 h-4 ${stats.overdue > 0 ? 'text-rose-500' : 'text-slate-300'}`} />
          </div>
          <div className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {stats.overdue}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {stats.overdue > 0 ? 'ต้องรีบจัดการ' : 'ไม่มีงานค้าง'}
          </div>
        </div>

        {/* Urgent */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          stats.urgent > 0 ? 'bg-[#FFF0D9]/60 border-amber-200' : 'bg-white border-[#E9E5F5]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#736B85]">งานเร่งด่วน</span>
            <Flame className={`w-4 h-4 ${stats.urgent > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
          </div>
          <div className={`text-2xl font-bold ${stats.urgent > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
            {stats.urgent}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">ความสำคัญสูง</div>
        </div>
      </div>

      {/* Progress Bar Component */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-[#514B62] mb-2">
          <span>ความคืบหน้ารวมของงานทั้งหมด</span>
          <span className="text-[#7C3AED] font-bold">{stats.done} / {stats.total} งาน ({stats.completionRate}%)</span>
        </div>
        <div className="w-full bg-[#EAE6F5] h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#9B82D7] via-[#A892DF] to-[#7C3AED] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-br from-[#FAF8FF] via-[#F4EFFE] to-[#EBE2FF] rounded-2xl border border-[#DCD0F7] p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#7C3AED] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#373145]">
                  คำแนะนำการจัดลำดับงานวันนี้จาก WorkFlow AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1] font-semibold">
                  Smart AI
                </span>
              </div>
              <p className="text-xs text-[#5D5570] mt-1.5 leading-relaxed">
                {aiAdvice}
              </p>

              {dailySlots.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {dailySlots.map((slot, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-white text-xs">
                      <p className="font-bold text-[#6B46C1] text-[11px]">{slot.timeSlot}</p>
                      <p className="text-[#4E4760] text-[11px] mt-0.5 line-clamp-2">{slot.action}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={fetchAiAdvice}
            disabled={loadingAi}
            title="รีเฟรชคำแนะนำ AI"
            className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-purple-700 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E9E5F5] shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#9B82D7]" />
              <h3 className="font-bold text-sm text-[#373145]">ตารางงานวันนี้</h3>
              <span className="text-xs text-[#8C84A0]">
                ({formatThaiDate(todayStr, { shortMonth: false })})
              </span>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>เปิดปฏิทิน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-70" />
              <p className="text-xs">ไม่มีงานที่กำหนดส่งวันนี้ พักผ่อนหรือวางแผนวันพรุ่งนี้ได้เลย!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((t) => {
                const isDone = t.status === 'done';
                const hasTime = t.startTime && t.endTime;

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      t.priority === 'urgent' || t.priority === 'high'
                        ? 'border-l-4 border-l-red-500'
                        : t.priority === 'medium'
                        ? 'border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-blue-400'
                    } ${
                      isDone
                        ? 'bg-[#FAF9FD] border-[#ECE7F7] opacity-60'
                        : 'bg-white hover:bg-[#FAF9FD] border-[#E9E5F5]'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(t.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-[#9B82D7] border-[#9B82D7] text-white'
                            : 'border-slate-300 hover:border-[#9B82D7] bg-white'
                        }`}
                      >
                        {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>

                      <div
                        onClick={() => openEditTaskModal(t)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-[#373145]'
                            }`}
                          >
                            {t.title}
                          </p>
                          <PriorityBadge priority={t.priority} size="xs" />
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8C84A0] flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#F4F1FB] text-[#6B46C1] font-medium">
                            {t.category}
                          </span>
                          {hasTime && (
                            <span className="flex items-center gap-1 font-medium text-[#514B62]">
                              <Clock className="w-3 h-3 text-[#9B82D7]" />
                              {t.startTime} - {t.endTime} น.
                            </span>
                          )}
                          {t.department && (
                            <span className="flex items-center gap-1 text-[#6F6782]">
                              <Building className="w-3 h-3" />
                              {t.department}
                            </span>
                          )}
                          {t.subtasks && t.subtasks.length > 0 && (
                            <span>
                              Checklist ({t.subtasks.filter((s) => s.completed).length}/
                              {t.subtasks.length})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditTaskModal(t)}
                      className="text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
                    >
                      แก้ไข
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E9E5F5] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
              <h3 className="font-bold text-sm text-[#373145]">
                งานที่ใกล้ถึงกำหนดส่ง
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>ดูงานทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ไม่มีงานที่มีกำหนดส่งในเร็วๆ นี้
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((t) => {
                  const dueInfo = getRelativeDueLabel(t.dueDate);
                  return (
                    <div
                      key={t.id}
                      onClick={() => openEditTaskModal(t)}
                      className="p-3 rounded-xl bg-[#FAF9FD] hover:bg-[#F4F1FB] border border-[#EBE7F7] cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#373145] line-clamp-1">
                          {t.title}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 border ${dueInfo.colorClass}`}
                        >
                          {dueInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#8C84A0] mt-2">
                        <span className="truncate">{t.category}</span>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={t.priority} size="xs" useShortLabel />
                          <span>{formatThaiDate(t.dueDate, { shortMonth: true })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[#F0EDF9]">
            <button
              onClick={() => openAddTaskModal()}
              className="w-full py-2 px-3 rounded-xl bg-[#F8F7FC] hover:bg-[#F2EDFB] text-[#6B46C1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มงานลงตาราง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
