import * as XLSX from 'xlsx';
import { Student, AttendanceRecord, SummativeGrade, Subject, ClassRoom } from '../types';

/**
 * Downloads an Excel template for bulk student import
 */
export function downloadStudentTemplate(className: string) {
  const data = [
    {
      'NIS (Nomor Induk Siswa)': '2425010',
      'Nama Siswa': 'Ahmad Fauzi',
      'Kelas Target': className,
    },
    {
      'NIS (Nomor Induk Siswa)': '2425011',
      'Nama Siswa': 'Citra Kirana',
      'Kelas Target': className,
    },
    {
      'NIS (Nomor Induk Siswa)': '2425012',
      'Nama Siswa': 'Gilang Ramadhan',
      'Kelas Target': className,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');

  // Adjust column widths
  worksheet['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }];

  XLSX.writeFile(workbook, `Template_Siswa_${className.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Parses an uploaded Excel file for student bulk import
 */
export async function parseStudentExcel(file: File, targetClassId: string): Promise<Array<{ nis: string; name: string; classId: string }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(worksheet);

        const students: Array<{ nis: string; name: string; classId: string }> = [];

        for (const row of json) {
          // Look for NIS and Nama with various header variants
          const nis = String(
            row['NIS (Nomor Induk Siswa)'] ||
            row['NIS'] ||
            row['nis'] ||
            row['No Induk'] ||
            ''
          ).trim();

          const name = String(
            row['Nama Siswa'] ||
            row['Nama Lengkap'] ||
            row['Nama'] ||
            row['name'] ||
            ''
          ).trim();

          if (nis && name) {
            students.push({
              nis,
              name,
              classId: targetClassId,
            });
          }
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports Attendance records to Excel
 */
export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  classes: ClassRoom[],
  subjects: Subject[],
  students: Student[],
  filename = 'Rekapitulasi_Absensi_SMK_Tridharma_Gorontalo.xlsx'
) {
  const classMap = new Map(classes.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const rows = records.map((rec, index) => {
    const student = studentMap.get(rec.studentId);
    return {
      No: index + 1,
      Tanggal: rec.date,
      Kelas: classMap.get(rec.classId) || '-',
      'Mata Pelajaran': subjectMap.get(rec.subjectId) || '-',
      NIS: student?.nis || '-',
      'Nama Siswa': student?.name || '-',
      'Status Kehadiran': rec.status,
      Keterangan: rec.notes || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 12 },
    { wch: 30 },
    { wch: 14 },
    { wch: 25 },
    { wch: 18 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');
  XLSX.writeFile(workbook, filename);
}

/**
 * Exports Summative Grades to Excel
 */
export function exportSummativeGradesToExcel(
  grades: SummativeGrade[],
  classes: ClassRoom[],
  subjects: Subject[],
  students: Student[],
  kkm: number,
  filename = 'Rekapitulasi_Nilai_Sumatif_SMK_Tridharma_Gorontalo.xlsx'
) {
  const classMap = new Map(classes.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const rows = grades.map((g, index) => {
    const student = studentMap.get(g.studentId);
    const isPassed = g.score >= kkm;
    return {
      No: index + 1,
      NIS: student?.nis || '-',
      'Nama Siswa': student?.name || '-',
      Kelas: classMap.get(g.classId) || '-',
      'Mata Pelajaran': subjectMap.get(g.subjectId) || '-',
      'Evaluasi Sumatif': `Sumatif ke-${g.evaluationNumber}`,
      'Bab / Materi Pokok': g.chapterTitle,
      'Nilai (0-100)': g.score,
      KKM: kkm,
      'Status Ketuntasan': isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
      'Tanggal Input': g.updatedAt,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 25 },
    { wch: 12 },
    { wch: 30 },
    { wch: 16 },
    { wch: 32 },
    { wch: 14 },
    { wch: 8 },
    { wch: 18 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nilai Sumatif');
  XLSX.writeFile(workbook, filename);
}

/**
 * Exports Student Individual Report Card (Rapor Mandiri)
 */
export function exportStudentReportToExcel(
  student: Student,
  classroom: ClassRoom | undefined,
  grades: SummativeGrade[],
  subjects: Subject[],
  attendance: AttendanceRecord[],
  kkm: number,
  institutionName: string
) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const studentAtt = attendance.filter((a) => a.studentId === student.id);

  // Group grades by subject to calculate average
  const subjectGradeGroups: Record<string, number[]> = {};
  studentGrades.forEach((g) => {
    if (!subjectGradeGroups[g.subjectId]) subjectGradeGroups[g.subjectId] = [];
    subjectGradeGroups[g.subjectId].push(g.score);
  });

  const gradeRows = studentGrades.map((g, idx) => ({
    No: idx + 1,
    'Mata Pelajaran': subjectMap.get(g.subjectId) || '-',
    Asesmen: `Sumatif ${g.evaluationNumber}`,
    'Materi / Pokok Bahasan': g.chapterTitle,
    Nilai: g.score,
    KKM: kkm,
    Ketuntasan: g.score >= kkm ? 'TUNTAS' : 'BELUM TUNTAS',
  }));

  const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
  const avgScore = studentGrades.length ? (totalScore / studentGrades.length).toFixed(1) : '0';

  const attSummary = {
    Hadir: studentAtt.filter((a) => a.status === 'Hadir').length,
    Izin: studentAtt.filter((a) => a.status === 'Izin').length,
    Sakit: studentAtt.filter((a) => a.status === 'Sakit').length,
    Alfa: studentAtt.filter((a) => a.status === 'Alfa').length,
  };

  const workbook = XLSX.utils.book_new();

  // 1. Sheet Rapor Nilai
  const wsGrades = XLSX.utils.json_to_sheet(gradeRows);
  wsGrades['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 32 }, { wch: 10 }, { wch: 8 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, wsGrades, 'Rapor Nilai');

  // 2. Sheet Info & Rekap
  const wsSummary = XLSX.utils.json_to_sheet([
    { Properti: 'Nama Institusi', Nilai: institutionName },
    { Properti: 'Nama Siswa', Nilai: student.name },
    { Properti: 'Nomor Induk Siswa (NIS)', Nilai: student.nis },
    { Properti: 'Kelas', Nilai: classroom?.name || '-' },
    { Properti: 'Jurusan', Nilai: classroom?.major || '-' },
    { Properti: 'Kriteria Ketuntasan Minimal (KKM)', Nilai: kkm },
    { Properti: 'Rata-Rata Nilai Sumatif', Nilai: avgScore },
    { Properti: 'Total Asesmen Diikuti', Nilai: studentGrades.length },
    { Properti: 'Kehadiran (Hadir)', Nilai: attSummary.Hadir },
    { Properti: 'Kehadiran (Izin)', Nilai: attSummary.Izin },
    { Properti: 'Kehadiran (Sakit)', Nilai: attSummary.Sakit },
    { Properti: 'Kehadiran (Alfa)', Nilai: attSummary.Alfa },
  ]);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Rapor');

  XLSX.writeFile(workbook, `Rapor_${student.name.replace(/\s+/g, '_')}_${classroom?.name || 'Siswa'}.xlsx`);
}
