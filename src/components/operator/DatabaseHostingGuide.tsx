import React, { useState } from 'react';
import {
  Server,
  Cloud,
  Globe,
  Database,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FileCode,
  Layers,
  ArrowRight,
  Upload,
  RefreshCw,
  AlertTriangle,
  FolderSync
} from 'lucide-react';
import { DoubleConfirmButton } from '../DoubleConfirmButton';
import {
  ClassRoom,
  Subject,
  Teacher,
  Student,
  AttendanceRecord,
  Material,
  Assignment,
  Submission,
  SummativeGrade,
  Announcement,
  SystemConfig,
} from '../../types';

interface DatabaseHostingGuideProps {
  systemConfig: SystemConfig;
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  attendance: AttendanceRecord[];
  materials: Material[];
  assignments: Assignment[];
  submissions: Submission[];
  summativeGrades: SummativeGrade[];
  announcements: Announcement[];
  onImportAllData: (importedData: any) => void;
  onResetToCleanSlate: () => void;
  showToast: (msg: string) => void;
}

export const DatabaseHostingGuide: React.FC<DatabaseHostingGuideProps> = ({
  systemConfig,
  classes,
  subjects,
  teachers,
  students,
  attendance,
  materials,
  assignments,
  submissions,
  summativeGrades,
  announcements,
  onImportAllData,
  onResetToCleanSlate,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'supabase' | 'firebase' | 'data_backup'>('vercel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast(`Berhasil menyalin ${keyName} ke clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Export all current LMS data as JSON
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      institution: systemConfig.institutionName,
      version: '1.0.0-production',
      data: {
        systemConfig,
        classes,
        subjects,
        teachers,
        students,
        attendance,
        materials,
        assignments,
        submissions,
        summativeGrades,
        announcements,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const cleanDate = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_smk_tridharma_lms_${cleanDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Database lengkap sekolah berhasil dicadangkan ke file JSON!');
  };

  // Import / Restore backup JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const dataToLoad = parsed.data || parsed;

        if (!dataToLoad.classes || !dataToLoad.students) {
          throw new Error('Format file cadangan tidak valid (kurang kelas/siswa).');
        }

        onImportAllData(dataToLoad);
        showToast('Data sekolah berhasil dipulihkan dari cadangan JSON!');
      } catch (err: any) {
        alert('Gagal memulihkan cadangan: ' + (err.message || 'Format JSON tidak valid'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download PANDUAN_DEPLOY_DATABASE.md
  const handleDownloadGuide = () => {
    const guideText = `# Panduan Lengkap Deploy ke Vercel & Database Cloud Gratis
## SMK Laboratorium Tridharma UNG - LMS Portal

Lihat panduan lengkap langkah-demi-langkah dengan tangkapan alur pada file PANDUAN_DEPLOY_DATABASE.md di repositori proyek.

Langkah Inti:
1. Simpan kode ke GitHub (git init -> git add . -> git commit -> git push).
2. Hubungkan repository GitHub Anda ke Vercel (https://vercel.com) secara otomatis.
3. Buat database PostgreSQL di Supabase (https://supabase.com) region Singapore.
4. Jalankan SQL Schema 11 tabel di SQL Editor Supabase.
5. Salin Project URL & anon key ke Vercel Settings > Environment Variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).
6. Redeploy di Vercel — Web sekolah resmi online dan aktif dengan database cloud!
`;
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(guideText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'PANDUAN_DEPLOY_DATABASE.md');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Panduan Markdown berhasil diunduh!');
  };

  const sqlSchema = `-- ==============================================================================
-- SCHEMA POSTGRESQL RESMI SUPABASE UNTUK SMK TRIDHARMA LMS
-- ==============================================================================

-- 1. TABEL PENGATURAN SISTEM & IDENTITAS SEKOLAH
CREATE TABLE IF NOT EXISTS system_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    institution_name TEXT NOT NULL,
    kkm NUMERIC NOT NULL DEFAULT 75,
    master_access_code TEXT NOT NULL DEFAULT 'admin2026',
    description TEXT,
    banner_text TEXT,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL KELAS
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    major TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL MATA PELAJARAN
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Kejuruan',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL GURU
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL,
    name TEXT NOT NULL,
    access_code TEXT NOT NULL,
    subject_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL SISWA
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    nis TEXT NOT NULL,
    name TEXT NOT NULL,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL PRESENSI (ABSENSI)
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alfa')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL MATERI PEMBELAJARAN
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    meeting_no INTEGER NOT NULL DEFAULT 1,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL TUGAS
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    meeting_no INTEGER NOT NULL DEFAULT 1,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE CASCADE,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABEL PENGUMPULAN TUGAS (SUBMISSIONS)
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    submission_url TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Sudah dikumpulkan',
    grade NUMERIC,
    feedback TEXT
);

-- 10. TABEL NILAI SUMATIF (RAPOR)
CREATE TABLE IF NOT EXISTS summative_grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE CASCADE,
    evaluation_number INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    score NUMERIC NOT NULL,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 11. TABEL PENGUMUMAN RESMI SEKOLAH
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Penting', 'Akademik', 'Kegiatan', 'Ujian', 'Umum')),
    date DATE NOT NULL,
    author TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INISIALISASI DATA AWAL SISTEM
INSERT INTO system_config (id, institution_name, kkm, master_access_code, description, banner_text)
VALUES (
    'default',
    'SMK TRIDHARMA GORONTALO',
    75,
    'admin2026',
    'Sistem Manajemen Pembelajaran Digital Terintegrasi',
    'Selamat Datang di Portal Pembelajaran Digital SMK Laboratorium Tridharma UNG.'
)
ON CONFLICT (id) DO NOTHING;

-- KEAMANAN: ROW LEVEL SECURITY (RLS) & AKSES
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE summative_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Akses Terbuka System Config" ON system_config;
    CREATE POLICY "Akses Terbuka System Config" ON system_config FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Classes" ON classes;
    CREATE POLICY "Akses Terbuka Classes" ON classes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Subjects" ON subjects;
    CREATE POLICY "Akses Terbuka Subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Teachers" ON teachers;
    CREATE POLICY "Akses Terbuka Teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Students" ON students;
    CREATE POLICY "Akses Terbuka Students" ON students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Attendance" ON attendance;
    CREATE POLICY "Akses Terbuka Attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Materials" ON materials;
    CREATE POLICY "Akses Terbuka Materials" ON materials FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Assignments" ON assignments;
    CREATE POLICY "Akses Terbuka Assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Submissions" ON submissions;
    CREATE POLICY "Akses Terbuka Submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Summative Grades" ON summative_grades;
    CREATE POLICY "Akses Terbuka Summative Grades" ON summative_grades FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Akses Terbuka Announcements" ON announcements;
    CREATE POLICY "Akses Terbuka Announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
END $$;`;

  const gitCommands = `# 1. Inisialisasi Git pada folder proyek
git init
git add .
git commit -m "feat: initial production deploy SMK Tridharma LMS"

# 2. Hubungkan ke repositori GitHub Anda (buat repo di github.com)
git branch -M main
git remote add origin https://github.com/USERNAME/smk-tridharma-lms.git
git push -u origin main`;

  const supabaseSnippet = `// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102f4e] via-[#153e67] to-[#0ea5a8] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-xs">
              Production & Cloud Ready
            </span>
            <span className="text-white/80 text-xs font-mono">Status: Siap Di-hosting</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Panduan Hosting Vercel & Database Gratis
          </h2>
          <p className="text-xs text-white/85 mt-1 max-w-2xl leading-relaxed">
            Ikuti petunjuk di bawah ini untuk menerbitkan LMS sekolah ke domain online permanen 
            menggunakan hosting gratis <strong>Vercel</strong> dan database cloud <strong>Supabase</strong> atau <strong>Firebase</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadGuide}
          className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#102f4e] hover:bg-slate-100 font-bold rounded-xl text-xs shadow-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-[#0ea5a8]" />
          <span>Unduh Panduan (.md)</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('vercel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vercel'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-[#0ea5a8]" />
          <span>1. Hosting Vercel (vercel.app)</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'supabase'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>2. Supabase (PostgreSQL Gratis - Rekomendasi)</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'firebase'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4 text-amber-500" />
          <span>3. Firebase (Firestore NoSQL)</span>
        </button>

        <button
          onClick={() => setActiveTab('data_backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data_backup'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderSync className="w-4 h-4 text-purple-500" />
          <span>4. Cadangan, Pemulihan & Bersihkan Data</span>
        </button>
      </div>

      {/* TAB 1: VERCEL HOSTING */}
      {activeTab === 'vercel' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0ea5a8]" />
                  Hosting Gratis Selamanya di Vercel (vercel.app)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vercel menyediakan paket Hobby gratis dengan CDN global super cepat, sertifikat SSL HTTPS otomatis, dan integrasi GitHub.
                </p>
              </div>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0ea5a8] hover:underline font-semibold"
              >
                Buka vercel.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-[#0ea5a8]/10 text-[#0ea5a8] flex items-center justify-center font-bold text-xs mb-2.5">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Unggah ke GitHub</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Inisialisasi git pada folder proyek ini lalu dorong (*push*) kode sumber ke repositori GitHub sekolah Anda.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-[#0ea5a8]/10 text-[#0ea5a8] flex items-center justify-center font-bold text-xs mb-2.5">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Import di Vercel</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Di Vercel, klik "Add New Project", pilih repo GitHub Anda. Framework Preset Vite & Output <code className="text-xs bg-slate-200 px-1 rounded">dist</code> akan otomatis terdeteksi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-[#0ea5a8]/10 text-[#0ea5a8] flex items-center justify-center font-bold text-xs mb-2.5">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Kustom Domain Sekolah</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gunakan subdomain gratis bawaan (<code className="text-xs">*.vercel.app</code>) atau hubungkan domain resmi seperti <code className="text-xs">lms.smktridharma.sch.id</code>.
                </p>
              </div>
            </div>

            {/* Git commands box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  Perintah Git Terminal untuk Unggah ke GitHub:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(gitCommands, 'Perintah Git')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copiedKey === 'Perintah Git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'Perintah Git' ? 'Tersalin!' : 'Salin Perintah'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
                {gitCommands}
              </pre>
            </div>

            {/* vercel.json notice */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <span className="font-bold">Konfigurasi vercel.json Sudah Disediakan:</span> Proyek ini telah dilengkapi dengan berkas <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded font-bold">vercel.json</code> untuk aturan perutean Single Page Application (SPA). Siswa dan guru dapat memuat ulang halaman tanpa mengalami error 404.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPABASE */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Supabase (PostgreSQL Cloud Gratis - Rekomendasi Utama)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Basis data relasional teruji untuk sistem akademik sekolah dengan kapasitas 500 MB gratis dan REST API otomatis.
                </p>
              </div>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:underline font-semibold"
              >
                Buka supabase.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-sm">Langkah Setup Database Supabase (Hanya 5 Menit):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="font-bold text-[#102f4e] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">1</span>
                    Buat Akun & Proyek
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Buka <strong>supabase.com</strong>, klik <strong>New Project</strong>. Beri nama <code>smk-tridharma-lms</code> dan pilih Region <strong>Singapore</strong> (tercepat untuk Indonesia).
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="font-bold text-[#102f4e] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">2</span>
                    Jalankan Skrip SQL
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Buka menu <strong>SQL Editor</strong> di kiri, klik <strong>New query</strong>, lalu klik tombol hijau di bawah untuk menyalin seluruh skrip 11 tabel dan klik <strong>Run</strong>.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="font-bold text-[#102f4e] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</span>
                    Salin URL & Anon Key
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Masuk ke <strong>Project Settings &gt; API</strong>. Salin <strong>Project URL</strong> dan <strong>anon public key</strong>.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="font-bold text-[#102f4e] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">4</span>
                    Simpan di Vercel
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Buka Vercel Settings &gt; Environment Variables. Masukkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>, lalu klik <strong>Redeploy</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* SQL Schema Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  Skrip SQL Schema DDL (11 Tabel Relasional Akademik):
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sqlSchema, 'Skrip SQL')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {copiedKey === 'Skrip SQL' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'Skrip SQL' ? 'SQL Tersalin!' : 'Salin Seluruh Skrip SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono max-h-80 overflow-y-auto overflow-x-auto leading-relaxed">
                {sqlSchema}
              </pre>
            </div>

            {/* Code Snippet for supabase.ts */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CodeIcon className="w-4 h-4 text-[#0ea5a8]" />
                  Kode Koneksi Klien (<code className="font-mono text-slate-800">src/lib/supabase.ts</code>):
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(supabaseSnippet, 'Kode Klien Supabase')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copiedKey === 'Kode Klien Supabase' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'Kode Klien Supabase' ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
                {supabaseSnippet}
              </pre>
            </div>

            {/* Environment Variable Setup Table */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                Variabel Lingkungan yang Wajib Diisi di Vercel:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 px-3">Nama Variabel (Key)</th>
                      <th className="py-2 px-3">Contoh Nilai (Value)</th>
                      <th className="py-2 px-3">Lokasi Ambil di Supabase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-700">VITE_SUPABASE_URL</td>
                      <td className="py-2 px-3 text-slate-600">https://xyzcompany.supabase.co</td>
                      <td className="py-2 px-3 font-sans text-slate-500">Project Settings &gt; API &gt; Project URL</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-emerald-700">VITE_SUPABASE_ANON_KEY</td>
                      <td className="py-2 px-3 text-slate-600">eyJhbGciOiJIUzI1NiIsIn...</td>
                      <td className="py-2 px-3 font-sans text-slate-500">Project Settings &gt; API &gt; Project API Keys (anon public)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIREBASE */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-amber-500" />
                  Firebase Firestore (Google Cloud Spark Plan Gratis)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Solusi database dokumen NoSQL dari Google Cloud dengan kuota gratis 1 GB penyimpanan dan 50.000 pembacaan/hari.
                </p>
              </div>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:underline font-semibold"
              >
                Buka Firebase Console
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800">Langkah Setup di Firebase:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>Buka <strong>console.firebase.google.com</strong>, klik <strong>Add Project</strong>, beri nama <code className="font-mono">smk-tridharma-lms</code>.</li>
                <li>Pilih menu <strong>Firestore Database</strong> &gt; Klik <strong>Create Database</strong> (pilih lokasi Jakarta: <code className="font-mono">asia-southeast2</code>).</li>
                <li>Daftarkan Web App di Firebase Project Settings untuk memperoleh objek konfigurasi API (<code className="font-mono">apiKey, projectId, authDomain</code>).</li>
                <li>Simpan variabel tersebut di Vercel atau berkas <code className="font-mono">.env</code> lokal.</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Struktur Koleksi Firestore yang Disarankan:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-amber-200">system_config</div>
                <div className="bg-white p-2 rounded border border-amber-200">classes</div>
                <div className="bg-white p-2 rounded border border-amber-200">subjects</div>
                <div className="bg-white p-2 rounded border border-amber-200">teachers</div>
                <div className="bg-white p-2 rounded border border-amber-200">students</div>
                <div className="bg-white p-2 rounded border border-amber-200">attendance</div>
                <div className="bg-white p-2 rounded border border-amber-200">materials</div>
                <div className="bg-white p-2 rounded border border-amber-200">assignments</div>
                <div className="bg-white p-2 rounded border border-amber-200">submissions</div>
                <div className="bg-white p-2 rounded border border-amber-200">summative_grades</div>
                <div className="bg-white p-2 rounded border border-amber-200">announcements</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA BACKUP, RESTORE & CLEAN SLATE */}
      {activeTab === 'data_backup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-purple-600" />
                Manajemen Data Produksi Sekolah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola pencadangan, pemulihan dari cadangan, atau bersihkan data uji coba saat sekolah siap memulai tahun ajaran baru secara riil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Backup Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Cadangkan Database Lengkap (.json)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Unduh seluruh data LMS saat ini (kelas, guru, siswa, kehadiran, materi, tugas, nilai, dan pengumuman) ke dalam 1 berkas JSON aman.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan JSON Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Restore Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Pulihkan dari Berkas Cadangan</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Unggah berkas JSON cadangan yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data sekolah ke perangkat atau browser ini.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="w-full py-2.5 px-4 bg-[#102f4e] hover:bg-[#163f68] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Berkas JSON Cadangan</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Clean Slate Card */}
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Mulai Tahun Ajaran Baru (Bersihkan Data Sampel Uji Coba)</span>
                </div>
                <p className="text-xs text-rose-700/90 max-w-xl leading-relaxed">
                  Jika Anda ingin memulai sistem secara bersih untuk sekolah nyata, Anda dapat menghapus data siswa sampel, rekapan tugas, dan nilai uji coba agar Anda dapat memasukkan data siswa dan guru SMK yang sebenarnya.
                </p>
              </div>

              <div className="shrink-0">
                <DoubleConfirmButton
                  onConfirm={onResetToCleanSlate}
                  itemName="data sampel uji coba"
                  title="Bersihkan Data Sampel Uji"
                  size="md"
                  className="px-4 py-2.5 text-xs font-bold shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
