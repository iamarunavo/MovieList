import { getTrending, getTopRated } from '@/lib/tmdb';
import HeroSection from '@/components/HeroSection';
import TrendingSection from '@/components/TrendingSection';
import TopRatedSection from '@/components/TopRatedSection';
import AboutSection from '@/components/AboutSection';

export const revalidate = 3600;

export default async function HomePage() {
  const [trendingDay, trendingWeek, topRated] = await Promise.all([
    getTrending('day'),
    getTrending('week'),
    getTopRated(),
  ]);

  return (
    <div className="min-h-screen bg-dark-base">
      <HeroSection />
      <div className="pt-1">
        <TrendingSection
          trendingDay={trendingDay.results || []}
          trendingWeek={trendingWeek.results || []}
        />
        <TopRatedSection movies={topRated.results || []} />
        <AboutSection />
      </div>
    </div>
  );
}
