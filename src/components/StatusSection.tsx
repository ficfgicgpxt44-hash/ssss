import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Status } from '../types';
import { StatusService } from '../services/StatusService';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StatusSection() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [activeStatusIdx, setActiveStatusIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await StatusService.getStatuses();
      setStatuses(data);
    };
    load();
    const interval = setInterval(load, 30000); // Polling for new statuses
    return () => clearInterval(interval);
  }, []);

  if (statuses.length === 0) return null;

  return (
    <div className="py-8 border-b border-white/5 bg-dark/50 backdrop-blur-sm sticky top-[72px] z-[40] overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-6 flex gap-6 items-center">
        {statuses.map((status, idx) => (
          <button
            key={status.id}
            onClick={() => setActiveStatusIdx(idx)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-gold to-yellow-200 transition-transform group-active:scale-95">
              <div className="w-full h-full rounded-full border-2 border-dark overflow-hidden bg-surface">
                <img src={status.image} className="w-full h-full object-cover" alt="Status" />
              </div>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Update</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeStatusIdx !== null && (
          <StatusViewer 
            statuses={statuses} 
            initialIdx={activeStatusIdx} 
            onClose={() => setActiveStatusIdx(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusViewer({ statuses, initialIdx, onClose }: { statuses: Status[], initialIdx: number, onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIdx < statuses.length - 1) {
            setCurrentIdx(prevIdx => prevIdx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIdx, statuses.length, onClose]);

  const handleNext = () => {
    if (currentIdx < statuses.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setProgress(0);
    }
  };

  const status = statuses[currentIdx];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg aspect-[9/16] bg-surface rounded-none sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Progress Bars */}
        <div className="absolute top-4 inset-x-4 flex gap-1 z-20">
          {statuses.map((_, idx) => (
            <div key={idx} className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear" 
                style={{ 
                  width: idx === currentIdx ? `${progress}%` : idx < currentIdx ? '100%' : '0%' 
                }} 
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 inset-x-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-gold">
              <div className="w-full h-full flex items-center justify-center text-dark text-[10px] font-bold">SA</div>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Sami Ali</span>
              <span className="text-white/40 text-[10px]">{new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image */}
        <img src={status.image} className="w-full h-full object-cover" alt="Full Status" />

        {/* Caption */}
        {status.caption && (
          <div className="absolute bottom-12 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent">
            <p className="text-white text-lg text-center font-light leading-relaxed">{status.caption}</p>
          </div>
        )}

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />
        
        {/* Navigation Buttons for desktop */}
        <div className="absolute inset-y-0 -left-16 hidden lg:flex items-center">
            <button onClick={handlePrev} disabled={currentIdx === 0} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-0">
                <ChevronLeft className="w-8 h-8" />
            </button>
        </div>
        <div className="absolute inset-y-0 -right-16 hidden lg:flex items-center">
            <button onClick={handleNext} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
      </div>
    </motion.div>
  );
}
