export interface PersonaConfig {
  count: number;
  country: string;
}

export interface Persona {
  id: number;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  reviewStyle: string;
  avatarEmoji: string;
  background: string;
}

export interface ReviewAnalysis {
  rating: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  overall: string;
}

export interface Review {
  id: number;
  persona: Persona;
  analysis: ReviewAnalysis;
}

export interface FilePart {
  mimeType: string;
  data: string; // base64 encoded string
}

export interface SummaryAnalysis {
  overallRating: string;
  keyInsights: string;
  commonStrengths: string[];
  suggestedImprovements: string[];
  finalThoughts: string;
}

export interface ReviewData {
  category: string;
  originalContent: string;
  reviews: Review[];
  summary: SummaryAnalysis;
  personas: Persona[];
  timestamp: string;
}
