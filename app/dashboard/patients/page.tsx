'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/lib/types';
import { patientsApi } from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import PatientModal from '@/components/PatientModal';
import { Edit2, Trash2 } from 'lucide-react';

export default function PatientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const itemsPerPage = 20;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', currentPage],
    queryFn: async () => {
      const response = await patientsApi.getAll({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to delete "${patient.first_name} ${patient.last_name}"?`)) {
      try {
        await deleteMutation.mutateAsync(patient.id);
      } catch (error) {
        alert('Failed to delete patient');
      }
    }
  };

  const handleSave = async (data: FormData) => {
    if (selectedPatient) {
      await updateMutation.mutateAsync({ id: selectedPatient.id, data });
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (row: Patient) => `${row.first_name} ${row.last_name}`,
    },
    {
      header: 'Phone',
      accessor: (row: Patient) => row.phone || 'N/A',
    },
    {
      header: 'Birth Date',
      accessor: (row: Patient) =>
        row.birth_date ? new Date(row.birth_date).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Gender',
      accessor: (row: Patient) => row.gender || 'N/A',
    },
    {
      header: 'Language',
      accessor: 'language' as const,
    },
    {
      header: 'Timezone',
      accessor: 'timezone' as const,
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
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
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage patient profiles</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load patients
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <Table data={data?.patients || []} columns={columns} />
            <Pagination
              currentPage={currentPage}
              totalItems={data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        patient={selectedPatient}
        mode="edit"
      />
    </div>
  );
}
