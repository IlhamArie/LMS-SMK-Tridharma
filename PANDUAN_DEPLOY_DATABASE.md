# Panduan Langkah Demi Langkah: Deploy ke Vercel & Koneksi Database Gratis

Dokumen ini ditulis secara **sederhana, bertahap, dan mudah dipahami** untuk siapa saja (bahkan bagi pemula yang belum pernah melakukan deploy sebelumnya).

---

## DAFTAR ISI CEPAT
1. [Prinsip Dasar: Bagaimana Sistem Ini Bekerja?](#1-prinsip-dasar-bagaimana-sistem-ini-bekerja)
2. [TAHAP 1: Menaruh Kode ke GitHub (5 Menit)](#2-tahap-1-menaruh-kode-ke-github-5-menit)
3. [TAHAP 2: Menerbitkan Website di Vercel (3 Menit)](#3-tahap-2-menerbitkan-website-di-vercel-3-menit)
4. [TAHAP 3: Membuat Database Cloud Gratis di Supabase (5 Menit)](#4-tahap-3-membuat-database-cloud-gratis-di-supabase-5-menit)
5. [TAHAP 4: Menghubungkan Vercel ke Supabase (2 Menit)](#5-tahap-4-menghubungkan-vercel-ke-supabase-2-menit)
6. [TAHAP 5: Checklist Keamanan Sebelum Dibagikan ke Siswa & Guru](#6-tahap-5-checklist-keamanan-sebelum-dibagikan-ke-siswa--guru)
7. [Tanya Jawab & Pemecahan Masalah (FAQ)](#7-tanya-jawab--pemecahan-masalah-faq)

---

## 1. Prinsip Dasar: Bagaimana Sistem Ini Bekerja?

Ada 3 komponen utama yang gratis:
1. **GitHub** *(Penyimpan Kode)*: Tempat kode program aplikasi disimpan secara aman dan otomatis tersambung ke Vercel.
2. **Vercel** *(Hosting Web Gratis)*: Komputer cloud yang menjalankan tampilan aplikasi Anda dengan alamat website gratis seperti `https://smk-tridharma.vercel.app` (atau domain sekolah Anda `*.sch.id`).
3. **Supabase** *(Database Cloud Gratis)*: Tempat penyimpanan data (kelas, guru, siswa, nilai, dan materi) sehingga ketika guru mengisi nilai di laptop, siswa langsung bisa melihat di HP masing-masing.

---

## 2. TAHAP 1: Menaruh Kode ke GitHub (5 Menit)

### Langkah 1.1: Buat Akun GitHub
- Jika belum punya akun, buka [https://github.com](https://github.com) dan klik **Sign Up** (gratis).

### Langkah 1.2: Buat Repositori Baru
1. Di halaman utama GitHub, klik tanda **"+"** di pojok kanan atas, lalu klik **"New repository"**.
2. Isi kolom:
   - **Repository name**: `smk-tridharma-lms`
   - **Visibility**: Pilih **Public** atau **Private** (bebas, keduanya didukung gratis oleh Vercel).
3. Biarkan opsi lainnya kosong, lalu klik tombol hijau **"Create repository"**.

### Langkah 1.3: Unggah Kode dari Komputer Anda
Buka aplikasi **Terminal** (Mac/Linux) atau **Git Bash / Command Prompt** (Windows) pada folder proyek ini, lalu jalankan perintah berikut baris demi baris:

```bash
# 1. Inisialisasi git di folder proyek
git init

# 2. Masukkan semua berkas
git add .

# 3. Buat catatan versi awal
git commit -m "feat: rilis sistem LMS SMK Tridharma"

# 4. Arahkan ke cabang utama
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/smk-tridharma-lms.git

# 6. Unggah kode ke GitHub
git push -u origin main
```
*Selesai! Sekarang seluruh kode aplikasi Anda sudah ada di GitHub.*

---

## 3. TAHAP 2: Menerbitkan Website di Vercel (3 Menit)

### Langkah 2.1: Masuk ke Vercel
1. Buka [https://vercel.com](https://vercel.com).
2. Klik tombol **"Sign Up"** atau **"Log In"**, lalu pilih **"Continue with GitHub"** (ini membuat akun Vercel langsung terhubung dengan GitHub Anda).

### Langkah 2.2: Impor Proyek
1. Di halaman utama (*Dashboard*) Vercel, klik tombol biru **"Add New..."** lalu pilih **"Project"**.
2. Anda akan melihat daftar repositori GitHub Anda. Cari `smk-tridharma-lms`, lalu klik tombol **"Import"**.

### Langkah 2.3: Konfigurasi Proyek (Otomatis)
Vercel akan otomatis mengenali pengaturan:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
*(Anda tidak perlu mengubah apa pun karena berkas `vercel.json` sudah disediakan dalam proyek ini).*

3. Klik tombol biru **"Deploy"**.
4. Tunggu proses sekitar 40–60 detik hingga muncul kembang api dan tulisan **"Congratulations!"**.
5. Klik gambar cuplikan situs Anda atau buka link yang diberikan (misalnya: `https://smk-tridharma-lms.vercel.app`).
*Website sekolah Anda kini sudah ONLINE dan bisa dibuka oleh siapa saja di seluruh dunia!*

---

## 4. TAHAP 3: Membuat Database Cloud Gratis di Supabase (5 Menit)

> **Mengapa Supabase?** Supabase berbasis PostgreSQL, sangat cepat, gratis 500 MB (cukup untuk bertahun-tahun data absensi & nilai siswa), dan memiliki server di Singapura (sangat cepat diakses dari Indonesia).

### Langkah 3.1: Buat Akun & Proyek Supabase
1. Buka [https://supabase.com](https://supabase.com) dan klik **"Start your project"** (bisa login dengan akun GitHub Anda).
2. Klik tombol hijau **"New Project"**.
3. Isi formulir:
   - **Name**: `smk-tridharma-lms`
   - **Database Password**: Buat password yang kuat, lalu simpan/catat di tempat aman.
   - **Region**: Pilih **`Southeast Asia (Singapore)`** agar akses dari Indonesia sangat cepat.
4. Klik **"Create new project"** dan tunggu sekitar 1 menit hingga statusnya hijau (*Active*).

### Langkah 3.2: Buat Tabel-Tabel Sekolah (1-Click SQL)
1. Di bilah menu sebelah kiri Supabase, klik ikon **"SQL Editor"** (ikon gambar terminal/dokumen SQL).
2. Klik tombol **"New query"**.
3. Salin (*copy*) seluruh skrip SQL di bawah ini, lalu tempel (*paste*) ke kotak editor:

```sql
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

-- MASUKKAN PENGATURAN AWAL SEKOLAH
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
END $$;
```

4. Klik tombol hijau **"Run"** (atau tekan `Ctrl + Enter`).
5. Tunggu pesan: `Success. No rows returned`.
*Tabel database cloud Anda sudah siap 100%!*

---

## 5. TAHAP 4: Menghubungkan Vercel ke Supabase (2 Menit)

Sekarang kita sambungkan Vercel dan Supabase dengan memasukkan 2 baris kunci rahasia (*Environment Variables*).

### Langkah 4.1: Ambil URL dan Kunci di Supabase
1. Di proyek Supabase Anda, klik ikon gerigi **Project Settings** (di sudut kiri bawah).
2. Klik menu **"API"**.
3. Di sana Anda akan melihat:
   - **Project URL**: Contoh `https://abcdefghijkl.supabase.co` (klik salin / copy).
   - **Project API Keys** -> baris **`anon` `public`**: Contoh `eyJhbGciOi...` (klik salin / copy).

### Langkah 4.2: Tempelkan ke Vercel
1. Buka dasbor proyek Anda di [https://vercel.com](https://vercel.com).
2. Klik tab **"Settings"** di bagian atas, lalu pilih **"Environment Variables"** di menu sebelah kiri.
3. Tambahkan 2 variabel berikut satu per satu:

| Key (Nama Variabel) | Value (Isi dari Supabase) |
|---|---|
| `VITE_SUPABASE_URL` | Masukkan **Project URL** Supabase Anda |
| `VITE_SUPABASE_ANON_KEY` | Masukkan **anon public key** Supabase Anda |

4. Klik tombol biru **"Save"**.

### Langkah 4.3: Perbarui Deployment (Redeploy)
Agar Vercel membaca kunci baru:
1. Klik tab **"Deployments"** di bagian atas dasbor Vercel.
2. Pada deployment teratas, klik ikon titik tiga `...` di sebelah kanan, lalu klik **"Redeploy"**.
3. Tunggu ~45 detik hingga selesai.
*Selamat! Aplikasi web Anda di Vercel sekarang resmi terhubung langsung ke database Supabase Cloud.*

---

## 6. TAHAP 5: Checklist Keamanan Sebelum Dibagikan ke Siswa & Guru

Sebelum URL dibagikan secara luas kepada seluruh warga sekolah:

1. [ ] **Ubah Kode Sandi Master Operator**:
   - Buka web yang sudah live di Vercel, pilih **Portal Operator** (masuk dengan sandi bawaan `admin2026`).
   - Masuk ke tab **Pengaturan & Logo**.
   - Ganti **Kode Sandi Master Operator** menjadi sandi baru yang hanya diketahui oleh kepala sekolah/operator IT.
2. [ ] **Unggah Logo Resmi Sekolah**:
   - Di tab **Pengaturan & Logo**, klik unggah logo sekolah (format PNG transparan lebih rapi). Logo akan langsung muncul di navbar dan rapor Excel.
3. [ ] **Sesuaikan Akun Guru & Kode Akses**:
   - Buka tab **Data Master** -> sub-tab **Data Guru**.
   - Berikan kode akses pribadi untuk tiap bapak/ibu guru pengajar.
4. [ ] **Input Data Siswa Riil**:
   - Buka tab **Data Master** -> sub-tab **Data Siswa**.
   - Anda bisa memasukkan siswa satu per satu, atau mengunduh format Excel lalu mengunggah daftar siswa sekelas sekaligus (*bulk import*).
5. [ ] **Unduh Cadangan Pertama**:
   - Buka tab **Deploy & Database** -> sub-tab **Cadangan & Pemulihan**.
   - Klik **"Unduh Cadangan JSON Sekarang"** untuk menyimpan arsip data pertama ke komputer Anda.

---

## 7. Tanya Jawab & Pemecahan Masalah (FAQ)

### Tanya: Apakah layanan Vercel dan Supabase ini benar-benar gratis selamanya?
**Jawab**: Ya, 100% gratis pada paket Hobby/Free Tier.
- **Vercel**: Bandwidth 100 GB/bulan (sangat besar untuk web sekolah).
- **Supabase**: 500 MB database & 50.000 pengguna aktif per bulan. Ini lebih dari cukup untuk menampung data siswa, nilai rapor, dan ribuan catatan absensi selama bertahun-tahun.

### Tanya: Bisakah sekolah menggunakan domain kustom sendiri (contoh: `lms.smktridharma.sch.id`)?
**Jawab**: Sangat bisa! 
1. Di Vercel -> Buka menu **Settings** -> **Domains**.
2. Masukkan subdomain yang diinginkan (misal: `lms.smktridharma.sch.id`).
3. Vercel akan memberikan petunjuk DNS (biasanya cukup membuat CNAME ke `cname.vercel-dns.com`).
4. Sertifikat keamanan HTTPS/SSL akan terbit secara gratis dan otomatis.

### Tanya: Jika saya me-refresh halaman di Vercel, apakah akan muncul error 404?
**Jawab**: Tidak. Berkas `vercel.json` dalam proyek ini sudah dikonfigurasi dengan aturan pengalihan (*rewrites*) ke `index.html`, sehingga halaman apapun yang di-refresh akan tetap berjalan lancar.

### Tanya: Bagaimana jika listrik padam atau kuota internet habis saat mengisi data?
**Jawab**: Aplikasi dilengkapi dengan penyimpanan ganda (*Dual Storage*). Semua data tersimpan aman di browser (*LocalStorage*) dan tersinkronkan ke Supabase Cloud saat terhubung kembali ke internet. Anda juga bisa mengunduh cadangan (*backup JSON*) kapan saja dari portal operator.
