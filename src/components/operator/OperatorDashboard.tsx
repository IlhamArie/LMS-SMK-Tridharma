import React, { useState } from 'react';
import {
  Home,
  Database,
  FileSpreadsheet,
  Plus,
  Download,
  Upload,
  Key,
  Edit2,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Settings,
  Layers,
  Search,
  CheckCircle,
  Megaphone,
  Image as ImageIcon,
  Trash2,
  Eye,
  Pin,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  Cloud,
  Server,
  ArrowRight,
} from 'lucide-react';
import {
  ClassRoom,
  Subject,
  Teacher,
  Student,
  AttendanceRecord,
  SummativeGrade,
  SystemConfig,
  UserSession,
  Announcement,
  Material,
  Assignment,
  Submission,
} from '../../types';
import { DoubleConfirmButton } from '../DoubleConfirmButton';
import { SchoolLogo } from '../SchoolLogo';
import { DatabaseHostingGuide } from './DatabaseHostingGuide';
import {
  downloadStudentTemplate,
  parseStudentExcel,
  exportAttendanceToExcel,
  exportSummativeGradesToExcel,
} from '../../utils/excel';

interface OperatorDashboardProps {
  session: UserSession;
  systemConfig: SystemConfig;
  onUpdateConfig: (newConfig: SystemConfig) => void;
  classes: ClassRoom[];
  onAddClass: (cls: Omit<ClassRoom, 'id'>) => void;
  onUpdateClass: (id: string, cls: Partial<ClassRoom>) => void;
  onDeleteClass: (id: string) => void;
  subjects: Subject[];
  onAddSubject: (sub: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (id: string, sub: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
  teachers: Teacher[];
  onAddTeacher: (t: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (id: string, t: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
  students: Student[];
  onAddStudent: (s: Omit<Student, 'id'>) => void;
  onAddBulkStudents: (students: Array<Omit<Student, 'id'>>) => void;
  onDeleteStudent: (id: string) => void;
  attendance: AttendanceRecord[];
  summativeGrades: SummativeGrade[];
  announcements: Announcement[];
  onAddAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  onUpdateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  materials?: Material[];
  assignments?: Assignment[];
  submissions?: Submission[];
  onImportAllData?: (importedData: any) => void;
  onResetToCleanSlate?: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  systemConfig,
  onUpdateConfig,
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  students,
  onAddStudent,
  onAddBulkStudents,
  onDeleteStudent,
  attendance,
  summativeGrades,
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  materials = [],
  assignments = [],
  submissions = [],
  onImportAllData,
  onResetToCleanSlate,
}) => {
  const [navTab, setNavTab] = useState<
    'beranda' | 'master' | 'rekap' | 'pengumuman' | 'pengaturan' | 'database_hosting'
  >('beranda');
  const [masterSubTab, setMasterSubTab] = useState<'mapel_kelas' | 'guru' | 'siswa'>('mapel_kelas');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Logo State ---
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>(systemConfig.logoUrl || '');
  const [logoUrlText, setLogoUrlText] = useState<string>(systemConfig.logoUrl || '');

  // --- Announcement State ---
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Penting' | 'Akademik' | 'Kegiatan' | 'Ujian' | 'Umum'>('Penting');
  const [annAuthor, setAnnAuthor] = useState('Operator Super Admin LMS');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annIsActive, setAnnIsActive] = useState(true);
  const [annDate, setAnnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annSearch, setAnnSearch] = useState('');
  const [annCategoryFilter, setAnnCategoryFilter] = useState<string>('all');
  const [previewingAnnouncement, setPreviewingAnnouncement] = useState<Announcement | null>(null);

  // --- Class state ---
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [newClassMajor, setNewClassMajor] = useState('Rekayasa Perangkat Lunak');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // --- Subject state ---
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'Kejuruan' | 'Umum' | 'Muatan Lokal'>('Kejuruan');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // --- Teacher state ---
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [teacherSelectedSubjects, setTeacherSelectedSubjects] = useState<string[]>([]);
  const [teacherAccessCode, setTeacherAccessCode] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // --- Student state ---
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentNis, setManualStudentNis] = useState('');
  const [manualStudentClassId, setManualStudentClassId] = useState(classes[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');
  const [importClassId, setImportClassId] = useState(classes[0]?.id || '');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- Global recap filter ---
  const [rekapTab, setRekapTab] = useState<'absensi' | 'sumatif'>('absensi');
  const [rekapClassFilter, setRekapClassFilter] = useState('all');

  // --- Config settings state ---
  const [configForm, setConfigForm] = useState(systemConfig);

  // Auto generator for teacher access code
  const generateAccessCode = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = 'guru_';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTeacherAccessCode(code);
  };

  // Class Actions
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    if (editingClassId) {
      onUpdateClass(editingClassId, {
        name: newClassName.trim(),
        gradeLevel: newClassGrade,
        major: newClassMajor.trim(),
      });
      setEditingClassId(null);
      showToast('Data Kelas berhasil diperbarui.');
    } else {
      onAddClass({
        name: newClassName.trim(),
        gradeLevel: newClassGrade,
        major: newClassMajor.trim(),
      });
      showToast('Kelas baru berhasil ditambahkan.');
    }
    setNewClassName('');
  };

  const handleStartEditClass = (cls: ClassRoom) => {
    setEditingClassId(cls.id);
    setNewClassName(cls.name);
    setNewClassGrade(cls.gradeLevel as 'X' | 'XI' | 'XII');
    setNewClassMajor(cls.major);
  };

  // Subject Actions
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    if (editingSubjectId) {
      onUpdateSubject(editingSubjectId, {
        code: newSubjectCode.trim() || `MAPEL-${Date.now()}`,
        name: newSubjectName.trim(),
        category: newSubjectCategory,
      });
      setEditingSubjectId(null);
      showToast('Mata Pelajaran berhasil diperbarui.');
    } else {
      onAddSubject({
        code: newSubjectCode.trim() || `MAPEL-${Date.now()}`,
        name: newSubjectName.trim(),
        category: newSubjectCategory,
      });
      showToast('Mata Pelajaran baru berhasil ditambahkan.');
    }
    setNewSubjectCode('');
    setNewSubjectName('');
  };

