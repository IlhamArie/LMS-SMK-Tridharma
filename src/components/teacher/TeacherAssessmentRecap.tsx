import React, { useState, useMemo } from 'react';
import {
  Award,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  Users,
  Calendar,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import {
  Teacher,
  ClassRoom,
  Subject,
  Student,
  SummativeGrade,
  Assignment,
  Submission,
  SystemConfig,
} from '../../types';
import { exportSummativeGradesToExcel } from '../../utils/excel';

interface TeacherAssessmentRecapProps {
  teacher?: Teacher;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  summativeGrades: SummativeGrade[];
  assignments: Assignment[];
  submissions: Submission[];
  systemConfig: SystemConfig;
  onShowToast: (msg: string) => void;
}

export const TeacherAssessmentRecap: React.FC<TeacherAssessmentRecapProps> = ({
  teacher,
  classes,
  subjects,
  students,
  summativeGrades,
  assignments,
  submissions,
  systemConfig,
  onShowToast,
}) => {
  const teacherSubjects = subjects.filter((s) => teacher?.subjectIds?.includes(s.id));
  const availableSubjects = teacherSubjects.length > 0 ? teacherSubjects : subjects;

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(availableSubjects[0]?.id || 'all');
  const [selectedEvalNo, setSelectedEvalNo] = useState<string>('all');
  const [selectedPassedFilter, setSelectedPassedFilter] = useState<'all' | 'tuntas' | 'belum_tuntas'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'gradebook' | 'detail' | 'tasks'>('gradebook');

  // Filtered raw summative grades
  const filteredGrades = useMemo(() => {
    return summativeGrades.filter((g) => {
      const matchesTeacher = !teacher || g.teacherId === teacher.id || availableSubjects.some((s) => s.id === g.subjectId);
      if (!matchesTeacher) return false;

      if (selectedClassId !== 'all' && g.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'all' && g.subjectId !== selectedSubjectId) return false;
      if (selectedEvalNo !== 'all' && g.evaluationNumber !== Number(selectedEvalNo)) return false;

      const isPassed = g.score >= systemConfig.kkm;
      if (selectedPassedFilter === 'tuntas' && !isPassed) return false;
      if (selectedPassedFilter === 'belum_tuntas' && isPassed) return false;

      if (searchQuery.trim()) {
        const student = students.find((s) => s.id === g.studentId);
        const q = searchQuery.toLowerCase();
        const matchesName = student?.name.toLowerCase().includes(q);
        const matchesNis = student?.nis.toLowerCase().includes(q);
        if (!matchesName && !matchesNis) return false;
      }

      return true;
    });
  }, [
    summativeGrades,
    teacher,
    availableSubjects,
    selectedClassId,
    selectedSubjectId,
    selectedEvalNo,
    selectedPassedFilter,
    systemConfig.kkm,
    searchQuery,
    students,
  ]);

  // Overall Statistics from filtered grades
  const totalGradesCount = filteredGrades.length;
  const passedCount = filteredGrades.filter((g) => g.score >= systemConfig.kkm).length;
  const failedCount = filteredGrades.filter((g) => g.score < systemConfig.kkm).length;
  const passRate = totalGradesCount > 0 ? Math.round((passedCount / totalGradesCount) * 100) : 0;

  const scoreValues = filteredGrades.map((g) => g.score);
  const averageScore = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0;
  const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
  const minScore = scoreValues.length > 0 ? Math.min(...scoreValues) : 0;

  // Gradebook Ledger per student (for selected class & subject)
  const studentGradebook = useMemo(() => {
    const targetStudents = students.filter((s) => {
      if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
      }
      return true;
    });

    return targetStudents.map((student) => {
      // Find grades for this student
      const stGrades = summativeGrades.filter((g) => {
        if (g.studentId !== student.id) return false;
        if (selectedSubjectId !== 'all' && g.subjectId !== selectedSubjectId) return false;
        return true;
      });

      // Map evaluationNumber -> score
      const evalScores: Record<number, number | null> = {};
      for (let i = 1; i <= 6; i++) {
        const found = stGrades.find((g) => g.evaluationNumber === i);
        evalScores[i] = found ? found.score : null;
      }

      const validScores = stGrades.map((g) => g.score);
      const studentAvg = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;
      const isPassed = studentAvg !== null ? studentAvg >= systemConfig.kkm : null;

      const cls = classes.find((c) => c.id === student.classId);

      return {
        student,
        classRoom: cls,
        evalScores,
        totalEvaluated: validScores.length,
        average: studentAvg,
        isPassed,
      };
    });
  }, [students, selectedClassId, searchQuery, summativeGrades, selectedSubjectId, systemConfig.kkm, classes]);

  // Teacher Assignments Summary
  const teacherAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesTeacher = !teacher || a.teacherId === teacher.id;
      if (!matchesTeacher) return false;
      if (selectedClassId !== 'all' && a.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'all' && a.subjectId !== selectedSubjectId) return false;
      return true;
    });
  }, [assignments, teacher, selectedClassId, selectedSubjectId]);

  const handleExport = () => {
    const className = selectedClassId === 'all' ? 'Semua_Kelas' : classes.find((c) => c.id === selectedClassId)?.name || 'Kelas';
    const subName = selectedSubjectId === 'all' ? 'Semua_Mapel' : subjects.find((s) => s.id === selectedSubjectId)?.code || 'Mapel';
    const filename = `Rekap_Nilai_Sumatif_${className}_${subName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    exportSummativeGradesToExcel(filteredGrades, classes, subjects, students, systemConfig.kkm, filename);
    onShowToast(`Rekap nilai asesmen berhasil diekspor (${filteredGrades.length} baris data)!`);
  };

  const handleResetFilters = () => {
    setSelectedClassId(classes[0]?.id || 'all');
    setSelectedSubjectId('all');
    setSelectedEvalNo('all');
    setSelectedPassedFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rekapitulasi Asesmen & Nilai Sumatif</h3>
                <p className="text-xs text-slate-500">
                  Laporan perolehan nilai sumatif per bab, transkrip buku nilai siswa, dan pemenuhan KKM ({systemConfig.kkm} poin).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredGrades.length === 0}
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
            <label className="block text-slate-500 font-semibold mb-1">Evaluasi Sumatif</label>
            <select
              value={selectedEvalNo}
              onChange={(e) => setSelectedEvalNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            >
              <option value="all">Semua Evaluasi Sumatif</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  Evaluasi Sumatif {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Status Ketuntasan</label>
            <select
              value={selectedPassedFilter}
              onChange={(e) => setSelectedPassedFilter(e.target.value as 'all' | 'tuntas' | 'belum_tuntas')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0ea5a8]"
            >
              <option value="all">Semua Status Ketuntasan</option>
              <option value="tuntas">Tuntas (≥ KKM {systemConfig.kkm})</option>
              <option value="belum_tuntas">Remedial / Belum Tuntas (&lt; KKM)</option>
            </select>
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

        {(selectedClassId !== 'all' || selectedSubjectId !== 'all' || selectedEvalNo !== 'all' || selectedPassedFilter !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">
              Filter aktif: Menampilkan {filteredGrades.length} nilai sumatif terinput
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Standar KKM</span>
            <span className="font-bold text-slate-400 font-mono">MIN</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{systemConfig.kkm}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Batas ketuntasan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>Rata-Rata Nilai</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className={`text-xl font-extrabold font-mono ${averageScore >= systemConfig.kkm ? 'text-emerald-600' : 'text-rose-600'}`}>
            {averageScore}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Skala 0 - 100</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span>Tuntas KKM</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">{passedCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">{passRate}% lulus evaluasi</div>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
            <span>Remedial</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono">{failedCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">
            {totalGradesCount > 0 ? Math.round((failedCount / totalGradesCount) * 100) : 0}% belum tuntas
          </div>
        </div>

        <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-[#0a7577] text-xs font-semibold mb-1">
            <span>Nilai Tertinggi</span>
            <span className="text-[10px] font-bold uppercase">MAX</span>
          </div>
          <div className="text-xl font-bold text-[#0a7577] font-mono">{maxScore}</div>
          <div className="text-[11px] text-cyan-600/80 mt-0.5">Skor maksimal</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold mb-1">
            <span>Nilai Terendah</span>
            <span className="text-[10px] font-bold uppercase">MIN</span>
          </div>
          <div className="text-xl font-bold text-slate-700 font-mono">{minScore}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Skor minimal</div>
        </div>
      </div>

      {/* Main Content & Mode Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('gradebook')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'gradebook'
                  ? 'bg-[#102f4e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Buku Nilai Siswa ({studentGradebook.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('detail')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'detail'
                  ? 'bg-[#102f4e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Log Rincian Asesmen ({filteredGrades.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'tasks'
                  ? 'bg-[#102f4e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Rekap Tugas ({teacherAssignments.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Guru Pengampu: <span className="font-semibold text-slate-800">{teacher?.name || 'Semua'}</span>
          </div>
        </div>

        {/* MODE 1: BUKU NILAI SISWA (MATRIX SUMATIF 1-6) */}
        {viewMode === 'gradebook' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center">No</th>
                  <th className="px-3 py-2.5">NIS</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-1</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-2</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-3</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-4</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-5</th>
                  <th className="px-3 py-2.5 text-center font-mono">S-6</th>
                  <th className="px-3 py-2.5 text-center font-bold text-slate-900">Rata-Rata</th>
                  <th className="px-3 py-2.5">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentGradebook.map((item, idx) => {
                  const hasScores = item.average !== null;
                  const isPassed = item.isPassed;

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 font-semibold">{item.student.nis}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{item.student.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.classRoom?.name || '-'}</td>

                      {/* Scores S1 to S6 */}
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        const sc = item.evalScores[num];
                        if (sc === null || sc === undefined) {
                          return (
                            <td key={num} className="px-3 py-2.5 text-center font-mono text-slate-300">
                              -
                            </td>
                          );
                        }
                        const isScorePassed = sc >= systemConfig.kkm;
                        return (
                          <td
                            key={num}
                            className={`px-3 py-2.5 text-center font-mono font-bold ${
                              isScorePassed ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {sc}
                          </td>
                        );
                      })}

                      {/* Average */}
                      <td className="px-3 py-2.5 text-center">
                        {hasScores ? (
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-extrabold text-xs ${
                              isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {item.average}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        {!hasScores ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                            Belum Dinilai
                          </span>
                        ) : isPassed ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            TUNTAS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            REMEDIAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {studentGradebook.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-8 text-slate-400">
                      Tidak ada siswa yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODE 2: LOG RINCIAN ASESMEN */}
        {viewMode === 'detail' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5">NIS</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Mata Pelajaran</th>
                  <th className="px-3 py-2.5">Evaluasi Sumatif</th>
                  <th className="px-3 py-2.5">Bab / Pokok Bahasan</th>
                  <th className="px-3 py-2.5 text-center">Nilai</th>
                  <th className="px-3 py-2.5">Ketuntasan (KKM {systemConfig.kkm})</th>
                  <th className="px-3 py-2.5">Tanggal Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGrades.map((g) => {
                  const student = students.find((s) => s.id === g.studentId);
                  const cls = classes.find((c) => c.id === g.classId);
                  const sub = subjects.find((s) => s.id === g.subjectId);
                  const isPassed = g.score >= systemConfig.kkm;

                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-600">{student?.nis || '-'}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{student?.name || '-'}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{cls?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-slate-700">{sub?.name || '-'}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">
                        Sumatif ke-{g.evaluationNumber}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{g.chapterTitle}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isPassed ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {g.score}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">{g.updatedAt}</td>
                    </tr>
                  );
                })}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Belum ada catatan nilai sumatif yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MODE 3: REKAP MONITORING PENUGASAN */}
        {viewMode === 'tasks' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">Pertemuan</th>
                    <th className="px-3 py-2.5">Judul Tugas</th>
                    <th className="px-3 py-2.5">Kelas</th>
                    <th className="px-3 py-2.5">Mata Pelajaran</th>
                    <th className="px-3 py-2.5">Batas Pengumpulan (Deadline)</th>
                    <th className="px-3 py-2.5 text-center">Terkumpul</th>
                    <th className="px-3 py-2.5 text-center">Tingkat Pengumpulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teacherAssignments.map((asg) => {
                    const cls = classes.find((c) => c.id === asg.classId);
                    const sub = subjects.find((s) => s.id === asg.subjectId);
                    const classStudents = students.filter((s) => s.classId === asg.classId);
                    const asgSubs = submissions.filter((s) => s.assignmentId === asg.id);
                    const rate = classStudents.length > 0 ? Math.round((asgSubs.length / classStudents.length) * 100) : 0;

                    return (
                      <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-slate-700">Pertemuan {asg.meetingNo}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">{asg.title}</td>
                        <td className="px-3 py-2.5 text-slate-700">{cls?.name || '-'}</td>
                        <td className="px-3 py-2.5 text-slate-600">{sub?.name || '-'}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">{asg.deadline}</td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                          {asgSubs.length} / {classStudents.length} siswa
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              rate >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : rate >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {teacherAssignments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada tugas yang dibuat untuk kelas & mapel yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
