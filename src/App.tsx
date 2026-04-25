/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import StatusSection from './components/StatusSection';
import Hero from './components/Hero';
import CV from './components/CV';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import { useState, useEffect } from 'react';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    // 1. Prevent Right Click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // 2. Prevent Copy, Print, Save shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Refresh (F5, Cmd+R)
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) return;
      
      // Block Ctrl/Cmd + C, V, S, P, U, Alt+Cmd+I (DevTools)
      if (
        ((e.ctrlKey || e.metaKey) && ['c', 's', 'p', 'u'].includes(e.key.toLowerCase())) ||
        (e.key === 'F12') ||
        (e.shiftKey && e.ctrlKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && e.key === 'i')
      ) {
        e.preventDefault();
      }
    };

    // 3. Screen capture deterrent (Disabled for now to avoid usability issues during dev)
    const handleVisibility = () => {
      // setIsProtected(document.visibilityState === 'hidden' || !document.hasFocus());
    };

    // 3. Prevent Dragging anything
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('visibilitychange', handleVisibility);
    // window.addEventListener('blur', () => setIsProtected(true));
    // window.addEventListener('focus', () => setIsProtected(false));

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('visibilitychange', handleVisibility);
      // window.removeEventListener('blur', () => setIsProtected(true));
      // window.removeEventListener('focus', () => setIsProtected(false));
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen bg-dark font-sans overflow-x-hidden transition-all duration-500 ${isProtected ? 'blur-2xl grayscale' : ''}`}>
      <Navbar onAdminOpen={() => setIsAdminOpen(true)} />
      <StatusSection />
      <main>
        <Hero />
        <CV />
        <Gallery onAdminOpen={() => setIsAdminOpen(true)} refreshTrigger={refreshTrigger} />
        <Contact />
      </main>

      {isAdminOpen && <AdminDashboard onClose={handleCloseAdmin} />}
      
      {/* Privacy Notice Overlay (Experimental deterrent) */}
      {isProtected && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="text-gold font-serif text-2xl tracking-widest opacity-40">PROTECTED CONTENT</div>
        </div>
      )}
    </div>
  );
}




