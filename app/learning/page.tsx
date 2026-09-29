'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Video,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';

interface ProgressData {
  unlocked: boolean;
  videoCompleted: boolean;
  quizPassed: boolean;
  quizScore: number;
  completedAt: string | null;
}

export default function LearningDashboardPage() {
  const [activeDay, setActiveDay] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState<Record<string, ProgressData>>({});
  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});
  const [isHackathonUnlocked, setIsHackathonUnlocked] = useState(false);

  useEffect(() => {
    fetchProgress();
    fetchCompetitions();
    checkHackathonStatus();
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
        // Pre-fill existing submission URLs
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

  async function checkHackathonStatus() {
    // Current date check or override
    const targetDate = new Date('2026-10-10T00:00:00+05:30');
    const now = new Date();
    if (now >= targetDate) {
      setIsHackathonUnlocked(true);
      return;
    }
    // Check if admin override enabled
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data?.config?.hackathon_release_override?.enabled === true) {
        setIsHackathonUnlocked(true);
      }
    } catch {}
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
        body: JSON.stringify({
          competitionType: type,
          submissionUrl: url,
        }),
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

  const daySessions = CURRICULUM_SESSIONS.filter((s) => s.day === activeDay);
  const currentDailyComp = DAILY_COMPETITIONS[activeDay];

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50/60 pb-16">
        {/* Sub-header Hero */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy font-bold text-xs uppercase tracking-wider">
                    Online Learning Phase
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    08–10 October 2026 · IBM Quantum × SRM University-AP
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Masterclass Curriculum & Competitions
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Complete each progressive session in linear sequence by attending the lecture and
                  passing the concept check quiz. Submit your daily creative challenge entries below.
                </p>
              </div>

              {/* Hackathon banner link */}
              <div className="p-3.5 rounded-lg border border-burgundy/20 bg-burgundy/[0.03] flex items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-1.5 text-burgundy font-bold text-xs">
                    <Users className="w-3.5 h-3.5" />
                    Hackathon Phase (Oct 10)
                  </div>
                  <span className="text-[11px] text-slate-600 block">
                    Team formation & 20 Problem Statements
                  </span>
                </div>
                <Link
                  href="/learning/hackathon"
                  className="px-3.5 py-1.5 bg-burgundy text-white text-xs font-semibold rounded hover:bg-burgundy-deep transition-colors shrink-0 flex items-center gap-1"
                >
                  Workspace
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Day Switcher Tabs */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              {([1, 2, 3] as const).map((dayNum) => {
                const isActive = activeDay === dayNum;
                const dayLabel =
                  dayNum === 1
                    ? 'Day 1: Foundations & Architecture'
                    : dayNum === 2
                    ? 'Day 2: Materials & Sensing'
                    : 'Day 3: QML & Cryptography';

                return (
                  <button
                    key={dayNum}
                    onClick={() => setActiveDay(dayNum)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Day 0{dayNum}</span>
                    <span className="hidden sm:inline font-normal text-slate-400">|</span>
                    <span className="hidden sm:inline font-medium">{dayLabel.split(': ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: The 2 Sessions for the active day */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-burgundy" />
                  Day 0{activeDay} Progressive Lecture Arc
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Sequential Progression Enforced
                </span>
              </div>

              <div className="space-y-4">
                {daySessions.map((session, idx) => {
                  const sProgress = progress[session.id] || {
                    unlocked: idx === 0 && activeDay === 1,
                    videoCompleted: false,
                    quizPassed: false,
                    quizScore: 0,
                    completedAt: null,
                  };

                  const isDone = sProgress.videoCompleted && sProgress.quizPassed;

                  return (
                    <div
                      key={session.id}
                      className={`p-5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-white border-emerald-200/80 shadow-xs'
                          : sProgress.unlocked
                          ? 'bg-white border-slate-200 shadow-xs ring-1 ring-burgundy/10'
                          : 'bg-slate-100/60 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                              Session {session.sessionNumber}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {session.duration} ({session.timeStr})
                            </span>
                            {isDone && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Completed (Score: {sProgress.quizScore}%)
                              </span>
                            )}
                            {!isDone && sProgress.unlocked && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-burgundy bg-burgundy/5 px-2 py-0.5 rounded border border-burgundy/20">
                                <Unlock className="w-3 h-3" /> Unlocked & Ready
                              </span>
                            )}
                            {!sProgress.unlocked && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3" /> Complete Previous Session to Unlock
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {session.title}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {session.description}
                          </p>

                          <div className="pt-1 text-xs text-slate-500 font-medium">
                            Speaker: <span className="text-slate-800 font-semibold">{session.speaker.name}</span> · {session.speaker.role}
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="shrink-0 self-end sm:self-center">
                          {sProgress.unlocked ? (
                            <Link
                              href={`/learning/session/${session.id}`}
                              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                                isDone
                                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                  : 'bg-burgundy text-white hover:bg-burgundy-deep'
                              }`}
                            >
                              <PlayCircle className="w-4 h-4" />
                              {isDone ? 'Review Lecture' : 'Launch Lecture & Quiz'}
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Daily Competition Widget */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-burgundy" />
                  Day 0{activeDay} Competition
                </h2>
              </div>

              {currentDailyComp && (
                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy block mb-1">
                      {currentDailyComp.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentDailyComp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {currentDailyComp.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-1">Guidelines:</span>
                    {currentDailyComp.guidelines.map((g, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="text-burgundy font-bold">•</span>
                        <span>{g}</span>
                      </p>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Deadline: <span className="text-slate-800 font-semibold">{currentDailyComp.submissionDeadline}</span>
                  </div>

                  {/* Submission Form */}
                  <form
                    onSubmit={(e) => handleCompetitionSubmit(e, currentDailyComp.type)}
                    className="space-y-2 pt-2 border-t border-slate-100"
                  >
                    <label className="block text-xs font-semibold text-slate-800">
                      Submit Your Work Link (URL):
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
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComp[currentDailyComp.type]}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        {competitions[currentDailyComp.type] ? 'Update' : 'Submit'}
                      </button>
                    </div>

                    {compSuccessMsg[currentDailyComp.type] && (
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {compSuccessMsg[currentDailyComp.type]}
                      </p>
                    )}

                    {competitions[currentDailyComp.type] && (
                      <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span>Submitted URL recorded</span>
                        <a
                          href={competitions[currentDailyComp.type].submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline flex items-center gap-1"
                        >
                          View Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
