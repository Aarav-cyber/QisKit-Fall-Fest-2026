'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, Users, ChevronRight, Award, Lock } from 'lucide-react';
import clsx from 'clsx';

const DAYS = [
  { id: 1, label: 'Day 1: Foundations', unlocked: true },
  { id: 2, label: 'Day 2: Physical Realization', unlocked: true },
  { id: 3, label: 'Day 3: Applications & Security', unlocked: true },
];

export function LearningSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isHackathon = pathname === '/learning/hackathon';
  const activeDay = isHackathon ? null : Number(searchParams?.get('day')) || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden sticky top-24">
      {/* Header section */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-burgundy/10 text-burgundy font-bold text-[10px] uppercase tracking-wider">
            Curriculum
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Masterclass 2026
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Complete the sessions sequentially to earn your certificate.
        </p>
      </div>

      {/* Nav items */}
      <nav className="p-3 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 pt-2">
          Learning Phase
        </div>
        
        {DAYS.map((day) => {
          const isActive = activeDay === day.id;
          return (
            <Link
              key={day.id}
              href={`/learning?day=${day.id}`}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold group',
                isActive 
                  ? 'bg-burgundy/5 text-burgundy border border-burgundy/20' 
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={clsx('w-4 h-4', isActive ? 'text-burgundy' : 'text-slate-400 group-hover:text-slate-600')} />
                <span>{day.label}</span>
              </div>
              <ChevronRight className={clsx('w-3.5 h-3.5 transition-transform', isActive ? 'text-burgundy translate-x-0.5' : 'text-slate-300')} />
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 pt-6">
          Hackathon Phase
        </div>

        <Link
          href="/learning/hackathon"
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold group',
            isHackathon 
              ? 'bg-burgundy/5 text-burgundy border border-burgundy/20' 
              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
          )}
        >
          <div className="flex items-center gap-3">
            <Users className={clsx('w-4 h-4', isHackathon ? 'text-burgundy' : 'text-slate-400 group-hover:text-slate-600')} />
            <span>Workspace</span>
          </div>
          <ChevronRight className={clsx('w-3.5 h-3.5 transition-transform', isHackathon ? 'text-burgundy translate-x-0.5' : 'text-slate-300')} />
        </Link>
      </nav>
    </div>
  );
}
