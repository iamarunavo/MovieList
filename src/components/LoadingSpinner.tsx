export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizeClass} border-4 border-white/10 border-t-pink-brand rounded-full animate-spin`}
      />
    </div>
  );
}
