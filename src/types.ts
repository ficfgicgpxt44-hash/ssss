export interface Case {
  id: string;
  createdAt: number;
  title: string;
  category: "Endodontics" | "Prosthodontics" | "Surgery" | "Pedodontics" | "Cosmetic Fillings";
  description: string;
  images: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface ExperienceItem {
  role: string;
  clinic: string;
  period: string;
  description: string;
}

export interface CourseItem {
  name: string;
  details: string;
}

export interface CVData {
  name: string;
  title: string;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  languages: string[];
  courses?: CourseItem[];
  profileImage?: string;
}

