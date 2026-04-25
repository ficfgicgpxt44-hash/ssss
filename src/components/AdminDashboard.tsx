import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, X, Save, LayoutDashboard, LogOut, ChevronRight, Download, User as UserIcon } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';
import heic2any from 'heic2any';
import { Case, CVData } from '../types';
import { CaseService } from '../services/CaseService';
import { ProfileService } from '../services/ProfileService';

const categories = ["Endodontics", "Prosthodontics", "Surgery", "Pedodontics", "Cosmetic Fillings"];
const ADMIN_EMAIL = "ficfgicgpxt44@gmail.com";

type AdminTab = 'cases' | 'profile';

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('cases');
  
  const [cases, setCases] = useState<Case[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState<Omit<Case, 'id' | 'createdAt'>>({
    title: '',
    category: 'Prosthodontics',
    description: '',
    images: []
  });

  const [cvData, setCvData] = useState<CVData>({
    name: 'Sami Ali',
    title: 'General Dentist',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    languages: []
  });

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your connection.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        if (activeTab === 'cases') {
          const data = await CaseService.getCases();
          setCases(data);
        } else if (activeTab === 'profile' && user) {
          const data = await ProfileService.getProfile(user.uid);
          if (data) setCvData(data);
        }
      };
      fetchData();
    }
  }, [isAdmin, activeTab, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await ProfileService.updateProfile(user.uid, cvData);
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="fixed inset-0 z-[300] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-6" dir="ltr">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-white/10 p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center text-gold mx-auto mb-8">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">Private Area</h2>
          <p className="text-white/40 mb-8 font-light">Please sign in with your authorized Google account to access dashboard</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-gold text-dark py-5 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
            >
              Sign in with Google
            </button>
            {user && user.email !== ADMIN_EMAIL && (
              <p className="text-red-500 text-xs">Account {user.email} is not authorized.</p>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-4 text-white/30 hover:text-white transition-all font-bold"
            >
              Back to Portfolio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard content follows

  const compressImage = (base64Str: string, maxWidth = 720, maxHeight = 720): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onerror = () => {
        console.warn("Compression: Failed to load image");
        resolve(base64Str);
      };
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(base64Str);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.4));
        } catch (err) {
          console.error("Compression error:", err);
          resolve(base64Str);
        }
      };
      img.src = base64Str;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return;
    
    try {
      if (editingCase) {
        await CaseService.updateCase({ ...formData, id: editingCase.id, createdAt: editingCase.createdAt });
      } else {
        await CaseService.addCase(formData);
      }
      const data = await CaseService.getCases();
      setCases(data);
      setIsAdding(false);
      setEditingCase(null);
      setFormData({ title: '', category: 'Prosthodontics', description: '', images: [] });
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save case. Please check if images are too large.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setCases(prev => prev.filter(c => c.id !== id));
      await CaseService.deleteCase(id);
    } catch (error) {
      console.error("Delete error:", error);
      const data = await CaseService.getCases();
      setCases(data);
      alert("An error occurred while deleting");
    }
  };

  const startEdit = (c: Case) => {
    setEditingCase(c);
    setFormData({
      title: c.title,
      category: c.category,
      description: c.description,
      images: c.images || []
    });
    setIsAdding(true);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-dark flex" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-dark">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-white text-xl">Dashboard</span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('cases')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'cases' ? 'bg-gold text-dark' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Cases
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-gold text-dark' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <UserIcon className="w-5 h-5" />
              CV Profile
            </button>
            
            <div className="pt-4 pb-2">
               <div className="h-[1px] bg-white/5 w-full"></div>
            </div>

            <button 
              onClick={() => { setIsAdding(true); setEditingCase(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 text-gold border border-gold/20 rounded-xl font-bold transition-all hover:bg-gold/10"
            >
              <Plus className="w-5 h-5" />
              Add New Case
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-all font-bold"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>

        <button 
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors font-bold"
        >
          <ChevronRight className="w-5 h-5" />
          Exit to Website
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        {activeTab === 'cases' ? (
          <>
            <header className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <h1 className="text-4xl font-serif text-white">Clinical Case Management</h1>
                <p className="text-white/20 text-xs mt-2 italic">You can upload images directly from your device</p>
              </div>
              <button 
                onClick={() => { setIsAdding(true); setEditingCase(null); }}
                className="px-6 py-3 bg-gold text-dark rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-gold/10"
              >
                New Case +
              </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {cases.map((c) => (
                  <motion.div 
                    layout
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border border-white/5 p-6 rounded-3xl flex items-center gap-8 group"
                  >
                    <div className="w-40 h-24 bg-dark rounded-xl overflow-hidden flex-shrink-0 relative">
                       {c.images && c.images.length > 0 && (
                         <img src={c.images[0]} className="w-full h-full object-cover" alt="Case Cover" />
                       )}
                       <div className="absolute bottom-2 right-2 bg-dark/80 px-2 py-0.5 rounded text-[10px] text-gold font-bold">
                         {c.images?.length || 0} Images
                       </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] uppercase text-gold font-bold tracking-widest">{c.category}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">{c.title}</h3>
                      <p className="text-white/40 text-sm font-light mt-1 line-clamp-1">{c.description}</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(c)}
                        className="p-3 bg-white/5 hover:bg-gold hover:text-dark rounded-xl transition-all border border-white/10 text-white"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-white/10 text-white"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="max-w-4xl">
            <header className="mb-12">
              <h1 className="text-4xl font-serif text-white">CV & Profile Editor</h1>
              <p className="text-white/20 text-xs mt-2 italic">Update your professional information displayed on the website</p>
            </header>

            <form onSubmit={handleSaveProfile} className="space-y-8 bg-card p-10 rounded-[3rem] border border-white/5">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Profile Image</label>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 rounded-3xl bg-dark/50 border border-white/10 overflow-hidden flex-shrink-0">
                        {cvData.profileImage ? (
                          <img src={cvData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10">
                            <UserIcon className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow space-y-3">
                        <div className="flex gap-3">
                          <label className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white cursor-pointer hover:border-gold transition-all text-sm">
                            Upload Photo
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const result = reader.result as string;
                                    const compressedDataUrl = await compressImage(result);
                                    if (compressedDataUrl) {
                                      setCvData({...cvData, profileImage: compressedDataUrl});
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {cvData.profileImage && (
                            <button 
                              type="button"
                              onClick={() => setCvData({...cvData, profileImage: ''})}
                              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-white/20">Recommended: Square aspect ratio (1:1)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Full Name</label>
                    <input 
                      value={cvData.name}
                      onChange={e => setCvData({...cvData, name: e.target.value})}
                      className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Professional Title</label>
                    <input 
                      value={cvData.title}
                      onChange={e => setCvData({...cvData, title: e.target.value})}
                      className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Profile Summary</label>
                    <textarea 
                      value={cvData.summary}
                      onChange={e => setCvData({...cvData, summary: e.target.value})}
                      rows={6}
                      className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  type="submit"
                  className="px-10 py-5 bg-gold text-dark rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-3 shadow-xl shadow-gold/10"
                >
                  <Save className="w-6 h-6" />
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Editor Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[300] bg-dark/95 backdrop-blur-md flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 rounded-[3rem] w-full max-w-2xl p-12 relative"
          >
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-8 right-8 text-white/40 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-serif text-white mb-8">
              {editingCase ? 'Edit Case' : 'Add New Case'}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Case Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    type="text" 
                    placeholder="e.g., Anterior Veneer Esthetics"
                    className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all appearance-none outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Case Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all resize-none"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Case Images (Up to 30)</label>
                   <span className="text-xs text-gold">{formData.images.length} / 30</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {formData.images.map((img, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square bg-dark/50 rounded-2xl overflow-hidden group border border-white/5 shadow-lg"
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                        <button 
                          type="button"
                          onClick={() => {
                            const newImages = [...formData.images];
                            newImages.splice(idx, 1);
                            setFormData({...formData, images: newImages});
                          }}
                          className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {formData.images.length < 30 && (
                    <label className="aspect-square bg-dark/50 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-all">
                      <Plus className="w-8 h-8 text-white/20 mb-1" />
                      <span className="text-[10px] text-white/30">Add Images</span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          const remaining = 30 - formData.images.length;
                          const toProcess = files.slice(0, remaining);
                          
                          if (toProcess.length === 0) return;

                          const processFile = async (file: File): Promise<string> => {
                            let fileToRead = file;
                            
                            // Handle HEIC conversion
                            if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
                              try {
                                const blob = await heic2any({
                                  blob: file,
                                  toType: 'image/jpeg',
                                  quality: 0.8
                                });
                                const convertedBlob = Array.isArray(blob) ? blob[0] : blob;
                                fileToRead = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
                              } catch (err) {
                                console.error("HEIC conversion failed:", err);
                                // Continue with original file if conversion fails, though it might fail later
                              }
                            }

                            return new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = async () => {
                                try {
                                  const result = reader.result as string;
                                  const compressed = await compressImage(result);
                                  resolve(compressed);
                                } catch (err) {
                                  reject(err);
                                }
                              };
                              reader.onerror = reject;
                              reader.readAsDataURL(fileToRead);
                            });
                          };

                          try {
                            const newImages = await Promise.all(toProcess.map(processFile));
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images, ...newImages].slice(0, 30)
                            }));
                          } catch (err) {
                            console.error("Error processing images:", err);
                            alert("Some images could not be processed.");
                          }
                          
                          // Reset input value to allow re-selecting same files
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={formData.images.length === 0}
                className="w-full bg-gold text-dark py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 shadow-xl shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                <Save className="w-6 h-6" />
                Save Case to Gallery
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
