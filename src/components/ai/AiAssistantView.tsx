import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  ShieldAlert,
  Layers,
  MessageSquare,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { Task } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';

interface EisenhowerData {
  doFirst: string[];
  schedule: string[];
  delegate: string[];
  dontDo: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAssistantView: React.FC = () => {
  const { tasks, openEditTaskModal } = useWorkFlow();

  const [activeTab, setActiveTab] = useState<'matrix' | 'chat'>('matrix');
  const [loadingPrioritize, setLoadingPrioritize] = useState(false);
  const [eisenhower, setEisenhower] = useState<EisenhowerData>({
    doFirst: [],
    schedule: [],
    delegate: [],
    dontDo: [],
  });
  const [aiSummary, setAiSummary] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [dailySchedule, setDailySchedule] = useState<{ timeSlot: string; taskId: string; action: string }[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'สวัสดีครับ! ผมคือ WorkFlow AI ผู้ช่วยวางแผนงานส่วนตัวของคุณ มีอะไรให้ผมช่วยจัดตาราง สรุป Daily Standup หรือร่างข้อความประสานงานวันนี้ไหมครับ?',
      time: '09:00',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Quick prompt presets
  const quickPrompts = [
    '📋 สรุป Daily Standup วันนี้ให้หน่อย',
    '⚖️ วิเคราะห์ภาระงานและเวลาจัดตารางวันนี้',
    '💬 ร่างข้อความปฏิเสธงานแทรกอย่างสุภาพ',
    '🧘 มีงานเยอะจนเริ่มเครียด ควรเริ่มอย่างไรดี?',
  ];

  const fetchPrioritization = async () => {
    setLoadingPrioritize(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data.summary || '');
        setAiAdvice(data.data.aiAdvice || '');
        if (data.data.eisenhower) {
          setEisenhower(data.data.eisenhower);
        }
        if (Array.isArray(data.data.dailyScheduleSuggestion)) {
          setDailySchedule(data.data.dailyScheduleSuggestion);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrioritize(false);
    }
  };

  useEffect(() => {
    fetchPrioritization();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          tasksContext: tasks.map((t) => ({
            title: t.title,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            category: t.category,
          })),
        }),
      });
      const data = await res.json();
      const replyText = data.reply || 'ขออภัยครับ ไม่สามารถประมวลผลข้อความได้ในขณะนี้';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้งครับ',
          time: '',
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find((t) => t.id === id);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9B82D7] to-[#BFA9F0] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-[#373145]">
                ผู้ช่วย AI อัจฉริยะ (WorkFlow AI)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1] font-semibold">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-[#827A94] mt-0.5">
              จัดลำดับความสำคัญของงานด้วย Eisenhower Matrix และปรึกษาการบริหารจัดการงานออฟฟิศ
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F8F7FC] p-1 rounded-xl border border-[#EBE7F7] text-xs font-medium self-start sm:self-center">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                : 'text-[#676179] hover:text-[#373145]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Eisenhower Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white text-[#6B46C1] font-bold shadow-2xs'
                : 'text-[#676179] hover:text-[#373145]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>แชทปรึกษา AI</span>
          </button>
        </div>
      </div>

      {activeTab === 'matrix' && (
        <>
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-[#FAF8FF] via-[#F4EFFE] to-[#EBE2FF] rounded-2xl border border-[#DCD0F7] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#6B46C1] uppercase tracking-wider">
                  บทวิเคราะห์ภาพรวมงาน
                </span>
                <p className="text-sm font-semibold text-[#373145] mt-1">
                  {aiSummary || 'กำลังประมวลผลการจัดลำดับงาน...'}
                </p>
                {aiAdvice && (
                  <p className="text-xs text-[#5D5570] mt-2 bg-white/70 p-2.5 rounded-xl border border-white">
                    💡 <strong>คำแนะนำ:</strong> {aiAdvice}
                  </p>
                )}
              </div>

              <button
                onClick={fetchPrioritization}
                disabled={loadingPrioritize}
                className="p-2 rounded-xl bg-white hover:bg-[#FAF9FD] text-[#6B46C1] border border-[#E0D9F2] shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                title="วิเคราะห์ใหม่"
              >
                <RefreshCw className={`w-4 h-4 ${loadingPrioritize ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Eisenhower Matrix 4 Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Q1: Do First (สำคัญ & ด่วน) */}
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-rose-900">
                      ทำทันที (Do First)
                    </h3>
                    <p className="text-[11px] text-rose-600 font-medium">สำคัญมาก & ด่วนมาก</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {eisenhower.doFirst.length} งาน
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eisenhower.doFirst.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ไม่มีงานวิกฤตในหมวดหมู่นี้</p>
                ) : (
                  eisenhower.doFirst.map((id) => {
                    const task = getTaskById(id);
                    if (!task) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => openEditTaskModal(task)}
                        className="p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-rose-950 truncate">{task.title}</p>
                          <PriorityBadge priority={task.priority} size="xs" useShortLabel />
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {task.category} | กำหนดส่ง: {task.dueDate}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Q2: Schedule (สำคัญ แต่ไม่ด่วน) */}
            <div className="bg-white rounded-2xl border border-[#D5CEEB] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5F5] mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E9E1FF] text-[#6B46C1] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#373145]">
                      วางแผนจัดเวลา (Schedule)
                    </h3>
                    <p className="text-[11px] text-[#6B46C1] font-medium">สำคัญ แต่ยังไม่ด่วน</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#6B46C1]">
                  {eisenhower.schedule.length} งาน
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eisenhower.schedule.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ไม่มีงานในหมวดนี้</p>
                ) : (
                  eisenhower.schedule.map((id) => {
                    const task = getTaskById(id);
                    if (!task) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => openEditTaskModal(task)}
                        className="p-2.5 rounded-xl bg-[#FAF9FD] hover:bg-[#F4F1FB] border border-[#EBE7F7] cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-[#373145] truncate">{task.title}</p>
                          <PriorityBadge priority={task.priority} size="xs" useShortLabel />
                        </div>
                        <p className="text-[11px] text-[#8C84A0] mt-0.5">
                          {task.category} | กำหนดส่ง: {task.dueDate}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Q3: Delegate (ไม่สำคัญ แต่ด่วน / งานประสานงาน) */}
            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF0D9] text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-amber-900">
                      มอบหมาย / ทวงถาม (Delegate)
                    </h3>
                    <p className="text-[11px] text-amber-700 font-medium">ด่วน แต่ส่งต่อหรือตามได้</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF0D9] text-amber-800">
                  {eisenhower.delegate.length} งาน
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eisenhower.delegate.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ไม่มีงานที่ต้องส่งต่อ</p>
                ) : (
                  eisenhower.delegate.map((id) => {
                    const task = getTaskById(id);
                    if (!task) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => openEditTaskModal(task)}
                        className="p-2.5 rounded-xl bg-[#FFFBF5] hover:bg-[#FFF6E9] border border-amber-200/60 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-[#373145] truncate">{task.title}</p>
                          <PriorityBadge priority={task.priority} size="xs" useShortLabel />
                        </div>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          {task.department || task.category}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Q4: Eliminate / Don't Do (ไม่สำคัญ & ไม่ด่วน) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                      ตัดทิ้งหรือทำทีหลัง (Eliminate)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">ไม่ด่วน & ผลกระทบต่ำ</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {eisenhower.dontDo.length} งาน
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eisenhower.dontDo.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ไม่มีงานที่ควรตัดทิ้ง</p>
                ) : (
                  eisenhower.dontDo.map((id) => {
                    const task = getTaskById(id);
                    if (!task) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => openEditTaskModal(task)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-700 truncate">{task.title}</p>
                          <PriorityBadge priority={task.priority} size="xs" useShortLabel />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-[#E9E5F5] overflow-hidden shadow-xs flex flex-col h-[580px]">
          {/* Quick prompts pills */}
          <div className="p-3 bg-[#F8F7FC] border-b border-[#E9E5F5] flex items-center gap-2 overflow-x-auto">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-[#E9E1FF] hover:text-[#6B46C1] border border-[#E5E1F2] text-xs font-medium text-[#514B62] transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                      isAi
                        ? 'bg-[#E9E1FF] text-[#7C3AED]'
                        : 'bg-[#9B82D7] text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      isAi
                        ? 'bg-[#FAF9FD] border border-[#EBE7F7] text-[#373145]'
                        : 'bg-[#9B82D7] text-white'
                    }`}
                  >
                    {msg.text}
                    {msg.time && (
                      <p
                        className={`text-[10px] mt-1.5 ${
                          isAi ? 'text-[#8C84A0]' : 'text-purple-100'
                        }`}
                      >
                        {msg.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-[#7C3AED] p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>WorkFlow AI กำลังคิดคำตอบ...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-[#F0EDF9] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="พิมพ์ข้อความปรึกษา AI เช่น สรุปงานวันนี้, ร่างข้อความตามงาน..."
              className="flex-1 px-4 py-2 text-xs bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loadingChat || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
