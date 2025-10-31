'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import { Event } from '@/lib/types';
import { Upload, X } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
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
    content: '',
    event_date: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event && mode === 'edit') {
      // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:MM)
      const dateObj = new Date(event.event_date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const localDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        title: event.title,
        content: event.content,
        event_date: localDatetime,
      });
      setImagePreview(event.image || '');
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        content: '',
        event_date: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setError('');
  }, [event, mode, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Backend expects FormData with form bindings
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('event_date', new Date(formData.event_date).toISOString());

      // Image is required for create, optional for update
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (mode === 'create') {
        setError('Image is required');
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting FormData:');
      for (const [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      await onSave(submitData);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to save event';
      setError(errorMessage);
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
            Content *
          </label>
          <textarea
            required
            rows={4}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
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
            Event Image {mode === 'create' && '*'}
          </label>

          {imagePreview ? (
            <div className="relative w-full h-48">
              <Image
                src={imagePreview}
                alt="Event preview"
                fill
                className="object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload event image
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          )}
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
