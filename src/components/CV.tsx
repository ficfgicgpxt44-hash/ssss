import { motion } from 'motion/react';
import { GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { query, collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CVData } from '../types';

const defaultEducation = [
// ...
// (education data)
  { degree: 'Bachelor of Oral and Dental Medicine', institution: 'Delta University', year: '2019 - 2024' },
  { degree: 'Honor Degree (Very Good)', institution: 'Academic Distinction', year: '2024' },
];

const defaultExperience = [
// ...
// (experience data)
  { 
    role: 'First Operator', 
    clinic: 'Shenawi Dental Clinic', 
    period: 'Present',
    description: 'Leading clinical operations and providing comprehensive dental care as the primary operator.'
  },
  { 
    role: 'Operator', 
    clinic: 'Charity Medical Center', 
    period: '2024 - Present',
    description: 'Performing various clinical procedures and providing essential dental services to the community.'
  },
  { 
    role: 'Internship Dentist', 
    clinic: 'MDTC', 
    period: '4 Months',
    description: 'Hands-on clinical internship focused on enhancing clinical skills and patient management.'
  },
  { 
    role: 'Internship Dentist', 
    clinic: 'Delta University', 
    period: '6 Months',
    description: 'Clinical internship within the university clinics, handling diverse dental cases.'
  },
  { 
    role: 'Internship Dentist', 
    clinic: 'Biala Hospital', 
    period: '2 Months',
    description: 'Clinical rotation and internship at a government hospital setting.'
  },
];

const defaultSkills = [
  'High Endodontic Skills',
  'Magnification User (8x Loupes & 3.5x)',
  'Photo Editing & Video Creator',
  'Dental Photography (Camera & Mobile)',
  'Attention to Quality',
  'Basic Exocad',
  'High Restorative Skill',
  'Ethics and Patience',
  'Deal with CBCT',
  'Communication Skills',
];

const defaultCourses = [
  { name: 'Mastering Basic & Advanced Endodontics Program', details: '60 Credit Hours' },
  { name: 'Digital Dentistry Program (Basic & Advanced Exocad Mastering)', details: 'Digital Workflow' },
  { name: 'Dental Aesthetics Program', details: '90 Credit Hours' },
  { name: 'Digital Smile Design (DSD) Program & Dental Photography', details: 'Aesthetic Planning' },
];

export default function CV() {
  const [data, setData] = useState<CVData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const q = query(collection(db, 'cv'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setData(querySnapshot.docs[0].data() as CVData);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const education = data?.education && data.education.length > 0 ? data.education : defaultEducation;
  const experience = data?.experience && data.experience.length > 0 ? data.experience : defaultExperience;
  const specializedSkills = data?.skills && data.skills.length > 0 ? data.skills : defaultSkills;
  const courses = defaultCourses; 

  return (
    <section id="cv" className="py-32 bg-surface px-6 sm:px-6 lg:px-8 border-y border-white/5 relative overflow-hidden" dir="ltr">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-4">Professional <br/><span className="text-gold italic">Journey</span></h2>
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-gold/40"></div>
              <p className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold italic">Curriculum Vitae</p>
            </div>
          </div>
          <div className="text-right hidden lg:block">
            <span className="text-8xl font-serif text-white/5 select-none">RESUME</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
          {/* Education */}
          <div className="space-y-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 text-gold">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-[0.3em] font-black">Education</h3>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-gold/40 to-transparent w-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {education.map((edu, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-card/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-gold/30 transition-all group"
                >
                  <div className="text-gold text-[10px] font-black mb-3 uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">{edu.year}</div>
                  <h4 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-gold transition-colors">{edu.degree}</h4>
                  <p className="text-white/40 text-sm font-medium">{edu.institution}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="lg:col-span-2 space-y-10">
             <div className="space-y-3">
              <div className="inline-flex items-center gap-3 text-gold">
                <Briefcase className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-[0.3em] font-black">Clinical Experience</h3>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-gold/40 to-transparent w-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {experience.map((exp, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-card/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white group-hover:text-gold transition-colors">{exp.role}</h4>
                        <p className="text-white/40 text-sm font-medium tracking-wide">{exp.clinic}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-gold bg-gold/10 px-5 py-2 rounded-full h-fit uppercase tracking-[0.2em] border border-gold/20">
                      {exp.period}
                    </div>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed font-light max-w-2xl">{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialized Skills & Courses Combined */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Skills */}
          <div className="space-y-10">
            <div className="space-y-3">
              <h3 className="text-sm text-gold uppercase tracking-[0.4em] font-black">Clinical Expertise</h3>
              <div className="h-[2px] bg-gradient-to-r from-gold/40 to-transparent w-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specializedSkills.map((skill, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(197, 160, 89, 0.05)' }}
                  className="bg-card/60 border border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-all"
                >
                  <div className="w-2 h-2 bg-gold/40 rounded-full shrink-0" />
                  <span className="text-xs font-bold text-white/60 tracking-wider uppercase">
                    {skill}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-10">
            <div className="space-y-3">
              <h3 className="text-sm text-gold uppercase tracking-[0.4em] font-black">Certifications</h3>
              <div className="h-[2px] bg-gradient-to-r from-gold/40 to-transparent w-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 10 }}
                  className="bg-card/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group transition-all"
                >
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-gold transition-colors">{course.name}</h4>
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-black">{course.details}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-gold group-hover:bg-gold/10 transition-all shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
