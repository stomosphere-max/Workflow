import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
      } else {
        setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim() || !email.trim() || !password) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setErrorMsg('Username ต้องมีความยาว 3-20 ตัวอักษร (ภาษาอังกฤษ, ตัวเลข, _ เท่านั้น)');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await registerWithEmail(email, password, cleanUsername, displayName);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ');
      } else {
        setErrorMsg(err.message || 'สมัครสมาชิกไม่สำเร็จ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('กรุณากรอกอีเมลที่ใช้สมัครสมาชิก');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(email);
      setSuccessMsg(`ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ`);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E9E1FF] relative animate-in zoom-in-95 duration-200">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#F4F1FB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9B82D7] to-[#B39EEB] text-white shadow-md shadow-[#9B82D7]/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#373145]">
            {authModalMode === 'login' && 'เข้าสู่ระบบ WorkFlow'}
            {authModalMode === 'register' && 'สร้างบัญชี WorkFlow Social'}
            {authModalMode === 'forgot_password' && 'รีเซ็ตรหัสผ่าน'}
          </h3>
          <p className="text-xs text-[#827A94] mt-1">
            {authModalMode === 'login' && 'จัดการงานและเชื่อมต่อกับเพื่อนร่วมงานของคุณ'}
            {authModalMode === 'register' && 'เริ่มต้นวางแผนงานส่วนตัวและเชื่อมต่อกับเครือข่าย'}
            {authModalMode === 'forgot_password' && 'กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่'}
          </p>
        </div>

        {/* Tab switcher for login / register */}
        {authModalMode !== 'forgot_password' && (
          <div className="flex bg-[#F5F2FC] p-1 rounded-2xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                resetForm();
                openAuthModal('login');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-[#7C3AED] shadow-2xs'
                  : 'text-[#7A748A] hover:text-[#373145]'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                openAuthModal('register');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-white text-[#7C3AED] shadow-2xs'
                  : 'text-[#7A748A] hover:text-[#373145]'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Login Form */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#514B62] mb-1">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#514B62]">รหัสผ่าน</label>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    openAuthModal('forgot_password');
                  }}
                  className="text-[11px] font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#9B82D7]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        {/* 2. Register Form */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#514B62] mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="somchai_work"
                  required
                  maxLength={20}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
              <p className="text-[10px] text-[#8C84A0] mt-1">
                สำหรับให้เพื่อนค้นหา (3-20 ตัวอักษร, ภาษาอังกฤษ, ตัวเลข, _)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#514B62] mb-1">
                ชื่อ-นามสกุล ที่แสดง (Display Name)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="สมชาย มั่นคง"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#514B62] mb-1">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#514B62] mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัว"
                  required
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#514B62] mb-1">ยืนยันรหัส</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="ยืนยันรหัสผ่าน"
                  required
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#9B82D7]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก WorkFlow'}
            </button>
          </form>
        )}

        {/* 3. Forgot Password Form */}
        {authModalMode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#514B62] mb-1">อีเมลของคุณ</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9F99B0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7FC] border border-[#E5E1F2] rounded-xl focus:outline-none focus:border-[#9B82D7] text-[#373145]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9B82D7] to-[#886EC9] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#9B82D7]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  openAuthModal('login');
                }}
                className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer"
              >
                ← กลับสู่หน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}

        {/* Divider & Google Login option */}
        {authModalMode !== 'forgot_password' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EBE7F7]" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-white text-[#9F99B0]">หรือเข้าสู่ระบบด้วย</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-[#E2DCF0] hover:bg-[#FAF9FD] text-[#373145] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
