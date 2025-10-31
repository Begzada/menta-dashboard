'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { questionnairesApi } from '@/lib/api';
import { Questionnaire } from '@/lib/types';
import QuestionnaireForm from '@/components/QuestionnaireForm';

export default function CreateQuestionnairePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Questionnaire>) =>
      questionnairesApi.create(data),
  });

  const handleSubmit = async (data: Partial<Questionnaire>) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
      router.push('/management/dashboard/questionnaires');
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/management/dashboard/questionnaires');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Questionnaire
        </h1>
        <p className="text-gray-600 mt-2">
          Design a new patient assessment questionnaire
        </p>
      </div>

      <QuestionnaireForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
