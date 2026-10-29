import React from 'react';
import { Sparkles, Calendar, Award } from 'lucide-react';
import { SystemConfig, UserSession } from '../types';

interface DigitalLearningHeroProps {
  session: UserSession;
  systemConfig: SystemConfig;
}

export const DigitalLearningHero: React.FC<DigitalLearningHeroProps> = ({
  session,
  systemConfig,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102f4e] via-[#143d63] to-[#0d2740] text-white p-6 sm:p-8 shadow-md border border-slate-700/50 mb-6">
      {/* Subtle geometric pattern / glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#0ea5a8]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0ea5a8] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Digital Learning
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-cyan-200 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5" />
              {todayFormatted}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, <span className="text-[#38d4d8]">{session.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
            {systemConfig.bannerText}
          </p>
        </div>

        {/* Right Metric / Quick Info */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[140px]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-200 font-medium mb-1">
              <Award className="w-4 h-4 text-[#0ea5a8]" />
              <span>Standar KKM</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {systemConfig.kkm}
              <span className="text-xs font-normal text-slate-300 ml-1">poin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
