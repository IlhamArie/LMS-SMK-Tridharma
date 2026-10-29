import React, { useState, useEffect } from 'react';
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
  UserSession,
  Announcement,
} from './types';
import {
  initialSystemConfig,
  initialClasses,
  initialSubjects,
  initialTeachers,
  initialStudents,
  initialAttendance,
  initialMaterials,
  initialAssignments,
  initialSubmissions,
  initialSummativeGrades,
  initialAnnouncements,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { DigitalLearningHero } from './components/DigitalLearningHero';
import { LoginScreen } from './components/LoginScreen';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SchoolLogo } from './components/SchoolLogo';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('smk_lms_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Loading state with Promise.all simulation as specified
  const [isLoading, setIsLoading] = useState(true);

  // System Configuration (Customizable)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('smk_lms_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.institutionName === 'SMK Tridharma') {
          parsed.institutionName = 'SMK TRIDHARMA GORONTALO';
          localStorage.setItem('smk_lms_config', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return initialSystemConfig;
      }
    }
    return initialSystemConfig;
  });

  // Master Data: Classes
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('smk_lms_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  // Master Data: Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('smk_lms_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  // Master Data: Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('smk_lms_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  // Master Data: Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smk_lms_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  // Attendance Records
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('smk_lms_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  // Learning Materials
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('smk_lms_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('smk_lms_assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('smk_lms_submissions');
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  // Summative Assessment Grades
  const [summativeGrades, setSummativeGrades] = useState<SummativeGrade[]>(() => {
    const saved = localStorage.getItem('smk_lms_grades');
    return saved ? JSON.parse(saved) : initialSummativeGrades;
  });

  // School Announcements & Notices (Editable by Operator, viewed on Student Home)
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('smk_lms_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  // Simulation of asynchronous data fetch using Promise.all as mandated:
  // "Performa: Gunakan Promise.all untuk simulasi pengambilan data secara asinkronus (mock data fetch)."
  useEffect(() => {
    const loadAppDataAsync = async () => {
      try {
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 200)),
          new Promise((resolve) => setTimeout(resolve, 250)),
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppDataAsync();
  }, []);

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem('smk_lms_config', JSON.stringify(systemConfig));
    if (systemConfig.logoUrl) {
      localStorage.setItem('smk_lms_custom_logo', systemConfig.logoUrl);
    } else {
      localStorage.removeItem('smk_lms_custom_logo');
    }
  }, [systemConfig]);

  useEffect(() => {
    localStorage.setItem('smk_lms_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('smk_lms_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('smk_lms_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('smk_lms_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('smk_lms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smk_lms_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('smk_lms_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('smk_lms_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('smk_lms_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('smk_lms_grades', JSON.stringify(summativeGrades));
  }, [summativeGrades]);

  // Session handler
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('smk_lms_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('smk_lms_session');
  };

  // --- Class Operations ---
  const handleAddClass = (cls: Omit<ClassRoom, 'id'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `cls-${Date.now()}`,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const handleUpdateClass = (id: string, updated: Partial<ClassRoom>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Subject Operations ---
  const handleAddSubject = (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...sub,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleUpdateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Teacher Operations ---
  const handleAddTeacher = (t: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...t,
      id: `t-${Date.now()}`,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const handleUpdateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Student Operations ---
  const handleAddStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...s,
      id: `stu-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleAddBulkStudents = (bulk: Array<Omit<Student, 'id'>>) => {
    const newItems: Student[] = bulk.map((s, idx) => ({
      ...s,
      id: `stu-bulk-${Date.now()}-${idx}`,
    }));
    setStudents((prev) => [...prev, ...newItems]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Attendance Operations ---
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      // Remove any duplicate matching studentId + date + subjectId
      const recordKeys = new Set(records.map((r) => `${r.date}_${r.studentId}_${r.subjectId}`));
      const filtered = prev.filter((p) => !recordKeys.has(`${p.date}_${p.studentId}_${p.subjectId}`));
      return [...filtered, ...records];
    });
  };

  // --- Material Operations ---
  const handleAddMaterial = (mat: Omit<Material, 'id' | 'createdAt'>) => {
    const newMat: Material = {
      ...mat,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Assignment Operations ---
  const handleAddAssignment = (asg: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [newAsg, ...prev]);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // --- Submission Operations ---
  const handleSubmitAssignment = (assignmentId: string, submissionUrl: string) => {
    if (!session?.studentData) return;

    const nowStr = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: session.studentData.id,
      submissionUrl,
      submittedAt: nowStr,
      status: 'Sudah dikumpulkan',
    };

    setSubmissions((prev) => {
      const filtered = prev.filter(
        (s) => !(s.assignmentId === assignmentId && s.studentId === session.studentData?.id)
      );
      return [newSub, ...filtered];
    });
  };

  // --- Announcement Operations (Operator Control) ---
  const handleAddAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleUpdateAnnouncement = (id: string, updated: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // --- Summative Grade Operations ---
  const handleSaveSummativeGrades = (grades: SummativeGrade[]) => {
    setSummativeGrades((prev) => {
      const gradeKeys = new Set(
        grades.map((g) => `${g.studentId}_${g.subjectId}_${g.evaluationNumber}`)
      );
      const filtered = prev.filter(
        (p) => !gradeKeys.has(`${p.studentId}_${p.subjectId}_${p.evaluationNumber}`)
      );
      return [...filtered, ...grades];
    });
  };

  // --- Complete System Backup & Restore Handlers ---
  const handleImportAllData = (importedData: any) => {
    if (importedData.systemConfig) setSystemConfig(importedData.systemConfig);
    if (importedData.classes) setClasses(importedData.classes);
    if (importedData.subjects) setSubjects(importedData.subjects);
    if (importedData.teachers) setTeachers(importedData.teachers);
    if (importedData.students) setStudents(importedData.students);
    if (importedData.attendance) setAttendance(importedData.attendance);
    if (importedData.materials) setMaterials(importedData.materials);
    if (importedData.assignments) setAssignments(importedData.assignments);
    if (importedData.submissions) setSubmissions(importedData.submissions);
    if (importedData.summativeGrades) setSummativeGrades(importedData.summativeGrades);
    if (importedData.announcements) setAnnouncements(importedData.announcements);
  };

  const handleResetToCleanSlate = () => {
    // Reset test data while keeping school identity
    setStudents([]);
    setAttendance([]);
    setMaterials([]);
    setAssignments([]);
    setSubmissions([]);
    setSummativeGrades([]);
  };

  // Show loading spinner during asynchronous data fetch simulation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7f2] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center max-w-sm w-full space-y-4 animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <SchoolLogo size="lg" />
            <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0ea5a8] flex items-center justify-center shadow-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
          <h2 className="font-bold text-slate-800 text-base">Memuat Portal LMS...</h2>
          <p className="text-xs text-slate-500">
            Menyelaraskan data master, modul materi MathJax, dan presensi akademik {systemConfig.institutionName}.
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the comprehensive Login Screen
  if (!session) {
    return (
      <LoginScreen
        systemConfig={systemConfig}
        classes={classes}
        teachers={teachers}
        students={students}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // If user is logged in, show the Sticky Navbar, Digital Learning Hero, and the role-specific Dashboard
  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col">
      {/* Sticky Navbar */}
      <Navbar
        session={session}
        systemConfig={systemConfig}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner "Digital Learning" pada hero section */}
        <DigitalLearningHero
          session={session}
          systemConfig={systemConfig}
        />

        {/* Dynamic Role-Based View Switching */}
        {session.role === 'operator' && (
          <OperatorDashboard
            session={session}
            systemConfig={systemConfig}
            onUpdateConfig={setSystemConfig}
            classes={classes}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            students={students}
            onAddStudent={handleAddStudent}
            onAddBulkStudents={handleAddBulkStudents}
            onDeleteStudent={handleDeleteStudent}
            attendance={attendance}
            summativeGrades={summativeGrades}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            materials={materials}
            assignments={assignments}
            submissions={submissions}
            onImportAllData={handleImportAllData}
            onResetToCleanSlate={handleResetToCleanSlate}
          />
        )}

        {session.role === 'guru' && (
          <TeacherDashboard
            session={session}
            systemConfig={systemConfig}
            classes={classes}
            subjects={subjects}
            students={students}
            attendance={attendance}
            onSaveAttendance={handleSaveAttendance}
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            assignments={assignments}
            onAddAssignment={handleAddAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            submissions={submissions}
            summativeGrades={summativeGrades}
            onSaveSummativeGrades={handleSaveSummativeGrades}
          />
        )}

        {session.role === 'siswa' && session.studentData && (
          <StudentDashboard
            session={session}
            systemConfig={systemConfig}
            classes={classes}
            subjects={subjects}
            student={session.studentData}
            attendance={attendance}
            materials={materials}
            assignments={assignments}
            submissions={submissions}
            onSubmitAssignment={handleSubmitAssignment}
            summativeGrades={summativeGrades}
            announcements={announcements}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} {systemConfig.institutionName} &bull; Portal Pembelajaran Digital LMS
          </span>
          <span className="text-slate-400">
            KKM: {systemConfig.kkm} | MathJax TeX Engine Aktif | Ekspor/Impor SheetJS
          </span>
        </div>
      </footer>
    </div>
  );
}
