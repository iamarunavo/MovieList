'use client';

import { useState } from 'react';
import ScrollRow from './ScrollRow';
import MovieCard from './MovieCard';

interface Props {
  trendingDay: any[];
  trendingWeek: any[];
}

export default function TrendingSection({ trendingDay, trendingWeek }: Props) {
  const [tab, setTab] = useState<'day' | 'week'>('week');
  const movies = tab === 'day' ? trendingDay : trendingWeek;

  const toggle = (
    <div className="flex gap-1 bg-white/10 rounded-full p-1 text-xs">
      {(['day', 'week'] as const).map(t => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            tab === t
              ? 'bg-pink-brand text-white shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {t === 'day' ? 'Today' : 'This Week'}
        </button>
      ))}
    </div>
  );

  return (
    <ScrollRow title="Trending" rightSlot={toggle}>
      {movies.map(m => (
        <MovieCard key={m.id} movie={m} size="sm" />
      ))}
    </ScrollRow>
  );
}
