import { cookies } from "next/headers";
import {
  AccountStats,
  TherapistStats,
  PatientStats,
  EventStats,
} from "@/lib/types";
import StatCard from "@/components/StatCard";
import { Users, UserCog, UserCheck, Calendar } from "lucide-react";
import { axiosClient } from "@/lib/axios-client";

async function getDashboardStats(token: string) {
  try {
    // Set token for server-side requests
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const [accountStats, therapistStats, patientStats, eventStats] =
      await Promise.all([
        axiosClient
          .get<{ data: AccountStats }>("/accounts/stats", config)
          .then((res) => res.data.data),
        axiosClient
          .get<{ data: TherapistStats }>("/therapists/stats", config)
          .then((res) => res.data.data),
        axiosClient
          .get<{ data: PatientStats }>("/patients/stats", config)
          .then((res) => res.data.data),
        axiosClient
          .get<{ data: EventStats }>("/events/stats", config)
          .then((res) => res.data.data),
      ]);

    return { accountStats, therapistStats, patientStats, eventStats };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("menta_session")?.value || "";
  const stats = await getDashboardStats(token);

  if (!stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  const { accountStats, therapistStats, patientStats, eventStats } = stats;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to Menta Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Accounts"
          value={accountStats.total_count}
          icon={Users}
          subtitle={`${accountStats.active_count} active`}
        />
        <StatCard
          title="Therapists"
          value={therapistStats.total_therapists}
          icon={UserCog}
          subtitle={`${therapistStats.verified_therapists} verified`}
        />
        <StatCard
          title="Patients"
          value={patientStats.total_patients}
          icon={UserCheck}
        />
        <StatCard
          title="Events"
          value={eventStats.total_events}
          icon={Calendar}
          subtitle={`${eventStats.upcoming_events} upcoming`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Accounts by Role
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Admins</span>
              <span className="font-semibold text-gray-900">
                {accountStats.admin_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Therapists</span>
              <span className="font-semibold text-gray-900">
                {accountStats.therapist_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Patients</span>
              <span className="font-semibold text-gray-900">
                {accountStats.patient_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Support</span>
              <span className="font-semibold text-gray-900">
                {accountStats.support_count}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Accounts</span>
              <span className="font-semibold text-green-600">
                {accountStats.active_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactive Accounts</span>
              <span className="font-semibold text-gray-900">
                {accountStats.inactive_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email Verified</span>
              <span className="font-semibold text-gray-900">
                {accountStats.email_verified_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Therapist Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified</span>
              <span className="font-semibold text-gray-900">
                {therapistStats.verified_therapists}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accepting Patients</span>
              <span className="font-semibold text-gray-900">
                {therapistStats.accepting_patients}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">
                {therapistStats.total_therapists}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
