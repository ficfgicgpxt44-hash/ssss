import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';
import { CaseService } from '../services/CaseService';
import { Case } from '../types';

const categories = ['ALL', 'Endodontics', 'Prosthodontics', 'Surgery', 'Pedodontics', 'Cosmetic Fillings'];

export default function Gallery({ onAdminOpen, refreshTrigger }: { onAdminOpen: () => void, refreshTrigger: number }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<null | Case>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      const data = await CaseService.getCases();
      setCases(data);
    };
    fetchCases();
  }, [refreshTrigger]);

  const filteredCases = activeCategory === 'ALL' 
    ? cases 
    : cases.filter(c => c.category === activeCategory);

  return (
    <section id="gallery" className="py-32 px-6 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="ltr">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-white/5 pb-12 relative group gap-6">
        <div>
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-4">Clinical <br/><span className="text-gold italic">Cases</span></h2>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold/40"></div>
            <p className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold italic">Clinical Portfolio</p>
          </div>
        </div>
        <div className="text-right hidden lg:block">
          <span className="text-8xl font-serif text-white/5 select-none tracking-tight">PORTFOLIO</span>
        </div>
        
        {/* Hidden Admin Trigger */}
        <button 
          onClick={onAdminOpen}
          className="absolute right-0 bottom-0 w-24 h-12 opacity-0 cursor-default"
        />
      </header>

      {/* Category Tabs - Scrollable on mobile */}
      <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-3 mb-20 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
              activeCategory === cat 
                ? 'bg-gold text-dark border-gold shadow-[0_10px_25px_-5px_rgba(197,160,89,0.4)]' 
                : 'bg-card/40 border-white/5 text-white/30 hover:border-gold/30 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredCases.map((c) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              key={c.id}
              className="group relative bg-card/40 rounded-[3rem] overflow-hidden border border-white/5 p-2 cursor-pointer transition-all hover:bg-white/[0.02] hover:border-gold/20"
              onClick={() => setSelectedCase(c)}
            >
              <div className="aspect-[16/10] bg-dark rounded-[2.5rem] overflow-hidden relative">
                 <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-1000">
                    {c.images && c.images.length > 0 && (
                      <img src={c.images[0]} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                 </div>
                 <div className="absolute top-6 right-6 bg-dark/60 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] text-gold font-black border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                   {c.images?.length || 0} Clinical Views
                 </div>
                 <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-gold rounded-full text-dark scale-75 group-hover:scale-100 transition-all shadow-2xl flex items-center justify-center">
                      <Maximize2 className="w-8 h-8" />
                    </div>
                 </div>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">{c.category}</span>
                </div>
                <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-gold transition-colors">{c.title}</h3>
                <p className="text-white/40 text-base font-light leading-relaxed line-clamp-2">{c.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Case Details Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-dark/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-surface w-full h-full md:h-auto md:max-w-6xl md:max-h-[90vh] md:rounded-[4rem] overflow-hidden flex flex-col relative border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
            >
              <button 
                onClick={() => setSelectedCase(null)}
                className="absolute top-6 left-6 md:top-10 md:left-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] border border-white/10 backdrop-blur-md active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="overflow-y-auto overflow-x-hidden no-scrollbar">
                {/* Image Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2 bg-black/40">
                  {selectedCase.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden group/img">
                      <img src={img} alt={`Case Detail ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-1000" />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity">
                         <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Clinical View {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content Section */}
                <div className="p-10 md:p-20 bg-surface">
                  <div className="flex items-center gap-6 mb-8">
                    <span className="text-gold text-xs font-black uppercase tracking-[0.4em]">Clinical Documentation</span>
                    <div className="h-[1px] bg-gold/20 flex-grow"></div>
                  </div>
                  
                  <h3 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">{selectedCase.title}</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                       <p className="text-white/40 leading-relaxed text-lg md:text-xl font-light">{selectedCase.description}</p>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                          <div className="text-[10px] uppercase text-white/20 font-black mb-3 tracking-[0.2em] italic">Service Type</div>
                          <div className="text-2xl font-serif text-gold">{selectedCase.category}</div>
                       </div>
                       <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                          <div className="text-[10px] uppercase text-white/20 font-black mb-3 tracking-[0.2em] italic">Documentation</div>
                          <div className="text-2xl font-serif text-white/80">{selectedCase.images?.length || 0} Professional Views</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

