import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Briefcase,
  Building,
  Image as ImageIcon,
  Check,
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';

const PRESET_AVATARS = [
  {
    name: 'สไตล์ 1 (มืออาชีพ หญิง)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'สไตล์ 2 (มืออาชีพ ชาย)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'สไตล์ 3 (นักบริหาร หญิง)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'สไตล์ 4 (สายไอที ชาย)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'สไตล์ 5 (ผู้จัดการ หญิง)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
];

/**
 * Compresses and scales image file to a lightweight data URL
 * so it fits smoothly in LocalStorage without performance lag.
 */
function compressAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with good quality (0.85) to keep payload ~30-50KB
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const EditProfileModal: React.FC = () => {
  const { userSettings, updateUserSettings, isProfileModalOpen, closeProfileModal } =
    useWorkFlow();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userName, setUserName] = useState(userSettings.userName);
  const [userRole, setUserRole] = useState(userSettings.userRole);
  const [department, setDepartment] = useState(userSettings.department);
  const [avatarUrl, setAvatarUrl] = useState(userSettings.avatarUrl);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (isProfileModalOpen) {
      setUserName(userSettings.userName);
      setUserRole(userSettings.userRole);
      setDepartment(userSettings.department);
      setAvatarUrl(userSettings.avatarUrl);
      setUploadedFileName(null);
      setShowSavedFeedback(false);
    }
  }, [isProfileModalOpen, userSettings]);

  if (!isProfileModalOpen) return null;

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP, GIF)');
      return;
    }

    setIsProcessingImage(true);
    try {
      const dataUrl = await compressAndResizeImage(file);
      setAvatarUrl(dataUrl);
      setUploadedFileName(file.name);
    } catch (error) {
      console.error('Error processing image file:', error);
      alert('ไม่สามารถประมวลผลไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleResetAvatar = () => {
    setAvatarUrl(PRESET_AVATARS[0].url);
    setUploadedFileName(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    updateUserSettings({
      userName: userName.trim(),
      userRole: userRole.trim(),
      department: department.trim(),
      avatarUrl: avatarUrl.trim() || userSettings.avatarUrl,
    });

    setShowSavedFeedback(true);
    setTimeout(() => {
      closeProfileModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E9E5F5] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0EDF9] flex items-center justify-between bg-[#F8F7FC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#373145]">แก้ไขข้อมูลโปรไฟล์</h3>
              <p className="text-[11px] text-[#8C84A0]">
                ปรับเปลี่ยนชื่อ ตำแหน่งงาน และอัปโหลดรูปภาพส่วนตัวจากเครื่อง
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Live Preview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#FAF8FF] via-[#F4EFFE] to-[#EFE7FE] border border-[#E5DCF8] flex items-center gap-4 shadow-2xs">
            {/* Clickable Avatar to Upload */}
            <div
              onClick={handleTriggerFileInput}
              className="relative cursor-pointer group shrink-0"
              title="คลิกเพื่อเลือกรูปภาพจากเครื่อง"
            >
              <img
                src={avatarUrl || userSettings.avatarUrl}
                alt="Preview Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#9B82D7] shadow-sm group-hover:brightness-90 transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = userSettings.avatarUrl;
                }}
              />
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 bg-[#9B82D7] text-white p-1 rounded-full border-2 border-white shadow-xs">
                <Upload className="w-2.5 h-2.5" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#373145] truncate">
                {userName || 'ชื่อผู้ใช้งาน'}
              </p>
              <p className="text-xs text-[#6B46C1] font-semibold truncate mt-0.5">
                {userRole || 'ตำแหน่งงาน'}
              </p>
              <p className="text-[11px] text-[#8C84A0] truncate">
                {department || 'ฝ่าย / แผนก'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerFileInput}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF9FD] text-[#6B46C1] font-semibold border border-[#DCD0F7] shadow-2xs text-[11px] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#9B82D7]" />
              <span>เปลี่ยนรูป</span>
            </button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block font-semibold text-[#514B62] mb-1">
              ชื่อ - นามสกุล (หรือชื่อเล่นที่ใช้ทำงาน) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9B82D7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="เช่น ศุภวิชญ์ พัฒนวรกุล (กัปตัน)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
              />
            </div>
          </div>

          {/* Role / Position Input */}
          <div>
            <label className="block font-semibold text-[#514B62] mb-1">
              ตำแหน่งงาน (Job Title / Role) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#9B82D7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                placeholder="เช่น Senior Project Specialist, Marketing Manager..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
              />
            </div>
          </div>

          {/* Department Input */}
          <div>
            <label className="block font-semibold text-[#514B62] mb-1">
              ฝ่าย / แผนก (Department)
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#9B82D7] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น ฝ่ายพัฒนาธุรกิจ, ฝ่ายการตลาด, ฝ่ายการเงิน..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F7FC] focus:bg-white border border-[#E5E1F2] focus:border-[#9B82D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B82D7]/20 text-[#373145]"
              />
            </div>
          </div>

          {/* 1. Primary: Upload from Device */}
          <div className="pt-2 border-t border-[#F0EDF9]">
            <label className="block font-semibold text-[#514B62] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#9B82D7]" />
                <span>เลือกรูปภาพส่วนตัวจากไฟล์ในเครื่อง (Device Upload)</span>
              </span>
              {uploadedFileName && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  อัปโหลดแล้ว: {uploadedFileName}
                </span>
              )}
            </label>

            <div
              onClick={handleTriggerFileInput}
              className="p-3.5 rounded-xl border-2 border-dashed border-[#D7CEEB] hover:border-[#9B82D7] bg-[#FAF8FE] hover:bg-[#F4EFFE] text-center cursor-pointer transition-all group"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-[#7C3AED] group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#514B62] group-hover:text-[#6B46C1]">
                    {isProcessingImage
                      ? 'กำลังประมวลผลรูปภาพ...'
                      : 'คลิกเพื่อเลือกรูปภาพจากมือถือหรือคอมพิวเตอร์'}
                  </p>
                  <p className="text-[10px] text-[#8C84A0] mt-0.5">
                    รองรับไฟล์ JPG, PNG, WEBP, GIF (ปรับขนาดและบีบอัดอัตโนมัติ)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Secondary: Preset Avatars */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#514B62]">
                หรือเลือกจากรูปภาพมาตรฐาน
              </span>
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-[11px] text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ใช้รูปเริ่มต้น</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(avatar.url);
                    setUploadedFileName(null);
                  }}
                  className={`relative p-0.5 rounded-full transition-transform cursor-pointer shrink-0 ${
                    avatarUrl === avatar.url
                      ? 'scale-110 ring-2 ring-[#9B82D7] shadow-xs'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={avatar.name}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {avatarUrl === avatar.url && (
                    <span className="absolute -top-1 -right-1 bg-[#9B82D7] text-white rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL input option */}
            <div className="mt-2.5 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="url"
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setUploadedFileName(null);
                }}
                placeholder="หรือวางลิงก์รูปภาพ URL (https://...)..."
                className="w-full px-2.5 py-1 text-[11px] bg-[#FAF9FD] border border-[#E5E1F2] rounded-lg focus:outline-none focus:border-[#9B82D7] text-[#373145]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#F0EDF9] flex items-center justify-between">
            {showSavedFeedback ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> บันทึกโปรไฟล์เรียบร้อยแล้ว!
              </span>
            ) : (
              <span className="text-[11px] text-[#8C84A0]">
                กดบันทึกเพื่ออัปเดตข้อมูล
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeProfileModal}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isProcessingImage}
                className="px-5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] active:scale-[0.98] text-white font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
