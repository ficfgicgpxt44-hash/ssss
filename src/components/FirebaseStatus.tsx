import { useState, useEffect } from 'react';
import { getFirebase } from '../lib/firebase';
import { Database, WifiOff, CheckCircle2 } from 'lucide-react';

export default function FirebaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');

  useEffect(() => {
    async function checkStatus() {
      const { app } = getFirebase();
      if (app) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    }
    checkStatus();
  }, []);

  if (status === 'loading') return null;

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10">
      {status === 'connected' ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-white/60">Cloud Active</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-500" />
          <span className="text-white/40">Local Mode</span>
        </>
      )}
    </div>
  );
}
