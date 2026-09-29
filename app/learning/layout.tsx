import React, { Suspense } from 'react';
import { LearningSidebar } from '@/components/learning/LearningSidebar';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Full-Height Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#F9FAFB] border-r border-slate-200 z-50 overflow-y-auto">
        <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading sidebar...</div>}>
          <LearningSidebar />
        </Suspense>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 min-w-0 bg-white">
        {children}
      </div>
    </div>
  );
}
