import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
} from '../types';

export interface CloudSyncStatus {
  isConfigured: boolean;
  provider: 'supabase' | 'local';
}

export const getCloudSyncStatus = (): CloudSyncStatus => {
  return {
    isConfigured: isSupabaseConfigured,
    provider: isSupabaseConfigured ? 'supabase' : 'local',
  };
};

/**
 * Sinkronisasi data lokal ke Supabase (Initial Migration)
 */
export async function syncLocalToSupabase(data: {
  systemConfig: SystemConfig;
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  announcements: Announcement[];
}): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Harap isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terlebih dahulu.',
    };
  }

  try {
    // 1. Simpan System Config
    const { error: cfgErr } = await supabase
      .from('system_config')
      .upsert({
        id: 'default',
        institution_name: data.systemConfig.institutionName,
        kkm: data.systemConfig.kkm,
        master_access_code: data.systemConfig.masterAccessCode,
        description: data.systemConfig.description,
        banner_text: data.systemConfig.bannerText,
        logo_url: data.systemConfig.logoUrl || null,
        updated_at: new Date().toISOString(),
      });

    if (cfgErr) throw cfgErr;

    // 2. Simpan Classes
    if (data.classes.length > 0) {
      const { error: clsErr } = await supabase
        .from('classes')
        .upsert(
          data.classes.map((c) => ({
            id: c.id,
            name: c.name,
            grade_level: c.gradeLevel,
            major: c.major,
          }))
        );
      if (clsErr) throw clsErr;
    }

    // 3. Simpan Subjects
    if (data.subjects.length > 0) {
      const { error: subErr } = await supabase
        .from('subjects')
        .upsert(
          data.subjects.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            category: s.category || 'Kejuruan',
          }))
        );
      if (subErr) throw subErr;
    }

    // 4. Simpan Teachers
    if (data.teachers.length > 0) {
      const { error: tchErr } = await supabase
        .from('teachers')
        .upsert(
          data.teachers.map((t) => ({
            id: t.id,
            name: t.name,
            nip: t.nip,
            access_code: t.accessCode,
            subject_ids: t.subjectIds,
          }))
        );
      if (tchErr) throw tchErr;
    }

    // 5. Simpan Students
    if (data.students.length > 0) {
      const { error: stuErr } = await supabase
        .from('students')
        .upsert(
          data.students.map((s) => ({
            id: s.id,
            name: s.name,
            nis: s.nis,
            class_id: s.classId,
          }))
        );
      if (stuErr) throw stuErr;
    }

    // 6. Simpan Announcements
    if (data.announcements.length > 0) {
      const { error: annErr } = await supabase
        .from('announcements')
        .upsert(
          data.announcements.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category,
            date: a.date,
            author: a.author,
            is_pinned: a.isPinned,
            is_active: a.isActive,
          }))
        );
      if (annErr) throw annErr;
    }

    return {
      success: true,
      message: 'Seluruh data sekolah berhasil disinkronkan ke Supabase Cloud Database!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat mengunggah data ke Supabase.',
    };
  }
}
