import React, { useState } from 'react';
import {
  Home,
  Clock,
  BookOpen,
  ClipboardList,
  Award,
  ExternalLink,
  Send,
  Download,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Pin,
  Megaphone,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  Student,
  ClassRoom,
  Subject,
  AttendanceRecord,
  Material,
  Assignment,
  Submission,
  SummativeGrade,
  SystemConfig,
  UserSession,
  Announcement,
} from '../../types';
import { MathView } from '../MathView';
import { exportStudentReportToExcel } from '../../utils/excel';
import { SchoolLogo } from '../SchoolLogo';

interface StudentDashboardProps {
  session: UserSession;
  systemConfig: SystemConfig;
  classes: ClassRoom[];
  subjects: Subject[];
  student: Student;
  attendance: AttendanceRecord[];
  materials: Material[];
  assignments: Assignment[];
  submissions: Submission[];
  onSubmitAssignment: (assignmentId: string, url: string) => void;
  summativeGrades: SummativeGrade[];
  announcements?: Announcement[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  systemConfig,
  classes,
  subjects,
  student,
  attendance,
  materials,
  assignments,
  submissions,
  onSubmitAssignment,
  summativeGrades,
  announcements = [],
}) => {
  const [activeTab, setActiveTab] = useState<'beranda' | 'absensi' | 'materi' | 'tugas' | 'rapor'>('beranda');
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [annCategoryFilter, setAnnCategoryFilter] = useState<
    'all' | 'Penting' | 'Akademik' | 'Kegiatan' | 'Ujian' | 'Umum'
  >('all');

  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const pinnedAnnouncements = activeAnnouncements.filter((a) => a.isPinned);
  const displayedAnnouncements = activeAnnouncements.filter(
    (a) => annCategoryFilter === 'all' || a.category === annCategoryFilter
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const studentClass = classes.find((c) => c.id === student.classId);

  // Filter items specifically for this student's class
  const classMaterials = materials.filter((m) => m.classId === student.classId);
  const classAssignments = assignments.filter((a) => a.classId === student.classId);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentGrades = summativeGrades.filter((g) => g.studentId === student.id);

  // Attendance metrics
  const totalAtt = studentAttendance.length;
  const hadirCount = studentAttendance.filter((a) => a.status === 'Hadir').length;
  const izinCount = studentAttendance.filter((a) => a.status === 'Izin').length;
  const sakitCount = studentAttendance.filter((a) => a.status === 'Sakit').length;
  const alfaCount = studentAttendance.filter((a) => a.status === 'Alfa').length;
  const attendanceRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 100;

  // Grades summary
  const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
  const averageGrade = studentGrades.length > 0 ? (totalScore / studentGrades.length).toFixed(1) : '0';

  const handleSubmit = (asgId: string) => {
    const url = submissionUrls[asgId]?.trim();
    if (!url) {
      showToast('Silakan masukkan tautan tugas terlebih dahulu.');
      return;
    }

    onSubmitAssignment(asgId, url);
    setSubmissionUrls((prev) => ({ ...prev, [asgId]: '' }));
    showToast('Tugas Anda berhasil diserahkan!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#102f4e] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-slide-up border border-[#0ea5a8]/40">
          <CheckCircle2 className="w-5 h-5 text-[#0ea5a8]" />
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
          <span>Beranda Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('absensi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'absensi'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Absensi</span>
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
          <span>Materi ({classMaterials.length})</span>
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
          <span>Tugas Aktif ({classAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rapor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'rapor'
              ? 'bg-[#102f4e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rapor Mandiri</span>
        </button>
      </div>

      {/* ==================== TAB 1: BERANDA ==================== */}
      {activeTab === 'beranda' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pinned Announcements High-Priority Banner */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-3">
              {pinnedAnnouncements.map((ann) => (
                <div
                  key={`pinned-${ann.id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                      <Pin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          Pengumuman Utama
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-amber-300">
                          {ann.category}
                        </span>
                        <span className="text-[11px] text-amber-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ann.date}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="shrink-0 px-4 py-2 bg-[#102f4e] hover:bg-[#163f68] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Baca Pengumuman</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{attendanceRate}%</div>
                <div className="text-xs text-slate-500 font-medium">Persentase Kehadiran</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0ea5a8] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{classMaterials.length}</div>
                <div className="text-xs text-slate-500 font-medium">Materi Pelajaran</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{classAssignments.length}</div>
                <div className="text-xs text-slate-500 font-medium">Penugasan Kelas</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{averageGrade}</div>
                <div className="text-xs text-slate-500 font-medium">Rata-Rata Sumatif</div>
              </div>
            </div>
          </div>

          {/* Student Profile & Quick Tasks Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Identitas Siswa Aktif</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-bold text-slate-800">{student.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Induk Siswa (NIS)</span>
                  <span className="font-mono font-bold text-slate-800">{student.nis}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Kelas</span>
                  <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                    {studentClass?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Program Keahlian</span>
                  <span className="font-medium text-slate-800 text-xs">{studentClass?.major}</span>
                </div>
              </div>
            </div>

            {/* Recent Pending Tasks */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Penugasan Terbaru</h3>
                <button
                  onClick={() => setActiveTab('tugas')}
                  className="text-xs text-[#0ea5a8] hover:underline font-semibold"
                >
                  Lihat Semua Tugas
                </button>
              </div>

              <div className="space-y-2.5">
                {classAssignments.slice(0, 3).map((asg) => {
                  const sub = submissions.find(
                    (s) => s.assignmentId === asg.id && s.studentId === student.id
                  );
                  const isSubmitted = !!sub;

                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{asg.title}</span>
                          <span className="text-[11px] text-slate-500">Pertemuan {asg.meetingNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tenggat: {asg.deadline.replace('T', ' ')}
                        </div>
                      </div>

                      <div>
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah dikumpulkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Belum dikumpulkan
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Papan Pengumuman & Informasi Sekolah */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0ea5a8] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Papan Pengumuman & Informasi Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pemberitahuan akademik, ujian, kegiatan siswa, dan edaran resmi {systemConfig.institutionName}.
                  </p>
                </div>
              </div>

              {/* Filter Category Chips */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                {(['all', 'Penting', 'Akademik', 'Kegiatan', 'Ujian', 'Umum'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAnnCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      annCategoryFilter === cat
                        ? 'bg-[#102f4e] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of active announcements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group ${
                    ann.isPinned
                      ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/80 hover:shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <Pin className="w-3 h-3" /> Disematkan
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0ea5a8] transition-colors line-clamp-2">
                      {ann.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ann.date}
                    </span>
                    <span className="text-[#0ea5a8] font-semibold group-hover:underline flex items-center gap-0.5">
                      Lihat Detail <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}

              {displayedAnnouncements.length === 0 && (
                <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <Megaphone className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada pengumuman untuk kategori yang dipilih.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Silakan pilih kategori "Semua" untuk melihat pengumuman lainnya.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: RIWAYAT ABSENSI ==================== */}
      {activeTab === 'absensi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Kehadiran Pribadi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekap kehadiran Anda pada kegiatan belajar daring dan luring {systemConfig.institutionName}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-800">
                Hadir: {hadirCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg font-bold bg-blue-100 text-blue-800">
                Izin: {izinCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg font-bold bg-amber-100 text-amber-800">
                Sakit: {sakitCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg font-bold bg-rose-100 text-rose-800">
                Alfa: {alfaCount}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">Mata Pelajaran</th>
                  <th className="px-3 py-2.5">Status Kehadiran</th>
                  <th className="px-3 py-2.5">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentAttendance.map((rec) => {
                  const sub = subjects.find((s) => s.id === rec.subjectId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-slate-600">{rec.date}</td>
                      <td className="px-3 py-3 font-bold text-slate-800">{sub?.name || '-'}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
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
                      <td className="px-3 py-3 text-slate-500">{rec.notes || '-'}</td>
                    </tr>
                  );
                })}
                {studentAttendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      Belum ada rekaman absensi untuk Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: MATERI ==================== */}
      {activeTab === 'materi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Materi Pembelajaran Kelas {studentClass?.name} ({classMaterials.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Materi difilter khusus untuk kelas Anda dengan integrasi formula matematika interaktif MathJax.
            </p>
          </div>

          <div className="space-y-4">
            {classMaterials.map((mat) => {
              const sub = subjects.find((s) => s.id === mat.subjectId);
              return (
                <div
                  key={mat.id}
                  className="p-5 rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50/50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#102f4e] text-white">
                        Pertemuan {mat.meetingNo}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-100 text-[#0a7577]">
                        {sub?.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.open(mat.url, '_blank')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0ea5a8] hover:bg-[#0c9194] text-white text-xs font-semibold rounded-lg transition-colors w-fit shadow-2xs"
                    >
                      <span>Buka Modul Materi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{mat.title}</h4>

                  {/* Formula and rich notes rendering */}
                  <div className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
                    <MathView content={mat.description} />
                  </div>
                </div>
              );
            })}

            {classMaterials.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                Belum ada materi pembelajaran yang dirilis untuk kelas Anda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: TUGAS ==================== */}
      {activeTab === 'tugas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Penugasan Kelas {studentClass?.name} ({classAssignments.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kumpulkan tautan tugas hasil pengerjaan Anda (Google Drive, GitHub, atau tautan berkas).
            </p>
          </div>

          <div className="space-y-4">
            {classAssignments.map((asg) => {
              const sub = submissions.find(
                (s) => s.assignmentId === asg.id && s.studentId === student.id
              );
              const isSubmitted = !!sub;
              const subMapel = subjects.find((s) => s.id === asg.subjectId);

              return (
                <div
                  key={asg.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isSubmitted
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#102f4e] text-white">
                          Pertemuan {asg.meetingNo}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{subMapel?.name}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{asg.title}</h4>
                      <div className="text-xs text-rose-600 font-semibold mt-0.5">
                        Batas Pengumpulan: {asg.deadline.replace('T', ' ')}
                      </div>
                    </div>

                    <div>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Sudah dikumpulkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Belum dikumpulkan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description with LaTeX math rendering */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 my-3">
                    <MathView content={asg.description} />
                  </div>

                  {/* Submission Form or Submission Status info */}
                  {isSubmitted ? (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-900">
                        <span className="font-semibold">Tautan Terkirim:</span>
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0ea5a8] hover:underline font-bold"
                        >
                          <span>Buka Tautan Tugas</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Waktu Penyerahan: {sub.submittedAt}
                      </div>
                      {sub.grade !== undefined && (
                        <div className="mt-1 pt-1 border-t border-emerald-200/60 font-bold text-emerald-800">
                          Nilai Tugas: {sub.grade} poin — Catatan: {sub.feedback || 'Baik'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-slate-100">
                      <input
                        type="url"
                        placeholder="Tempelkan tautan hasil tugas (Google Drive / GitHub / link file)..."
                        value={submissionUrls[asg.id] || ''}
                        onChange={(e) =>
                          setSubmissionUrls({ ...submissionUrls, [asg.id]: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0ea5a8]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmit(asg.id)}
                        className="px-4 py-2 bg-[#102f4e] hover:bg-[#163f68] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kumpulkan Tugas</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {classAssignments.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                Tidak ada penugasan aktif untuk kelas Anda saat ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: RAPOR MANDIRI ==================== */}
      {activeTab === 'rapor' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size="lg" className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Rapor Penilaian Sumatif Mandiri
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {systemConfig.institutionName} &bull; Kriteria Ketuntasan Minimal (KKM): {systemConfig.kkm} poin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                exportStudentReportToExcel(
                  student,
                  studentClass,
                  summativeGrades,
                  subjects,
                  attendance,
                  systemConfig.kkm,
                  systemConfig.institutionName
                );
                showToast('Rapor mandiri berhasil diunduh dalam format Excel (.xlsx)!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Rapor (.xlsx)</span>
            </button>
          </div>

          {/* Rapor Header Identity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Nama Siswa</span>
              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nomor Induk Siswa (NIS)</span>
              <span className="font-bold font-mono text-slate-900">{student.nis}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Kelas & Jurusan</span>
              <span className="font-bold text-slate-900">{studentClass?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Rata-Rata Nilai</span>
              <span className="font-extrabold text-cyan-800 text-base">{averageGrade}</span>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-[#102f4e] text-white uppercase font-semibold">
                <tr>
                  <th className="px-3.5 py-3">No</th>
                  <th className="px-3.5 py-3">Mata Pelajaran</th>
                  <th className="px-3.5 py-3">Asesmen</th>
                  <th className="px-3.5 py-3">Materi / Pokok Bahasan</th>
                  <th className="px-3.5 py-3">Nilai</th>
                  <th className="px-3.5 py-3">KKM</th>
                  <th className="px-3.5 py-3">Status Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentGrades.map((g, idx) => {
                  const sub = subjects.find((s) => s.id === g.subjectId);
                  const isPassed = g.score >= systemConfig.kkm;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-3.5 py-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-bold text-slate-900">{sub?.name || '-'}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-700">Sumatif {g.evaluationNumber}</td>
                      <td className="px-3.5 py-3 text-slate-600">{g.chapterTitle}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-900 text-sm">{g.score}</td>
                      <td className="px-3.5 py-3 font-mono text-slate-500">{systemConfig.kkm}</td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                {studentGrades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Belum ada nilai sumatif yang diinput oleh dewan guru untuk Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Pengumuman Siswa */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-[#102f4e] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#0ea5a8]" />
                <span className="text-xs font-bold tracking-wide">
                  Pengumuman Resmi Sekolah
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedAnnouncement.category === 'Penting'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedAnnouncement.category === 'Akademik'
                      ? 'bg-cyan-100 text-cyan-800'
                      : selectedAnnouncement.category === 'Kegiatan'
                      ? 'bg-purple-100 text-purple-800'
                      : selectedAnnouncement.category === 'Ujian'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedAnnouncement.category}
                </span>

                {selectedAnnouncement.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Pin className="w-3 h-3 text-amber-600" />
                    Prioritas Utama
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedAnnouncement.title}
              </h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>Dipublikasikan: {selectedAnnouncement.date}</span>
                <span>Penerbit: {selectedAnnouncement.author}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Tutup Pengumuman
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
