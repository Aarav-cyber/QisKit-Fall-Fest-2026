'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { Award, Send, CheckCircle2, ExternalLink, PlayCircle } from 'lucide-react';

function LearningDashboardContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');
  const challengeDay = searchParams?.get('challenge');

  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompetitions();
  }, []);

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

  // 1. If viewing a session
  if (sessionId) {
    const session = CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
    if (!session) {
      return <div className="p-12 text-center text-slate-500">Session not found.</div>;
    }

    return (
      <div className="flex flex-col min-h-screen animate-in fade-in duration-500 bg-white">
        {/* Video Player Section - Takes Full Width of Content Area */}
        <div className="w-full aspect-video bg-black relative max-h-[70vh]">
          <iframe
            src={`https://www.youtube.com/embed/${session.youtubeId}?autoplay=1&rel=0`}
            title={session.title}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Content Below Video */}
        <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-12">
          {/* Session Overview */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{session.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">{session.description}</p>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Key Learning Points</h3>
              <ul className="space-y-2">
                {session.learnPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-burgundy font-bold mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Speaker Details */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">About the Speaker</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-bold text-slate-400">
                  {session.speaker.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{session.speaker.name}</h3>
                  <p className="text-burgundy font-medium">{session.speaker.role}</p>
                  <p className="text-slate-500 text-sm">{session.speaker.institution}</p>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {session.speaker.bio}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  {session.speaker.websiteUrl && (
                    <a href={session.speaker.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 hover:text-burgundy flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  {session.speaker.profileUrl && (
                    <a href={session.speaker.profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 hover:text-burgundy flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. If viewing a challenge
  if (challengeDay) {
    const day = Number(challengeDay);
    const challenge = DAILY_COMPETITIONS[day];

    if (!challenge) {
      return <div className="p-12 text-center text-slate-500">No challenge available for this day.</div>;
    }

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-burgundy/10 rounded-xl">
            <Award className="w-8 h-8 text-burgundy" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Challenge: Day {day}</h1>
            <p className="text-slate-500 mt-1">{challenge.subtitle}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{challenge.title}</h2>
            <p className="text-slate-600 leading-relaxed">{challenge.description}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">Submission Guidelines</h3>
            <ul className="space-y-2">
              {challenge.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-burgundy font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Deadline</span>
              <p className="text-sm font-semibold text-slate-900">{challenge.submissionDeadline}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <form onSubmit={(e) => handleCompetitionSubmit(e, challenge.type)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Submit Your Work Link (URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={competitionUrls[challenge.type] || ''}
                    onChange={(e) =>
                      setCompetitionUrls((prev) => ({
                        ...prev,
                        [challenge.type]: e.target.value,
                      }))
                    }
                    placeholder={challenge.urlPlaceholder}
                    required
                    className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComp[challenge.type]}
                    className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {competitions[challenge.type] ? 'Update Submission' : 'Submit Now'}
                  </button>
                </div>
              </div>

              {compSuccessMsg[challenge.type] && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  {compSuccessMsg[challenge.type]}
                </div>
              )}

              {competitions[challenge.type] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Current active submission link:</span>
                  <a
                    href={competitions[challenge.type].submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-burgundy hover:underline flex items-center gap-1"
                  >
                    View Submission <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default state (Welcome / Congratulations)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-burgundy/5 text-burgundy rounded-full flex items-center justify-center mb-6 ring-8 ring-burgundy/5">
        <PlayCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
        Welcome to QisKit Fall Fest Learning Phase
      </h1>
      <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
        Select a session or daily challenge from the sidebar to begin your quantum computing journey. Complete all modules sequentially to earn your certificate!
      </p>
    </div>
  );
}

export default function LearningDashboardPage() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading learning environment...</div>}>
        <LearningDashboardContent />
      </Suspense>
    </AuthGate>
  );
}
