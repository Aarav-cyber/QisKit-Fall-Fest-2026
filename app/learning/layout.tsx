import React, { Suspense } from 'react';
import { LearningSidebar } from '@/components/learning/LearningSidebar';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar - flows normally on mobile, fixed full-height on desktop */}
      <div className="relative md:fixed md:inset-y-0 md:left-0 w-full md:w-72 bg-[#F9FAFB] border-r border-slate-200 md:z-50 md:overflow-y-auto">
        <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading sidebar...</div>}>
          <LearningSidebar />
        </Suspense>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 min-w-0 bg-white">
        {children}
      </div>
    </div>
  );
}
