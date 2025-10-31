'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Match } from '@/lib/types';
import { matchesApi } from '@/lib/api';
import Table from '@/components/Table';

export default function MatchesPage() {
  const [minScore, setMinScore] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', minScore],
    queryFn: async () => {
      const params: Record<string, number> = {};
      if (minScore) params.min_score = parseInt(minScore);

      const response = await matchesApi.getAll(params);
      return response.data;
    },
  });

  const columns = [
    {
      header: 'Patient ID',
      accessor: (row: Match) => row.patient_id.substring(0, 8) + '...',
    },
    {
      header: 'Therapist ID',
      accessor: (row: Match) => row.therapist_id.substring(0, 8) + '...',
    },
    {
      header: 'Match Score',
      accessor: (row: Match) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className={`h-2 rounded-full ${
                row.match_score >= 80 ? 'bg-green-500' :
                row.match_score >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${row.match_score}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.match_score}%</span>
        </div>
      ),
    },
    {
      header: 'Language Match',
      accessor: (row: Match) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.language_match ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.language_match ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Specialization Match',
      accessor: (row: Match) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.specialization_match ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.specialization_match ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: (row: Match) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Therapist-Patient Matches</h1>
        <p className="text-gray-600 mt-2">Manage therapist-patient matching data</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min match score..."
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load matches
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table data={data?.matches || []} columns={columns} />
        )}
      </div>
    </div>
  );
}
