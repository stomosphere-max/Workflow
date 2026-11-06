import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
    return null;
  }
};

// AI Endpoint: Prioritize tasks (Eisenhower matrix & Daily execution plan)
app.post('/api/ai/prioritize', async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'ไม่พบรายการงานที่ส่งมา' });
    }

    const ai = getAiClient();
    if (ai) {
      const prompt = `คุณคือผู้ช่วยบริหารจัดการงานมืออาชีพในออฟฟิศไทย
กรุณาวิเคราะห์รายการงานต่อไปนี้ และจัดลำดับความสำคัญตาม Eisenhower Matrix พร้อมแนะนำลำดับการทำงานที่เหมาะสมที่สุดสำหรับวันนี้

รายการงาน:
${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, deadline: t.dueDate, category: t.category })), null, 2)}

ตอบกลับเป็นรูปแบบ JSON เดียวเท่านั้น (ไม่ต้องมี markdown code fence หรืออักษรอื่น) ตามโครงสร้าง:
{
  "summary": "สรุปภาพรวมสั้นๆ 1-2 ประโยค",
  "dailyScheduleSuggestion": [
    { "timeSlot": "ช่วงเช้า 09:00 - 11:30", "taskId": "id ของงาน", "action": "สิ่งที่ควรทำก่อนเพราะเหตุใด" }
  ],
  "eisenhower": {
    "doFirst": ["id งานที่สำคัญและด่วน"],
    "schedule": ["id งานที่สำคัญแต่ไม่ด่วน"],
    "delegate": ["id งานที่ไม่สำคัญแต่ด่วน หรือควรตามจากผู้อื่น"],
    "dontDo": ["id งานที่ไม่สำคัญและไม่ด่วน"]
  },
  "aiAdvice": "คำแนะนำเพิ่มเติมในการจัดการพลังงานและการทำงานวันนี้ 2 ข้อ"
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed, isLiveAi: true });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart local engine:', geminiError);
      }
    }

    // Smart heuristic fallback
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
    const normalTasks = tasks.filter(t => t.priority === 'medium' || t.priority === 'low');

    const fallbackResult = {
      summary: `มีงานทั้งหมด ${tasks.length} งาน โดยมีงานเร่งด่วน ${urgentTasks.length} งานที่ควรจัดการก่อนช่วงเที่ยง เพื่อป้องกันการสะดุดของทีม`,
      dailyScheduleSuggestion: [
        {
          timeSlot: 'ช่วงเช้า (09:00 - 11:30)',
          taskId: urgentTasks[0]?.id || tasks[0]?.id,
          action: 'เคลียร์งานเร่งด่วนและงานที่ต้องส่งต่อให้เพื่อนร่วมงานหรือหัวหน้าอนุมัติ'
        },
        {
          timeSlot: 'ช่วงบ่ายต้น (13:00 - 15:30)',
          taskId: urgentTasks[1]?.id || normalTasks[0]?.id || tasks[0]?.id,
          action: 'โฟกัสงานที่ต้องใช้สมาธิสูง งานเอกสาร หรือเตรียมข้อมูลประชุม'
        },
        {
          timeSlot: 'ช่วงบ่ายปลาย (15:30 - 17:30)',
          taskId: normalTasks[1]?.id || tasks[tasks.length - 1]?.id,
          action: 'ตรวจทานความคืบหน้า ตอบอีเมล ประสานงานติดตามงาน และวางแผนวันถัดไป'
        }
      ],
      eisenhower: {
        doFirst: urgentTasks.map(t => t.id),
        schedule: normalTasks.map(t => t.id),
        delegate: [],
        dontDo: []
      },
      aiAdvice: 'แนะนำให้ใช้เทคนิค Time Blocking 50 นาที พัก 10 นาที เพื่อรักษาพลังงานตลอดทั้งวัน และหลีกเลี่ยงการเปิดอีเมลขณะทำงานที่ต้องใช้สมาธิสูง'
    };

    return res.json({ success: true, data: fallbackResult, isLiveAi: false });
  } catch (error) {
    console.error('Error in /api/ai/prioritize:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผล' });
  }
});

// AI Endpoint: Generate Subtasks (Breakdown)
app.post('/api/ai/generate-subtasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'กรุณาระบุชื่องาน' });
    }

    const ai = getAiClient();
    if (ai) {
      const prompt = `ช่วยแตกงานออฟฟิศชิ้นนี้: "${title}" ${description ? `(รายละเอียด: ${description})` : ''} ออกเป็นขั้นตอนย่อย (Checklist) ที่ชัดเจนและทำตามได้จริง 3-5 ข้อ
ตอบเป็น JSON array ของ string สั้นๆ เช่น:
["ตรวจสอบข้อมูลดิบจากฝ่ายบัญชี", "จัดทำสไลด์สรุปเนื้อหาหลัก 5 หน้า", "นัดหมายหัวหน้าเพื่อตรวจทานก่อน 1 วัน"]`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '[]');
        return res.json({ success: true, subtasks: Array.isArray(parsed) ? parsed : [], isLiveAi: true });
      } catch (err) {
        console.warn('Gemini subtask failed, fallback to smart breakdown:', err);
      }
    }

    // Smart heuristic fallback based on task title keywords
    const lower = title.toLowerCase();
    let subtasks = [
      `รวบรวมข้อมูลและเอกสารที่เกี่ยวข้องกับ "${title}"`,
      `จัดทำร่างข้อมูลหรือขั้นตอนการดำเนินงานฉบับแรก`,
      `ตรวจสอบความถูกต้องร่วมกับผู้เกี่ยวข้อง`,
      `ส่งมอบหรือสรุปผลการดำเนินงานเสร็จสมบูรณ์`
    ];

    if (lower.includes('ประชุม') || lower.includes('meeting')) {
      subtasks = [
        'กำหนดวาระการประชุม (Agenda) และรายชื่อผู้เข้าร่วม',
        'ส่งปฏิทินนัดหมายพร้อมแนบเอกสารล่วงหน้าอย่างน้อย 1 วัน',
        'เตรียมห้องประชุมและทดสอบระบบนำเสนอ/เสียง',
        'จดบันทึกการประชุมและสรุป Action Items ส่งให้ทีม'
      ];
    } else if (lower.includes('รายงาน') || lower.includes('report') || lower.includes('สรุป')) {
      subtasks = [
        'ดึงข้อมูลสถิติตัวเลขและยอดสรุปจากระบบ',
        'วิเคราะห์ประเด็นสำคัญและแนวโน้มที่เกิดขึ้น',
        'จัดรูปแบบการนำเสนอให้กระชับ เข้าใจง่าย',
        'ตรวจทานตัวเลขและส่งให้ผู้บริหารตรวจสอบ'
      ];
    } else if (lower.includes('จัดซื้อ') || lower.includes('ขออนุมัติ') || lower.includes('po')) {
      subtasks = [
        'ขอใบเสนอราคาเปรียบเทียบจากผู้ขายอย่างน้อย 2-3 ราย',
        'กรอกแบบฟอร์มขออนุมัติจัดซื้อพร้อมแนบเหตุผลความจำเป็น',
        'ส่งขออนุมัติตามลำดับขั้น (Manager / Finance)',
        'ติดตามเลขที่ PO และประสานงานส่งของกับผู้ขาย'
      ];
    }

    return res.json({ success: true, subtasks, isLiveAi: false });
  } catch (error) {
    console.error('Error in /api/ai/generate-subtasks:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแตกงานย่อย' });
  }
});

// AI Endpoint: Generate Follow-up Message (LINE / Slack / Email)
app.post('/api/ai/followup-message', async (req, res) => {
  try {
    const { contactName, department, taskTitle, channel, urgency, contextNotes } = req.body;

    const ai = getAiClient();
    if (ai) {
      const prompt = `เขียนข้อความติดตามงานภาษาไทยอย่างมืออาชีพ สุภาพ ชัดเจน และมีกาลเทศะ
ข้อมูล:
- ถึงคุณ: ${contactName || 'เพื่อนร่วมงาน'}
- แผนก: ${department || 'ผู้เกี่ยวข้อง'}
- ชื่องาน: ${taskTitle}
- ช่องทาง: ${channel || 'LINE'}
- ระดับความเร่งด่วน: ${urgency || 'ปกติ'}
- บันทึกเพิ่มเติม: ${contextNotes || 'ไม่มี'}

ตอบเป็น JSON:
{
  "subject": "หัวข้อ (สำหรับอีเมล หรือหัวเรื่อง)",
  "message": "เนื้อหาข้อความทั้งหมดที่สามารถกด Copy ไปส่งได้ทันที",
  "tips": "คำแนะนำสั้นๆ ในการสื่อสาร"
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed, isLiveAi: true });
      } catch (err) {
        console.warn('Gemini follow-up message failed, fallback:', err);
      }
    }

    const name = contactName || 'คุณ';
    const isEmail = channel === 'Email';
    const isUrgent = urgency === 'urgent' || urgency === 'high';

    const fallback = {
      subject: `[ติดตามงาน] ${taskTitle} - ขออนุญาตสอบถามความคืบหน้า`,
      message: isEmail
        ? `เรียน ${name} (${department || 'ทีมงาน'})\n\nสืบเนื่องจากงาน "${taskTitle}" ที่เราได้ประสานงานกันไว้ ${isUrgent ? 'เนื่องจากใกล้ถึงกำหนดส่งแล้ว' : 'ขออนุญาตสอบถามความคืบหน้า'}\n\nไม่ทราบว่าขณะนี้งานดำเนินไปถึงขั้นตอนใดแล้ว หรือมีข้อมูลใดที่ต้องการให้ทางผม/ดิฉันสนับสนุนเพิ่มเติมหรือไม่ครับ/ค่ะ?\n\nหากสะดวกรบกวนแจ้งอัปเดตสั้นๆ ให้ทราบด้วยนะครับ/ค่ะ\nขอบคุณมากครับ/ค่ะ`
        : `สวัสดีครับ/ค่ะ ${name} 😊 ขออนุญาตสอบถามความคืบหน้างาน "${taskTitle}" นิดนึงนะครับ/ค่ะ ${isUrgent ? 'พอดีมีกำหนดสรุปในเร็วๆ นี้' : ''} มีติดขัดตรงไหนให้ช่วยประสานงานเพิ่มเติมแจ้งได้เลยนะครับ ขอบคุณมากครับ 🙏`,
      tips: isUrgent
        ? 'งานเร่งด่วน แนะนำให้โทรสอบถามโดยตรง หรือทัก LINE ส่วนตัวเพื่อความรวดเร็ว'
        : 'ส่งข้อความช่วงเวลา 09:30 - 11:30 หรือ 14:00 - 16:00 เพื่อให้ผู้รับสะดวกอ่านและตอบกลับ'
    };

    return res.json({ success: true, data: fallback, isLiveAi: false });
  } catch (error) {
    console.error('Error in /api/ai/followup-message:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างข้อความติดตามงาน' });
  }
});

