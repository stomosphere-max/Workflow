import React from 'react';
import {
  Download,
  X,
  Share,
  PlusSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const PWAInstallModals: React.FC = () => {
  const {
    isInstalled,
    hasPrompt,
    isIOS,
    isSafari,
    showIOSModal,
    setShowIOSModal,
    showConfirmModal,
    setShowConfirmModal,
    installSuccessToast,
    setInstallSuccessToast,
    confirmInstall,
  } = usePWA();

  return (
    <>
      {/* 1. Android / Desktop Prompt Confirmation Modal */}
      {showConfirmModal && !isInstalled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E1FF] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F4F1FB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon & Badge */}
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#9B82D7] to-[#B39EEB] p-0.5 shadow-lg shadow-[#9B82D7]/30 flex items-center justify-center">
                  <img
                    src="/pwa-192x192.png"
                    alt="WorkFlow Icon"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#373145]">ติดตั้ง WorkFlow</h3>
              <p className="text-xs text-[#827A94] mt-1 max-w-xs">
                Smart Personal Work Planner สำหรับพนักงานออฟฟิศ
              </p>
            </div>

            {/* Feature highlights */}
            <div className="bg-[#FAF9FD] rounded-2xl p-4 border border-[#EBE7F7] space-y-3 mb-6 text-xs text-[#514B62]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[#373145]">เปิดใช้งานแบบเต็มหน้าจอ</p>
                  <p className="text-[#8C84A0] text-[11px]">
                    เปิดแอปได้จากหน้าจอหลักโดยตรง ไร้แถบที่อยู่ของเบราว์เซอร์
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#DDF3E7] text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[#373145]">โหลดไวและใช้งานออฟไลน์</p>
                  <p className="text-[#8C84A0] text-[11px]">
                    ระบบแคชข้อมูลผ่าน Service Worker ทำงานได้ลื่นไหลแม้เน็ตหลุด
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#FFF0D9] text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[#373145]">ปลอดภัยและเป็นส่วนตัว</p>
                  <p className="text-[#8C84A0] text-[11px]">
                    ข้อมูลทั้งหมดเก็บอยู่ในอุปกรณ์ของคุณ ไม่มีการส่งออกภายนอก
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2DCF0] text-xs font-semibold text-[#676179] hover:bg-[#F8F7FC] transition-colors cursor-pointer"
              >
                ไว้คราวหลัง
              </button>
              <button
                type="button"
                onClick={confirmInstall}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-xs font-bold text-white shadow-md shadow-[#9B82D7]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{hasPrompt ? 'ยืนยันติดตั้งแอป' : 'ติดตั้ง WorkFlow'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS Safari Add to Home Screen Step-by-Step Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E1FF] relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F4F1FB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#F0EDF9]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9B82D7] to-[#E9E1FF] p-0.5 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="/apple-touch-icon.png"
                  alt="WorkFlow"
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#373145]">
                  ติดตั้ง WorkFlow บน iPhone / iPad
                </h3>
                <p className="text-xs text-[#827A94]">
                  เพิ่มไอคอนลงบนหน้าจอโฮมเพื่อใช้งานแบบแอป
                </p>
              </div>
            </div>

            {/* Non-Safari Warning */}
            {isIOS && !isSafari && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">คำแนะนำ:</span> เพื่อความสะดวก กรุณาเปิดเว็บไซต์นี้ด้วย{' '}
                  <span className="font-semibold underline">Safari</span> เพื่อรองรับปุ่ม &quot;เพิ่มไปยังหน้าจอโฮม&quot;
                </div>
              </div>
            )}

            {/* Steps with Visual UI */}
            <div className="space-y-4 my-5 text-xs text-[#514B62]">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E9E1FF] text-[#7C3AED] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#373145]">
                    แตะที่ปุ่ม <span className="text-[#7C3AED] font-bold">แชร์ (Share)</span>
                  </p>
                  <p className="text-[#8C84A0] text-[11px] mt-0.5">
                    อยู่ที่แถบเมนูด้านล่างสุดของหน้าจอ Safari
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9FD] border border-[#E9E5F5] text-[#7C3AED] font-semibold text-xs">
                    <Share className="w-4 h-4 text-[#7C3AED]" />
                    <span>ไอคอนแชร์ (ลูกศรชี้ขึ้น)</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E9E1FF] text-[#7C3AED] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#373145]">
                    เลื่อนลงและเลือก <span className="text-[#7C3AED] font-bold">&quot;เพิ่มไปยังหน้าจอโฮม&quot;</span>
                  </p>
                  <p className="text-[#8C84A0] text-[11px] mt-0.5">
                    หรือ &quot;Add to Home Screen&quot;
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9FD] border border-[#E9E5F5] text-[#373145] font-semibold text-xs">
                    <PlusSquare className="w-4 h-4 text-[#9B82D7]" />
                    <span>เพิ่มไปยังหน้าจอโฮม</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E9E1FF] text-[#7C3AED] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#373145]">
                    แตะที่คำว่า <span className="text-[#7C3AED] font-bold">&quot;เพิ่ม&quot; (Add)</span>
                  </p>
                  <p className="text-[#8C84A0] text-[11px] mt-0.5">
                    ที่มุมขวาบนของหน้าจอ แล้วไอคอน WorkFlow จะปรากฏบนหน้าจอหลักของคุณทันที
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#9B82D7] hover:bg-[#886EC9] text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* 3. Success Toast Notification */}
      {installSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-white rounded-2xl shadow-xl border border-emerald-200 p-3.5 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-800">ติดตั้ง WorkFlow สำเร็จแล้ว 🎉</p>
            <p className="text-[11px] text-slate-500 truncate">
              เปิดใช้งานได้โดยตรงจากไอคอนบนหน้าจอหลักได้ทันที
            </p>
          </div>
          <button
            onClick={() => setInstallSuccessToast(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
