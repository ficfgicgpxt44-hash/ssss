export interface Case {
  id: string;
  createdAt: number;
  title: string;
  category: "Endodontics" | "Prosthodontics" | "Surgery" | "Pedodontics" | "Cosmetic Fillings";
  description: string;
  images: string[];
}

export interface CVData {
  name: string;
  title: string;
  summary: string;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    role: string;
    clinic: string;
    period: string;
    description: string;
  }[];
  skills: string[];
  languages: string[];
  profileImage?: string;
}
