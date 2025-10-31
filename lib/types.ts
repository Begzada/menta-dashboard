export interface Account {
  id: string;
  email: string;
  role: 'admin' | 'therapist' | 'patient';
  is_active: boolean;
  email_verified: boolean;
  auth_provider: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Therapist {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  specializations: string[];
  years_of_experience: number;
  education: string;
  languages: string[];
  hourly_rate: number;
  bio: string;
  is_verified: boolean;
  is_accepting_patients: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  therapist_id: string;
  certificate_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  timezone: string;
  language: string;
  bio: string | null;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  patient_id: string;
  therapist_id: string;
  match_score: number;
  language_match: boolean;
  specialization_match: boolean;
  created_at: string;
}

export interface AccountStats {
  total_count: number;
  active_count: number;
  inactive_count: number;
  admin_count: number;
  therapist_count: number;
  patient_count: number;
  support_count: number;
  email_verified_count: number;
}

export interface TherapistStats {
  total_therapists: number;
  verified_therapists: number;
  accepting_patients: number;
}

export interface PatientStats {
  total_patients: number;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  past_events: number;
}

export interface Session {
  session_id: string;
  account: Account;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'scale' | 'yes_no';
  options?: string[];
  order: number;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  patient_id: string;
  answers: Record<string, any>;
  completed_at: string;
  created_at: string;
}
