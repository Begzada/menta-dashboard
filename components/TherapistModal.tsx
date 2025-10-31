'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Therapist } from '@/lib/types';

interface TherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  therapist?: Therapist | null;
  mode: 'create' | 'edit';
}

export default function TherapistModal({
  isOpen,
  onClose,
  onSave,
  therapist,
  mode,
}: TherapistModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    license_number: '',
    specializations: '',
    years_of_experience: 0,
    education: '',
    languages: '',
    hourly_rate: 0,
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (therapist && mode === 'edit') {
      setFormData({
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        license_number: therapist.license_number,
        specializations: therapist.specializations.join(', '),
        years_of_experience: therapist.years_of_experience,
        education: therapist.education,
        languages: therapist.languages.join(', '),
        hourly_rate: therapist.hourly_rate,
        bio: therapist.bio,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        license_number: '',
        specializations: '',
        years_of_experience: 0,
        education: '',
        languages: '',
        hourly_rate: 0,
        bio: '',
      });
    }
    setError('');
  }, [therapist, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('license_number', formData.license_number);
      formDataToSend.append('specializations', formData.specializations);
      formDataToSend.append('years_of_experience', formData.years_of_experience.toString());
      formDataToSend.append('education', formData.education);
      formDataToSend.append('languages', formData.languages);
      formDataToSend.append('hourly_rate', formData.hourly_rate.toString());
      formDataToSend.append('bio', formData.bio);

      await onSave(formDataToSend);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save therapist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Therapist' : 'Edit Therapist'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number *
          </label>
          <input
            type="text"
            required
            value={formData.license_number}
            onChange={(e) =>
              setFormData({ ...formData, license_number: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specializations * (comma-separated)
          </label>
          <input
            type="text"
            required
            value={formData.specializations}
            onChange={(e) =>
              setFormData({ ...formData, specializations: e.target.value })
            }
            placeholder="e.g., Anxiety, Depression, PTSD"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.years_of_experience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  years_of_experience: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate * ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourly_rate: parseFloat(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Languages * (comma-separated)
          </label>
          <input
            type="text"
            required
            value={formData.languages}
            onChange={(e) =>
              setFormData({ ...formData, languages: e.target.value })
            }
            placeholder="e.g., English, Spanish, French"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education *
          </label>
          <input
            type="text"
            required
            value={formData.education}
            onChange={(e) =>
              setFormData({ ...formData, education: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            required
            rows={4}
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
