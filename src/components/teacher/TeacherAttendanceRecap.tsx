import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Download,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import {
  Teacher,
  ClassRoom,
  Subject,
  Student,
  AttendanceRecord,
  AttendanceStatus,
} from '../../types';
import { exportAttendanceToExcel } from '../../utils/excel';

interface TeacherAttendanceRecapProps {
  teacher?: Teacher;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  attendance: AttendanceRecord[];
  onShowToast: (msg: string) => void;
}

export const TeacherAttendanceRecap: React.FC<TeacherAttendanceRecapProps> = ({
  teacher,
  classes,
  subjects,
  students,
  attendance,
  onShowToast,
}) => {
  const teacherSubjects = subjects.filter((s) => teacher?.subjectIds?.includes(s.id));
  const availableSubjects = teacherSubjects.length > 0 ? teacherSubjects : subjects;

  // Filter states
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'log'>('matrix');

  // Filtered raw records
  const filteredRecords = useMemo(() => {
    return attendance.filter((rec) => {
      // If teacher is restricted to their subjects (or all if not defined)
      const matchesTeacher = !teacher || rec.teacherId === teacher.id || availableSubjects.some((s) => s.id === rec.subjectId);
      if (!matchesTeacher) return false;

      if (selectedClassId !== 'all' && rec.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
      if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false;
      if (selectedDate && rec.date !== selectedDate) return false;

      if (searchQuery.trim()) {
        const student = students.find((s) => s.id === rec.studentId);
        const q = searchQuery.toLowerCase();
        const matchesName = student?.name.toLowerCase().includes(q);
        const matchesNis = student?.nis.toLowerCase().includes(q);
        if (!matchesName && !matchesNis) return false;
      }

      return true;
    });
  }, [attendance, teacher, availableSubjects, selectedClassId, selectedSubjectId, selectedStatus, selectedDate, searchQuery, students]);

  // Overall Statistics based on filtered records
  const totalRecords = filteredRecords.length;
  const countHadir = filteredRecords.filter((r) => r.status === 'Hadir').length;
  const countIzin = filteredRecords.filter((r) => r.status === 'Izin').length;
  const countSakit = filteredRecords.filter((r) => r.status === 'Sakit').length;
  const countAlfa = filteredRecords.filter((r) => r.status === 'Alfa').length;
  const presenceRate = totalRecords > 0 ? Math.round((countHadir / totalRecords) * 100) : 0;

  // Matrix aggregation per student
  const studentMatrix = useMemo(() => {
    // Target students: if class is selected, filter by that class, otherwise all relevant students
    const targetStudents = students.filter((s) => {
      if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
      }
      return true;
    });

    return targetStudents.map((student) => {
      // Find all attendance records for this student matching subject and date
      const studentRecs = attendance.filter((rec) => {
        if (rec.studentId !== student.id) return false;
        const matchesTeacher = !teacher || rec.teacherId === teacher.id || availableSubjects.some((s) => s.id === rec.subjectId);
        if (!matchesTeacher) return false;
        if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
        if (selectedDate && rec.date !== selectedDate) return false;
        return true;
      });

      const total = studentRecs.length;
      const h = studentRecs.filter((r) => r.status === 'Hadir').length;
      const i = studentRecs.filter((r) => r.status === 'Izin').length;
      const s = studentRecs.filter((r) => r.status === 'Sakit').length;
      const a = studentRecs.filter((r) => r.status === 'Alfa').length;
      const rate = total > 0 ? Math.round((h / total) * 100) : 100;

      const cls = classes.find((c) => c.id === student.classId);

      return {
        student,
        classRoom: cls,
        total,
        h,
        i,
        s,
        a,
        rate,
      };
    });
  }, [students, selectedClassId, searchQuery, attendance, teacher, availableSubjects, selectedSubjectId, selectedDate, classes]);

  const handleExport = () => {
    const className = selectedClassId === 'all' ? 'Semua_Kelas' : classes.find((c) => c.id === selectedClassId)?.name || 'Kelas';
    const subName = selectedSubjectId === 'all' ? 'Semua_Mapel' : subjects.find((s) => s.id === selectedSubjectId)?.code || 'Mapel';
    const filename = `Rekap_Kehadiran_${className}_${subName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    exportAttendanceToExcel(filteredRecords, classes, subjects, students, filename);
    onShowToast(`Rekap kehadiran berhasil diekspor (${filteredRecords.length} catatan)!`);
  };

  const handleResetFilters = () => {
    setSelectedClassId('all');
    setSelectedSubjectId('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSelectedDate('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-50 text-[#0ea5a8]">
                <CheckSquare className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rekapitulasi Kehadiran Siswa</h3>
                <p className="text-xs text-slate-500">
                  Pantau rekapitulasi presensi per siswa, tingkat keaktifan, dan rekap log kehadiran.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Pilih Kelas</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            >
              <option value="all">Semua Mapel Pengampu</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Status Kehadiran</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            >
              <option value="all">Semua Status (H/I/S/A)</option>
              <option value="Hadir">Hadir Saja</option>
              <option value="Izin">Izin Saja</option>
              <option value="Sakit">Sakit Saja</option>
              <option value="Alfa">Alfa Saja</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Cari Siswa</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {(selectedClassId !== 'all' || selectedSubjectId !== 'all' || selectedStatus !== 'all' || selectedDate || searchQuery) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">
              Filter aktif: Menampilkan {filteredRecords.length} catatan presensi
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#0ea5a8] hover:underline font-semibold"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Catatan</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalRecords}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sesi presensi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>Tingkat Hadir</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">{presenceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rata-rata kelas</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span>Hadir</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-xl font-bold text-emerald-700">{countHadir}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">
            {totalRecords > 0 ? Math.round((countHadir / totalRecords) * 100) : 0}% dari total
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold mb-1">
            <span>Izin</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-xl font-bold text-blue-700">{countIzin}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">
            {totalRecords > 0 ? Math.round((countIzin / totalRecords) * 100) : 0}% dari total
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span>Sakit</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-xl font-bold text-amber-700">{countSakit}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">
            {totalRecords > 0 ? Math.round((countSakit / totalRecords) * 100) : 0}% dari total
          </div>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
            <span>Alfa</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-xl font-bold text-rose-700">{countAlfa}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">
            {totalRecords > 0 ? Math.round((countAlfa / totalRecords) * 100) : 0}% dari total
          </div>
        </div>
      </div>

      {/* View Mode Switcher and Main Table Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-[#102f4e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Rekap Per Siswa ({studentMatrix.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('log')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'log'
                  ? 'bg-[#102f4e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Log Jurnal Presensi ({filteredRecords.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Menampilkan data pengajar: <span className="font-semibold text-slate-800">{teacher?.name || 'Semua'}</span>
          </div>
        </div>

        {/* MODE 1: REKAP PER SISWA (MATRIX) */}
        {viewMode === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">No</th>
                  <th className="px-3 py-2.5">NIS</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5 text-center text-emerald-700">Hadir (H)</th>
                  <th className="px-3 py-2.5 text-center text-blue-700">Izin (I)</th>
                  <th className="px-3 py-2.5 text-center text-amber-700">Sakit (S)</th>
                  <th className="px-3 py-2.5 text-center text-rose-700">Alfa (A)</th>
                  <th className="px-3 py-2.5 text-center">Total</th>
                  <th className="px-3 py-2.5 text-center">Kehadiran</th>
                  <th className="px-3 py-2.5">Status Keaktifan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentMatrix.map((item, idx) => {
                  const statusBadge =
                    item.total === 0
                      ? { text: 'Belum Ada Sesi', color: 'bg-slate-100 text-slate-600' }
                      : item.rate >= 90
                      ? { text: 'Sangat Disiplin', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }
                      : item.rate >= 75
                      ? { text: 'Disiplin', color: 'bg-blue-100 text-blue-800 border border-blue-200' }
                      : { text: 'Perlu Perhatian', color: 'bg-rose-100 text-rose-800 border border-rose-200' };

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 font-semibold">{item.student.nis}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{item.student.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.classRoom?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-600 font-mono">{item.h}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-blue-600 font-mono">{item.i}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-amber-600 font-mono">{item.s}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-rose-600 font-mono">{item.a}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-600">{item.total}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-extrabold font-mono text-slate-800">{item.rate}%</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {studentMatrix.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODE 2: LOG JURNAL PRESENSI */}
        {viewMode === 'log' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Mata Pelajaran</th>
                  <th className="px-3 py-2.5">NIS</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">Status Kehadiran</th>
                  <th className="px-3 py-2.5">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((rec) => {
                  const student = students.find((s) => s.id === rec.studentId);
                  const cls = classes.find((c) => c.id === rec.classId);
                  const sub = subjects.find((s) => s.id === rec.subjectId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-600">{rec.date}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{cls?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-slate-700">{sub?.name || '-'}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">{student?.nis || '-'}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{student?.name || '-'}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
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
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Belum ada catatan presensi yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