  const handleStartEditSubject = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setNewSubjectCode(sub.code);
    setNewSubjectName(sub.name);
    setNewSubjectCategory(sub.category);
  };

  // Teacher Actions
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    const access = teacherAccessCode.trim() || `guru${Math.floor(100 + Math.random() * 900)}`;

    if (editingTeacherId) {
      onUpdateTeacher(editingTeacherId, {
        name: teacherName.trim(),
        nip: teacherNip.trim() || '-',
        subjectIds: teacherSelectedSubjects,
        accessCode: access,
      });
      setEditingTeacherId(null);
      showToast('Data Guru berhasil diperbarui.');
    } else {
      onAddTeacher({
        name: teacherName.trim(),
        nip: teacherNip.trim() || '-',
        subjectIds: teacherSelectedSubjects,
        accessCode: access,
      });
      showToast('Guru baru dan Kode Akses berhasil didaftarkan.');
    }
    setTeacherName('');
    setTeacherNip('');
    setTeacherSelectedSubjects([]);
    setTeacherAccessCode('');
  };

  const handleStartEditTeacher = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setTeacherName(t.name);
    setTeacherNip(t.nip);
    setTeacherSelectedSubjects(t.subjectIds || []);
    setTeacherAccessCode(t.accessCode);
  };

  const toggleSubjectForTeacher = (subId: string) => {
    if (teacherSelectedSubjects.includes(subId)) {
      setTeacherSelectedSubjects(teacherSelectedSubjects.filter((id) => id !== subId));
    } else {
      setTeacherSelectedSubjects([...teacherSelectedSubjects, subId]);
    }
  };

  // Student Actions
  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName.trim() || !manualStudentNis.trim()) return;

    onAddStudent({
      name: manualStudentName.trim(),
      nis: manualStudentNis.trim(),
      classId: manualStudentClassId || classes[0]?.id || '',
    });
    setManualStudentName('');
    setManualStudentNis('');
    showToast('Siswa berhasil ditambahkan.');
  };

  const handleDownloadTemplate = () => {
    const selectedClass = classes.find((c) => c.id === importClassId) || classes[0];
    if (!selectedClass) return;
    downloadStudentTemplate(selectedClass.name);
    showToast(`Template Excel untuk ${selectedClass.name} berhasil diunduh.`);
  };

  const handleUploadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    try {
      setIsImporting(true);
      const parsed = await parseStudentExcel(importFile, importClassId);
      if (parsed.length === 0) {
        showToast('Tidak ada data siswa yang valid dalam file Excel.');
        setIsImporting(false);
        return;
      }
      onAddBulkStudents(parsed);
      setImportFile(null);
      showToast(`Berhasil mengimpor ${parsed.length} siswa secara massal!`);
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses file Excel. Pastikan format kolom sesuai.');
    } finally {
      setIsImporting(false);
    }
  };

  // Config Update
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(configForm);
    showToast('Pengaturan sistem dan KKM berhasil diperbarui.');
  };

  // Logo Handlers
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran file maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreviewUrl(result);
      showToast('File logo berhasil dimuat. Klik "Terapkan Logo Baru" untuk menyimpan.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogo = () => {
    const newLogo = logoInputType === 'upload' ? logoPreviewUrl : logoUrlText.trim();
    if (!newLogo) {
      showToast('Pilih file gambar atau masukkan URL logo terlebih dahulu.');
      return;
    }
    const updated = { ...configForm, logoUrl: newLogo };
    setConfigForm(updated);
    onUpdateConfig(updated);
    try {
      localStorage.setItem('smk_lms_custom_logo', newLogo);
    } catch {
      // ignore
    }
    showToast('Logo sekolah berhasil diperbarui di seluruh sistem!');
  };

  const handleResetLogo = () => {
    const updated = { ...configForm, logoUrl: undefined };
    delete updated.logoUrl;
    setConfigForm(updated);
    onUpdateConfig(updated);
    setLogoPreviewUrl('');
    setLogoUrlText('');
    try {
      localStorage.removeItem('smk_lms_custom_logo');
    } catch {
      // ignore
    }
    showToast('Logo sekolah berhasil direset ke logo resmi SMK Laboratorium Tridharma UNG.');
  };

  // Announcement Handlers
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    if (editingAnnId) {
      onUpdateAnnouncement(editingAnnId, {
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        author: annAuthor.trim() || 'Operator Sekolah',
        isPinned: annIsPinned,
        isActive: annIsActive,
        date: annDate,
      });
      setEditingAnnId(null);
      showToast('Pengumuman berhasil diperbarui.');
    } else {
      onAddAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        author: annAuthor.trim() || 'Operator Sekolah',
        isPinned: annIsPinned,
        isActive: annIsActive,
        date: annDate,
      });
      showToast('Pengumuman baru berhasil diterbitkan untuk siswa!');
    }

    // Reset form
    setAnnTitle('');
    setAnnContent('');
    setAnnCategory('Penting');
    setAnnIsPinned(false);
    setAnnIsActive(true);
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnCategory(ann.category);
    setAnnAuthor(ann.author);
    setAnnIsPinned(!!ann.isPinned);
    setAnnIsActive(ann.isActive);
    setAnnDate(ann.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAnn = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnCategory('Penting');
    setAnnIsPinned(false);
    setAnnIsActive(true);
  };

  const handleTogglePinAnn = (ann: Announcement) => {
    onUpdateAnnouncement(ann.id, { isPinned: !ann.isPinned });
    showToast(ann.isPinned ? 'Sematkan pengumuman dicabut.' : 'Pengumuman disematkan di paling atas.');
  };

  const handleToggleActiveAnn = (ann: Announcement) => {
    onUpdateAnnouncement(ann.id, { isActive: !ann.isActive });
    showToast(ann.isActive ? 'Pengumuman dinonaktifkan (disembunyikan dari siswa).' : 'Pengumuman diaktifkan kembali.');
  };

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchCategory = annCategoryFilter === 'all' || ann.category === annCategoryFilter;
    const matchSearch =
      ann.title.toLowerCase().includes(annSearch.toLowerCase()) ||
      ann.content.toLowerCase().includes(annSearch.toLowerCase()) ||
      ann.author.toLowerCase().includes(annSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filtering for student table
  const filteredStudents = students.filter((s) => {
    const matchClass = studentClassFilter === 'all' || s.classId === studentClassFilter;
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.includes(studentSearch);
    return matchClass && matchSearch;
  });

  // Global Attendance filtered
  const filteredAttendance = attendance.filter((a) => {
    return rekapClassFilter === 'all' || a.classId === rekapClassFilter;
  });

  // Global Grades filtered
  const filteredGrades = summativeGrades.filter((g) => {
    return rekapClassFilter === 'all' || g.classId === rekapClassFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#102f4e] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-slide-up border border-[#0ea5a8]/40">
          <CheckCircle className="w-5 h-5 text-[#0ea5a8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setNavTab('beranda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'beranda'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda Operator</span>
        </button>

        <button
          onClick={() => setNavTab('master')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'master'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Kelola Data Master</span>
        </button>

        <button
          onClick={() => setNavTab('rekap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'rekap'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rekapitulasi Global</span>
        </button>

        <button
          onClick={() => setNavTab('pengumuman')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'pengumuman'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Pengumuman & Info Siswa</span>
          {announcements.filter((a) => a.isActive).length > 0 && (
            <span className="text-[11px] bg-[#0ea5a8] text-white font-bold px-2 py-0.5 rounded-full">
              {announcements.filter((a) => a.isActive).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setNavTab('pengaturan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'pengaturan'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Logo</span>
        </button>

        <button
          onClick={() => setNavTab('database_hosting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            navTab === 'database_hosting'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-4 h-4 text-[#0ea5a8]" />
          <span>Deploy & Database</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Cloud
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: BERANDA ==================== */}
      {navTab === 'beranda' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{classes.length}</div>
                <div className="text-xs text-slate-500 font-medium">Total Kelas Aktif</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0ea5a8] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{subjects.length}</div>
                <div className="text-xs text-slate-500 font-medium">Mata Pelajaran</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{teachers.length}</div>
                <div className="text-xs text-slate-500 font-medium">Dewan Guru Terdaftar</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{students.length}</div>
                <div className="text-xs text-slate-500 font-medium">Siswa Terdaftar</div>
              </div>
            </div>
          </div>

          {/* Production & Cloud Readiness Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#102f4e] via-[#163f68] to-[#0ea5a8] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Kesiapan Hosting Vercel & Database Cloud</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Siap Produksi
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5 max-w-xl leading-relaxed">
                  Aplikasi telah diuji dan siap di-deploy secara permanen ke domain sekolah via Vercel gratis dengan database PostgreSQL Supabase atau Firestore.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNavTab('database_hosting')}
              className="px-4 py-2.5 bg-white text-[#102f4e] hover:bg-slate-100 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Buka Panduan Deploy</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0ea5a8]" />
            </button>
          </div>

          {/* Quick Info & Operator Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#0ea5a8]" />
                Pusat Kendali Otoritas Operator
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Sebagai Operator Super Admin, Anda memiliki wewenang penuh dalam mengonfigurasi data master akademik sekolah:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-800 mb-1">Mata Pelajaran & Kelas</div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Menambah, menyunting nama, tingkat jurusan, dan kurikulum aktif secara dinamis.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-800 mb-1">Pendaftaran Guru & Password</div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Generate kode akses unik bagi masing-masing guru pengampu mata pelajaran.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-800 mb-1">Impor Siswa Massal (Excel)</div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Unduh template per kelas, lalu unggah file xlsx untuk memasukkan siswa secara instan.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-800 mb-1">Rekapitulasi Global Excel</div>
                  <p className="text-xs text-slate-500 leading-normal">
                    Ekspor seluruh arsip absensi dan nilai sumatif dari seluruh kelas dalam satu klik.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Master Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <SchoolLogo size="md" className="w-11 h-11" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    Parameter Master Sistem
                  </h3>
                  <p className="text-xs text-slate-500">Identitas Lembaga & Nilai KKM</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nama Sekolah</span>
                  <span className="font-bold text-slate-800">{systemConfig.institutionName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Standar KKM</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {systemConfig.kkm} poin
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Kode Akses Master</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold">
                    {systemConfig.masterAccessCode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNavTab('pengaturan')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sesuaikan Parameter Sistem & Logo</span>
              </button>
            </div>
          </div>

          {/* Quick Announcements Widget in Operator Home */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-[#0ea5a8]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Pengumuman & Informasi Siswa Aktif</h4>
                  <p className="text-xs text-slate-500">
                    Informasi penting dan edaran yang saat ini terlihat di halaman depan siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNavTab('pengumuman')}
                className="px-4 py-2 bg-[#102f4e] hover:bg-[#163f68] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kelola & Buat Pengumuman</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {announcements.filter((a) => a.isActive).slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-2 ${
                    ann.isPinned
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {ann.category}
                      </span>
                      {ann.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <Pin className="w-3 h-3" /> Disematkan
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                    <span>{ann.date}</span>
                    <button
                      type="button"
                      onClick={() => handleEditAnnouncement(ann)}
                      className="text-[#0ea5a8] hover:underline font-semibold"
                    >
                      Edit Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: KELOLA DATA MASTER ==================== */}
      {navTab === 'master' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub Navigation */}
          <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
            <button
              onClick={() => setMasterSubTab('mapel_kelas')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                masterSubTab === 'mapel_kelas'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mata Pelajaran & Kelas
            </button>
            <button
              onClick={() => setMasterSubTab('guru')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                masterSubTab === 'guru'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Guru & Kode Akses
            </button>
            <button
              onClick={() => setMasterSubTab('siswa')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                masterSubTab === 'siswa'
                  ? 'bg-white text-[#102f4e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Siswa & Impor Excel
            </button>
          </div>

          {/* Sub-Tab: Mata Pelajaran & Kelas */}
          {masterSubTab === 'mapel_kelas' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kelas Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <School className="w-5 h-5 text-[#102f4e]" />
                    Data Kelas ({classes.length})
                  </h3>
                  {editingClassId && (
                    <button
                      onClick={() => {
                        setEditingClassId(null);
                        setNewClassName('');
                      }}
                      className="text-xs text-slate-500 underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveClass} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-xs text-slate-700">
                    {editingClassId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Nama Kelas (mis: X RPL 1)"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <div>
                      <select
                        value={newClassGrade}
                        onChange={(e) => setNewClassGrade(e.target.value as 'X' | 'XI' | 'XII')}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      >
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Jurusan (mis: Rekayasa Perangkat Lunak)"
                      value={newClassMajor}
                      onChange={(e) => setNewClassMajor(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#102f4e] hover:bg-[#153e66] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingClassId ? 'Simpan Perubahan Kelas' : 'Tambah Kelas'}</span>
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">Kelas</th>
                        <th className="px-3 py-2.5">Jurusan</th>
                        <th className="px-3 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-bold text-slate-900">{cls.name}</td>
                          <td className="px-3 py-2.5 text-slate-600">{cls.major}</td>
                          <td className="px-3 py-2.5 text-right space-x-1">
                            <button
                              onClick={() => handleStartEditClass(cls)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <DoubleConfirmButton
                              itemName={`Kelas ${cls.name}`}
                              onConfirm={() => {
                                onDeleteClass(cls.id);
                                showToast(`Kelas ${cls.name} berhasil dihapus.`);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mata Pelajaran Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0ea5a8]" />
                    Mata Pelajaran ({subjects.length})
                  </h3>
                  {editingSubjectId && (
                    <button
                      onClick={() => {
                        setEditingSubjectId(null);
                        setNewSubjectName('');
                        setNewSubjectCode('');
                      }}
                      className="text-xs text-slate-500 underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveSubject} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-xs text-slate-700">
                    {editingSubjectId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Kode (mis: RPL-PW)"
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Nama Mata Pelajaran"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={newSubjectCategory}
                      onChange={(e) =>
                        setNewSubjectCategory(e.target.value as 'Kejuruan' | 'Umum' | 'Muatan Lokal')
                      }
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    >
                      <option value="Kejuruan">Kejuruan (Produktif)</option>
                      <option value="Umum">Mata Pelajaran Umum (Normatif/Adaptif)</option>
                      <option value="Muatan Lokal">Muatan Lokal</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0ea5a8] hover:bg-[#0c9194] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingSubjectId ? 'Simpan Perubahan Mapel' : 'Tambah Mapel'}</span>
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">Kode</th>
                        <th className="px-3 py-2.5">Nama Mapel</th>
                        <th className="px-3 py-2.5">Kategori</th>
                        <th className="px-3 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono text-slate-500">{sub.code}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{sub.name}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {sub.category}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right space-x-1">
                            <button
                              onClick={() => handleStartEditSubject(sub)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <DoubleConfirmButton
                              itemName={`Mata Pelajaran ${sub.name}`}
                              onConfirm={() => {
                                onDeleteSubject(sub.id);
                                showToast(`Mata Pelajaran ${sub.name} berhasil dihapus.`);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab: Kelola Guru */}
          {masterSubTab === 'guru' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Tambah/Edit Guru */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0ea5a8]" />
                    {editingTeacherId ? 'Edit Data Guru' : 'Pendaftaran Guru Baru'}
                  </h3>
                  {editingTeacherId && (
                    <button
                      onClick={() => {
                        setEditingTeacherId(null);
                        setTeacherName('');
                        setTeacherNip('');
                        setTeacherSelectedSubjects([]);
                        setTeacherAccessCode('');
                      }}
                      className="text-xs text-slate-500 underline"
                    >
                      Batal
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveTeacher} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso, S.Kom."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / ID Guru</label>
                    <input
                      type="text"
                      placeholder="Contoh: 19850315..."
                      value={teacherNip}
                      onChange={(e) => setTeacherNip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mata Pelajaran yang Diampu
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      {subjects.map((s) => {
                        const isChecked = teacherSelectedSubjects.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                              isChecked ? 'bg-cyan-50 text-[#0a7577] font-semibold' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSubjectForTeacher(s.id)}
                              className="rounded text-[#0ea5a8] focus:ring-[#0ea5a8]"
                            />
                            <span>{s.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Kode Akses (Password Guru)
                      </label>
                      <button
                        type="button"
                        onClick={generateAccessCode}
                        className="text-[11px] text-[#0ea5a8] hover:underline font-semibold"
                      >
                        Acak Password
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Generate atau masukkan kode akses"
                        value={teacherAccessCode}
                        onChange={(e) => setTeacherAccessCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kode ini digunakan guru untuk masuk ke portal Dasbor Guru.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#102f4e] hover:bg-[#163f68] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                  >
                    {editingTeacherId ? 'Simpan Perubahan Guru' : 'Daftarkan Guru & Generate Akses'}
                  </button>
                </form>
              </div>

              {/* Tabel Guru Terdaftar */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#102f4e]" />
                    Daftar Guru & Kode Akses ({teachers.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">Nama Guru / NIP</th>
                        <th className="px-3 py-2.5">Mapel Yang Diampu</th>
                        <th className="px-3 py-2.5">Kode Akses</th>
                        <th className="px-3 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {teachers.map((t) => {
                        const teacherMapels = subjects.filter((s) => t.subjectIds?.includes(s.id));
                        return (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-3 py-3">
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">NIP: {t.nip}</div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {teacherMapels.length > 0 ? (
                                  teacherMapels.map((m) => (
                                    <span
                                      key={m.id}
                                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 text-[#0a7577] border border-cyan-200"
                                    >
                                      {m.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 italic">Belum ditentukan</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-mono text-xs font-bold px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                                {t.accessCode}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right space-x-1">
                              <button
                                onClick={() => handleStartEditTeacher(t)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <DoubleConfirmButton
                                itemName={`Guru ${t.name}`}
                                onConfirm={() => {
                                  onDeleteTeacher(t.id);
                                  showToast(`Guru ${t.name} berhasil dihapus.`);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab: Kelola Siswa & Impor Excel */}
          {masterSubTab === 'siswa' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Input Manual Siswa */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#102f4e]" />
                    Input Siswa Manual
                  </h3>
                  <form onSubmit={handleManualAddStudent} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 2425020"
                        value={manualStudentNis}
                        onChange={(e) => setManualStudentNis(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Farhan"
                        value={manualStudentName}
                        onChange={(e) => setManualStudentName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kelas Siswa</label>
                      <select
                        value={manualStudentClassId}
                        onChange={(e) => setManualStudentClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.major})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#102f4e] hover:bg-[#153e66] text-white font-semibold rounded-lg transition-colors"
                    >
                      Simpan Data Siswa
                    </button>
                  </form>
                </div>

                {/* Fitur Impor Siswa Massal Excel */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        Impor Siswa Massal Menggunakan Excel (.xlsx)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Unduh template Excel resmi berdasarkan kelas, isi data siswa, lalu unggah kembali.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Step 1: Download template */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-[#102f4e] text-white flex items-center justify-center text-[11px]">
                          1
                        </span>
                        <span>Unduh Template Excel Berdasarkan Kelas</span>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Pilih Kelas Sasaran Template:</label>
                        <select
                          value={importClassId}
                          onChange={(e) => setImportClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.major})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Template (.xlsx)</span>
                      </button>
                    </div>

                    {/* Step 2: Upload file */}
                    <form onSubmit={handleUploadExcel} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                          2
                        </span>
                        <span>Unggah File Siswa yang Sudah Diisi</span>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Pilih File Excel (.xlsx):</label>
                        <input
                          type="file"
                          required
                          accept=".xlsx, .xls"
                          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!importFile || isImporting}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isImporting ? 'Memproses File...' : 'Impor Data Siswa Sekarang'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Tabel Master Siswa */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#102f4e]" />
                    Daftar Siswa Terdaftar ({filteredStudents.length} dari {students.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari NIS atau Nama..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                    </div>
                    <select
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    >
                      <option value="all">Semua Kelas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">NIS</th>
                        <th className="px-3 py-2.5">Nama Siswa</th>
                        <th className="px-3 py-2.5">Kelas</th>
                        <th className="px-3 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredStudents.map((s) => {
                        const sClass = classes.find((c) => c.id === s.classId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 font-mono font-semibold text-slate-600">{s.nis}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-900">{s.name}</td>
                            <td className="px-3 py-2.5">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                {sClass?.name || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <DoubleConfirmButton
                                itemName={`Siswa ${s.name}`}
                                onConfirm={() => {
                                  onDeleteStudent(s.id);
                                  showToast(`Data siswa ${s.name} berhasil dihapus.`);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-400">
                            Tidak ada data siswa yang cocok dengan kriteria pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: REKAPITULASI GLOBAL ==================== */}
      {navTab === 'rekap' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRekapTab('absensi')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  rekapTab === 'absensi'
                    ? 'bg-[#102f4e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rekap Absensi Global ({attendance.length})
              </button>
              <button
                onClick={() => setRekapTab('sumatif')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  rekapTab === 'sumatif'
                    ? 'bg-[#102f4e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rekap Nilai Sumatif Global ({summativeGrades.length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={rekapClassFilter}
                onChange={(e) => setRekapClassFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0ea5a8]"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {rekapTab === 'absensi' ? (
                <button
                  type="button"
                  onClick={() => {
                    exportAttendanceToExcel(filteredAttendance, classes, subjects, students);
                    showToast('Rekapitulasi Absensi berhasil diekspor ke Excel!');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    exportSummativeGradesToExcel(filteredGrades, classes, subjects, students, systemConfig.kkm);
                    showToast('Rekapitulasi Nilai Sumatif berhasil diekspor ke Excel!');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              )}
            </div>
          </div>

          {/* Rekap Absensi Table */}
          {rekapTab === 'absensi' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Tanggal</th>
                      <th className="px-3 py-2.5">Kelas</th>
                      <th className="px-3 py-2.5">Mata Pelajaran</th>
                      <th className="px-3 py-2.5">Nama Siswa</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAttendance.map((rec) => {
                      const student = students.find((s) => s.id === rec.studentId);
                      const cls = classes.find((c) => c.id === rec.classId);
                      const sub = subjects.find((s) => s.id === rec.subjectId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono text-slate-600">{rec.date}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-900">{cls?.name || '-'}</td>
                          <td className="px-3 py-2.5 text-slate-700">{sub?.name || '-'}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{student?.name || '-'}</td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                rec.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'Izin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : rec.status === 'Sakit'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{rec.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {filteredAttendance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          Belum ada catatan absensi untuk kriteria yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rekap Nilai Sumatif Table */}
          {rekapTab === 'sumatif' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Kelas</th>
                      <th className="px-3 py-2.5">Mata Pelajaran</th>
                      <th className="px-3 py-2.5">Nama Siswa</th>
                      <th className="px-3 py-2.5">Asesmen</th>
                      <th className="px-3 py-2.5">Bab / Pokok Bahasan</th>
                      <th className="px-3 py-2.5">Nilai</th>
                      <th className="px-3 py-2.5">Status Ketuntasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredGrades.map((g) => {
                      const student = students.find((s) => s.id === g.studentId);
                      const cls = classes.find((c) => c.id === g.classId);
                      const sub = subjects.find((s) => s.id === g.subjectId);
                      const isPassed = g.score >= systemConfig.kkm;
                      return (
                        <tr key={g.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-semibold text-slate-900">{cls?.name || '-'}</td>
                          <td className="px-3 py-2.5 text-slate-700">{sub?.name || '-'}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{student?.name || '-'}</td>
                          <td className="px-3 py-2.5 font-mono">Sumatif {g.evaluationNumber}</td>
                          <td className="px-3 py-2.5 text-slate-600">{g.chapterTitle}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 text-sm">{g.score}</td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPassed ? 'TUNTAS' : 'BELUM TUNTAS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredGrades.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Belum ada catatan nilai sumatif untuk kriteria yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB: PENGUMUMAN & INFO SISWA ==================== */}
      {navTab === 'pengumuman' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Quick Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#0ea5a8]" />
                Manajemen Pengumuman & Informasi Beranda Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kelola informasi akademik, edaran resmi, dan pengumuman mendesak yang ditampilkan langsung di Beranda Siswa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                Total: <strong className="text-slate-900">{announcements.length}</strong> ({announcements.filter((a) => a.isActive).length} Aktif)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tambah / Edit Pengumuman */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0ea5a8]" />
                  {editingAnnId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h4>
                {editingAnnId && (
                  <button
                    type="button"
                    onClick={handleCancelEditAnn}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Pengumuman <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jadwal Asesmen Sumatif & Pra-UKK"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    >
                      <option value="Penting">Penting</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan Siswa</option>
                      <option value="Ujian">Ujian / Asesmen</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanggal Tayang
                    </label>
                    <input
                      type="date"
                      required
                      value={annDate}
                      onChange={(e) => setAnnDate(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penerbit / Penulis
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Waka Kurikulum, Operator Super Admin"
                    value={annAuthor}
                    onChange={(e) => setAnnAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Isi Lengkap Pengumuman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tuliskan detail informasi, petunjuk pelaksanaan, tenggat waktu, atau tautan terkait..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annIsPinned}
                      onChange={(e) => setAnnIsPinned(e.target.checked)}
                      className="w-4 h-4 text-[#0ea5a8] rounded accent-[#0ea5a8]"
                    />
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-amber-600" />
                      Sematkan di Atas (Prioritas Utama)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 ml-6">
                    Pengumuman bertanda pin akan disorot dengan kartu khusus di puncak Beranda Siswa.
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={annIsActive}
                      onChange={(e) => setAnnIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#0ea5a8] rounded accent-[#0ea5a8]"
                    />
                    <span className="font-semibold text-slate-800">
                      Status Tayang (Aktifkan untuk Siswa)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-[#102f4e] hover:bg-[#163f68] text-white font-semibold rounded-xl transition-all shadow-xs"
                  >
                    {editingAnnId ? 'Simpan Perubahan' : 'Publikasikan Pengumuman'}
                  </button>
                  {editingAnnId && (
                    <button
                      type="button"
                      onClick={handleCancelEditAnn}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Daftar Pengumuman Terbit */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search & Filter */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari judul atau isi pengumuman..."
                    value={annSearch}
                    onChange={(e) => setAnnSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Filter:</span>
                  <select
                    value={annCategoryFilter}
                    onChange={(e) => setAnnCategoryFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="Penting">Penting</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Kegiatan">Kegiatan Siswa</option>
                    <option value="Ujian">Ujian / Asesmen</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
              </div>

              {/* Announcements List Cards */}
              <div className="space-y-3">
                {filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      ann.isPinned
                        ? 'border-amber-300 ring-1 ring-amber-200/70 shadow-xs'
                        : 'border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              ann.category === 'Penting'
                                ? 'bg-rose-100 text-rose-800'
                                : ann.category === 'Akademik'
                                ? 'bg-cyan-100 text-cyan-800'
                                : ann.category === 'Kegiatan'
                                ? 'bg-purple-100 text-purple-800'
                                : ann.category === 'Ujian'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ann.category}
                          </span>

                          {ann.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              <Pin className="w-3 h-3 text-amber-600" />
                              Disematkan
                            </span>
                          )}

                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              ann.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {ann.isActive ? 'Tayang di Beranda' : 'Non-aktif (Arsip)'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {ann.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                          {ann.content}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {ann.date}
                          </span>
                          <span>Oleh: {ann.author}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => setPreviewingAnnouncement(ann)}
                          title="Pratinjau Tampilan Siswa"
                          className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePinAnn(ann)}
                          title={ann.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
                          className={`p-2 rounded-xl transition-colors ${
                            ann.isPinned
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActiveAnn(ann)}
                          title={ann.isActive ? 'Nonaktifkan Pengumuman' : 'Aktifkan Pengumuman'}
                          className={`p-2 rounded-xl transition-colors ${
                            ann.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditAnnouncement(ann)}
                          title="Edit Pengumuman"
                          className="p-2 rounded-xl bg-slate-50 text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <DoubleConfirmButton
                          itemName={ann.title}
                          title="Hapus Pengumuman"
                          onConfirm={() => {
                            onDeleteAnnouncement(ann.id);
                            showToast('Pengumuman berhasil dihapus.');
                          }}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAnnouncements.length === 0 && (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
                    <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-700">Belum Ada Pengumuman</h5>
                    <p className="text-xs text-slate-400">
                      Gunakan formulir di sebelah kiri untuk mempublikasikan pengumuman atau informasi baru bagi siswa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: PENGATURAN SISTEM & LOGO ==================== */}
      {navTab === 'pengaturan' && (
        <div className="space-y-6 animate-fade-in">
          {/* ==================== SECTION: GANTI & SESUAIKAN LOGO SEKOLAH ==================== */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#0ea5a8]" />
                  Ganti & Sesuaikan Logo Sekolah
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ubah logo institusi yang ditampilkan pada Navbar, Layar Login, Kartu Rapor, dan Header Dashboard.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {systemConfig.logoUrl ? (
                  <span className="text-[11px] font-bold px-3 py-1 bg-cyan-50 text-[#0ea5a8] border border-cyan-200 rounded-full">
                    Menggunakan Logo Kustom
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Logo Resmi Default Aktif
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Logo Upload & Input Form */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setLogoInputType('upload')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      logoInputType === 'upload'
                        ? 'bg-[#102f4e] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Unggah Berkas Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoInputType('url')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      logoInputType === 'url'
                        ? 'bg-[#102f4e] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Masukkan URL Gambar
                  </button>
                </div>

                {logoInputType === 'upload' ? (
                  <div className="space-y-3">
                    <label className="block border-2 border-dashed border-slate-300 hover:border-[#0ea5a8] bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-2xl p-6 text-center cursor-pointer">
                      <Upload className="w-8 h-8 text-[#0ea5a8] mx-auto mb-2" />
                      <span className="block text-xs font-bold text-slate-800">
                        Klik untuk memilih file logo baru
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Mendukung format PNG, JPG, JPEG, SVG, WebP (Maksimal 3 MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700">
                      Tautan URL Gambar Logo
                    </label>
                    <input
                      type="url"
                      placeholder="https://domain-sekolah.sch.id/logo.png"
                      value={logoUrlText}
                      onChange={(e) => {
                        setLogoUrlText(e.target.value);
                        setLogoPreviewUrl(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                    />
                    <p className="text-[11px] text-slate-500">
                      Masukkan link langsung ke file gambar logo beresolusi tinggi.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApplyLogo}
                    className="py-2.5 px-5 bg-[#102f4e] hover:bg-[#163f68] text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#0ea5a8]" />
                    <span>Terapkan Logo Baru</span>
                  </button>

                  {systemConfig.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kembalikan ke Logo Bawaan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Pane */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pratinjau Langsung Tampilan Logo
                </span>

                {/* Preview 1: Light Background (Login & Dashboard) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <SchoolLogo
                    size="lg"
                    src={logoPreviewUrl || systemConfig.logoUrl || '/school-logo.svg'}
                    className="w-14 h-14"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Tampilan Kartu / Rapor</span>
                    <h5 className="text-xs font-bold text-slate-800">{systemConfig.institutionName}</h5>
                    <p className="text-[10px] text-slate-500">LMS Tridharma UNG</p>
                  </div>
                </div>

                {/* Preview 2: Dark Background (Navbar) */}
                <div className="bg-[#102f4e] p-4 rounded-xl text-white flex items-center gap-3">
                  <SchoolLogo
                    size="md"
                    src={logoPreviewUrl || systemConfig.logoUrl || '/school-logo.svg'}
                    className="w-10 h-10"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-300">Tampilan Navbar Utama</span>
                    <h5 className="text-xs font-bold">{systemConfig.institutionName}</h5>
                    <p className="text-[10px] text-slate-300">Portal Pembelajaran Digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SECTION: IDENTITAS & PARAMETER MASTER ==================== */}
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#102f4e]" />
                Pengaturan Identitas & Nilai Master [DAPAT DISESUAIKAN]
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sesuaikan nama institusi, KKM kelulusan, dan password master sistem secara dinamis.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Institusi Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={configForm.institutionName}
                  onChange={(e) => setConfigForm({ ...configForm, institutionName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Ketuntasan Minimal (KKM)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={configForm.kkm}
                    onChange={(e) => setConfigForm({ ...configForm, kkm: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Akses Master Operator
                  </label>
                  <input
                    type="text"
                    required
                    value={configForm.masterAccessCode}
                    onChange={(e) => setConfigForm({ ...configForm, masterAccessCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat Sekolah (Layar Login)
                </label>
                <textarea
                  rows={2}
                  value={configForm.description}
                  onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Banner "Digital Learning" (Dasbor Hero)
                </label>
                <textarea
                  rows={2}
                  value={configForm.bannerText}
                  onChange={(e) => setConfigForm({ ...configForm, bannerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-[#102f4e] hover:bg-[#163f68] text-white font-semibold rounded-xl text-sm transition-all shadow-md"
              >
                Simpan Perubahan Pengaturan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: DATABASE & DEPLOY HOSTING ==================== */}
      {navTab === 'database_hosting' && (
        <DatabaseHostingGuide
          systemConfig={systemConfig}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          students={students}
          attendance={attendance}
          materials={materials || []}
          assignments={assignments || []}
          submissions={submissions || []}
          summativeGrades={summativeGrades}
          announcements={announcements}
          onImportAllData={onImportAllData || (() => {})}
          onResetToCleanSlate={onResetToCleanSlate || (() => {})}
          showToast={showToast}
        />
      )}

      {/* Modal Pratinjau Tampilan Siswa */}
      {previewingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-[#102f4e] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#0ea5a8]" />
                <span className="text-xs font-bold tracking-wide">
                  Pratinjau Pengumuman Beranda Siswa
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingAnnouncement(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    previewingAnnouncement.category === 'Penting'
                      ? 'bg-rose-100 text-rose-800'
                      : previewingAnnouncement.category === 'Akademik'
                      ? 'bg-cyan-100 text-cyan-800'
                      : previewingAnnouncement.category === 'Kegiatan'
                      ? 'bg-purple-100 text-purple-800'
                      : previewingAnnouncement.category === 'Ujian'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {previewingAnnouncement.category}
                </span>

                {previewingAnnouncement.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Pin className="w-3 h-3 text-amber-600" />
                    Prioritas Utama
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {previewingAnnouncement.title}
              </h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {previewingAnnouncement.content}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>Dipublikasikan: {previewingAnnouncement.date}</span>
                <span>Penerbit: {previewingAnnouncement.author}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewingAnnouncement(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
