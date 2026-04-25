import { motion } from 'motion/react';
import { Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { query, collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CVData } from '../types';

export default function Hero() {
  const [cvData, setCvData] = useState<CVData>({
    name: 'Sami Ali',
    title: 'General Dentist',
    summary: 'A motivated 2024 Dentistry graduate with a strong work ethic and an innate ability to learn new techniques quickly. I bring a unique, patient-centered approach to every procedure, combining precision with compassionate care. As a dedicated and adaptable team player, I’m eager to apply my skills and innovative mindset to help improve patient outcomes and contribute positively to a dental practice.',
    education: [],
    experience: [],
    skills: [],
    languages: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'cv'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as CVData;
          setCvData(prev => ({...prev, ...data}));
        }
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden" dir="ltr">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-extrabold uppercase tracking-[0.3em] mb-8 border border-gold/20 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {cvData.title}
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] mb-8">
            <span className="text-gradient leading-tight block">{cvData.name}</span>
            <span className="text-white/20 text-3xl md:text-4xl lg:text-5xl font-light italic">{cvData.title}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light whitespace-pre-wrap">
            {cvData.summary}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <a href="#gallery" className="w-full sm:w-auto px-10 py-5 bg-gold text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gold/20 flex items-center justify-center gap-3 group overflow-hidden relative">
              <span className="relative z-10">View Clinical Portfolio</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                →
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            
            <a href="#contact" className="text-white/40 hover:text-gold transition-colors font-bold text-sm tracking-widest uppercase py-4">
              Get in Touch
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="relative perspective-1000"
        >
          {/* Animated rings around image */}
          <div className="absolute inset-0 border border-gold/10 rounded-[4rem] scale-110 animate-[spin_20s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-0 border border-white/5 rounded-[4rem] scale-105 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />

          <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-card border-4 border-surface shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] glow-gold group">
            <div className="w-full h-full overflow-hidden">
               <img 
                src={cvData.profileImage || "/sami_profile.png"} 
                alt={cvData.name} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop";
                }}
              />
            </div>
            
            {/* Overlay Info */}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg backdrop-blur-sm">
                    <Award className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Honors Graduate 2024</span>
               </div>
            </div>
          </div>
          
          {/* Floating stat card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -right-4 lg:-right-10 bg-card/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 hidden md:block"
          >
            <div className="text-3xl font-serif text-gold font-bold">2024</div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Class Distinction</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

