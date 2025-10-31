'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Certificate } from '@/lib/types';
import { certificatesApi } from '@/lib/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function CertificatesPage() {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificates', filterStatus],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;

      const response = await certificatesApi.getAll(params);
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => certificatesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      certificatesApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setSelectedCertificate(null);
    },
  });

  const handleApprove = async (certificate: Certificate) => {
    if (window.confirm(`Are you sure you want to approve this ${certificate.certificate_type} certificate?`)) {
      try {
        await approveMutation.mutateAsync(certificate.id);
      } catch (error) {
        alert('Failed to approve certificate');
      }
    }
  };

  const handleRejectClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertificate) return;

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedCertificate.id,
        reason: rejectionReason,
      });
    } catch (error) {
      alert('Failed to reject certificate');
    }
  };

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
    {
      header: 'Document',
      accessor: (row: Certificate) => (
        <a
          href={row.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-4 h-4" />
          View
        </a>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Certificate) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {row.status !== 'pending' && (
            <span className="text-xs text-gray-500">
              {row.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      ),
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

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectionReason('');
          setSelectedCertificate(null);
        }}
        title="Reject Certificate"
        size="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              You are about to reject the <strong>{selectedCertificate?.certificate_type}</strong> certificate.
              Please provide a reason for rejection.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g., Document is expired, unclear information, etc."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason('');
                setSelectedCertificate(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={rejectMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Certificate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
