import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  BookOpen,
  ClipboardList,
  Award,
  Plus,
  Download,
  ExternalLink,
  Save,
  CheckCircle,
  HelpCircle,
  FileCheck2,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Teacher,
  ClassRoom,
  Subject,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  Material,
  Assignment,
  Submission,
  SummativeGrade,
  SystemConfig,
  UserSession,
} from '../../types';
import { DoubleConfirmButton } from '../DoubleConfirmButton';
import { MathView } from '../MathView';
import { exportAttendanceToExcel, exportSummativeGradesToExcel } from '../../utils/excel';
import { TeacherAttendanceRecap } from './TeacherAttendanceRecap';
import { TeacherAssessmentRecap } from './TeacherAssessmentRecap';

interface TeacherDashboardProps {
  session: UserSession;
  systemConfig: SystemConfig;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  materials: Material[];
  onAddMaterial: (mat: Omit<Material, 'id' | 'createdAt'>) => void;
  onDeleteMaterial: (id: string) => void;
  assignments: Assignment[];
  onAddAssignment: (asg: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onDeleteAssignment: (id: string) => void;
  submissions: Submission[];
  summativeGrades: SummativeGrade[];
  onSaveSummativeGrades: (grades: SummativeGrade[]) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  systemConfig,
  classes,
  subjects,
  students,
  attendance,
  onSaveAttendance,
  materials,
  onAddMaterial,
  onDeleteMaterial,
  assignments,
  onAddAssignment,
  onDeleteAssignment,
  submissions,
  summativeGrades,
  onSaveSummativeGrades,
}) => {
  const teacher = session.teacherData as Teacher | undefined;
  const teacherSubjects = subjects.filter((s) => teacher?.subjectIds?.includes(s.id));
  const defaultSubjectId = teacherSubjects[0]?.id || subjects[0]?.id || '';

  const [activeTab, setActiveTab] = useState<
    'beranda' | 'absensi' | 'rekap-absensi' | 'materi' | 'tugas' | 'sumatif' | 'rekap-asesmen'
  >('beranda');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Absensi State ---
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attClassId, setAttClassId] = useState<string>(classes[0]?.id || '');
  const [attSubjectId, setAttSubjectId] = useState<string>(defaultSubjectId);
  const [attEntries, setAttEntries] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});

  // Class students for attendance
  const currentClassStudents = students.filter((s) => s.classId === attClassId);

  const handleAttStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttEntries((prev) => ({
      ...prev,
      [studentId]: {
        status,
        notes: prev[studentId]?.notes || '',
      },
    }));
  };

  const handleAttNotesChange = (studentId: string, notes: string) => {
    setAttEntries((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Hadir',
        notes,
      },
    }));
  };

  const handleSetAllPresent = () => {
    const newEntries: Record<string, { status: AttendanceStatus; notes: string }> = {};
    currentClassStudents.forEach((s) => {
      newEntries[s.id] = {
        status: 'Hadir',
        notes: attEntries[s.id]?.notes || '',
      };
    });
    setAttEntries(newEntries);
  };

  const handleSaveAttendance = () => {
    const newRecords: AttendanceRecord[] = currentClassStudents.map((s) => ({
      id: `att-${attDate}-${s.id}-${attSubjectId}`,
      date: attDate,
      classId: attClassId,
      subjectId: attSubjectId,
      teacherId: teacher?.id || 't-unknown',
      studentId: s.id,
      status: attEntries[s.id]?.status || 'Hadir',
      notes: attEntries[s.id]?.notes || '',
    }));

    onSaveAttendance(newRecords);
    showToast(`Presensi kehadiran untuk ${currentClassStudents.length} siswa berhasil disimpan.`);
  };

  // --- Materi State ---
  const [matTitle, setMatTitle] = useState('');
  const [matMeetingNo, setMatMeetingNo] = useState(1);
  const [matClassId, setMatClassId] = useState(classes[0]?.id || '');
  const [matSubjectId, setMatSubjectId] = useState(defaultSubjectId);
  const [matUrl, setMatUrl] = useState('');
  const [matDescription, setMatDescription] = useState('');
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matUrl.trim()) return;

    onAddMaterial({
      title: matTitle.trim(),
      meetingNo: Number(matMeetingNo),
      classId: matClassId,
      subjectId: matSubjectId,
      teacherId: teacher?.id || 't-unknown',
      url: matUrl.trim(),
      description: matDescription.trim(),
    });

    setMatTitle('');
    setMatUrl('');
    setMatDescription('');
    setMatMeetingNo((prev) => prev + 1);
    showToast('Materi pembelajaran berhasil dipublikasikan!');
  };

  const insertFormulaToMaterial = (snippet: string) => {
    setMatDescription((prev) => `${prev} ${snippet} `);
  };

  // --- Tugas State ---
  const [asgTitle, setAsgTitle] = useState('');
  const [asgMeetingNo, setAsgMeetingNo] = useState(1);
  const [asgClassId, setAsgClassId] = useState(classes[0]?.id || '');
  const [asgSubjectId, setAsgSubjectId] = useState(defaultSubjectId);
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgDescription, setAsgDescription] = useState('');
  const [selectedAsgIdForMonitoring, setSelectedAsgIdForMonitoring] = useState<string | null>(null);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDeadline) return;

    onAddAssignment({
      title: asgTitle.trim(),
      meetingNo: Number(asgMeetingNo),
      classId: asgClassId,
      subjectId: asgSubjectId,
      teacherId: teacher?.id || 't-unknown',
      deadline: asgDeadline,
      description: asgDescription.trim(),
    });

    setAsgTitle('');
    setAsgDeadline('');
    setAsgDescription('');
    setAsgMeetingNo((prev) => prev + 1);
    showToast('Penugasan berhasil dibuat dan dipublikasikan ke siswa!');
  };

  // --- Penilaian Sumatif State ---
  const [sumatifClassId, setSumatifClassId] = useState(classes[0]?.id || '');
  const [sumatifSubjectId, setSumatifSubjectId] = useState(defaultSubjectId);
  const [sumatifEvalNo, setSumatifEvalNo] = useState(1);
  const [sumatifChapter, setSumatifChapter] = useState('');
  const [sumatifScores, setSumatifScores] = useState<Record<string, number>>({});

  const sumatifStudents = students.filter((s) => s.classId === sumatifClassId);

  // Pre-load existing scores when class/eval/subject change
  const handleLoadExistingScores = (clsId: string, subId: string, evalNo: number) => {
    const existing = summativeGrades.filter(
      (g) => g.classId === clsId && g.subjectId === subId && g.evaluationNumber === evalNo
    );
    const scoreMap: Record<string, number> = {};
    existing.forEach((g) => {
      scoreMap[g.studentId] = g.score;
    });
    setSumatifScores(scoreMap);
  };

  const handleScoreChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setSumatifScores((prev) => ({
      ...prev,
      [studentId]: clamped,
    }));
  };

  const handleSaveSummativeGrades = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const newGrades: SummativeGrade[] = sumatifStudents.map((s) => ({
      id: `sg-${sumatifClassId}-${sumatifSubjectId}-${sumatifEvalNo}-${s.id}`,
      studentId: s.id,
      classId: sumatifClassId,
      subjectId: sumatifSubjectId,
      teacherId: teacher?.id || 't-unknown',
      evaluationNumber: sumatifEvalNo,
      chapterTitle: sumatifChapter.trim() || `Asesmen Sumatif Bab ${sumatifEvalNo}`,
      score: sumatifScores[s.id] ?? 0,
      updatedAt: dateStr,
    }));

    onSaveSummativeGrades(newGrades);
    showToast(`Nilai Evaluasi Sumatif ${sumatifEvalNo} berhasil disimpan!`);
  };

  // Quick Summary Calculations for Teacher Overview
  const teacherAttendance = attendance.filter(
    (a) => a.teacherId === teacher?.id || teacherSubjects.some((s) => s.id === a.subjectId)
  );
  const totalAttRecords = teacherAttendance.length;
  const countAttHadir = teacherAttendance.filter((r) => r.status === 'Hadir').length;
  const countAttIzin = teacherAttendance.filter((r) => r.status === 'Izin').length;
  const countAttSakit = teacherAttendance.filter((r) => r.status === 'Sakit').length;
  const countAttAlfa = teacherAttendance.filter((r) => r.status === 'Alfa').length;
  const teacherPresenceRate = totalAttRecords > 0 ? Math.round((countAttHadir / totalAttRecords) * 100) : 100;

  const teacherEvaluations = summativeGrades.filter(
    (g) => g.teacherId === teacher?.id || teacherSubjects.some((s) => s.id === g.subjectId)
  );
  const totalEvalRecords = teacherEvaluations.length;
  const passedEvalCount = teacherEvaluations.filter((g) => g.score >= systemConfig.kkm).length;
  const failedEvalCount = teacherEvaluations.filter((g) => g.score < systemConfig.kkm).length;
  const evalPassRate = totalEvalRecords > 0 ? Math.round((passedEvalCount / totalEvalRecords) * 100) : 0;
  const evalAverageScore =
    totalEvalRecords > 0
      ? Math.round(teacherEvaluations.reduce((acc, g) => acc + g.score, 0) / totalEvalRecords)
      : 0;

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
          onClick={() => setActiveTab('beranda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'beranda'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda Guru</span>
        </button>

        <button
          onClick={() => setActiveTab('absensi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'absensi'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Input Presensi</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap-absensi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'rekap-absensi'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekap Presensi</span>
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'materi'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Materi Pembelajaran</span>
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'tugas'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Tugas & Pengumpulan</span>
        </button>

        <button
          onClick={() => setActiveTab('sumatif')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'sumatif'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Input Nilai Sumatif</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap-asesmen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'rekap-asesmen'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rekap Asesmen</span>
        </button>
      </div>

      {/* ==================== TAB 1: BERANDA ==================== */}
      {activeTab === 'beranda' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0ea5a8] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{teacherSubjects.length}</div>
                <div className="text-xs text-slate-500 font-medium">Mapel Yang Diampu</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {attendance.filter((a) => a.teacherId === teacher?.id).length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Rekap Presensi Siswa</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {assignments.filter((a) => a.teacherId === teacher?.id).length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Penugasan Aktif</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {summativeGrades.filter((g) => g.teacherId === teacher?.id).length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Nilai Sumatif Terinput</div>
              </div>
            </div>
          </div>

          {/* Teacher Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Informasi Penugasan Pengajar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Nama & NIP</span>
                <div className="font-bold text-slate-800">{teacher?.name}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">NIP: {teacher?.nip}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Mata Pelajaran Aktif</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {teacherSubjects.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0ea5a8]/15 text-[#0a7577] border border-[#0ea5a8]/30"
                    >
                      {s.name} ({s.code})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Ringkasan Rekapitulasi Pembelajaran */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Ringkasan Rekapitulasi Pembelajaran</h3>
              <span className="text-xs text-slate-500">Pembaruan real-time berdasarkan aktivitas kelas</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Card 1: Rekapitulasi Presensi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0ea5a8] flex items-center justify-center">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Rekapitulasi Kehadiran Siswa</h4>
                        <p className="text-xs text-slate-500">Tingkat kehadiran di seluruh kelas yang diampu</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {teacherPresenceRate}% Hadir
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${teacherPresenceRate}%` }}
                      title={`Hadir: ${teacherPresenceRate}%`}
                    ></div>
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{ width: `${100 - teacherPresenceRate}%` }}
                      title={`Tidak Hadir: ${100 - teacherPresenceRate}%`}
                    ></div>
                  </div>

                  {/* Detailed Counters */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Hadir</span>
                      <span className="font-bold font-mono text-emerald-600 text-base">{countAttHadir}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Izin</span>
                      <span className="font-bold font-mono text-blue-600 text-base">{countAttIzin}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Sakit</span>
                      <span className="font-bold font-mono text-amber-600 text-base">{countAttSakit}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Alfa</span>
                      <span className="font-bold font-mono text-rose-600 text-base">{countAttAlfa}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('rekap-absensi')}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#102f4e] border border-slate-200 hover:border-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Buka Rekapitulasi Kehadiran Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Rekapitulasi Asesmen & Nilai */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Rekapitulasi Asesmen & Nilai</h4>
                        <p className="text-xs text-slate-500">Ketuntasan KKM ({systemConfig.kkm} poin) evaluasi sumatif</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold font-mono bg-[#102f4e] text-white">
                      Rerata: {evalAverageScore}
                    </span>
                  </div>

                  {/* Pass Rate Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Persentase Ketuntasan Siswa</span>
                      <span className="text-emerald-700 font-mono font-bold">{evalPassRate}% Tuntas</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className="bg-[#0ea5a8] h-full transition-all"
                        style={{ width: `${evalPassRate}%` }}
                      ></div>
                      <div
                        className="bg-rose-400 h-full transition-all"
                        style={{ width: `${100 - evalPassRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Total Nilai</span>
                      <span className="font-bold font-mono text-slate-800 text-base">{totalEvalRecords}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] uppercase font-semibold text-emerald-700">Tuntas KKM</span>
                      <span className="font-bold font-mono text-emerald-700 text-base">{passedEvalCount}</span>
                    </div>
                    <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                      <span className="block text-[10px] uppercase font-semibold text-rose-700">Remedial</span>
                      <span className="font-bold font-mono text-rose-700 text-base">{failedEvalCount}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('rekap-asesmen')}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#102f4e] border border-slate-200 hover:border-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Buka Rekapitulasi Asesmen Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ABSENSI ==================== */}
      {activeTab === 'absensi' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Tanggal Presensi</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kelas yang Diajar</label>
                <select
                  value={attClassId}
                  onChange={(e) => setAttClassId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.major})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mata Pelajaran</label>
                <select
                  value={attSubjectId}
                  onChange={(e) => setAttSubjectId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSetAllPresent}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Set Semua Hadir
              </button>
              <button
                type="button"
                onClick={() => {
                  const classRecs = attendance.filter((a) => a.classId === attClassId);
                  exportAttendanceToExcel(classRecs, classes, subjects, students);
                  showToast('Rekap absensi kelas berhasil diekspor ke Excel!');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Rekap (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-[#102f4e] hover:bg-[#163f68] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Form Pencatatan Kehadiran Siswa ({currentClassStudents.length} Siswa)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">NIS</th>
                    <th className="px-3 py-2.5">Nama Siswa</th>
                    <th className="px-3 py-2.5">Status Kehadiran</th>
                    <th className="px-3 py-2.5">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentClassStudents.map((stu) => {
                    const currentStatus = attEntries[stu.id]?.status || 'Hadir';
                    const currentNotes = attEntries[stu.id]?.notes || '';
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 font-mono text-slate-600">{stu.nis}</td>
                        <td className="px-3 py-3 font-bold text-slate-900">{stu.name}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            {(['Hadir', 'Izin', 'Sakit', 'Alfa'] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleAttStatusChange(stu.id, status)}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                  currentStatus === status
                                    ? status === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : status === 'Izin'
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : status === 'Sakit'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            placeholder="Alasan izin / surat dokter..."
                            value={currentNotes}
                            onChange={(e) => handleAttNotesChange(stu.id, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-[#0ea5a8]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {currentClassStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">
                        Belum ada siswa yang terdaftar di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2B: REKAPITULASI PRESENSI ==================== */}
      {activeTab === 'rekap-absensi' && (
        <TeacherAttendanceRecap
          teacher={teacher}
          classes={classes}
          subjects={subjects}
          students={students}
          attendance={attendance}
          onShowToast={showToast}
        />
      )}

      {/* ==================== TAB 3: MATERI ==================== */}
      {activeTab === 'materi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Form Input Materi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#0ea5a8]" />
              Publikasi Materi Baru
            </h3>

            <form onSubmit={handleCreateMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Algoritma Pencarian Linear & Biner"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={matMeetingNo}
                    onChange={(e) => setMatMeetingNo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Kelas</label>
                  <select
                    value={matClassId}
                    onChange={(e) => setMatClassId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={matSubjectId}
                  onChange={(e) => setMatSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tautan Materi (HTTP / HTTPS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... atau https://..."
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Deskripsi & Formula Matematika (LaTeX/MathJax)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFormulaHelper(!showFormulaHelper)}
                    className="text-[11px] text-[#0ea5a8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Contoh Rumus</span>
                  </button>
                </div>

                {showFormulaHelper && (
                  <div className="p-2.5 bg-slate-100 rounded-lg mb-2 text-[11px] space-y-1.5 text-slate-700">
                    <p className="font-semibold text-slate-800">Klik untuk menyisipkan rumus LaTeX:</p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => insertFormulaToMaterial('$f(x) = ax^2 + bx + c$')}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] hover:bg-slate-50"
                      >
                        Fungsi Kuadrat
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaToMaterial('$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$')}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] hover:bg-slate-50"
                      >
                        Rumus ABC
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaToMaterial('$V = I \\cdot R$')}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] hover:bg-slate-50"
                      >
                        Hukum Ohm
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormulaToMaterial('$$\\sum_{i=1}^n x_i$$')}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] hover:bg-slate-50"
                      >
                        Notasi Sigma
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={4}
                  placeholder="Deskripsi materi, catatan instruksi, atau rumus matematika dalam format LaTeX ($...$)"
                  value={matDescription}
                  onChange={(e) => setMatDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              {/* Live Preview of LaTeX formula */}
              {matDescription && (
                <div className="p-2.5 bg-cyan-50/50 border border-cyan-200/60 rounded-lg">
                  <div className="text-[10px] font-bold text-[#0a7577] uppercase tracking-wider mb-1">
                    Pratinjau MathJax:
                  </div>
                  <MathView content={matDescription} className="text-xs text-slate-800" />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0ea5a8] hover:bg-[#0c9194] text-white font-semibold rounded-lg transition-colors shadow-xs"
              >
                Publikasikan Materi
              </button>
            </form>
          </div>

          {/* Daftar Materi Guru */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Materi Pembelajaran ({materials.length})
            </h3>

            <div className="space-y-3">
              {materials.map((mat) => {
                const matClass = classes.find((c) => c.id === mat.classId);
                const matSub = subjects.find((s) => s.id === mat.subjectId);
                return (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-cyan-300 transition-colors bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#102f4e] text-white">
                            Pertemuan {mat.meetingNo}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-[#0a7577]">
                            {matClass?.name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {matSub?.name}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{matTitle}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-cyan-600 rounded"
                          title="Buka Tautan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <DoubleConfirmButton
                          itemName={`Materi Pertemuan ${mat.meetingNo}`}
                          onConfirm={() => {
                            onDeleteMaterial(mat.id);
                            showToast('Materi berhasil dihapus.');
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                      <MathView content={mat.description || 'Tidak ada catatan deskripsi tambahan.'} />
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Tautan Sumber: <span className="text-cyan-600 underline break-all">{mat.url}</span>
                    </div>
                  </div>
                );
              })}

              {materials.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada materi pembelajaran yang dipublikasikan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: TUGAS & PENGUMPULAN ==================== */}
      {activeTab === 'tugas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Form Buat Tugas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#102f4e]" />
              Buat Penugasan Baru
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Penugasan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas 1: Studi Kasus Database"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={asgMeetingNo}
                    onChange={(e) => setAsgMeetingNo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Kelas</label>
                  <select
                    value={asgClassId}
                    onChange={(e) => setAsgClassId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={asgSubjectId}
                  onChange={(e) => setAsgSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Waktu Pengumpulan (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi & Instruksi Tugas (Mendukung Formula LaTeX)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan petunjuk penugasan, instruksi pengumpulan, atau formula matematika ($...$)"
                  value={asgDescription}
                  onChange={(e) => setAsgDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>

              {asgDescription && (
                <div className="p-2.5 bg-cyan-50/50 border border-cyan-200/60 rounded-lg">
                  <div className="text-[10px] font-bold text-[#0a7577] uppercase tracking-wider mb-1">
                    Pratinjau MathJax:
                  </div>
                  <MathView content={asgDescription} className="text-xs text-slate-800" />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#102f4e] hover:bg-[#163f68] text-white font-semibold rounded-lg transition-colors shadow-xs"
              >
                Buat Tugas & Rilis ke Siswa
              </button>
            </form>
          </div>

          {/* Daftar Tugas & Monitoring Pengumpulan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Daftar Penugasan Siswa ({assignments.length})
              </h3>

              <div className="space-y-3">
                {assignments.map((asg) => {
                  const asgClass = classes.find((c) => c.id === asg.classId);
                  const asgSub = subjects.find((s) => s.id === asg.subjectId);
                  const taskSubs = submissions.filter((s) => s.assignmentId === asg.id);
                  const isSelected = selectedAsgIdForMonitoring === asg.id;

                  return (
                    <div
                      key={asg.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-cyan-500 ring-2 ring-cyan-100 bg-cyan-50/20'
                          : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#102f4e] text-white">
                              Pertemuan {asg.meetingNo}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-[#0a7577]">
                              {asgClass?.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {asgSub?.name}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{asg.title}</h4>
                          <div className="text-xs text-rose-600 font-medium mt-0.5">
                            Batas: {asg.deadline.replace('T', ' ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAsgIdForMonitoring(isSelected ? null : asg.id)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-[#0ea5a8] text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {taskSubs.length} Terkumpul
                          </button>

                          <DoubleConfirmButton
                            itemName={`Tugas ${asg.title}`}
                            onConfirm={() => {
                              onDeleteAssignment(asg.id);
                              showToast('Penugasan berhasil dihapus.');
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 mt-2">
                        <MathView content={asg.description} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monitoring Pengumpulan Siswa */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  Monitoring Pengumpulan Tugas Siswa
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Nama Siswa</th>
                      <th className="px-3 py-2.5">Judul Tugas</th>
                      <th className="px-3 py-2.5">Tautan Hasil Tugas</th>
                      <th className="px-3 py-2.5">Waktu Pengumpulan</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submissions
                      .filter(
                        (s) =>
                          !selectedAsgIdForMonitoring ||
                          s.assignmentId === selectedAsgIdForMonitoring
                      )
                      .map((sub) => {
                        const student = students.find((st) => st.id === sub.studentId);
                        const asg = assignments.find((a) => a.id === sub.assignmentId);
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="px-3 py-3 font-bold text-slate-900">{student?.name || '-'}</td>
                            <td className="px-3 py-3 text-slate-700">{asg?.title || '-'}</td>
                            <td className="px-3 py-3">
                              <a
                                href={sub.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0ea5a8] hover:underline font-semibold"
                              >
                                <span>Lihat Berkas</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </td>
                            <td className="px-3 py-3 text-slate-500 font-mono">{sub.submittedAt}</td>
                            <td className="px-3 py-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          Belum ada penyerahan tugas dari siswa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: PENILAIAN SUMATIF ==================== */}
      {activeTab === 'sumatif' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Penilaian Sumatif
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kelas Sasaran</label>
                <select
                  value={sumatifClassId}
                  onChange={(e) => {
                    const newCls = e.target.value;
                    setSumatifClassId(newCls);
                    handleLoadExistingScores(newCls, sumatifSubjectId, sumatifEvalNo);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Mata Pelajaran</label>
                <select
                  value={sumatifSubjectId}
                  onChange={(e) => {
                    const newSub = e.target.value;
                    setSumatifSubjectId(newSub);
                    handleLoadExistingScores(sumatifClassId, newSub, sumatifEvalNo);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Evaluasi Sumatif</label>
                <select
                  value={sumatifEvalNo}
                  onChange={(e) => {
                    const evalN = Number(e.target.value);
                    setSumatifEvalNo(evalN);
                    handleLoadExistingScores(sumatifClassId, sumatifSubjectId, evalN);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      Evaluasi Sumatif {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Bab / Pokok Bahasan</label>
                <input
                  type="text"
                  placeholder="Contoh: CSS Grid & Flexbox"
                  value={sumatifChapter}
                  onChange={(e) => setSumatifChapter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Standar KKM: <span className="font-bold text-emerald-600">{systemConfig.kkm} poin</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const classGrades = summativeGrades.filter(
                      (g) => g.classId === sumatifClassId && g.subjectId === sumatifSubjectId
                    );
                    exportSummativeGradesToExcel(
                      classGrades,
                      classes,
                      subjects,
                      students,
                      systemConfig.kkm,
                      `Rekap_Nilai_Sumatif_${classes.find((c) => c.id === sumatifClassId)?.name}.xlsx`
                    );
                    showToast('Rekapitulasi Nilai berhasil diekspor ke Excel!');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSummativeGrades}
                  className="px-4 py-2 bg-[#102f4e] hover:bg-[#163f68] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Nilai Sumatif</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Grading Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Input Nilai Sumatif Siswa (Skala 0 - 100)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">NIS</th>
                    <th className="px-3 py-2.5">Nama Siswa</th>
                    <th className="px-3 py-2.5 w-40">Nilai (0-100)</th>
                    <th className="px-3 py-2.5">Status Ketuntasan (KKM {systemConfig.kkm})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sumatifStudents.map((stu) => {
                    const currentScore = sumatifScores[stu.id] ?? 0;
                    const isPassed = currentScore >= systemConfig.kkm;
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 font-mono text-slate-600">{stu.nis}</td>
                        <td className="px-3 py-3 font-bold text-slate-900">{stu.name}</td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentScore}
                            onChange={(e) => handleScoreChange(stu.id, parseInt(e.target.value, 10))}
                            className="w-24 px-2.5 py-1.5 font-mono font-bold bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isPassed ? 'TUNTAS' : 'BELUM TUNTAS'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {sumatifStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">
                        Belum ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5B: REKAPITULASI ASESMEN ==================== */}
      {activeTab === 'rekap-asesmen' && (
        <TeacherAssessmentRecap
          teacher={teacher}
          classes={classes}
          subjects={subjects}
          students={students}
          summativeGrades={summativeGrades}
          assignments={assignments}
          submissions={submissions}
          systemConfig={systemConfig}
          onShowToast={showToast}
        />
      )}
    </div>
  );
};
