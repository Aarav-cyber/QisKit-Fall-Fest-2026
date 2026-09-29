'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
  Send,
  ExternalLink,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import clsx from 'clsx';

interface ProgressData {
  unlocked: boolean;
  videoCompleted: boolean;
  quizPassed: boolean;
  quizScore: number;
  completedAt: string | null;
}

function LearningDashboardContent() {
  const searchParams = useSearchParams();
  const dayParam = Number(searchParams?.get('day')) || 1;
  const activeDay = (dayParam >= 1 && dayParam <= 3) ? (dayParam as 1 | 2 | 3) : 1;

  const [progress, setProgress] = useState<Record<string, ProgressData>>({});
  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});
  
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
    fetchCompetitions();
  }, []);

  async function fetchProgress() {
    try {
      const res = await fetch('/api/learning/progress');
      const data = await res.json();
      if (data.progress) {
        setProgress(data.progress);
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }

  async function fetchCompetitions() {
    try {
      const res = await fetch('/api/learning/competition-submit');
      const data = await res.json();
      if (data.submissions) {
        setCompetitions(data.submissions);
        const urls: Record<string, string> = {};
        Object.entries(data.submissions).forEach(([type, sub]: [string, any]) => {
          urls[type] = sub.submission_url || '';
        });
        setCompetitionUrls(urls);
      }
    } catch (e) {
      console.error('Error loading competitions:', e);
    }
  }

  async function handleCompetitionSubmit(e: React.FormEvent, type: 'reels' | 'poster' | 'essay') {
    e.preventDefault();
    const url = competitionUrls[type]?.trim();
    if (!url) return;

    setIsSubmittingComp((prev) => ({ ...prev, [type]: true }));
    setCompSuccessMsg((prev) => ({ ...prev, [type]: '' }));

    try {
      const res = await fetch('/api/learning/competition-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionType: type, submissionUrl: url }),
      });

      const data = await res.json();
      if (data.success) {
        setCompetitions((prev) => ({ ...prev, [type]: data.submission }));
        setCompSuccessMsg((prev) => ({ ...prev, [type]: 'Submitted successfully!' }));
      }
    } catch (err) {
      console.error('Error submitting competition:', err);
    } finally {
      setIsSubmittingComp((prev) => ({ ...prev, [type]: false }));
    }
  }

  // Check if all sessions are completed
  const allSessionsCompleted = CURRICULUM_SESSIONS.every((session) => {
    const sProgress = progress[session.id];
    return sProgress?.videoCompleted && sProgress?.quizPassed;
  });

  if (allSessionsCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center mb-6 ring-8 ring-burgundy/5">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
          Congratulations! 🎉
        </h1>
        <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
          You have successfully completed all masterclass sessions for the QisKit Fall Fest 2026. 
          Your dedication to quantum computing is commendable. Get ready for the Hackathon!
        </p>
        <Link
          href="/learning/hackathon"
          className="px-6 py-3 bg-burgundy text-white font-semibold rounded-lg hover:bg-burgundy-deep transition-all shadow-md hover:shadow-lg"
        >
          Enter Hackathon Workspace
        </Link>
      </div>
    );
  }

  const daySessions = CURRICULUM_SESSIONS.filter((s) => s.day === activeDay);
  const currentDailyComp = DAILY_COMPETITIONS[activeDay];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-burgundy" />
          Day {activeDay} Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {daySessions.map((session, idx) => {
            const sProgress = progress[session.id] || {
              unlocked: idx === 0 && activeDay === 1, // Proper logic depends on real progress
              videoCompleted: false,
              quizPassed: false,
              quizScore: 0,
              completedAt: null,
            };
            const isDone = sProgress.videoCompleted && sProgress.quizPassed;
            const isExpanded = expandedSession === session.id;

            return (
              <div
                key={session.id}
                className={clsx(
                  'rounded-xl border transition-all duration-300 overflow-hidden',
                  isDone
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : sProgress.unlocked
                    ? 'bg-white border-slate-200 shadow-sm hover:border-burgundy/30'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                )}
              >
                {/* Header Area (Always Visible) */}
                <div 
                  className={clsx(
                    "p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                    sProgress.unlocked && !isDone && "hover:bg-slate-50/50"
                  )}
                  onClick={() => sProgress.unlocked && setExpandedSession(isExpanded ? null : session.id)}
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px] uppercase tracking-wider">
                        Session {session.sessionNumber}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : sProgress.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy uppercase tracking-wider">
                          <Unlock className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {session.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 hidden sm:flex">
                      <Clock className="w-3.5 h-3.5" />
                      {session.duration}
                    </div>
                    {sProgress.unlocked && (
                      <div className={clsx("p-1.5 rounded-full bg-slate-100 transition-transform", isExpanded && "rotate-180")}>
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Content Area */}
                {sProgress.unlocked && (
                  <div className={clsx(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {session.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            Speaker: <span className="font-semibold text-slate-800">{session.speaker.name}</span>
                          </div>
                          <Link
                            href={`/learning/session/${session.id}`}
                            className={clsx(
                              'px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm',
                              isDone
                                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                : 'bg-burgundy text-white hover:bg-burgundy-deep'
                            )}
                          >
                            <PlayCircle className="w-4 h-4" />
                            {isDone ? 'Review Module' : 'Start Module'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Daily Competition Sidebar */}
        <div className="xl:col-span-1">
          {currentDailyComp && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-burgundy" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Daily Challenge
                </h2>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {currentDailyComp.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentDailyComp.description}
                </p>
              </div>

              <form
                onSubmit={(e) => handleCompetitionSubmit(e, currentDailyComp.type)}
                className="space-y-3 pt-4 border-t border-slate-100"
              >
                <label className="block text-xs font-bold text-slate-700">
                  Submission Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={competitionUrls[currentDailyComp.type] || ''}
                    onChange={(e) =>
                      setCompetitionUrls((prev) => ({
                        ...prev,
                        [currentDailyComp.type]: e.target.value,
                      }))
                    }
                    placeholder={currentDailyComp.urlPlaceholder}
                    required
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComp[currentDailyComp.type]}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    {competitions[currentDailyComp.type] ? 'Update' : 'Submit'}
                  </button>
                </div>
                {compSuccessMsg[currentDailyComp.type] && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {compSuccessMsg[currentDailyComp.type]}
                  </p>
                )}
                {competitions[currentDailyComp.type] && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-medium">Link submitted</span>
                    <a
                      href={competitions[currentDailyComp.type].submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline flex items-center gap-1 hover:text-emerald-900"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearningDashboardPage() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
        <LearningDashboardContent />
      </Suspense>
    </AuthGate>
  );
}
