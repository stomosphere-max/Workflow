import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Kanban,
  List as ListIcon,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
  Building,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { PriorityLevel, Task, TaskStatus } from '../../types';
import { formatThaiDateShort, getRelativeDueLabel } from '../../utils/thaiDate';
import { PriorityBadge, getPriorityConfig } from '../common/PriorityBadge';

export const TasksView: React.FC = () => {
  const {
    tasks,
    categories,
    openAddTaskModal,
    openEditTaskModal,
    deleteTask,
    toggleTaskComplete,
    toggleSubtask,
    updateTask,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    searchQuery,
  } = useWorkFlow();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchDept = t.department?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDept) return false;
    }
    return true;
  });

  // Kanban Columns
  const kanbanColumns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'todo', title: 'รอดำเนินการ', color: 'text-slate-700', badgeBg: 'bg-slate-100 text-slate-700' },
    { id: 'in_progress', title: 'กำลังทำ', color: 'text-[#6B46C1]', badgeBg: 'bg-[#E9E1FF] text-[#6B46C1]' },
    { id: 'waiting', title: 'รอผู้อื่น / ตรวจสอบ', color: 'text-amber-700', badgeBg: 'bg-[#FFF0D9] text-amber-700' },
    { id: 'done', title: 'เสร็จสิ้น', color: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-700' },
  ];

  // Drag and drop for Kanban
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropColumn = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      updateTask(id, {
        status: targetStatus,
        completedAt: targetStatus === 'done' ? new Date().toISOString() : undefined,
      });
    }
    setDraggedTaskId(null);
  };

  const getPriorityBorderClass = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-amber-500';
      case 'low':
        return 'border-l-4 border-l-blue-400';
      default:
        return 'border-l-4 border-l-slate-300';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in">
      {/* Top Controls: Search summary, Filter Pills, View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-[#E9E5F5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-[#373145]">งานของฉัน</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1] font-semibold">
              {filteredTasks.length} งาน
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F8F7FC] p-1 rounded-xl border border-[#EBE7F7] text-xs font-medium">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                    : 'text-[#676179] hover:text-[#373145]'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>บอร์ด (Kanban)</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                    : 'text-[#676179] hover:text-[#373145]'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>รายการ (List)</span>
              </button>
            </div>

            <button
              onClick={() => openAddTaskModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มงาน</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F0EDF9] text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#514B62]">ตัวกรอง:</span>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F8F7FC] border border-[#E5E1F2] text-[#373145] text-xs focus:outline-none focus:border-[#9B82D7]"
          >
            <option value="all">ทุกหมวดหมู่ ({tasks.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F8F7FC] border border-[#E5E1F2] text-[#373145] text-xs focus:outline-none focus:border-[#9B82D7]"
          >
            <option value="all">ทุกระดับความสำคัญ</option>
            <option value="urgent">🔴 ด่วนมาก (Urgent)</option>
            <option value="high">🔴 สูง (High)</option>
            <option value="medium">🟡 ปานกลาง (Medium)</option>
            <option value="low">🔵 ต่ำ (Low)</option>
          </select>

          {/* Quick Priority Filter Chips */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                filterPriority === 'high' || filterPriority === 'urgent'
                  ? 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-200'
                  : 'bg-red-50/70 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              🔴 สูง (High)
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'medium' ? 'all' : 'medium')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                filterPriority === 'medium'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              🟡 ปานกลาง (Medium)
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'low' ? 'all' : 'low')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                filterPriority === 'low'
                  ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              🔵 ต่ำ (Low)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F8F7FC] border border-[#E5E1F2] text-[#373145] text-xs focus:outline-none focus:border-[#9B82D7]"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="todo">รอดำเนินการ</option>
            <option value="in_progress">กำลังทำ</option>
            <option value="waiting">รอผู้อื่น</option>
            <option value="done">เสร็จสิ้น</option>
          </select>

          {(filterCategory !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterPriority('all');
                setFilterStatus('all');
              }}
              className="text-[#7C3AED] hover:underline text-xs ml-auto font-medium cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropColumn(e, col.id)}
                className="bg-[#F8F7FC] rounded-2xl border border-[#E9E5F5] p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE5F5]">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-xs ${col.color}`}>{col.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${col.badgeBg}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openAddTaskModal({ status: col.id })}
                    className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={`เพิ่มงานใน ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-[#DDD7EE] rounded-xl">
                      ไม่มีงานในสถานะนี้
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const isDone = t.status === 'done';
                      const isExpanded = Boolean(expandedTaskIds[t.id]);
                      const dueInfo = getRelativeDueLabel(t.dueDate);

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          className={`bg-white p-3.5 rounded-xl border border-[#E9E5F5] ${getPriorityBorderClass(
                            t.priority
                          )} shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing ${
                            isDone ? 'opacity-70 bg-[#FAF9FD]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F1FB] text-[#6B46C1] font-medium">
                              {t.category}
                            </span>
                            <PriorityBadge priority={t.priority} size="xs" />
                          </div>

                          <h4
                            onClick={() => openEditTaskModal(t)}
                            className={`font-semibold text-xs sm:text-sm text-[#373145] hover:text-[#6B46C1] cursor-pointer line-clamp-2 ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </h4>

                          {t.description && (
                            <p className="text-[11px] text-[#8C84A0] mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {t.subtasks && t.subtasks.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-[#F0EDF9]">
                              <button
                                onClick={() => toggleExpand(t.id)}
                                className="flex items-center justify-between w-full text-[11px] text-[#736B85] hover:text-[#373145] cursor-pointer"
                              >
                                <span>
                                  Checklist ({t.subtasks.filter((s) => s.completed).length}/
                                  {t.subtasks.length})
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 space-y-1">
                                  {t.subtasks.map((st) => (
                                    <label
                                      key={st.id}
                                      className="flex items-center gap-1.5 text-[11px] cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={st.completed}
                                        onChange={() => toggleSubtask(t.id, st.id)}
                                        className="rounded text-[#9B82D7] w-3 h-3"
                                      />
                                      <span
                                        className={
                                          st.completed
                                            ? 'line-through text-slate-400'
                                            : 'text-[#4E4760]'
                                        }
                                      >
                                        {st.title}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Footer with date & quick complete */}
                          <div className="mt-3 pt-2 border-t border-[#F0EDF9] flex items-center justify-between text-[11px] text-[#8C84A0]">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${dueInfo.colorClass}`}
                            >
                              {formatThaiDateShort(t.dueDate)}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleTaskComplete(t.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                                  isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={isDone ? 'ยกเลิกเสร็จสิ้น' : 'ทำเครื่องหมายว่าเสร็จสิ้น'}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditTaskModal(t)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E9E5F5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FC] border-b border-[#E9E5F5] text-[#514B62] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">สถานะ</th>
                  <th className="py-3 px-4">ชื่องาน</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ความสำคัญ</th>
                  <th className="py-3 px-4">แผนก</th>
                  <th className="py-3 px-4">กำหนดส่ง</th>
                  <th className="py-3 px-4">Checklist</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBF7]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      ไม่พบรายการงานที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isDone = t.status === 'done';
                    const dueInfo = getRelativeDueLabel(t.dueDate);

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-[#FAF8FE] transition-colors ${
                          isDone ? 'bg-[#FAF9FD]/60' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleTaskComplete(t.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-[#9B82D7] border-[#9B82D7] text-white'
                                : 'border-slate-300 hover:border-[#9B82D7]'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <p
                            onClick={() => openEditTaskModal(t)}
                            className={`font-semibold cursor-pointer hover:text-[#6B46C1] ${
                              isDone ? 'line-through text-slate-400' : 'text-[#373145]'
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.startTime && (
                            <p className="text-[11px] text-[#8C84A0] mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#9B82D7]" />
                              {t.startTime} - {t.endTime} น.
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#F4F1FB] text-[#6B46C1] font-medium text-[11px]">
                            {t.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <PriorityBadge priority={t.priority} size="sm" />
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {t.department ? (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              {t.department}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium border ${dueInfo.colorClass}`}
                          >
                            {dueInfo.label} ({formatThaiDateShort(t.dueDate)})
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#8C84A0]">
                          {t.subtasks && t.subtasks.length > 0 ? (
                            <span>
                              {t.subtasks.filter((s) => s.completed).length} / {t.subtasks.length}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditTaskModal(t)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('ต้องการลบงานนี้หรือไม่?')) {
                                  deleteTask(t.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
