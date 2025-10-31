'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/lib/types';
import { eventsApi } from '@/lib/api';
import Table from '@/components/Table';
import EventModal from '@/components/EventModal';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function EventsPage() {
  const [searchTitle, setSearchTitle] = useState('');
  const [filterTime, setFilterTime] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', searchTitle, filterTime],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTitle) params.title = searchTitle;
      if (filterTime) params.time_filter = filterTime;

      const response = await eventsApi.getAll(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Event>) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleCreate = () => {
    setModalMode('create');
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(event.id);
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const handleSave = async (data: Partial<Event>) => {
    if (modalMode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (selectedEvent) {
      await updateMutation.mutateAsync({ id: selectedEvent.id, data });
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as const,
    },
    {
      header: 'Description',
      accessor: 'description' as const,
      className: 'text-gray-600 text-sm max-w-xs truncate',
    },
    {
      header: 'Event Date',
      accessor: (row: Event) => new Date(row.event_date).toLocaleString(),
    },
    {
      header: 'Location',
      accessor: 'location' as const,
    },
    {
      header: 'Participants',
      accessor: (row: Event) => `${row.current_participants}/${row.max_participants}`,
    },
    {
      header: 'Actions',
      accessor: (row: Event) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Manage mental health events</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Failed to load events
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <Table data={data?.events || []} columns={columns} />
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        event={selectedEvent}
        mode={modalMode}
      />
    </div>
  );
}
