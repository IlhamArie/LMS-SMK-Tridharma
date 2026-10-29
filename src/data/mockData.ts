import {
  SystemConfig,
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
} from '../types';

export const initialSystemConfig: SystemConfig = {
  institutionName: 'SMK TRIDHARMA GORONTALO',
  kkm: 75,
  masterAccessCode: 'operator2026',
  description: 'Mencetak Generasi Vokasi Unggul, Berkarakter, dan Berdaya Saing Global di Era Industri 4.0.',
  bannerText: 'Selamat Datang di Portal Pembelajaran Digital SMK TRIDHARMA GORONTALO. Tingkatkan kompetensi dan prestasimu melalui ekosistem belajar daring terpadu.',
};

export const initialClasses: ClassRoom[] = [
  { id: 'c-1', name: 'X RPL 1', gradeLevel: 'X', major: 'Rekayasa Perangkat Lunak' },
  { id: 'c-2', name: 'X RPL 2', gradeLevel: 'X', major: 'Rekayasa Perangkat Lunak' },
  { id: 'c-3', name: 'XI TKJ 1', gradeLevel: 'XI', major: 'Teknik Komputer & Jaringan' },
  { id: 'c-4', name: 'XII DKV 1', gradeLevel: 'XII', major: 'Desain Komunikasi Visual' },
];

export const initialSubjects: Subject[] = [
  { id: 's-1', code: 'RPL-PW', name: 'Pemrograman Web & Perangkat Bergerak', category: 'Kejuruan' },
  { id: 's-2', code: 'RPL-BD', name: 'Basis Data Terdistribusi', category: 'Kejuruan' },
  { id: 's-3', code: 'UM-MAT', name: 'Matematika Terapan & Diskrit', category: 'Umum' },
  { id: 's-4', code: 'UM-FIS', name: 'Fisika Terapan Vokasi', category: 'Umum' },
  { id: 's-5', code: 'UM-BIND', name: 'Bahasa Indonesia Kejuruan', category: 'Umum' },
];

export const initialTeachers: Teacher[] = [
  {
    id: 't-1',
    nip: '198503152010011005',
    name: 'Budi Santoso, S.Kom., M.T.',
    subjectIds: ['s-1', 's-2'],
    accessCode: 'guru123',
  },
  {
    id: 't-2',
    nip: '198807202012022003',
    name: 'Dra. Siti Rahmawati, M.Pd.',
    subjectIds: ['s-3'],
    accessCode: 'guru456',
  },
  {
    id: 't-3',
    nip: '199109052015031008',
    name: 'Ir. Agus Setiawan, S.T.',
    subjectIds: ['s-4'],
    accessCode: 'guru789',
  },
];

