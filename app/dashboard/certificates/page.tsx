'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Certificate } from '@/lib/types';
import { certificatesApi } from '@/lib/api';
import Table from '@/components/Table';
import { Search } from 'lucide-react';

export default function CertificatesPage() {
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificates', filterStatus],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;

      const response = await certificatesApi.getAll(params);
      return response.data;
    },
  });

  const columns = [
    {
      header: 'Therapist ID',
      accessor: (row: Certificate) => row.therapist_id.substring(0, 8) + '...',
    },
    {
      header: 'Type',
      accessor: 'certificate_type' as const,
    },
    {
      header: 'Status',
      accessor: (row: Certificate) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'approved' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Issued Date',
      accessor: (row: Certificate) =>
        row.issued_date ? new Date(row.issued_date).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Expiry Date',
      accessor: (row: Certificate) =>
        row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Rejection Reason',
      accessor: (row: Certificate) => row.rejection_reason || 'N/A',
      className: 'text-gray-600 text-sm max-w-xs truncate',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
        <p className="text-gray-600 mt-2">Manage therapist certificates</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load certificates
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table data={data?.certificates || []} columns={columns} />
        )}
      </div>
    </div>
  );
}
