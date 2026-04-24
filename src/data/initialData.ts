import { Case } from '../types';

export const initialCases: Case[] = [
  {
    id: '1',
    title: 'Anterior Esthetic Restoration',
    category: 'Cosmetic Fillings',
    description: 'Complete smile transformation using ultra-conservative composite bonding. Patient presented with multiple diastemas and irregular tooth edges. The treatment was performed in a single session without any anesthesia or tooth reduction.',
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Complex Endodontic Treatment',
    category: 'Endodontics',
    description: 'Root canal treatment of a calcified molar using rotary instrumentation and warm vertical compaction. The case was completed under dental microscope magnification to ensure thorough disinfection of the complex canal system.',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 2000000
  },
  {
    id: '3',
    title: 'Full Arch Rehabilitation',
    category: 'Prosthodontics',
    description: 'Comprehensive restorative treatment involving Zirconia crowns and porcelain-fused-to-metal bridges. Restored function and aesthetics for a patient with severe generalized attrition and loss of vertical dimension.',
    images: [
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 3000000
  },
  {
    id: '4',
    title: 'Wisdom Tooth Surgical Extraction',
    category: 'Surgery',
    description: 'Minimally invasive surgical removal of a deeply impacted lower third molar. Specialized surgical techniques were used to preserve the surrounding bone and minimize post-operative swelling and discomfort.',
    images: [
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 4000000
  }
];
