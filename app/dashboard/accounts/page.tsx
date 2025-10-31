"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account } from "@/lib/types";
import { accountsApi } from "@/lib/api";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import AccountModal from "@/components/AccountModal";
import { Search, Plus, Trash2 } from "lucide-react";

export default function AccountsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 20;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["accounts", currentPage, searchEmail, filterRole, filterActive],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (searchEmail) params.email = searchEmail;
      if (filterRole) params.role = filterRole;
      if (filterActive) params.is_active = filterActive;

      const response = await accountsApi.getAll(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (email: string) => accountsApi.create(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => accountsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => accountsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      accountsApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async (account: Account) => {
    if (window.confirm(`Are you sure you want to delete account "${account.email}"?`)) {
      try {
        await deleteMutation.mutateAsync(account.id);
      } catch (error) {
        alert("Failed to delete account");
      }
    }
  };

  const handleSave = async (email: string) => {
    await createMutation.mutateAsync(email);
  };

  const handleToggleActive = async (account: Account) => {
    try {
      if (account.is_active) {
        await deactivateMutation.mutateAsync(account.id);
      } else {
        await activateMutation.mutateAsync(account.id);
      }
    } catch (error) {
      alert("Failed to update account status");
    }
  };

  const handleRoleChange = async (account: Account, newRole: string) => {
    if (window.confirm(`Are you sure you want to change the role of "${account.email}" to ${newRole}?`)) {
      try {
        await updateRoleMutation.mutateAsync({ id: account.id, role: newRole });
      } catch (error) {
        alert("Failed to update role");
      }
    }
  };

  const columns = [
    { header: "Email", accessor: "email" as const },
    {
      header: "Role",
      accessor: (row: Account) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row, e.target.value)}
          className={`px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${
            row.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : row.role === "therapist"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          <option value="admin">admin</option>
          <option value="therapist">therapist</option>
          <option value="patient">patient</option>
        </select>
      ),
    },
    {
      header: "Status",
      accessor: (row: Account) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
            row.is_active
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          title={`Click to ${row.is_active ? "deactivate" : "activate"}`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      header: "Email Verified",
      accessor: (row: Account) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.email_verified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.email_verified ? "Verified" : "Not Verified"}
        </span>
      ),
    },
    {
      header: "Last Login",
      accessor: (row: Account) =>
        row.last_login_at
          ? new Date(row.last_login_at).toLocaleDateString()
          : "Never",
    },
    {
      header: "Actions",
      accessor: (row: Account) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-2">Manage user accounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          Create Account
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="therapist">Therapist</option>
                <option value="patient">Patient</option>
              </select>
              <select
                value={filterActive}
                onChange={(e) => {
                  setFilterActive(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load accounts
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <Table data={data?.data?.accounts || []} columns={columns} />
            <Pagination
              currentPage={currentPage}
              totalItems={data?.data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        mode="create"
      />
    </div>
  );
}
