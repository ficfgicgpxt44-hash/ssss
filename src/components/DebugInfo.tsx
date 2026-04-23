export default function DebugInfo() {
  const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasLocalStorage = typeof localStorage !== 'undefined';

  return (
    <div className="fixed bottom-4 left-4 bg-dark border border-gold/30 rounded-lg p-4 text-xs font-mono text-gold max-w-xs z-40 opacity-50 hover:opacity-100 transition-opacity">
      <div className="mb-2 font-bold">DEBUG INFO</div>
      <div>Supabase: {hasSupabase ? '✓' : '✗'}</div>
      <div>LocalStorage: {hasLocalStorage ? '✓' : '✗'}</div>
      <div className="mt-2 text-white/50">Check console for detailed logs</div>
    </div>
  );
}
