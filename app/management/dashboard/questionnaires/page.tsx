"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Questionnaire } from "@/lib/types";
import { questionnairesApi } from "@/lib/api";
import Table from "@/components/Table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuestionnairesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      const response = await questionnairesApi.getAll();
      return response.data.data;
    },
  });

  console.log(data);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionnairesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    },
  });

  const handleDelete = async (questionnaire: Questionnaire) => {
    if (
      window.confirm(`Are you sure you want to delete "${questionnaire.name}"?`)
    ) {
      try {
        await deleteMutation.mutateAsync(questionnaire.id);
      } catch (error) {
        alert("Failed to delete questionnaire");
      }
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
    },
    {
      header: "Description",
      accessor: (row: Questionnaire) => row.description || "-",
      className: "text-gray-600 text-sm max-w-xs truncate",
    },
    {
      header: "Questions",
      accessor: (row: Questionnaire) =>
        row.questions ? Object.keys(row.questions).length : 0,
    },
    {
      header: "Status",
      accessor: (row: Questionnaire) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Questionnaire) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/management/dashboard/questionnaires/${row.id}/edit`)
            }
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600 mt-2">
            Manage patient assessment questionnaires
          </p>
        </div>
        <button
          onClick={() => router.push("/management/dashboard/questionnaires/create")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          Create Questionnaire
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load questionnaires
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table data={data?.templates || []} columns={columns} />
        )}
      </div>
    </div>
  );
}
