import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  List,
  Columns,
  Grid,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { Task } from '../../types';
import {
  formatThaiDate,
  generateCalendarMonth,
  generateWeekDays,
  getBuddhistYear,
  hasTimeConflict,
  THAI_DAYS_SHORT_MON_START,
  THAI_MONTHS_FULL,
  THAI_MONTHS_SHORT,
  toIsoDateString,
} from '../../utils/thaiDate';
import { PriorityBadge } from '../common/PriorityBadge';

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    categories,
    openAddTaskModal,
    openEditTaskModal,
    updateTask,
  } = useWorkFlow();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarMode>('month');

  // Month & Year calculations
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const buddhistYear = currentYear + 543;
  const monthName = THAI_MONTHS_FULL[currentMonth];

  // Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get category colors
  const getCategoryTheme = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    if (found) {
      return {
        bg: found.bgColor,
        text: found.color,
        border: found.borderColor,
      };
    }
    return {
      bg: '#E9E1FF',
      text: '#7C3AED',
      border: '#C4B5FD',
    };
  };

  // Map tasks by date string
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.dueDate) || [];
      list.push(t);
      map.set(t.dueDate, list);
    }
    // Sort by startTime if available
    for (const [date, list] of map.entries()) {
      list.sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
    }
    return map;
  }, [tasks]);

  // Check if a day has time conflicts
  const hasDayConflict = (dateStr: string): boolean => {
    const dayTasks = tasksByDate.get(dateStr) || [];
    if (dayTasks.length < 2) return false;
    for (let i = 0; i < dayTasks.length; i++) {
      for (let j = i + 1; j < dayTasks.length; j++) {
        if (hasTimeConflict(dayTasks[i].startTime, dayTasks[i].endTime, dayTasks[j].startTime, dayTasks[j].endTime)) {
          return true;
        }
      }
    }
    return false;
  };

  // Drag and drop handlers for rescheduling
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { dueDate: targetDateStr });
    }
    setDraggedTaskId(null);
  };

  // Render Month View
  const renderMonthView = () => {
    const monthCells = generateCalendarMonth(currentYear, currentMonth);

    return (
      <div className="bg-white rounded-2xl border border-[#E9E5F5] overflow-hidden shadow-xs">
        {/* Days Header starting Monday */}
        <div className="grid grid-cols-7 border-b border-[#E9E5F5] bg-[#F8F7FC] text-center text-xs font-semibold text-[#514B62]">
          {THAI_DAYS_SHORT_MON_START.map((day) => (
            <div key={day.key} className="py-2.5">
              <span className="hidden sm:inline">{day.full}</span>
              <span className="sm:hidden">{day.short}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#EFEBF7]">
          {monthCells.map((cell, idx) => {
            const cellTasks = tasksByDate.get(cell.dateStr) || [];
            const dayConflict = hasDayConflict(cell.dateStr);

            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cell.dateStr)}
                onClick={(e) => {
                  // Only trigger if clicking the cell background, not a task card
                  if ((e.target as HTMLElement).closest('.task-item-card')) return;
                  openAddTaskModal(cell.dateStr);
                }}
                className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition-colors relative cursor-pointer group flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-[#FAF9FD]/50 text-slate-300'
                    : 'bg-white hover:bg-[#FAF8FE]'
                }`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-[#9B82D7] text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-[#373145]'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayConflict && (
                      <span title="มีเวลาจัดตารางงานซ้อนกัน!">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddTaskModal(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#E9E1FF] text-[#7C3AED] transition-opacity cursor-pointer"
                    title="เพิ่มงานในวันนี้"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tasks inside cell */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] flex-1">
                  {cellTasks.slice(0, 3).map((t) => {
                    const theme = getCategoryTheme(t.category);
                    const isDone = t.status === 'done';

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTaskModal(t);
                        }}
                        style={{
                          backgroundColor: isDone ? '#F4F1FB' : theme.bg,
                          color: isDone ? '#8C84A0' : theme.text,
                          borderColor: theme.border,
                        }}
                        className="task-item-card px-1.5 py-1 rounded-md text-[11px] font-medium border truncate transition-transform hover:scale-[1.02] shadow-2xs cursor-grab active:cursor-grabbing flex items-center justify-between gap-1"
                        title={`${t.title} (${t.startTime || ''} - ${t.endTime || ''})`}
                      >
                        <div className="flex items-center gap-1 min-w-0 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              t.priority === 'urgent' || t.priority === 'high'
                                ? 'bg-red-500'
                                : t.priority === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className={`truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {t.startTime ? `${t.startTime} ` : ''}
                            {t.title}
                          </span>
                        </div>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}

                  {cellTasks.length > 3 && (
                    <div className="text-[10px] text-[#7C3AED] font-semibold text-center py-0.5">
                      +{cellTasks.length - 3} งานเพิ่มเติม
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = generateWeekDays(currentDate);

    return (
      <div className="bg-white rounded-2xl border border-[#E9E5F5] overflow-hidden shadow-xs">
        {/* Day column headers */}
        <div className="grid grid-cols-7 border-b border-[#E9E5F5] bg-[#F8F7FC] text-center divide-x divide-[#EFEBF7]">
          {weekDays.map((day, idx) => {
            const dayLabel = THAI_DAYS_SHORT_MON_START[idx];
            return (
              <div
                key={day.dateStr}
                className={`py-3 px-1 ${day.isToday ? 'bg-[#F2EDFB]' : ''}`}
              >
                <p className="text-xs text-[#8C84A0] font-medium">{dayLabel.full}</p>
                <p
                  className={`text-sm font-bold mt-0.5 ${
                    day.isToday ? 'text-[#7C3AED]' : 'text-[#373145]'
                  }`}
                >
                  {day.dayNumber} {THAI_MONTHS_SHORT[day.date.getMonth()]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Week Task Columns */}
        <div className="grid grid-cols-7 min-h-[450px] divide-x divide-[#EFEBF7]">
          {weekDays.map((day) => {
            const dayTasks = tasksByDate.get(day.dateStr) || [];
            const dayConflict = hasDayConflict(day.dateStr);

            return (
              <div
                key={day.dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.dateStr)}
                className={`p-2 flex flex-col justify-between ${
                  day.isToday ? 'bg-[#FCFBFE]' : 'bg-white'
                }`}
              >
                <div className="space-y-2">
                  {dayConflict && (
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>มีเวลาจัดตารางซ้อน</span>
                    </div>
                  )}

                  {dayTasks.map((t) => {
                    const theme = getCategoryTheme(t.category);
                    const isDone = t.status === 'done';

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => openEditTaskModal(t)}
                        style={{
                          backgroundColor: isDone ? '#FAF9FD' : theme.bg,
                          borderColor: theme.border,
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer shadow-xs hover:shadow-sm transition-all ${
                          t.priority === 'urgent' || t.priority === 'high'
                            ? 'border-l-3 border-l-red-500'
                            : t.priority === 'medium'
                            ? 'border-l-3 border-l-amber-500'
                            : 'border-l-3 border-l-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <PriorityBadge priority={t.priority} size="xs" useShortLabel />
                          {isDone && (
                            <span className="text-emerald-600 font-bold text-xs">✓</span>
                          )}
                        </div>

                        <p
                          style={{ color: isDone ? '#8C84A0' : theme.text }}
                          className={`font-semibold line-clamp-2 ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.title}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          {t.startTime ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#9B82D7]" />
                              {t.startTime}-{t.endTime}
                            </span>
                          ) : (
                            <span>ตลอดวัน</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => openAddTaskModal(day.dateStr)}
                  className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[#D5CEEB] hover:border-[#9B82D7] text-[#7C3AED] hover:bg-[#F8F7FC] text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>เพิ่มงาน</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dateStr = toIsoDateString(currentDate);
    const dayTasks = tasksByDate.get(dateStr) || [];
    const dayConflict = hasDayConflict(dateStr);

    return (
      <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div>
            <h3 className="font-bold text-base text-[#373145]">
              {formatThaiDate(currentDate, { includeDayName: true, shortMonth: false })}
            </h3>
            <p className="text-xs text-[#8C84A0] mt-0.5">
              มีกำหนดงานทั้งหมด {dayTasks.length} รายการ
            </p>
          </div>

          <button
            onClick={() => openAddTaskModal(dateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานวันนี้</span>
          </button>
        </div>

        {dayConflict && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              มีรายการงานที่มีช่วงเวลาชนกันในวันนี้ กรุณาตรวจเช็คและปรับเวลาเริ่มต้น-สิ้นสุด
            </span>
          </div>
        )}

        {dayTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CalendarIcon className="w-12 h-12 text-[#9B82D7]/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">ไม่มีตารางงานในวันนี้</p>
            <button
              onClick={() => openAddTaskModal(dateStr)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#E9E1FF] hover:bg-[#ded2fd] text-[#6B46C1] text-xs font-semibold cursor-pointer"
            >
              + เพิ่มงานชิ้นแรกสำหรับวันนี้
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTasks.map((t) => {
              const theme = getCategoryTheme(t.category);
              const isDone = t.status === 'done';

              return (
                <div
                  key={t.id}
                  onClick={() => openEditTaskModal(t)}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer hover:shadow-xs transition-all ${
                    isDone ? 'bg-[#FAF9FD] border-[#ECE7F7] opacity-70' : 'bg-white border-[#E9E5F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: theme.bg, color: theme.text }}
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0"
                    >
                      <span>{t.startTime || '—'}</span>
                      <span className="text-[10px] opacity-70">{t.endTime || ''}</span>
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-400' : 'text-[#373145]'
                        }`}
                      >
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#8C84A0]">
                        <span className="px-2 py-0.5 rounded bg-[#F8F7FC] text-[#6B46C1] font-medium">
                          {t.category}
                        </span>
                        {t.department && <span>แผนก: {t.department}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} size="sm" />
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-[#E9E1FF] text-[#6B46C1]'
                      }`}
                    >
                      {isDone ? 'เสร็จสิ้น' : 'รอทำ'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in">
      {/* Calendar Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs">
        {/* Navigation & Month/Year Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F8F7FC] p-1 rounded-xl border border-[#EBE7F7]">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-[#6B46C1] hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              วันนี้
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#373145]">
            {viewMode === 'day'
              ? formatThaiDate(currentDate, { shortMonth: false })
              : `${monthName} พ.ศ. ${buddhistYear}`}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F8F7FC] p-1 rounded-xl border border-[#EBE7F7] text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'month'
                  ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                  : 'text-[#676179] hover:text-[#373145]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>รายเดือน</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                  : 'text-[#676179] hover:text-[#373145]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>รายสัปดาห์</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'day'
                  ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                  : 'text-[#676179] hover:text-[#373145]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>รายวัน</span>
            </button>
          </div>

          <button
            onClick={() => openAddTaskModal(toIsoDateString(currentDate))}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่มงาน</span>
          </button>
        </div>
      </div>

      {/* Render active view */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};
