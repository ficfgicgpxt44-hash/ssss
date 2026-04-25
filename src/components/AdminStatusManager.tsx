import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, Save, Camera } from 'lucide-react';
import { Status } from '../types';
import { StatusService } from '../services/StatusService';

export default function AdminStatusManager() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ image: '', caption: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    const data = await StatusService.getStatuses();
    setStatuses(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return;
    setIsSaving(true);
    try {
      await StatusService.addStatus(formData.image, formData.caption);
      await loadStatuses();
      setIsAdding(false);
      setFormData({ image: '', caption: '' });
    } catch (err) {
      alert("Failed to save status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this status?")) {
      await StatusService.deleteStatus(id);
      await loadStatuses();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDimension = 1080;

            if (width > height) {
                if (width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.6) });
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-white/5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Active Statuses</h2>
          <p className="text-white/30 text-xs mt-1">Statuses disappear automatically after 24 hours</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-dark rounded-xl font-bold hover:scale-105 transition-transform"
        >
          <Camera className="w-4 h-4" />
          Post New Status
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {statuses.map(status => (
            <motion.div 
              layout
              key={status.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-[9/16] bg-surface rounded-2xl overflow-hidden group border border-white/5"
            >
              <img src={status.image} className="w-full h-full object-cover" alt="Status thumbnail" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <p className="text-[10px] text-white/60 truncate">{status.caption || 'No caption'}</p>
              </div>
              <button 
                onClick={() => handleDelete(status.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[400] bg-dark/95 backdrop-blur-md flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-md p-10 relative shadow-2xl"
          >
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-serif text-white mb-8">Create Status</h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div 
                className="aspect-[9/16] bg-dark/50 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-all overflow-hidden relative group"
                onClick={() => document.getElementById('status-upload')?.click()}
              >
                {formData.image ? (
                  <>
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <span>Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-white/10 mb-4" />
                    <span className="text-white/30 font-bold uppercase tracking-widest text-xs">Tap to Upload</span>
                  </>
                )}
                <input id="status-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <input 
                value={formData.caption}
                onChange={e => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Add a caption... (optional)"
                className="w-full bg-dark/50 border border-white/10 rounded-2xl p-4 text-white focus:border-gold transition-all"
              />

              <button 
                type="submit"
                disabled={!formData.image || isSaving}
                className="w-full bg-gold text-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 shadow-xl shadow-gold/20"
              >
                {isSaving ? 'Posting...' : 'Share Status'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
