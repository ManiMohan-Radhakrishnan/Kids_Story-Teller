'use client';

import React from 'react';
import { TutorCreator } from '@/components/TutorCreator';
import { TutorChat } from '@/components/TutorChat';
import { useStory } from '@/contexts/StoryContext';

export default function TutorPage() {
  const { hasActiveSession } = useStory();

  return (
    <div className="min-h-screen">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasActiveSession ? <TutorChat /> : <TutorCreator />}
      </main>
    </div>
  );
}