// AI Endpoint: Chat / Daily Standup / Productivity Advisor
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, tasksContext, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'กรุณาส่งข้อความ' });
    }

    const ai = getAiClient();
    if (ai) {
      const systemInstruction = `คุณคือ WorkFlow AI - ผู้ช่วยวางแผนและบริหารจัดการงานส่วนตัวสำหรับคนทำงานออฟฟิศไทย
คุณมีบุคลิกภาพที่สุภาพ เป็นมิตร กระตือรือร้น และให้คำแนะนำที่นำไปปฏิบัติได้จริง (Actionable & Practical)
เน้นการช่วยลดความเครียดจากการทำงาน ป้องกันงานตกหล่น แนะนำเทคนิค Time Management เช่น Pomodoro, Eisenhower Matrix, และวิธีสื่อสารกับเพื่อนร่วมงาน
ตอบเป็นภาษาไทยที่อ่านง่าย มีการจัดข้อความด้วย Bullet point และเน้นคำสำคัญ`;

      const prompt = `บริบทงานปัจจุบันของผู้ใช้:
${tasksContext ? JSON.stringify(tasksContext) : 'ไม่มีข้อมูลงาน'}

คำถามหรือคำขอของผู้ใช้: "${message}"`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
        return res.json({ success: true, reply: response.text, isLiveAi: true });
      } catch (err) {
        console.warn('Gemini chat failed, fallback:', err);
      }
    }

    // Smart heuristic responses for common office queries
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('standup') || lower.includes('ประชุมเช้า') || lower.includes('สรุปงาน')) {
      reply = `📋 **สรุป Daily Standup สำหรับวันนี้:**

1. **เมื่อวานทำอะไรไปแล้ว:**
   - เคลียร์งานเอกสารและตรวจทานความเรียบร้อยของรายงานประจำสัปดาห์
   - ประสานงานติดตามข้อมูลจากทีมที่เกี่ยวข้อง

2. **วันนี้จะทำอะไรบ้าง:**
   - โฟกัสงานที่มีความสำคัญอันดับหนึ่งช่วงเช้า (Deep Work 2 ชั่วโมง)
   - สรุปตัวเลขผลการดำเนินงานและจัดเตรียมสไลด์สำหรับประชุม
   - ติดตามงานที่ค้างคำตอบจากแผนกอื่น

3. **มีปัญหาหรืออุปสรรคใด (Blockers):**
   - ยังรอข้อมูลเพิ่มเติมบางส่วน หากบ่ายนี้ยังไม่ได้จะโทรติดตามโดยตรง`;
    } else if (lower.includes('เหนื่อย') || lower.includes('เครียด') || lower.includes('งานเยอะ')) {
      reply = `💜 **เข้าใจเลยครับ ช่วงที่งานเยอะอาจทำให้รู้สึก Overwhelmed ได้ง่าย ขอแนะนำ 3 ข้อง่ายๆ ตอนนี้:**

1. **หยุดพักหายใจ 3 นาที:** ลุกไปดื่มน้ำสักแก้ว หรือมองออกไปนอกหน้าต่างเพื่อพักสายตา
2. **เลือกทำแค่ 1 งานที่สำคัญที่สุด:** ไม่ต้องมองทั้งกอง เอาเฉพาะงานที่จะปลดล็อกเรื่องอื่นก่อนเพียง 1 ชิ้น
3. **ตัดสิ่งที่ไม่จำเป็นออก:** เลื่อนงานที่ไม่ด่วนและไม่สำคัญออกไปวันพรุ่งนี้`;
    } else {
      reply = `✨ **คำแนะนำจาก WorkFlow AI:**
จากรายการงานปัจจุบัน ขอแนะนำให้แบ่งเวลาทำงานเป็นบล็อก (Time-boxing) 
- ช่วงเช้า 09:30 - 11:30 ควรเป็นช่วงโฟกัสสูง (ไม่เปิดการแจ้งเตือน)
- เคลียร์งานด่วนให้เสร็จก่อนเที่ยง จะช่วยลดความกดดันตลอดช่วงบ่ายได้อย่างมากครับ!`;
    }

    return res.json({ success: true, reply, isLiveAi: false });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสนทนากับ AI' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`WorkFlow server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
