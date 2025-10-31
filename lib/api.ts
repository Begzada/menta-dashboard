import { axiosClient } from "./axios-client";
import {
  Account,
  AccountStats,
  Therapist,
  TherapistStats,
  Patient,
  PatientStats,
  Certificate,
  Event,
  EventStats,
  Match,
  Questionnaire,
  QuestionnaireResponse,
} from "./types";

// Auth API
export const authApi = {
  sendOTP: (email: string) => axiosClient.post("/auth/send-otp", { email }),

  verifyOTP: (email: string, otp: string) =>
    axiosClient.post<{ data: { session_id: string; account: Account } }>(
      "/auth/verify-otp",
      {
        email,
        otp,
      }
    ),

  signOut: () => axiosClient.get("/auth/sign-out"),
};

// Accounts API
export const accountsApi = {
  getAll: (params?: {
    limit?: number;
    offset?: number;
    email?: string;
    role?: string;
    is_active?: string;
  }) =>
    axiosClient.get<{ data: { accounts: Account[]; total: number } }>(
      "/accounts/",
      {
        params,
      }
    ),

  getById: (id: string) => axiosClient.get<Account>(`/accounts/${id}`),

  getStats: () => axiosClient.get<AccountStats>("/accounts/stats/"),

  create: (email: string) => axiosClient.post<Account>("/accounts/", { email }),

  delete: (id: string) => axiosClient.delete(`/accounts/${id}`),

  activate: (id: string) => axiosClient.put(`/accounts/${id}/activate`),

  deactivate: (id: string) => axiosClient.put(`/accounts/${id}/deactivate`),

  updateRole: (id: string, role: string) =>
    axiosClient.put(`/accounts/${id}/role`, { role }),
};

// Therapists API
export const therapistsApi = {
  getAll: (params?: {
    limit?: number;
    offset?: number;
    query?: string;
    specialization?: string;
    language?: string;
    min_rate?: number;
    max_rate?: number;
    is_verified?: boolean;
    is_accepting_patients?: boolean;
  }) =>
    axiosClient.get<{ therapists: Therapist[]; total: number }>("/therapists/", {
      params,
    }),

  getById: (id: string) => axiosClient.get<Therapist>(`/therapists/${id}`),

  getStats: () => axiosClient.get<TherapistStats>("/therapists/stats"),

  create: (data: FormData) => axiosClient.post<Therapist>("/therapists/", data),

  update: (id: string, data: FormData) =>
    axiosClient.put<Therapist>(`/therapists/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/therapists/${id}`),

  updateVerification: (id: string, is_verified: boolean) =>
    axiosClient.put(`/therapists/${id}/verification`, { is_verified }),

  updateAccepting: (id: string, is_accepting_patients: boolean) =>
    axiosClient.put(`/therapists/${id}/accepting`, { is_accepting_patients }),
};

// Certificates API
export const certificatesApi = {
  getAll: (params?: {
    therapist_id?: string;
    certificate_type?: string;
    status?: string;
  }) =>
    axiosClient.get<{ certificates: Certificate[]; total: number }>(
      "/certificates/",
      { params }
    ),

  getById: (id: string) => axiosClient.get<Certificate>(`/certificates/${id}`),

  approve: (id: string) => axiosClient.put(`/certificates/${id}/approve`),

  reject: (id: string, rejection_reason: string) =>
    axiosClient.put(`/certificates/${id}/reject`, { rejection_reason }),
};

// Patients API
export const patientsApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    axiosClient.get<{ patients: Patient[]; total: number }>("/patients/", {
      params,
    }),

  getById: (id: string) => axiosClient.get<Patient>(`/patients/${id}`),

  getStats: () => axiosClient.get<PatientStats>("/patients/stats"),

  create: (data: FormData) => axiosClient.post<Patient>("/patients/", data),

  update: (id: string, data: FormData) =>
    axiosClient.put<Patient>(`/patients/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/patients/${id}`),
};

// Events API
export const eventsApi = {
  getAll: (params?: {
    title?: string;
    time_filter?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    axiosClient.get<{ events: Event[]; total: number }>("/events/", { params }),

  getById: (id: string) => axiosClient.get<Event>(`/events/${id}`),

  getStats: () => axiosClient.get<EventStats>("/events/stats"),

  create: (data: Partial<Event>) => axiosClient.post<Event>("/events/", data),

  update: (id: string, data: Partial<Event>) =>
    axiosClient.put<Event>(`/events/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/events/${id}`),
};

// Matches API
export const matchesApi = {
  getAll: (params?: {
    patient_id?: string;
    therapist_id?: string;
    min_score?: number;
    max_score?: number;
  }) =>
    axiosClient.get<{ matches: Match[]; total: number }>("/matches/", {
      params,
    }),

  getById: (id: string) => axiosClient.get<Match>(`/matches/${id}`),

  create: (data: {
    patient_id: string;
    therapist_id: string;
    match_score: number;
    language_match?: boolean;
    specialization_match?: boolean;
  }) => axiosClient.post<Match>("/matches/", data),

  update: (id: string, data: Partial<Match>) =>
    axiosClient.put<Match>(`/matches/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/matches/${id}`),
};

// Questionnaires API
export const questionnairesApi = {
  getAll: (params?: {
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }) =>
    axiosClient.get<{ questionnaires: Questionnaire[]; total: number }>(
      "/questionnaire-templates/",
      { params }
    ),

  getById: (id: string) =>
    axiosClient.get<Questionnaire>(`/questionnaire-templates/${id}`),

  create: (data: Partial<Questionnaire>) =>
    axiosClient.post<Questionnaire>("/questionnaire-templates/", data),

  update: (id: string, data: Partial<Questionnaire>) =>
    axiosClient.put<Questionnaire>(`/questionnaire-templates/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/questionnaire-templates/${id}`),

  toggleActive: (id: string, is_active: boolean) =>
    axiosClient.put(`/questionnaire-templates/${id}/active`, { is_active }),

  getResponses: (id: string) =>
    axiosClient.get<{ responses: QuestionnaireResponse[]; total: number }>(
      `/questionnaire-templates/${id}/responses`
    ),
};
