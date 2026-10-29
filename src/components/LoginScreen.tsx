import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { UserRole, ClassRoom, Teacher, Student, SystemConfig, UserSession } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface LoginScreenProps {
  systemConfig: SystemConfig;
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  systemConfig,
  classes,
  teachers,
  students,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>('siswa');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student inputs
  const [studentName, setStudentName] = useState('');
  const [studentClassId, setStudentClassId] = useState(classes[0]?.id || '');

  // Teacher inputs
  const [teacherIdOrName, setTeacherIdOrName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Operator input
  const [operatorPassword, setOperatorPassword] = useState('');

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage(null);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = studentName.trim();
    if (!trimmedName) {
      setErrorMessage('Silakan masukkan Nama Lengkap Anda.');
      return;
    }
    if (!studentClassId) {
      setErrorMessage('Silakan pilih Kelas Anda.');
      return;
    }

    // Match or create/associate student
    const matched = students.find(
      (s) =>
        s.classId === studentClassId &&
        s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const targetStudent: Student = matched || {
      id: `stu-auto-${Date.now()}`,
      nis: `2425${Math.floor(100 + Math.random() * 900)}`,
      name: trimmedName,
      classId: studentClassId,
    };

    onLoginSuccess({
      role: 'siswa',
      name: targetStudent.name,
      identifier: targetStudent.nis,
      classId: targetStudent.classId,
      studentData: targetStudent,
    });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdent = teacherIdOrName.trim();
    if (!trimmedIdent) {
      setErrorMessage('Silakan masukkan Nama atau ID/NIP Guru.');
      return;
    }
    if (!teacherPassword) {
      setErrorMessage('Silakan masukkan Kode Akses Guru.');
      return;
    }

    // Find teacher by ID, NIP, or Name
    const foundTeacher = teachers.find(
      (t) =>
        t.id === trimmedIdent ||
        t.nip === trimmedIdent ||
        t.name.toLowerCase().includes(trimmedIdent.toLowerCase())
    );

    if (!foundTeacher) {
      setErrorMessage('Data Guru tidak ditemukan dalam sistem.');
      return;
    }

    if (foundTeacher.accessCode !== teacherPassword) {
      setErrorMessage('Kode Akses salah. Pastikan kode akses sesuai.');
      return;
    }

    onLoginSuccess({
      role: 'guru',
      name: foundTeacher.name,
      identifier: foundTeacher.id,
      teacherData: foundTeacher,
    });
  };

  const handleOperatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!operatorPassword) {
      setErrorMessage('Masukkan Kode Akses Master.');
      return;
    }

    if (operatorPassword !== systemConfig.masterAccessCode) {
      setErrorMessage('Kode Akses Master tidak valid.');
      return;
    }

    onLoginSuccess({
      role: 'operator',
      name: 'Super Admin Operator',
      identifier: 'OPERATOR_ROOT',
    });
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#f5f7f2]">
      {/* Left Column: Campus Image & School Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#102f4e] text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Campus Image Layer with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
          }}
        />

        {/* Ambient Gradient Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5a8]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <SchoolLogo size="lg" src={systemConfig.logoUrl} className="w-14 h-14" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                {systemConfig.institutionName}
              </h1>
              <p className="text-sm font-medium text-cyan-200">
                LMS Portal Pembelajaran Digital Vokasi
              </p>
            </div>
          </div>
        </div>

        {/* Middle Value Proposition & Quote */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-cyan-200 border border-white/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#0ea5a8]" />
            Ekosistem Pendidikan Berbasis Kompetensi
          </div>
          <h2 className="text-3xl xl:text-4xl font-black leading-tight text-white mb-4">
            Mencetak Generasi Terampil, Kreatif & Berkarakter Unggul.
          </h2>
          <p className="text-base text-slate-300 leading-relaxed max-w-lg mb-8">
            {systemConfig.description}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-4 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400">Standar Kelulusan</div>
              <div className="text-xl font-bold text-white mt-1">KKM {systemConfig.kkm}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400">Formula Matematika</div>
              <div className="text-xl font-bold text-[#38d4d8] mt-1">LaTeX & MathJax</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} {systemConfig.institutionName}</span>
          <span>Versi Sistem 2.6.0</span>
        </div>
      </div>

      {/* Right Column: Interactive Login Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 animate-fade-in">
          {/* Header Mobile / Title */}
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2.5 mb-4">
              <SchoolLogo size="md" src={systemConfig.logoUrl} className="w-10 h-10" />
              <span className="font-bold text-lg text-[#102f4e]">
                {systemConfig.institutionName}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Masuk ke Akun Anda
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih peran akses Anda untuk melanjutkan ke dasbor
            </p>
          </div>

          {/* Tab Selector: Siswa, Guru, Operator */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('siswa')}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'siswa'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Siswa
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('guru')}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'guru'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guru
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('operator')}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'operator'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Operator
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-start gap-2.5 animate-fade-in">
              <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Content Based on Tab */}
          {activeTab === 'siswa' && (
            <form onSubmit={handleStudentLogin} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Aditya Pratama"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0ea5a8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilihan Kelas
                </label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0ea5a8] focus:border-transparent outline-none transition-all"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} — {cls.major}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-[#102f4e] hover:bg-[#163f68] active:bg-[#0c243c] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Masuk Portal Siswa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          )}

          {activeTab === 'guru' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama atau ID / NIP Guru
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={teacherIdOrName}
                    onChange={(e) => setTeacherIdOrName(e.target.value)}
                    placeholder="Contoh: Budi Santoso atau 19850315..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0ea5a8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kode Akses Guru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Masukkan kode akses password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0ea5a8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-[#0ea5a8] hover:bg-[#0c9396] active:bg-[#0a7577] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Masuk Portal Guru</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          )}

          {activeTab === 'operator' && (
            <form onSubmit={handleOperatorLogin} className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kode Akses Master
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  {/* Mode Operator: Memerlukan "Kode Akses Master" berjenis password tanpa placeholder karakter */}
                  <input
                    type="password"
                    required
                    value={operatorPassword}
                    onChange={(e) => setOperatorPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#102f4e] focus:border-transparent outline-none transition-all tracking-widest font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Akses eksklusif untuk Operator Super Admin {systemConfig.institutionName}.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-[#102f4e] hover:bg-[#163f68] active:bg-[#0c243c] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Otorisasi Dasbor Operator</span>
              </button>
            </form>
          )}

          {/* Catatan Keamanan Akses Portal */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-center text-slate-400">
            <p>
              Pastikan Anda menggunakan kredensial resmi yang telah diberikan oleh pihak sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
