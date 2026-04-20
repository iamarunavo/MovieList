import Link from 'next/link';

interface Genre {
  id: number;
  name: string;
}

const GENRE_ICONS: Record<string, string> = {
  Action: '💥',
  Adventure: '🗺️',
  Animation: '🎨',
  Comedy: '😂',
  Crime: '🔍',
  Documentary: '🎥',
  Drama: '🎭',
  Fantasy: '🧙',
  History: '📜',
  Horror: '👻',
  Music: '🎵',
  Mystery: '🔮',
  Romance: '💕',
  'Science Fiction': '🚀',
  Thriller: '😱',
  War: '⚔️',
  Western: '🤠',
};

export default function GenreSection({ genres }: { genres: Genre[] }) {
  return (
    <section className="mb-10 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-pink-brand mb-5">Browse by Genre</h2>
      <div className="flex flex-wrap gap-3">
        {genres.map(genre => (
          <Link
            key={genre.id}
            href={`/search?genre=${genre.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full
              text-sm font-medium text-white/70 hover:bg-pink-brand/20 hover:border-pink-brand/50
              hover:text-white transition-all hover:-translate-y-0.5"
          >
            <span>{GENRE_ICONS[genre.name] || '🎬'}</span>
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
