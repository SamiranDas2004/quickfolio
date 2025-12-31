export interface User {
  id: string;
  username: string; // URL slug
  email: string;
  password: string; // hashed
  name: string; // for TextHoverEffect
  title: string; // e.g., "Full Stack Developer"
  bio: string; // description text
  avatar_url: string;
  background_preference: "ripple" | "beams";
  social_links: SocialLinks;
  projects: Project[];
  skills: string[];
  experience: Experience[];
  contact: ContactInfo;
  created_at: Date;
  updated_at: Date;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  image_url?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
}