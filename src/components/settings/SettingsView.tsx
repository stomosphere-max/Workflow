import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  User,
  Clock,
  Tag,
  Database,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Check,
  Camera,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Share,
} from 'lucide-react';
import { useWorkFlow } from '../../context/WorkFlowContext';
import { usePWA } from '../../context/PWAContext';
import { CategoryDef } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    userSettings,
    updateUserSettings,
    openProfileModal,
    categories,
    addCategory,
    deleteCategory,
    resetToSampleData,
    exportDataJson,
    importDataJson,
  } = useWorkFlow();

  const {
    isInstalled,
    isIOS,
    isSafari,
    hasPrompt,
    triggerInstall,
    setShowIOSModal,
  } = usePWA();

  // Profile fields
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState(userSettings.userName);
  const [userRole, setUserRole] = useState(userSettings.userRole);
  const [department, setDepartment] = useState(userSettings.department);
  const [workStartTime, setWorkStartTime] = useState(userSettings.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(userSettings.workEndTime);

  const handleUploadLocalAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateUserSettings({ avatarUrl: dataUrl });
          setSavedFeedback(true);
          setTimeout(() => setSavedFeedback(false), 2500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setUserName(userSettings.userName);
    setUserRole(userSettings.userRole);
    setDepartment(userSettings.department);
    setWorkStartTime(userSettings.workStartTime);
    setWorkEndTime(userSettings.workEndTime);
  }, [userSettings]);

  const [savedFeedback, setSavedFeedback] = useState(false);

  // New Category fields
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState<{
    color: string;
    bgColor: string;
    borderColor: string;
  }>({
    color: '#7C3AED',
    bgColor: '#E9E1FF',
    borderColor: '#C4B5FD',
  });

  const pastelPalettes = [
    { color: '#7C3AED', bgColor: '#E9E1FF', borderColor: '#C4B5FD', name: 'Lavender' },
    { color: '#059669', bgColor: '#DDF3E7', borderColor: '#A7F3D0', name: 'Mint Green' },
    { color: '#D97706', bgColor: '#FFF0D9', borderColor: '#FDE68A', name: 'Peach' },
    { color: '#DB2777', bgColor: '#FCE3EF', borderColor: '#FBCFE8', name: 'Soft Pink' },
    { color: '#2563EB', bgColor: '#EFF6FF', borderColor: '#BFDBFE', name: 'Sky Blue' },
    { color: '#4B5563', bgColor: '#F3F4F6', borderColor: '#E5E7EB', name: 'Slate Gray' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings({
      userName,
      userRole,
      department,
      workStartTime,
      workEndTime,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: CategoryDef = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: selectedColor.color,
      bgColor: selectedColor.bgColor,
      borderColor: selectedColor.borderColor,
    };
    addCategory(newCat);
    setNewCatName('');
  };

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert('นำเข้าข้อมูลสำเร็จแล้ว!');
        } else {
          alert('ไม่สามารถนำเข้าไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์ JSON');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-4xl">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E9E1FF] text-[#7C3AED] flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-[#373145]">การตั้งค่าระบบ (Settings)</h2>
        </div>
        <p className="text-xs text-[#827A94] mt-1">
          ปรับแต่งข้อมูลส่วนตัว เวลาทำงาน หมวดหมู่งาน และการสำรองข้อมูล
        </p>
      </div>

      {/* 1. Profile Settings */}
      <div className="bg-white p-6 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#9B82D7]" />
            <h3 className="font-bold text-sm text-[#373145]">ข้อมูลส่วนตัวและตำแหน่งงาน</h3>
          </div>
          <button
            type="button"
            onClick={openProfileModal}
            className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
          >
            เปิดหน้าต่างแก้ไขโปรไฟล์แบบเร็ว
          </button>
        </div>

        {/* Profile Card Summary */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadLocalAvatar}
          className="hidden"
        />

        <div className="p-3.5 mb-4 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group shrink-0"
              title="คลิกเพื่ออัปโหลดรูปภาพใหม่จากเครื่อง"
            >
              <img
                src={userSettings.avatarUrl}
                alt={userSettings.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#9B82D7] group-hover:brightness-90 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 bg-[#9B82D7] text-white p-0.5 rounded-full border border-white">
                <Camera className="w-2.5 h-2.5" />
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#373145]">{userSettings.userName}</p>
              <p className="text-xs text-[#6B46C1] font-medium">{userSettings.userRole}</p>
              <p className="text-[11px] text-[#8C84A0]">{userSettings.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF9FD] border border-[#E0D9F2] text-xs font-semibold text-[#6B46C1] shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#9B82D7]" />
              <span>อัปโหลดรูปจากเครื่อง</span>
            </button>
            <button
              type="button"
              onClick={openProfileModal}
              className="px-3 py-1.5 rounded-xl bg-[#E9E1FF] hover:bg-[#ded2fd] text-xs font-semibold text-[#6B46C1] shadow-2xs cursor-pointer"
            >
              แก้ไขชื่อ / ตำแหน่ง
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#514B62] mb-1">ชื่อ - นามสกุล</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#514B62] mb-1">ตำแหน่งงาน</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#514B62] mb-1">ฝ่าย / แผนก</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
            />
          </div>

          {/* Working Hours */}
          <div className="pt-2">
            <label className="block font-semibold text-[#514B62] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9B82D7]" />
              <span>เวลาทำงานปกติประจำวัน</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div>
                <span className="text-[11px] text-slate-500 mb-1 block">เวลาเข้างาน</span>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7]"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 mb-1 block">เวลาเลิกงาน</span>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EDF9]">
            {savedFeedback && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> บันทึกข้อมูลสำเร็จแล้ว
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white font-semibold shadow-xs cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>

      {/* 2. Categories Manager */}
      <div className="bg-white p-6 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0EDF9] mb-4">
          <Tag className="w-4 h-4 text-[#9B82D7]" />
          <h3 className="font-bold text-sm text-[#373145]">จัดการหมวดหมู่งาน (Categories)</h3>
        </div>

        {/* Existing categories list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          {categories.map((c) => (
            <div
              key={c.id}
              style={{ backgroundColor: c.bgColor, borderColor: c.borderColor }}
              className="p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  style={{ backgroundColor: c.color }}
                  className="w-3 h-3 rounded-full shrink-0"
                />
                <span style={{ color: c.color }} className="truncate">
                  {c.name}
                </span>
              </div>

              {categories.length > 1 && (
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="p-1 rounded hover:bg-black/5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new category form */}
        <div className="p-4 rounded-xl bg-[#FAF9FD] border border-[#EBE7F7] space-y-3 text-xs">
          <h4 className="font-semibold text-[#514B62]">เพิ่มหมวดหมู่ใหม่</h4>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="ชื่อหมวดหมู่ เช่น ลูกค้าต่างประเทศ, งานเอกสาร..."
              className="w-full sm:flex-1 px-3 py-2 bg-white border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7]"
            />

            {/* Color swatches */}
            <div className="flex items-center gap-1.5 py-1">
              {pastelPalettes.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(p)}
                  style={{ backgroundColor: p.bgColor, borderColor: p.borderColor }}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform ${
                    selectedColor.color === p.color ? 'scale-110 shadow-xs ring-2 ring-[#9B82D7]' : ''
                  }`}
                  title={p.name}
                >
                  <span
                    style={{ backgroundColor: p.color }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#9B82D7] hover:bg-[#886ec9] text-white font-semibold shadow-xs disabled:opacity-40 cursor-pointer"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* 3. Progressive Web App (PWA) Installation */}
      <div className="bg-white p-6 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9] mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#9B82D7]" />
            <h3 className="font-bold text-sm text-[#373145]">
              การติดตั้งแอปพลิเคชัน (Mobile & Desktop App)
            </h3>
          </div>
          {isInstalled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ติดตั้ง WorkFlow สำเร็จแล้ว
            </span>
          )}
        </div>

        {/* PWA Hero Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FAF9FD] to-[#F1EDFB] border border-[#EBE7F7] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md shadow-[#9B82D7]/20 border border-[#E5DEFA] flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="WorkFlow Icon"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#9B82D7] text-white p-1 rounded-full border-2 border-white shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base text-[#373145]">WorkFlow</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E9E1FF] text-[#7C3AED] font-semibold">
                  PWA Standalone
                </span>
              </div>
              <p className="text-xs text-[#827A94] mt-0.5 leading-relaxed">
                Smart Personal Work Planner สำหรับพนักงานออฟฟิศ
              </p>
              <p className="text-[11px] text-[#6B46C1] font-medium mt-1">
                {isInstalled
                  ? 'ทำงานในโหมด Standalone เต็มหน้าจอ ไร้แถบ URL เบราว์เซอร์'
                  : 'ติดตั้งลงบนหน้าจอหลักของ iPhone, Android หรือ Desktop ได้ทันที'}
              </p>
            </div>
          </div>

          {/* Action button area */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            {isInstalled ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>แอปติดตั้งพร้อมใช้งานแล้ว</span>
              </div>
            ) : (
              <>
                {isIOS ? (
                  <button
                    type="button"
                    onClick={() => setShowIOSModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9B82D7]/30 transition-all cursor-pointer"
                  >
                    <Share className="w-4 h-4" />
                    <span>ติดตั้ง WorkFlow (iOS Safari)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={triggerInstall}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#9B82D7]/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ติดตั้ง WorkFlow</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-[#514B62]">
          <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EFEBF9]">
            <p className="font-semibold text-[#373145] mb-0.5">📱 หน้าจอเต็มแบบ Native</p>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              เปิดผ่านไอคอนบนหน้าจอหลัก ไม่มีแถบ Browser มาบดบังสายตา
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EFEBF9]">
            <p className="font-semibold text-[#373145]">⚡ เปิดเร็วและรองรับออฟไลน์</p>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              ระบบ Service Worker บันทึกแคชทำงานได้ราบรื่นแม้สัญญาณเน็ตขาดหาย
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EFEBF9]">
            <p className="font-semibold text-[#373145]">
              {isIOS ? '🍎 รองรับ iPhone & iPad' : '🤖 รองรับ Android & Desktop'}
            </p>
            <p className="text-[#8C84A0] text-[11px] leading-relaxed">
              {isIOS
                ? 'รองรับการเพิ่มไปยังหน้าจอโฮมผ่าน Safari พร้อม Safe Area'
                : 'คลิกติดตั้งเพียงครั้งเดียว เพิ่มไอคอนได้ทันที'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Data Backup & Reset */}
      <div className="bg-white p-6 rounded-2xl border border-[#E9E5F5] shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0EDF9] mb-4">
          <Database className="w-4 h-4 text-[#9B82D7]" />
          <h3 className="font-bold text-sm text-[#373145]">
            การจัดการและสำรองข้อมูล (Data Management)
          </h3>
        </div>

        <p className="text-xs text-[#8C84A0] mb-4 leading-relaxed">
          ข้อมูลทั้งหมดของคุณจะถูกบันทึกไว้อย่างปลอดภัยในเบราว์เซอร์เครื่องนี้ (LocalStorage) คุณสามารถดาวน์โหลดไฟล์สำรองข้อมูล JSON หรือนำกลับมาใช้งานได้ตลอดเวลา
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8F7FC] hover:bg-[#F2EDFB] border border-[#E5E1F2] text-xs font-semibold text-[#6B46C1] shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อมูลสำรอง (Export JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8F7FC] hover:bg-[#F2EDFB] border border-[#E5E1F2] text-xs font-semibold text-[#514B62] shadow-2xs cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>นำเข้าข้อมูล (Import JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นข้อมูลตัวอย่างออฟฟิศมาตรฐานใช่หรือไม่?')) {
                resetToSampleData();
                alert('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 cursor-pointer ml-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
