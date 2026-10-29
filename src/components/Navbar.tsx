import React from 'react';
import { LogOut, Wifi, UserCheck, ShieldCheck, BookOpen } from 'lucide-react';
import { UserSession, SystemConfig } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface NavbarProps {
  session: UserSession;
  systemConfig: SystemConfig;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ session, systemConfig, onLogout }) => {
  const getRoleBadge = () => {
    switch (session.role) {
      case 'operator':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Operator Super Admin
          </span>
        );
      case 'guru':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0ea5a8]/15 text-[#0a7577] border border-[#0ea5a8]/30">
            <BookOpen className="w-3.5 h-3.5" />
            Dewan Guru
          </span>
        );
      case 'siswa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            Siswa Aktif
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <SchoolLogo size="md" src={systemConfig.logoUrl} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#102f4e] tracking-tight">
                  {systemConfig.institutionName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded">
                  LMS v2.6
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Learning Management System Berbasis Vokasi
              </p>
            </div>
          </div>

          {/* Right Section: Connection Status, Active User, Role Badge, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Connection status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-xs text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-medium">Online</span>
            </div>

            {/* Active User Info */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {session.name}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-end">
                {getRoleBadge()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-colors shadow-2xs"
              title="Keluar dari sesi"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
