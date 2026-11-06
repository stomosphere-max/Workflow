import React, { useState } from 'react';
import {
  Users,
  Plus,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Edit,
  Clock,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { FollowUpItem } from '../../types';
import { formatThaiDateShort } from '../../utils/thaiDate';

export const FollowUpView: React.FC = () => {
  const { followUps, addFollowUp, updateFollowUp, deleteFollowUp } = useWorkFlow();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);

  // Form states
  const [contactName, setContactName] = useState('');
  const [department, setDepartment] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [channel, setChannel] = useState<'LINE' | 'Email' | 'โทรศัพท์' | 'พบปะพูดคุย' | 'Slack'>('LINE');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);

  // AI draft modal
  const [activeAiDraft, setActiveAiDraft] = useState<{
    item: FollowUpItem;
    subject?: string;
    message: string;
    tips?: string;
  } | null>(null);
  const [loadingAiDraft, setLoadingAiDraft] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const filteredItems = followUps.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setContactName('');
    setDepartment('');
    setTaskTitle('');
    setChannel('LINE');
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setUrgent(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: FollowUpItem) => {
    setEditingItem(item);
    setContactName(item.contactName);
    setDepartment(item.department);
    setTaskTitle(item.taskTitle);
    setChannel(item.channel);
    setDueDate(item.dueDate);
    setNotes(item.notes || '');
    setUrgent(item.urgent);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !taskTitle.trim()) return;

    if (editingItem) {
      updateFollowUp(editingItem.id, {
        contactName: contactName.trim(),
        department: department.trim(),
        taskTitle: taskTitle.trim(),
        channel,
        dueDate,
        notes: notes.trim(),
        urgent,
      });
    } else {
      addFollowUp({
        contactName: contactName.trim(),
        department: department.trim(),
        taskTitle: taskTitle.trim(),
        channel,
        dueDate,
        status: 'waiting',
        notes: notes.trim(),
        urgent,
      });
    }
    setIsAddModalOpen(false);
  };

  // AI Draft Follow-up Message
  const handleGenerateAiMessage = async (item: FollowUpItem) => {
    setLoadingAiDraft(true);
    setCopiedSuccess(false);
    try {
      const res = await fetch('/api/ai/followup-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: item.contactName,
          department: item.department,
          taskTitle: item.taskTitle,
          channel: item.channel,
          urgency: item.urgent ? 'urgent' : 'medium',
          contextNotes: item.notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveAiDraft({
          item,
          subject: data.data.subject,
          message: data.data.message,
          tips: data.data.tips,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiDraft(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const getStatusBadge = (status: FollowUpItem['status']) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0D9] text-amber-800">รอคำตอบ</span>;
      case 'follow_again':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 animate-pulse">ต้องทวงซ้ำ</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">ได้คำตอบแล้ว</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D9] text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-[#373145]">
              งานติดตามจากผู้อื่น (Follow-up Tracker)
            </h2>
          </div>
          <p className="text-xs text-[#827A94] mt-1">
            บันทึกและติดตามงานที่ต้องรอคำตอบ อนุมัติ หรือเอกสารจากแผนกอื่น พร้อม AI ช่วยร่างข้อความทวงงาน
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายการติดตาม</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E5F5] pb-3 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#E9E1FF] text-[#6B46C1]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ทั้งหมด ({followUps.length})
        </button>
        <button
          onClick={() => setFilterStatus('waiting')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            filterStatus === 'waiting'
              ? 'bg-[#FFF0D9] text-amber-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          รอคำตอบ ({followUps.filter((f) => f.status === 'waiting').length})
        </button>
        <button
          onClick={() => setFilterStatus('follow_again')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            filterStatus === 'follow_again'
              ? 'bg-rose-100 text-rose-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ต้องทวงซ้ำ ({followUps.filter((f) => f.status === 'follow_again').length})
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            filterStatus === 'resolved'
              ? 'bg-emerald-100 text-emerald-800'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ได้รับแล้ว ({followUps.filter((f) => f.status === 'resolved').length})
        </button>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9E5F5] p-12 text-center text-slate-400">
            <UserCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-70" />
            <p className="text-xs">ไม่มีรายการงานที่ต้องติดตามในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-xs transition-all ${
                item.status === 'resolved'
                  ? 'border-[#ECE7F7] bg-[#FAF9FD]/60 opacity-75'
                  : item.status === 'follow_again'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-[#E9E5F5] hover:border-[#D5CEEB]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#373145]">
                      {item.contactName}
                    </span>
                    <span className="text-xs text-[#8C84A0] px-2 py-0.5 rounded-md bg-[#F4F1FB]">
                      {item.department}
                    </span>
                    <span className="text-xs text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 flex items-center gap-1">
                      {item.channel === 'LINE' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                      {item.channel === 'Email' && <Mail className="w-3 h-3 text-blue-600" />}
                      {item.channel === 'โทรศัพท์' && <Phone className="w-3 h-3 text-purple-600" />}
                      {item.channel}
                    </span>
                    {getStatusBadge(item.status)}
                    {item.urgent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                        ด่วน
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[#514B62] mt-2">
                    เรื่อง: {item.taskTitle}
                  </p>

                  {item.notes && (
                    <p className="text-[11px] text-[#8C84A0] mt-1 bg-[#FAF9FD] p-2 rounded-lg border border-[#EBE7F7]">
                      📝 โน้ต: {item.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-[#8C84A0]">
                    <span>กำหนดติดตาม: {formatThaiDateShort(item.dueDate)}</span>
                    {item.lastContactDate && (
                      <span>ติดต่อล่าสุด: {formatThaiDateShort(item.lastContactDate)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* AI Message Draft Button */}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleGenerateAiMessage(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E9E1FF] hover:bg-[#ded2fd] text-[#6B46C1] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#9B82D7]" />
                      <span>ร่างข้อความ AI</span>
                    </button>
                  )}

                  {/* Status Toggle Button */}
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateFollowUp(item.id, {
                        status: e.target.value as FollowUpItem['status'],
                        lastContactDate: new Date().toISOString().split('T')[0],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-[#E5E1F2] bg-white text-[#514B62] focus:outline-none focus:border-[#9B82D7]"
                  >
                    <option value="waiting">รอคำตอบ</option>
                    <option value="follow_again">ต้องทวงซ้ำ</option>
                    <option value="resolved">ได้รับคำตอบแล้ว</option>
                  </select>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('ต้องการลบรายการติดตามนี้หรือไม่?')) {
                        deleteFollowUp(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Follow-up Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E9E5F5] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[#F0EDF9] flex items-center justify-between bg-[#F8F7FC]">
              <h3 className="font-bold text-sm text-[#373145]">
                {editingItem ? 'แก้ไขรายการติดตามงาน' : 'เพิ่มรายการติดตามงานจากผู้อื่น'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#514B62] mb-1">
                  ชื่อผู้ติดต่อ / บุคคลที่ประสานงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="เช่น คุณพิมพ์ชนก (ฝ่ายบัญชี), คุณธีรภัทร..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#514B62] mb-1">
                    แผนก / บริษัท
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="เช่น การเงิน, จัดซื้อ, ลูกค้า..."
                    className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#514B62] mb-1">
                    ช่องทางติดต่อหลัก
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                  >
                    <option value="LINE">LINE</option>
                    <option value="Email">Email</option>
                    <option value="โทรศัพท์">โทรศัพท์</option>
                    <option value="พบปะพูดคุย">พบปะพูดคุย</option>
                    <option value="Slack">Slack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#514B62] mb-1">
                  เรื่องที่ติดตาม / งานที่รอ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="เช่น ขอรับใบเสร็จรับเงิน, รอตรวจร่างสัญญาจัดซื้อ..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#514B62] mb-1">
                    กำหนดติดตามผล
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#514B62]">
                    <input
                      type="checkbox"
                      checked={urgent}
                      onChange={(e) => setUrgent(e.target.checked)}
                      className="rounded text-[#9B82D7] w-4 h-4"
                    />
                    <span>งานเร่งด่วน (Urgent)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#514B62] mb-1">
                  โน้ตประวัติการพูดคุย
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="บันทึกรายละเอียดสั้นๆ..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white font-semibold shadow-xs"
                >
                  {editingItem ? 'บันทึก' : 'เพิ่มรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Draft Message Modal */}
      {activeAiDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E9E5F5] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[#F0EDF9] flex items-center justify-between bg-gradient-to-r from-[#FAF8FF] to-[#F4EFFE]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="font-bold text-sm text-[#373145]">
                  ข้อความทวงงานโดย WorkFlow AI
                </h3>
              </div>
              <button
                onClick={() => setActiveAiDraft(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="text-xs text-[#6F6782] flex items-center justify-between bg-[#F8F7FC] p-2.5 rounded-xl border border-[#EBE7F7]">
                <span>ส่งถึง: <strong className="text-[#373145]">{activeAiDraft.item.contactName}</strong> ({activeAiDraft.item.department})</span>
                <span className="px-2 py-0.5 rounded bg-white font-semibold text-[#6B46C1]">
                  ช่องทาง: {activeAiDraft.item.channel}
                </span>
              </div>

              {activeAiDraft.subject && (
                <div>
                  <label className="block text-xs font-semibold text-[#514B62] mb-1">
                    หัวข้อเรื่อง (Subject):
                  </label>
                  <div className="p-2.5 bg-[#FAF9FD] rounded-xl border border-[#EBE7F7] text-xs font-medium text-[#373145]">
                    {activeAiDraft.subject}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#514B62] mb-1">
                  ข้อความที่พร้อมส่ง:
                </label>
                <textarea
                  readOnly
                  rows={6}
                  value={activeAiDraft.message}
                  className="w-full p-3 text-xs sm:text-sm bg-[#FAF9FD] border border-[#E0D9F2] rounded-xl text-[#373145] focus:outline-none font-sans whitespace-pre-wrap leading-relaxed"
                />
              </div>

              {activeAiDraft.tips && (
                <div className="p-2.5 rounded-xl bg-purple-50 text-[#6B46C1] text-[11px] flex items-start gap-2">
                  <span className="font-bold">💡 ทริค:</span>
                  <span>{activeAiDraft.tips}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveAiDraft(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ปิด
                </button>

                <button
                  onClick={() => handleCopy(activeAiDraft.message)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>คัดลอกเรียบร้อยแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>คัดลอกข้อความไปส่ง</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