export const initialStudents: Student[] = [
  { id: 'stu-1', nis: '2425001', name: 'Aditya Pratama', classId: 'c-1' },
  { id: 'stu-2', nis: '2425002', name: 'Dewi Lestari', classId: 'c-1' },
  { id: 'stu-3', nis: '2425003', name: 'Fajar Nugraha', classId: 'c-1' },
  { id: 'stu-4', nis: '2425004', name: 'Nabila Putri Azzahra', classId: 'c-1' },
  { id: 'stu-5', nis: '2425005', name: 'Rian Hidayat', classId: 'c-1' },
  { id: 'stu-6', nis: '2425006', name: 'Salsabila Rahma', classId: 'c-2' },
  { id: 'stu-7', nis: '2425007', name: 'Dimas Anggara', classId: 'c-2' },
  { id: 'stu-8', nis: '2324001', name: 'Bagus Wicaksono', classId: 'c-3' },
  { id: 'stu-9', nis: '2223001', name: 'Zahra Anindya', classId: 'c-4' },
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att-1', date: '2026-09-15', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', studentId: 'stu-1', status: 'Hadir' },
  { id: 'att-2', date: '2026-09-15', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', studentId: 'stu-2', status: 'Hadir' },
  { id: 'att-3', date: '2026-09-15', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', studentId: 'stu-3', status: 'Izin', notes: 'Lomba LKS Tingkat Kota' },
  { id: 'att-4', date: '2026-09-15', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', studentId: 'stu-4', status: 'Hadir' },
  { id: 'att-5', date: '2026-09-15', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', studentId: 'stu-5', status: 'Hadir' },
  { id: 'att-6', date: '2026-09-16', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', studentId: 'stu-1', status: 'Hadir' },
  { id: 'att-7', date: '2026-09-16', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', studentId: 'stu-2', status: 'Sakit', notes: 'Surat dokter terlampir' },
  { id: 'att-8', date: '2026-09-16', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', studentId: 'stu-3', status: 'Hadir' },
  { id: 'att-9', date: '2026-09-16', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', studentId: 'stu-4', status: 'Hadir' },
  { id: 'att-10', date: '2026-09-16', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', studentId: 'stu-5', status: 'Hadir' },
];

export const initialMaterials: Material[] = [
  {
    id: 'mat-1',
    title: 'Kalkulus Diskrit: Relasi Rekursif & Kompleksitas Algoritma',
    meetingNo: 1,
    classId: 'c-1',
    subjectId: 's-3',
    teacherId: 't-2',
    url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
    description: 'Kajian deret rekursif Fibonacci dengan formulasi eksplisit Binet: $$F(n) = \\frac{1}{\\sqrt{5}}\\left[\\left(\\frac{1+\\sqrt{5}}{2}\\right)^n - \\left(\\frac{1-\\sqrt{5}}{2}\\right)^n\\right]$$ Pelajari penerapan relasi ini pada algoritma dinamis.',
    createdAt: '2026-09-10',
  },
  {
    id: 'mat-2',
    title: 'Fisika Gelombang Elektromagnetik & Sinyal RF',
    meetingNo: 2,
    classId: 'c-1',
    subjectId: 's-4',
    teacherId: 't-3',
    url: 'https://en.wikipedia.org/wiki/Electromagnetic_radiation',
    description: 'Hubungan panjang gelombang, frekuensi, dan kecepatan rambat cahaya: $$\\lambda = \\frac{c}{f}$$ Dimana $c \\approx 3 \\times 10^8 \\text{ m/s}$ dan energi foton ditentukan oleh persamaan Planck $E = h \\cdot f$.',
    createdAt: '2026-09-12',
  },
  {
    id: 'mat-3',
    title: 'Arsitektur RESTful API & Keamanan Token JWT',
    meetingNo: 3,
    classId: 'c-1',
    subjectId: 's-1',
    teacherId: 't-1',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    description: 'Implementasi middleware otentikasi stateless, penanganan CORS, serta sanitasi payload input berbasis Express & TypeScript.',
    createdAt: '2026-09-14',
  },
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Tugas 1: Analisis Persamaan Kuadrat & Optimasi Grafis',
    meetingNo: 2,
    classId: 'c-1',
    subjectId: 's-3',
    teacherId: 't-2',
    deadline: '2026-09-25T23:59',
    description: 'Tentukan akar-akar dan titik puncak dari fungsi kuadrat $f(x) = 2x^2 - 8x + 6$ dengan rumus diskriminan $D = b^2 - 4ac$ serta rumus kuadratik $$x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$. Tuliskan langkah perhitungannya dalam format PDF atau Google Docs.',
    createdAt: '2026-09-13',
  },
  {
    id: 'asg-2',
    title: 'Tugas 2: Desain Skema Basis Data Normalisasi 3NF',
    meetingNo: 3,
    classId: 'c-1',
    subjectId: 's-1',
    teacherId: 't-1',
    deadline: '2026-09-28T23:59',
    description: 'Rancang ERD sistem perpustakaan digital SMK dengan entitas Siswa, Buku, Peminjaman, dan Petugas. Terapkan aturan integritas referensial dan normalisasi sampai bentuk 3NF.',
    createdAt: '2026-09-15',
  },
];

export const initialSubmissions: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    submissionUrl: 'https://drive.google.com/file/d/aditya-matematika-tugas1/view',
    submittedAt: '2026-09-16 14:20',
    status: 'Sudah dikumpulkan',
    grade: 92,
    feedback: 'Penjelasan langkah matematis sangat rinci dan akurat.',
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-1',
    studentId: 'stu-2',
    submissionUrl: 'https://github.com/dewilestari/smk-matematika-opt',
    submittedAt: '2026-09-17 09:15',
    status: 'Sudah dikumpulkan',
    grade: 88,
    feedback: 'Grafik koordinat digambar dengan sangat rapi.',
  },
];

export const initialSummativeGrades: SummativeGrade[] = [
  { id: 'sg-1', studentId: 'stu-1', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 1, chapterTitle: 'HTML5 Semantic & CSS Grid Layout', score: 88, updatedAt: '2026-09-10' },
  { id: 'sg-2', studentId: 'stu-1', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 2, chapterTitle: 'JavaScript ES6+ & DOM Manipulation', score: 85, updatedAt: '2026-09-12' },
  { id: 'sg-3', studentId: 'stu-1', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', evaluationNumber: 1, chapterTitle: 'Logika Proposisi & Himpunan', score: 90, updatedAt: '2026-09-11' },
  { id: 'sg-4', studentId: 'stu-1', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', evaluationNumber: 2, chapterTitle: 'Persamaan Linear & Kuadrat', score: 82, updatedAt: '2026-09-14' },
  { id: 'sg-5', studentId: 'stu-1', classId: 'c-1', subjectId: 's-4', teacherId: 't-3', evaluationNumber: 1, chapterTitle: 'Kinematika Gerak Lurus & Melingkar', score: 78, updatedAt: '2026-09-15' },

  { id: 'sg-6', studentId: 'stu-2', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 1, chapterTitle: 'HTML5 Semantic & CSS Grid Layout', score: 92, updatedAt: '2026-09-10' },
  { id: 'sg-7', studentId: 'stu-2', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 2, chapterTitle: 'JavaScript ES6+ & DOM Manipulation', score: 90, updatedAt: '2026-09-12' },
  { id: 'sg-8', studentId: 'stu-2', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', evaluationNumber: 1, chapterTitle: 'Logika Proposisi & Himpunan', score: 86, updatedAt: '2026-09-11' },

  { id: 'sg-9', studentId: 'stu-3', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 1, chapterTitle: 'HTML5 Semantic & CSS Grid Layout', score: 72, updatedAt: '2026-09-10' },
  { id: 'sg-10', studentId: 'stu-3', classId: 'c-1', subjectId: 's-3', teacherId: 't-2', evaluationNumber: 1, chapterTitle: 'Logika Proposisi & Himpunan', score: 70, updatedAt: '2026-09-11' },

  { id: 'sg-11', studentId: 'stu-4', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 1, chapterTitle: 'HTML5 Semantic & CSS Grid Layout', score: 95, updatedAt: '2026-09-10' },
  { id: 'sg-12', studentId: 'stu-5', classId: 'c-1', subjectId: 's-1', teacherId: 't-1', evaluationNumber: 1, chapterTitle: 'HTML5 Semantic & CSS Grid Layout', score: 80, updatedAt: '2026-09-10' },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Jadwal Asesmen Sumatif Tengah Semester & Pra-UKK Kejuruan',
    content: 'Diberitahukan kepada seluruh peserta didik kelas X, XI, dan XII bahwa pelaksanaan Asesmen Sumatif Tengah Semester Ganjil TA 2026/2027 serta verifikasi berkas Pra-UKK (Uji Kompetensi Keahlian) akan dilaksanakan mulai tanggal 12 s/d 17 Oktober 2026. Mohon pastikan seluruh penugasan di portal LMS telah diselesaikan tepat waktu.',
    category: 'Penting',
    date: '2026-09-18',
    author: 'Waka Kurikulum & Pengajaran',
    isPinned: true,
    isActive: true,
  },
  {
    id: 'ann-2',
    title: 'Sosialisasi Penempatan Praktik Kerja Lapangan (PKL) & Lab Terpadu UNG',
    content: 'Bagi siswa kelas XI program Keahlian Keperawatan, Farmasi Klinis, dan Rekayasa Perangkat Lunak, pengarahan teknis PKL kemitraan Rumah Sakit dan Laboratorium Riset Universitas Negeri Gorontalo akan diselenggarakan pada hari Senin pukul 08.30 WITA di Aula Utama.',
    category: 'Akademik',
    date: '2026-09-16',
    author: 'Koordinator Hubungan Industri (Hubin)',
    isPinned: false,
    isActive: true,
  },
  {
    id: 'ann-3',
    title: 'Pemberitahuan Pemeliharaan Server Portal LMS & MathJax Engine',
    content: 'Pembaruan sistem LMS mandiri telah sukses dilakukan dengan penambahan modul rendering rumus matematika MathJax/LaTeX, fitur unduh rapor sumatif format Excel, dan sinkronisasi presensi real-time. Jika mengalami kendala akses, hubungi ruang Operator LMS.',
    category: 'Umum',
    date: '2026-09-15',
    author: 'Operator Super Admin LMS',
    isPinned: false,
    isActive: true,
  },
];

