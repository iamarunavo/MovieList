'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-dark-deep">
      {/* Cinematic background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-deep via-[#0d0d1a] to-dark-base" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,27,141,0.08)_0%,transparent_70%)]" />
      {/* Subtle film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in">
        {/* Logo + Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Image src="/logo.svg" alt="LaxMovies" width={72} height={72} className="animate-float" />
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
            Lax<span className="text-pink-brand">Movies</span>
          </h1>
        </div>

        {/* Headline */}
        <p className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Discover Your Next Favorite Movie
        </p>
        <p className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto">
          Trending films, top-rated picks, and personalized favorites — all in one place.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search movies, actors, directors…"
            className="w-full px-6 py-4 pr-14 rounded-full bg-white/10 border-2 border-pink-brand/60
              text-white placeholder-white/40 text-base
              focus:outline-none focus:border-pink-brand focus:bg-white/15
              focus:shadow-[0_0_30px_rgba(255,27,141,0.4)] transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
              bg-pink-brand rounded-full text-white hover:brightness-110 transition-all hover:scale-105"
            aria-label="Search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="9" r="6" />
              <line x1="15" y1="15" x2="19" y2="19" />
            </svg>
          </button>
        </form>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <span className="text-white/30 text-sm">Popular:</span>
          {['Avengers', 'Interstellar', 'The Dark Knight', 'Inception'].map(q => (
            <button
              key={q}
              onClick={() => router.push(`/search?q=${encodeURIComponent(q)}`)}
              className="text-sm text-white/50 hover:text-pink-brand transition-colors underline-offset-2 hover:underline"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-dark-base to-transparent" />
    </section>
  );
}
