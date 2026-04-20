'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-deep/95 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Left: Logo + Explore */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="LaxMovies" width={36} height={36} />
            <span className="text-2xl font-extrabold tracking-tight">
              Lax<span className="text-pink-brand">Movies</span>
            </span>
          </Link>
          <Link
            href="/search"
            className={`hidden md:block text-sm font-medium transition-colors ${
              pathname === '/search' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Explore
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(s => !s)}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 hidden lg:block truncate max-w-[140px]">
                {currentUser.email}
              </span>
              <Link
                href="/favorites"
                className="text-xs text-white/40 hover:text-white transition-colors hidden sm:block"
              >
                Favorites
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:-translate-y-0.5 transition-transform"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm bg-pink-brand text-white px-3 py-1.5 rounded-lg font-medium hover:brightness-110 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-white text-black px-3 py-1.5 rounded-lg font-medium hover:-translate-y-0.5 transition-transform"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Expandable search bar */}
      {showSearch && (
        <div className="px-4 pb-3 border-t border-white/10">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-3">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search movies, actors, directors…"
              className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-2.5 pr-12 text-white placeholder-white/40 text-sm focus:outline-none focus:border-pink-brand focus:ring-1 focus:ring-pink-brand/20 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-brand hover:scale-110 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
