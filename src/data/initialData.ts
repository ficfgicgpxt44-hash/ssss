import { Case, CVData } from '../types';

export const defaultCVData: CVData = {
  name: 'Sami Ali',
  title: 'General Dentist',
  summary: 'A motivated 2024 Dentistry graduate with a strong work ethic and an innate ability to learn new techniques quickly. I bring a unique, patient-centered approach to every procedure, combining precision with compassionate care. As a dedicated and adaptable team player, I’m eager to apply my skills and innovative mindset to help improve patient outcomes and contribute positively to a dental practice.',
  education: [
    { degree: 'Bachelor of Oral and Dental Medicine', institution: 'Delta University', year: '2019 - 2024' },
    { degree: 'Honor Degree (Very Good)', institution: 'Academic Distinction', year: '2024' },
  ],
  experience: [
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
  ],
  skills: [
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
  ],
  languages: ['Arabic (Native)', 'English (Fluent)'],
  courses: [
    { name: 'Mastering Basic & Advanced Endodontics Program', details: '60 Credit Hours' },
    { name: 'Digital Dentistry Program (Basic & Advanced Exocad Mastering)', details: 'Digital Workflow' },
    { name: 'Dental Aesthetics Program', details: '90 Credit Hours' },
    { name: 'Digital Smile Design (DSD) Program & Dental Photography', details: 'Aesthetic Planning' },
  ]
};

export const initialCases: Case[] = [
  {
    id: 'case-endo-1',
    createdAt: 1715000000000,
    title: 'Mandibular First Molar Root Canal Treatment',
    category: 'Endodontics',
    description: 'Diagnosis of symptomatic irreversible pulpitis with apical periodontitis. Complete rotary instrumentation under 8x magnification loupes, ultrasonic irrigation activation, and 3D warm vertical compaction obturation.',
    images: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'case-cosmetic-1',
    createdAt: 1715100000000,
    title: 'Anterior Aesthetic Composite Layering (Class IV)',
    category: 'Cosmetic Fillings',
    description: 'Polychromatic anterior composite restoration using anatomical stratification technique. Customized silicone index, progressive shade matching, enamel beveling, and multi-step polishing for natural light refraction.',
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'case-prosth-1',
    createdAt: 1715200000000,
    title: 'Monolithic Zirconia Full-Contour Crown',
    category: 'Prosthodontics',
    description: 'Biomimetic prosthetic preparation with supragingival margins. Digital intraoral scanning, Exocad custom design, and adhesive resin cementation under rubber dam isolation.',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'case-surgery-1',
    createdAt: 1715300000000,
    title: 'Surgical Extraction of Impacted Mandibular Third Molar',
    category: 'Surgery',
    description: 'Class II Position B mesioangular impaction. Atraumatic envelope flap reflection, conservative bone guttering, tooth sectioning under copious irrigation, and primary closure with 4-0 non-resorbable sutures.',
    images: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'case-pedo-1',
    createdAt: 1715400000000,
    title: 'Pediatric Primary Molar Pulpotomy & Stainless Steel Crown',
    category: 'Pedodontics',
    description: 'Coronal pulp amputation in primary mandibular second molar using bioceramic medicament, followed by Hall-adapted stainless steel crown placement for full occlusal protection.',
    images: [
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

