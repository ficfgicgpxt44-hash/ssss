import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  Download, 
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Check
} from 'lucide-react';
import heic2any from 'heic2any';
import { Case, CVData, EducationItem, ExperienceItem, CourseItem } from '../types';
import { CaseService } from '../services/CaseService';
import { ProfileService } from '../services/ProfileService';

const categories = ["Endodontics", "Prosthodontics", "Surgery", "Pedodontics", "Cosmetic Fillings"];
const ADMIN_PASSWORD = "Sami082#";
const DOCTOR_DOC_ID = "7MI8gihA7CO7319M2S9MDpWfVHh1";

type AdminTab = 'cases' | 'journey' | 'profile';
type JourneySection = 'experience' | 'education' | 'courses' | 'skills';

// Normalizes input to handle Arabic numerals and trims whitespace
const cleanPasswordInput = (val: string): string => {
  return val
    .trim()
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return (
      localStorage.getItem('sami_admin_auth') === 'true' ||
      sessionStorage.getItem('sami_admin_auth') === 'true'
    );
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('cases');
  const [journeySection, setJourneySection] = useState<JourneySection>('experience');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  
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
    languages: [],
    courses: []
  });

  // Journey editing modals state
  const [editingExp, setEditingExp] = useState<{
    isOpen: boolean;
    index: number | null;
    data: ExperienceItem;
  }>({
    isOpen: false,
    index: null,
    data: { role: '', clinic: '', period: '', description: '' }
  });

  const [editingEdu, setEditingEdu] = useState<{
    isOpen: boolean;
    index: number | null;
    data: EducationItem;
  }>({
    isOpen: false,
    index: null,
    data: { degree: '', institution: '', year: '' }
  });

  const [editingCourse, setEditingCourse] = useState<{
    isOpen: boolean;
    index: number | null;
    data: CourseItem;
  }>({
    isOpen: false,
    index: null,
    data: { name: '', details: '' }
  });

  const [newSkillInput, setNewSkillInput] = useState('');

  const triggerSaveNotice = (message: string) => {
    setSaveNotice(message);
    setTimeout(() => {
      setSaveNotice(null);
    }, 3500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanPasswordInput(passwordInput);
    if (clean === ADMIN_PASSWORD || clean.toLowerCase() === ADMIN_PASSWORD.toLowerCase()) {
      setIsAdmin(true);
      localStorage.setItem('sami_admin_auth', 'true');
      sessionStorage.setItem('sami_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى / Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('sami_admin_auth');
    sessionStorage.removeItem('sami_admin_auth');
    setPasswordInput('');
    setErrorMsg('');
    onClose();
  };

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        try {
          const [casesData, profileData] = await Promise.all([
            CaseService.getCases(),
            ProfileService.getProfile(DOCTOR_DOC_ID)
          ]);
          setCases(casesData);
          if (profileData) {
            setCvData(profileData);
          }
        } catch (err) {
          console.warn("Dashboard data fetch:", err);
        }
      };
      fetchData();
    }
  }, [isAdmin]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProfileService.updateProfile(DOCTOR_DOC_ID, cvData);
      triggerSaveNotice('تم حفظ وتحديث السيرة الذاتية بنجاح / Profile updated');
    } catch (err) {
      console.error(err);
      alert('فشل في حفظ البيانات / Failed to update profile');
    }
  };

  const handleSaveAllJourney = async () => {
    try {
      await ProfileService.updateProfile(DOCTOR_DOC_ID, cvData);
      triggerSaveNotice('تم حفظ كامل المسيرة المهنية وتحديث الموقع بنجاح!');
    } catch (err) {
      console.error(err);
      alert('فشل في حفظ البيانات / Failed to save');
    }
  };

  // Experience handlers
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp.data.role.trim() || !editingExp.data.clinic.trim()) {
      alert('يرجى كتابة المسمى الوظيفي والعيادة / Please provide role and clinic');
      return;
    }
    const currentList = [...(cvData.experience || [])];
    if (editingExp.index === null || editingExp.index === -1) {
      currentList.unshift(editingExp.data);
    } else {
      currentList[editingExp.index] = editingExp.data;
    }
    const updated = { ...cvData, experience: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    setEditingExp({ isOpen: false, index: null, data: { role: '', clinic: '', period: '', description: '' } });
    triggerSaveNotice('تم حفظ الخبرة السريرية بنجاح');
  };

  const handleDeleteExperience = (index: number) => {
    if (!confirm('هل تريد بالتأكيد حذف هذه الخبرة؟ / Delete this clinical experience?')) return;
    const currentList = (cvData.experience || []).filter((_, i) => i !== index);
    const updated = { ...cvData, experience: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    triggerSaveNotice('تم حذف الخبرة');
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    const list = [...(cvData.experience || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    const updated = { ...cvData, experience: list };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
  };

  // Education handlers
  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu.data.degree.trim() || !editingEdu.data.institution.trim()) {
      alert('يرجى ملء المؤهل والجامعة / Please provide degree and institution');
      return;
    }
    const currentList = [...(cvData.education || [])];
    if (editingEdu.index === null || editingEdu.index === -1) {
      currentList.unshift(editingEdu.data);
    } else {
      currentList[editingEdu.index] = editingEdu.data;
    }
    const updated = { ...cvData, education: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    setEditingEdu({ isOpen: false, index: null, data: { degree: '', institution: '', year: '' } });
    triggerSaveNotice('تم حفظ المؤهل الدراسي بنجاح');
  };

  const handleDeleteEducation = (index: number) => {
    if (!confirm('هل تريد بالتأكيد حذف هذا المؤهل؟ / Delete this education record?')) return;
    const currentList = (cvData.education || []).filter((_, i) => i !== index);
    const updated = { ...cvData, education: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    triggerSaveNotice('تم حذف المؤهل الدراسي');
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    const list = [...(cvData.education || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    const updated = { ...cvData, education: list };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
  };

  // Course handlers
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse.data.name.trim()) {
      alert('يرجى إدخال اسم الشهادة أو الكورس / Please provide certification name');
      return;
    }
    const currentList = [...(cvData.courses || [])];
    if (editingCourse.index === null || editingCourse.index === -1) {
      currentList.push(editingCourse.data);
    } else {
      currentList[editingCourse.index] = editingCourse.data;
    }
    const updated = { ...cvData, courses: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    setEditingCourse({ isOpen: false, index: null, data: { name: '', details: '' } });
    triggerSaveNotice('تم حفظ الشهادة بنجاح');
  };

  const handleDeleteCourse = (index: number) => {
    if (!confirm('هل تريد بالتأكيد حذف هذه الشهادة؟ / Delete this certification?')) return;
    const currentList = (cvData.courses || []).filter((_, i) => i !== index);
    const updated = { ...cvData, courses: currentList };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    triggerSaveNotice('تم حذف الشهادة');
  };

  // Skill handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSkill = newSkillInput.trim();
    if (!cleanSkill) return;
    const currentSkills = cvData.skills || [];
    if (currentSkills.includes(cleanSkill)) {
      setNewSkillInput('');
      return;
    }
    const updatedSkills = [...currentSkills, cleanSkill];
    const updated = { ...cvData, skills: updatedSkills };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    setNewSkillInput('');
    triggerSaveNotice('تمت إضافة المهارة');
  };

  const handleDeleteSkill = (index: number) => {
    const currentSkills = (cvData.skills || []).filter((_, i) => i !== index);
    const updated = { ...cvData, skills: currentSkills };
    setCvData(updated);
    ProfileService.updateProfile(DOCTOR_DOC_ID, updated);
    triggerSaveNotice('تم حذف المهارة');
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[300] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-surface border border-white/10 p-8 sm:p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle gold glow behind card */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/15 blur-[70px] pointer-events-none rounded-full" />

          <div className="w-20 h-20 bg-gold/10 border border-gold/20 rounded-3xl flex items-center justify-center text-gold mx-auto mb-6 shadow-xl shadow-gold/10">
            <Lock className="w-9 h-9" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2">لوحة التحكم</h2>
          <p className="text-white/40 text-xs sm:text-sm mb-8 font-light">
            يرجى إدخال كلمة المرور للوصول إلى لوحة إدارة الحالات والسيرة الذاتية
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                className="w-full bg-dark/80 border border-white/10 rounded-2xl py-4 pr-4 pl-12 text-white placeholder-white/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-right transition-all font-mono text-base tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-right"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full bg-gold text-dark py-4 rounded-2xl font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2.5 mt-2 cursor-pointer"
            >
              <KeyRound className="w-5 h-5" />
              <span>دخول إلى لوحة التحكم</span>
            </button>

            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 text-white/40 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              العودة إلى الموقع
            </button>
          </form>
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
      {/* Toast Notification */}
      <AnimatePresence>
        {saveNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 right-8 z-[500] flex items-center gap-3 bg-gold text-dark px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm border border-gold/40"
          >
            <CheckCircle2 className="w-5 h-5 text-dark shrink-0" />
            <span>{saveNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 p-8 flex flex-col justify-between shrink-0">
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
              onClick={() => setActiveTab('journey')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'journey' ? 'bg-gold text-dark' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Briefcase className="w-5 h-5" />
              Professional Journey
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-gold text-dark' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <UserIcon className="w-5 h-5" />
              CV Profile & Bio
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
      <main className="flex-grow p-8 sm:p-12 overflow-y-auto">
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
        ) : activeTab === 'journey' ? (
          <div className="max-w-5xl">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-white/5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif text-white flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-gold" />
                  <span>Professional Journey</span>
                </h1>
                <p className="text-white/30 text-xs sm:text-sm mt-1">
                  تعديل وإدارة تفاصيل الخبرات السريرية، التعليم الأكاديمي، البرامج التدريبية والمهارات
                </p>
              </div>

              <button
                onClick={handleSaveAllJourney}
                className="px-6 py-3 bg-gold text-dark rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10 text-sm cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>حفظ التعديلات في الموقع</span>
              </button>
            </header>

            {/* Sub-Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-surface p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => setJourneySection('experience')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  journeySection === 'experience'
                    ? 'bg-gold text-dark shadow-md'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Clinical Experience</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  journeySection === 'experience' ? 'bg-dark/20 text-dark' : 'bg-white/10 text-white/50'
                }`}>
                  {cvData.experience?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setJourneySection('education')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  journeySection === 'education'
                    ? 'bg-gold text-dark shadow-md'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Education</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  journeySection === 'education' ? 'bg-dark/20 text-dark' : 'bg-white/10 text-white/50'
                }`}>
                  {cvData.education?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setJourneySection('courses')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  journeySection === 'courses'
                    ? 'bg-gold text-dark shadow-md'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certifications</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  journeySection === 'courses' ? 'bg-dark/20 text-dark' : 'bg-white/10 text-white/50'
                }`}>
                  {cvData.courses?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setJourneySection('skills')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  journeySection === 'skills'
                    ? 'bg-gold text-dark shadow-md'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Clinical Skills</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  journeySection === 'skills' ? 'bg-dark/20 text-dark' : 'bg-white/10 text-white/50'
                }`}>
                  {cvData.skills?.length || 0}
                </span>
              </button>
            </div>

            {/* SECTION 1: CLINICAL EXPERIENCE */}
            {journeySection === 'experience' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Experience (الخبرات السريرية)</h2>
                    <p className="text-white/30 text-xs">الأدوار والعيادات والمستشفيات وفترة العمل</p>
                  </div>
                  <button
                    onClick={() => setEditingExp({
                      isOpen: true,
                      index: -1,
                      data: { role: '', clinic: '', period: '', description: '' }
                    })}
                    className="px-5 py-2.5 bg-gold text-dark rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة خبرة جديدة / Add Experience</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(cvData.experience || []).map((exp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gold/20 transition-all"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-gold font-bold text-lg">{exp.role}</span>
                          <span className="text-white/40 text-sm font-medium">@ {exp.clinic}</span>
                          <span className="text-[10px] font-black text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20 uppercase tracking-wider">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs sm:text-sm font-light leading-relaxed">
                          {exp.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          title="نقل لأعلى / Move Up"
                          disabled={idx === 0}
                          onClick={() => handleMoveExperience(idx, 'up')}
                          className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 rounded-xl transition-all text-white border border-white/5 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          title="نقل لأسفل / Move Down"
                          disabled={idx === (cvData.experience?.length || 0) - 1}
                          onClick={() => handleMoveExperience(idx, 'down')}
                          className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 rounded-xl transition-all text-white border border-white/5 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          title="تعديل / Edit"
                          onClick={() => setEditingExp({ isOpen: true, index: idx, data: { ...exp } })}
                          className="p-2.5 bg-white/5 hover:bg-gold hover:text-dark rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          title="حذف / Delete"
                          onClick={() => handleDeleteExperience(idx)}
                          className="p-2.5 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {(!cvData.experience || cvData.experience.length === 0) && (
                    <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-white/10">
                      <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">لم تتم إضافة أي خبرات سريرية بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 2: EDUCATION */}
            {journeySection === 'education' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Academic Education (التعليم الأكاديمي)</h2>
                    <p className="text-white/30 text-xs">الشهادات الجامعية والدرجات العلمية</p>
                  </div>
                  <button
                    onClick={() => setEditingEdu({
                      isOpen: true,
                      index: -1,
                      data: { degree: '', institution: '', year: '' }
                    })}
                    className="px-5 py-2.5 bg-gold text-dark rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مؤهل دراسي / Add Education</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(cvData.education || []).map((edu, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gold/20 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="text-gold text-[10px] font-black uppercase tracking-widest">{edu.year}</div>
                        <h3 className="text-white font-bold text-lg">{edu.degree}</h3>
                        <p className="text-white/40 text-sm font-medium">{edu.institution}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          title="نقل لأعلى"
                          disabled={idx === 0}
                          onClick={() => handleMoveEducation(idx, 'up')}
                          className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 rounded-xl transition-all text-white border border-white/5 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          title="نقل لأسفل"
                          disabled={idx === (cvData.education?.length || 0) - 1}
                          onClick={() => handleMoveEducation(idx, 'down')}
                          className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 rounded-xl transition-all text-white border border-white/5 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          title="تعديل"
                          onClick={() => setEditingEdu({ isOpen: true, index: idx, data: { ...edu } })}
                          className="p-2.5 bg-white/5 hover:bg-gold hover:text-dark rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => handleDeleteEducation(idx)}
                          className="p-2.5 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {(!cvData.education || cvData.education.length === 0) && (
                    <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-white/10">
                      <GraduationCap className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">لم تتم إضافة أي مؤهلات دراسية بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3: CERTIFICATIONS */}
            {journeySection === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Certifications & Programs (الشهادات والبرامج)</h2>
                    <p className="text-white/30 text-xs">الدورات التدريبية المتقدمة وساعات الاعتماد</p>
                  </div>
                  <button
                    onClick={() => setEditingCourse({
                      isOpen: true,
                      index: -1,
                      data: { name: '', details: '' }
                    })}
                    className="px-5 py-2.5 bg-gold text-dark rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة شهادة / Add Certification</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(cvData.courses || []).map((course, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-white/5 p-6 rounded-3xl flex justify-between items-center gap-4 hover:border-gold/20 transition-all"
                    >
                      <div className="space-y-1">
                        <h3 className="text-white font-bold text-base">{course.name}</h3>
                        <p className="text-gold text-xs font-semibold tracking-wider uppercase">{course.details}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          title="تعديل"
                          onClick={() => setEditingCourse({ isOpen: true, index: idx, data: { ...course } })}
                          className="p-2.5 bg-white/5 hover:bg-gold hover:text-dark rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => handleDeleteCourse(idx)}
                          className="p-2.5 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-white border border-white/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {(!cvData.courses || cvData.courses.length === 0) && (
                    <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-white/10">
                      <Award className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">لم تتم إضافة أي شهادات أو برامج بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4: CLINICAL SKILLS */}
            {journeySection === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Clinical Expertise & Skills (المهارات السريرية والتقنية)</h2>
                  <p className="text-white/30 text-xs">المهارات المميزة مثل Endodontics، التكبير باللوبس، التصوير، وتصميم الابتسامة</p>
                </div>

                {/* Add Skill Input */}
                <form onSubmit={handleAddSkill} className="flex gap-3">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="اكتب اسم المهارة الجديدة... (e.g., Dental Photography, Rotary Endodontics)"
                    className="flex-grow bg-card border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-gold transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gold text-dark rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10 cursor-pointer shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة المهارة</span>
                  </button>
                </form>

                {/* Skill Badges */}
                <div className="bg-card border border-white/5 p-8 rounded-3xl">
                  <div className="flex flex-wrap gap-3">
                    {(cvData.skills || []).map((skill, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark/70 border border-white/10 hover:border-gold/30 rounded-2xl py-2.5 px-4 flex items-center gap-3 group transition-all"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                        <span className="text-white font-medium text-xs sm:text-sm tracking-wide">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(idx)}
                          className="text-white/30 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                          title="حذف المهارة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {(!cvData.skills || cvData.skills.length === 0) && (
                    <div className="text-center py-12 text-white/30 text-sm">
                      لم يتم إدخال أي مهارات بعد. أضف مهاراتك من الحقل أعلاه.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
                  className="px-10 py-5 bg-gold text-dark rounded-2xl font-bold hover:opacity-90 transition-all flex items-center gap-3 shadow-xl shadow-gold/10 cursor-pointer"
                >
                  <Save className="w-6 h-6" />
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Experience Add/Edit Modal */}
      {editingExp.isOpen && (
        <div className="fixed inset-0 z-[350] bg-dark/95 backdrop-blur-md flex items-center justify-center p-6" dir="ltr">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl"
          >
            <button
              onClick={() => setEditingExp({ isOpen: false, index: null, data: { role: '', clinic: '', period: '', description: '' } })}
              className="absolute top-6 right-6 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-gold" />
              <span>{editingExp.index === -1 || editingExp.index === null ? 'Add Clinical Experience' : 'Edit Clinical Experience'}</span>
            </h2>

            <form onSubmit={handleSaveExperience} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Role / Position (المسمى الوظيفي)</label>
                <input
                  required
                  value={editingExp.data.role}
                  onChange={(e) => setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data, role: e.target.value }
                  })}
                  placeholder="e.g. First Operator, Resident Dentist..."
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Clinic / Hospital (المركز أو العيادة)</label>
                  <input
                    required
                    value={editingExp.data.clinic}
                    onChange={(e) => setEditingExp({
                      ...editingExp,
                      data: { ...editingExp.data, clinic: e.target.value }
                    })}
                    placeholder="e.g. Shenawi Dental Clinic"
                    className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Period / Duration (الفترة الزمنية)</label>
                  <input
                    required
                    value={editingExp.data.period}
                    onChange={(e) => setEditingExp({
                      ...editingExp,
                      data: { ...editingExp.data, period: e.target.value }
                    })}
                    placeholder="e.g. Present, 2024 - Present, 6 Months"
                    className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Clinical Description (تفاصيل العمل السريري)</label>
                <textarea
                  rows={4}
                  value={editingExp.data.description}
                  onChange={(e) => setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data, description: e.target.value }
                  })}
                  placeholder="Describe key responsibilities, procedures handled, patient care..."
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-grow py-4 bg-gold text-dark font-bold rounded-2xl hover:opacity-95 transition-all text-sm cursor-pointer shadow-lg shadow-gold/10"
                >
                  حفظ الخبرة / Save Experience
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExp({ isOpen: false, index: null, data: { role: '', clinic: '', period: '', description: '' } })}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold rounded-2xl transition-all text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Education Add/Edit Modal */}
      {editingEdu.isOpen && (
        <div className="fixed inset-0 z-[350] bg-dark/95 backdrop-blur-md flex items-center justify-center p-6" dir="ltr">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl"
          >
            <button
              onClick={() => setEditingEdu({ isOpen: false, index: null, data: { degree: '', institution: '', year: '' } })}
              className="absolute top-6 right-6 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-gold" />
              <span>{editingEdu.index === -1 || editingEdu.index === null ? 'Add Education' : 'Edit Education'}</span>
            </h2>

            <form onSubmit={handleSaveEducation} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Degree / Qualification (المؤهل الأكاديمي)</label>
                <input
                  required
                  value={editingEdu.data.degree}
                  onChange={(e) => setEditingEdu({
                    ...editingEdu,
                    data: { ...editingEdu.data, degree: e.target.value }
                  })}
                  placeholder="e.g. Bachelor of Oral and Dental Medicine"
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Institution / University (الجامعة أو الكلية)</label>
                <input
                  required
                  value={editingEdu.data.institution}
                  onChange={(e) => setEditingEdu({
                    ...editingEdu,
                    data: { ...editingEdu.data, institution: e.target.value }
                  })}
                  placeholder="e.g. Delta University"
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Year / Period (سنة التخرج أو الفترة)</label>
                <input
                  required
                  value={editingEdu.data.year}
                  onChange={(e) => setEditingEdu({
                    ...editingEdu,
                    data: { ...editingEdu.data, year: e.target.value }
                  })}
                  placeholder="e.g. 2019 - 2024"
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-grow py-4 bg-gold text-dark font-bold rounded-2xl hover:opacity-95 transition-all text-sm cursor-pointer shadow-lg shadow-gold/10"
                >
                  حفظ المؤهل / Save Education
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEdu({ isOpen: false, index: null, data: { degree: '', institution: '', year: '' } })}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold rounded-2xl transition-all text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Certification Add/Edit Modal */}
      {editingCourse.isOpen && (
        <div className="fixed inset-0 z-[350] bg-dark/95 backdrop-blur-md flex items-center justify-center p-6" dir="ltr">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl"
          >
            <button
              onClick={() => setEditingCourse({ isOpen: false, index: null, data: { name: '', details: '' } })}
              className="absolute top-6 right-6 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-gold" />
              <span>{editingCourse.index === -1 || editingCourse.index === null ? 'Add Certification' : 'Edit Certification'}</span>
            </h2>

            <form onSubmit={handleSaveCourse} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Certification / Program Name (اسم الشهادة أو الدورة)</label>
                <input
                  required
                  value={editingCourse.data.name}
                  onChange={(e) => setEditingCourse({
                    ...editingCourse,
                    data: { ...editingCourse.data, name: e.target.value }
                  })}
                  placeholder="e.g. Mastering Basic & Advanced Endodontics Program"
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Details / Credit Hours (التفاصيل أو ساعات الاعتماد)</label>
                <input
                  required
                  value={editingCourse.data.details}
                  onChange={(e) => setEditingCourse({
                    ...editingCourse,
                    data: { ...editingCourse.data, details: e.target.value }
                  })}
                  placeholder="e.g. 60 Credit Hours / Digital Workflow"
                  className="w-full bg-dark/60 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-grow py-4 bg-gold text-dark font-bold rounded-2xl hover:opacity-95 transition-all text-sm cursor-pointer shadow-lg shadow-gold/10"
                >
                  حفظ الشهادة / Save Certification
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCourse({ isOpen: false, index: null, data: { name: '', details: '' } })}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold rounded-2xl transition-all text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
