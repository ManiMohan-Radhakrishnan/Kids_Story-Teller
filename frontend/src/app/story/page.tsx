'use client';

import React from 'react';
import { StoryCreator } from '@/components/StoryCreator';
import { StoryChat } from '@/components/StoryChat';
import { useStory } from '@/contexts/StoryContext';

export default function StoryPage() {
  const { hasActiveSession } = useStory();

  return (
    <div className="min-h-screen">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasActiveSession ? <StoryChat /> : <StoryCreator />}
      </main>
    </div>
  );
}
