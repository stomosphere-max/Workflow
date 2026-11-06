import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building,
  Loader2,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { PriorityLevel, SubTask, Task, TaskStatus } from '../../types';
import { formatThaiDate } from '../../utils/thaiDate';

export const TaskModal: React.FC = () => {
  const {
    isAddTaskModalOpen,
    closeTaskModal,
    editingTask,
    addTask,
    updateTask,
    deleteTask,
    categories,
  } = useWorkFlow();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [department, setDepartment] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(1);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGeneratingAiSubtasks, setIsGeneratingAiSubtasks] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || categories[0]?.name || 'ทั่วไป');
      setPriority(editingTask.priority || 'medium');
      setStatus(editingTask.status || 'todo');
      setDueDate(editingTask.dueDate || new Date().toISOString().split('T')[0]);
      setStartTime(editingTask.startTime || '09:00');
      setEndTime(editingTask.endTime || '10:00');
      setDepartment(editingTask.department || '');
      setEstimatedHours(editingTask.estimatedHours || 1);
      setSubtasks(editingTask.subtasks ? [...editingTask.subtasks] : []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.name || 'การตลาด & แคมเปญ');
      setPriority('medium');
      setStatus('todo');
      setDueDate(today);
      setStartTime('09:00');
      setEndTime('10:00');
      setDepartment('');
      setEstimatedHours(1);
      setSubtasks([]);
    }
    setAiError(null);
  }, [editingTask, isAddTaskModalOpen, categories]);

  if (!isAddTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Generate subtasks with AI
  const handleGenerateAiSubtasks = async () => {
    if (!title.trim()) {
      setAiError('กรุณากรอกชื่องานก่อนกดให้ AI ช่วยแตกงานย่อย');
      return;
    }
    setIsGeneratingAiSubtasks(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/generate-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.subtasks)) {
        const newGenerated: SubTask[] = data.subtasks.map((stText: string, idx: number) => ({
          id: `ai-st-${Date.now()}-${idx}`,
          title: stText,
          completed: false,
        }));
        setSubtasks((prev) => [...prev, ...newGenerated]);
      } else {
        setAiError(data.error || 'ไม่สามารถสร้างงานย่อยได้');
      }
    } catch (err) {
      console.error(err);
      setAiError('เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    } finally {
      setIsGeneratingAiSubtasks(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        dueDate,
        startTime,
        endTime,
        department: department.trim(),
        estimatedHours,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        dueDate,
        startTime,
        endTime,
        department: department.trim(),
        estimatedHours,
        subtasks,
      });
    }
    closeTaskModal();
  };

  const isEditing = Boolean(editingTask && editingTask.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E9E5F5] overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0EDF9] flex items-center justify-between bg-[#F8F7FC]/70">
          <div>
            <h2 className="text-base font-bold text-[#373145]">
              {isEditing ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่'}
            </h2>
            <p className="text-xs text-[#827A94]">
              {isEditing ? 'ปรับปรุงรายละเอียดงานและกำหนดส่ง' : 'วางแผนและบันทึกงานให้เป็นระบบ'}
            </p>
          </div>
          <button
            onClick={closeTaskModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#514B62] mb-1">
              ชื่องาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เตรียมสไลด์สรุปผลงาน Q3 เสนอบอร์ด, ประชุมทีมการตลาด..."
              className="w-full px-3.5 py-2 text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145] placeholder-[#A39CB5]"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1">
                หมวดหมู่งาน
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-[#9B82D7] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1">
                แผนก / ผู้เกี่ยวข้อง
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#9B82D7] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น ฝ่ายการเงิน, หัวหน้าแผนก, ฝ่าย IT"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
                />
              </div>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1">
                ระดับความสำคัญ
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(
                  [
                    { id: 'urgent', label: '🔴 ด่วนมาก', activeColor: 'text-red-700 bg-red-100 border-red-300 ring-2 ring-red-400' },
                    { id: 'high', label: '🔴 สูง', activeColor: 'text-red-700 bg-red-100 border-red-300 ring-2 ring-red-400' },
                    { id: 'medium', label: '🟡 ปานกลาง', activeColor: 'text-amber-800 bg-amber-100 border-amber-300 ring-2 ring-amber-400' },
                    { id: 'low', label: '🔵 ต่ำ', activeColor: 'text-blue-700 bg-blue-100 border-blue-300 ring-2 ring-blue-400' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                      priority === p.id
                        ? `${p.activeColor} font-bold shadow-xs`
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1">
                สถานะงาน
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(
                  [
                    { id: 'todo', label: 'รอเริ่ม' },
                    { id: 'in_progress', label: 'กำลังทำ' },
                    { id: 'waiting', label: 'รอผู้อื่น' },
                    { id: 'done', label: 'เสร็จสิ้น' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                      status === s.id
                        ? 'bg-[#E9E1FF] border-[#9B82D7] text-[#6B46C1] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF9FD] p-3 rounded-xl border border-[#EBE7F7]">
            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9B82D7]" />
                <span>กำหนดส่ง (Deadline)</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1F2] rounded-lg focus:outline-none focus:border-[#9B82D7]"
              />
              <p className="text-[11px] text-[#8C84A0] mt-1">
                {dueDate ? formatThaiDate(dueDate, { shortMonth: false }) : '-'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9B82D7]" />
                <span>เวลาเริ่ม</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1F2] rounded-lg focus:outline-none focus:border-[#9B82D7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#514B62] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9B82D7]" />
                <span>เวลาสิ้นสุด</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E1F2] rounded-lg focus:outline-none focus:border-[#9B82D7]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#514B62] mb-1">
              รายละเอียดเพิ่มเติม / โน้ต
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุลิงก์เอกสาร วาระการประชุม หรือข้อสังเกต..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
            />
          </div>

          {/* Subtasks (Checklist) + AI Generator */}
          <div className="border-t border-[#F0EDF9] pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#514B62] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#9B82D7]" />
                <span>ขั้นตอนย่อย (Checklist) ({subtasks.filter((s) => s.completed).length}/{subtasks.length})</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateAiSubtasks}
                disabled={isGeneratingAiSubtasks}
                className="flex items-center gap-1 text-xs text-[#7C3AED] bg-[#E9E1FF] hover:bg-[#ded2fd] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAiSubtasks ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#9B82D7]" />
                    <span>✨ แตกงานย่อยด้วย AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-2 mb-2 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Checklist items */}
            <div className="space-y-1.5 mb-2.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9FD] border border-[#EBE7F7] text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded text-[#9B82D7] focus:ring-[#9B82D7] w-4 h-4"
                    />
                    <span
                      className={
                        st.completed
                          ? 'line-through text-slate-400'
                          : 'text-[#373145] font-medium'
                      }
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add manual subtask */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="เพิ่มขั้นตอนย่อย..."
                className="flex-1 px-3 py-1.5 text-xs bg-[#F8F7FC] border border-[#E5E1F2] rounded-lg focus:outline-none focus:border-[#9B82D7]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-[#FAF9FD] hover:bg-[#E9E1FF] border border-[#E5E1F2] text-[#514B62] rounded-lg text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-[#F0EDF9] pt-4 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('ยืนยันที่จะลบงานนี้หรือไม่?')) {
                    if (editingTask?.id) {
                      deleteTask(editingTask.id);
                    }
                    closeTaskModal();
                  }
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบงานนี้</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeTaskModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#9B82D7] hover:bg-[#886ec9] active:scale-[0.99] rounded-xl shadow-xs shadow-[#9B82D7]/30 transition-all cursor-pointer"
              >
                {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มงาน'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
