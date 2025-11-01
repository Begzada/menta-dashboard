'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Therapist } from '@/lib/types';
import { therapistsApi } from '@/lib/api';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import TherapistModal from '@/components/TherapistModal';
import { Search, Edit2, Trash2, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';

export default function TherapistsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [filterAccepting, setFilterAccepting] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const itemsPerPage = 20;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['therapists', currentPage, searchQuery, filterVerified, filterAccepting],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (searchQuery) params.query = searchQuery;
      if (filterVerified) params.is_verified = filterVerified === 'true';
      if (filterAccepting) params.is_accepting_patients = filterAccepting === 'true';

      const response = await therapistsApi.getAll(params);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      therapistsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => therapistsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });

  const verificationMutation = useMutation({
    mutationFn: ({ id, is_verified }: { id: string; is_verified: boolean }) =>
      therapistsApi.updateVerification(id, is_verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });

  const acceptingMutation = useMutation({
    mutationFn: ({ id, is_accepting_patients }: { id: string; is_accepting_patients: boolean }) =>
      therapistsApi.updateAccepting(id, is_accepting_patients),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
  });

  const handleEdit = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  const handleDelete = async (therapist: Therapist) => {
    if (window.confirm(`Are you sure you want to delete "${therapist.first_name} ${therapist.last_name}"?`)) {
      try {
        await deleteMutation.mutateAsync(therapist.id);
      } catch (error) {
        alert('Failed to delete therapist');
      }
    }
  };

  const handleSave = async (data: FormData) => {
    if (selectedTherapist) {
      await updateMutation.mutateAsync({ id: selectedTherapist.id, data });
    }
  };

  const handleToggleVerification = async (therapist: Therapist) => {
    try {
      await verificationMutation.mutateAsync({
        id: therapist.id,
        is_verified: !therapist.is_verified,
      });
    } catch (error) {
      alert('Failed to update verification status');
    }
  };

  const handleToggleAccepting = async (therapist: Therapist) => {
    try {
      await acceptingMutation.mutateAsync({
        id: therapist.id,
        is_accepting_patients: !therapist.is_accepting_patients,
      });
    } catch (error) {
      alert('Failed to update accepting patients status');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (row: Therapist) => `${row.first_name} ${row.last_name}`,
    },
    {
      header: 'Specializations',
      accessor: (row: Therapist) => (
        <span className="text-gray-600">{row.specializations.join(', ')}</span>
      ),
    },
    {
      header: 'Languages',
      accessor: (row: Therapist) => (
        <span className="text-gray-600">{row.languages.join(', ')}</span>
      ),
    },
    {
      header: 'Experience',
      accessor: (row: Therapist) => `${row.years_of_experience} years`,
    },
    {
      header: 'Rate',
      accessor: (row: Therapist) => `$${row.hourly_rate}/hr`,
    },
    {
      header: 'Verified',
      accessor: (row: Therapist) => (
        <button
          onClick={() => handleToggleVerification(row)}
          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
            row.is_verified
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
          title={`Click to ${row.is_verified ? 'unverify' : 'verify'}`}
        >
          {row.is_verified ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      header: 'Accepting Patients',
      accessor: (row: Therapist) => (
        <button
          onClick={() => handleToggleAccepting(row)}
          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
            row.is_accepting_patients
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          title={`Click to ${row.is_accepting_patients ? 'stop accepting' : 'accept'} patients`}
        >
          {row.is_accepting_patients ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Therapist) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Therapists</h1>
          <p className="text-gray-600 mt-2">Manage therapist profiles</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or language..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterVerified}
                onChange={(e) => {
                  setFilterVerified(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                value={filterAccepting}
                onChange={(e) => {
                  setFilterAccepting(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">All Accepting</option>
                <option value="true">Accepting Patients</option>
                <option value="false">Not Accepting</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load therapists
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <Table data={data?.therapists || []} columns={columns} />
            <Pagination
              currentPage={currentPage}
              totalItems={data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <TherapistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        therapist={selectedTherapist}
        mode="edit"
      />
    </div>
  );
}
