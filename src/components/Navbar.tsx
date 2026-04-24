import { motion, AnimatePresence } from 'motion/react';
import { User, GraduationCap, Phone, Image as ImageIcon, Settings, Menu, X, Award } from 'lucide-react';
import { useState } from 'react';
import FirebaseStatus from './FirebaseStatus';

const navItems = [
  { name: 'Home', href: '#home', icon: User },
  { name: 'CV', href: '#cv', icon: GraduationCap },
  { name: 'Portfolio', href: '#gallery', icon: ImageIcon },
  { name: 'Contact', href: '#contact', icon: Phone },
];

export default function Navbar({ onAdminOpen }: { onAdminOpen: () => void }) {
  const [active, setActive] = useState('Home');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
              <Award className="text-black w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl text-white tracking-tight leading-none">Sami Ali</span>
              <FirebaseStatus />
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActive(item.name)}
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${
                  active === item.name ? 'text-gold' : 'text-white/40 hover:text-gold'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </a>
            ))}
            
            <button 
              onClick={onAdminOpen}
              className="p-3 border border-white/10 rounded-2xl text-gold hover:bg-gold hover:text-dark transition-all flex items-center gap-2 group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={onAdminOpen}
              className="p-2 border border-white/10 rounded-xl text-gold"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setActive(item.name);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-lg transition-all ${
                    active === item.name ? 'bg-gold text-dark' : 'text-white/40 bg-white/5'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

