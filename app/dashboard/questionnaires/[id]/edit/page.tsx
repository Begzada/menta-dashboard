'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { questionnairesApi } from '@/lib/api';
import { Questionnaire } from '@/lib/types';
import QuestionnaireForm from '@/components/QuestionnaireForm';

export default function EditQuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['questionnaire', id],
    queryFn: async () => {
      const response = await questionnairesApi.getById(id);
      return response.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Questionnaire>) =>
      questionnairesApi.update(id, data),
  });

  const handleSubmit = async (data: Partial<Questionnaire>) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
      router.push('/dashboard/questionnaires');
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/questionnaires');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Questionnaire
        </h1>
        <p className="text-gray-600 mt-2">Update questionnaire details</p>
      </div>

      <QuestionnaireForm
        questionnaire={questionnaire}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
