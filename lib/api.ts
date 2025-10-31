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
    axiosClient.get<{ therapists: Therapist[]; total: number }>(
      "/therapists/",
      {
        params,
      }
    ),

  getById: (id: string) => axiosClient.get<Therapist>(`/therapists/${id}`),

  getStats: () => axiosClient.get<TherapistStats>("/therapists/stats"),

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
    limit?: number;
    offset?: number;
    therapist_id?: string;
    certificate_type?: string;
    status?: string;
  }) =>
    axiosClient.get<{ certificates: Certificate[]; total: number }>(
      "/certificates/",
      { params }
    ),

  getById: (id: string) => axiosClient.get<Certificate>(`/certificates/${id}`),

  approve: (id: string) => axiosClient.put(`/certificates/${id}/approve/`),

  reject: (id: string, rejection_reason: string) =>
    axiosClient.put(`/certificates/${id}/reject/`, { rejection_reason }),
};

// Patients API
export const patientsApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    axiosClient.get<{ patients: Patient[]; total: number }>("/patients/", {
      params,
    }),

  getById: (id: string) => axiosClient.get<Patient>(`/patients/${id}`),

  getStats: () => axiosClient.get<PatientStats>("/patients/stats"),

  update: (id: string, data: FormData) =>
    axiosClient.put<Patient>(`/patients/${id}`, data),

  delete: (id: string) => axiosClient.delete(`/patients/${id}`),
};

// Events API
export const eventsApi = {
  getAll: (params?: {
    limit?: number;
    offset?: number;
    title?: string;
    time_filter?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    axiosClient.get<{ data: { events: Event[]; total: number } }>("/events/", {
      params,
    }),

  getById: (id: string) => axiosClient.get<{ data: Event }>(`/events/${id}`),

  getStats: () => axiosClient.get<{ data: EventStats }>("/events/stats"),

  create: (data: FormData) =>
    axiosClient.post<{ data: Event }>("/events/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    axiosClient.put<{ data: Event }>(`/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => axiosClient.delete(`/events/${id}`),
};

// Questionnaires API
export const questionnairesApi = {
  getAll: (params?: { is_active?: boolean; limit?: number; offset?: number }) =>
    axiosClient.get<{
      data: {
        count: number;
        limit: number;
        offset: number;
        templates: Questionnaire[];
      };
    }>("/questionnaire-templates/", { params }),

  getById: (id: string) =>
    axiosClient.get<{ data: Questionnaire }>(`/questionnaire-templates/${id}`),

  create: (data: Partial<Questionnaire>) =>
    axiosClient.post<{ data: Questionnaire }>(
      "/questionnaire-templates/",
      data
    ),

  update: (id: string, data: Partial<Questionnaire>) =>
    axiosClient.put<{ data: Questionnaire }>(
      `/questionnaire-templates/${id}`,
      data
    ),

  delete: (id: string) => axiosClient.delete(`/questionnaire-templates/${id}`),

  getResponses: (id: string) =>
    axiosClient.get<{ responses: QuestionnaireResponse[]; total: number }>(
      `/questionnaire-templates/${id}/responses`
    ),
};
