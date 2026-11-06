import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Clock,
  Printer,
  Download,
  Calendar,
  AlertCircle,
  Building,
  Award,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { formatThaiDate } from '../../utils/thaiDate';

export const WeeklyReportView: React.FC = () => {
  const { tasks, categories, followUps, userSettings } = useWorkFlow();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate < new Date().toISOString().split('T')[0]
  );

  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Productivity score calculation
  const productivityScore = Math.min(
    100,
    Math.round(completionRate * 0.7 + (totalTasks > 0 ? (1 - overdueTasks.length / totalTasks) * 30 : 0))
  );

  // Category distribution
  const categoryStats = categories.map((c) => {
    const catTasks = tasks.filter((t) => t.category === c.name);
    const catDone = catTasks.filter((t) => t.status === 'done').length;
    return {
      name: c.name,
      total: catTasks.length,
      done: catDone,
      color: c.color,
      bgColor: c.bgColor,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const reportText = `สรุปผลการทำงานประจำสัปดาห์ - WorkFlow
เจ้าของงาน: ${userSettings.userName} (${userSettings.userRole})
วันที่จัดทำ: ${formatThaiDate(new Date(), { includeDayName: true })}
-------------------------------------------
คะแนนประสิทธิภาพ (Productivity Score): ${productivityScore}%
งานทั้งหมด: ${totalTasks} งาน
เสร็จสิ้นแล้ว: ${doneTasks.length} งาน (${completionRate}%)
งานที่อยู่ระหว่างดำเนินการ: ${inProgressTasks.length} งาน
งานที่เกินกำหนด: ${overdueTasks.length} งาน

งานสำคัญที่ทำสำเร็จ:
${doneTasks.map((t, idx) => `${idx + 1}. ${t.title} (${t.category})`).join('\n')}

งานที่ยังรอติดตามจากผู้อื่น:
${followUps.filter((f) => f.status !== 'resolved').map((f) => `- ${f.contactName} (${f.department}): ${f.taskTitle}`).join('\n')}
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkFlow_Weekly_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in print:p-0">
      {/* Top Header & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#DDF3E7] text-emerald-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-[#373145]">
              รายงานสรุปผลงานรายสัปดาห์ (Weekly Report)
            </h2>
          </div>
          <p className="text-xs text-[#827A94] mt-1">
            สรุปความก้าวหน้า วิเคราะห์เวลา และประเมินผลการดำเนินงานสำหรับเสนอบริหาร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E1F2] text-xs font-semibold text-[#514B62] shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ดาวน์โหลดสรุป</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Main Score & Metrics Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Productivity Score */}
        <div className="bg-gradient-to-br from-white to-[#F8F5FE] p-6 rounded-2xl border border-[#DED6F2] shadow-xs flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#EAE6F5]"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#9B82D7]"
                strokeDasharray={`${productivityScore}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-[#373145]">{productivityScore}</span>
              <span className="text-[10px] block font-semibold text-[#8C84A0]">%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B46C1] mb-1">
              <Award className="w-4 h-4" />
              <span>ดัชนีประสิทธิภาพงาน</span>
            </div>
            <h3 className="font-bold text-sm text-[#373145]">
              {productivityScore >= 80
                ? 'ยอดเยี่ยมมาก! (High Productivity)'
                : productivityScore >= 60
                ? 'ระดับมาตรฐาน (Good Performance)'
                : 'ควรปรับจังหวะงาน (Needs Attention)'}
            </h3>
            <p className="text-[11px] text-[#736B85] mt-1 leading-relaxed">
              อัตราความสำเร็จของงานสัปดาห์นี้อยู่ที่ {completionRate}% โดยจัดการงานสำคัญได้อย่างมีประสิทธิภาพ
            </p>
          </div>
        </div>

        {/* Planned vs Done */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C84A0] font-medium mb-1">
              <span>งานตามแผนเทียบงานสำเร็จ</span>
              <TrendingUp className="w-4 h-4 text-[#9B82D7]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">{doneTasks.length}</span>
              <span className="text-sm font-semibold text-slate-400">/ {totalTasks} งานที่วางแผนไว้</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EDF9] text-xs flex items-center justify-between">
            <span className="text-[#514B62]">งานรอดำเนินการ:</span>
            <span className="font-bold text-[#6B46C1]">{inProgressTasks.length} งาน</span>
          </div>
        </div>

        {/* Overdue & Bottleneck */}
        <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C84A0] font-medium mb-1">
              <span>ความเสี่ยงและงานค้างสะดุด</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-rose-600">{overdueTasks.length}</span>
              <span className="text-sm font-semibold text-slate-400">งานเกินกำหนด</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EDF9] text-xs flex items-center justify-between">
            <span className="text-[#514B62]">งานที่รอคำตอบจากผู้อื่น:</span>
            <span className="font-bold text-amber-700">
              {followUps.filter((f) => f.status !== 'resolved').length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Key Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#373145] pb-3 border-b border-[#F0EDF9] mb-4">
            สัดส่วนงานตามหมวดหมู่
          </h3>

          <div className="space-y-3.5">
            {categoryStats.map((cat, idx) => {
              const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#514B62]">{cat.name}</span>
                    <span className="text-[#8C84A0]">
                      {cat.done} / {cat.total} งาน ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE6F5] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ backgroundColor: cat.color, width: `${pct}%` }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="bg-white rounded-2xl border border-[#E9E5F5] p-5 shadow-xs">
          <h3 className="font-bold text-sm text-[#373145] pb-3 border-b border-[#F0EDF9] mb-4">
            ผลงานสำคัญที่ส่งมอบสำเร็จแล้ว
          </h3>

          {doneTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              ยังไม่มีงานที่ทำเครื่องหมายว่าเสร็จสิ้นในสัปดาห์นี้
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {doneTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#373145]">{t.title}</h4>
                    <p className="text-[11px] text-[#8C84A0] mt-0.5">
                      หมวดหมู่: {t.category} {t.department ? `| ${t.department}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
