'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Event } from '@/lib/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Event>) => Promise<void>;
  event?: Event | null;
  mode: 'create' | 'edit';
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  event,
  mode,
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_participants: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date.slice(0, 16), // Format for datetime-local input
        location: event.location,
        max_participants: event.max_participants,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_participants: 0,
      });
    }
    setError('');
  }, [event, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Event' : 'Edit Event'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Date & Time *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.event_date}
            onChange={(e) =>
              setFormData({ ...formData, event_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Participants *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.max_participants}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_participants: parseInt(e.target.value),
              })
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
