// src/pages/admin/positions/form.tsx

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams as useParamsRouter, Link } from 'react-router-dom';
import api from '../../../api/client';

const AdminPositionsForm = () => {
  const navigate = useNavigate();
  const { id } = useParamsRouter();
  const isEditing = !!id;
  
  const [position, setPosition] = useState({
    title: '',
    description: '',
    responsibilities: [''],
    requirements: ['', ''],
    hiringStatus: 'OPEN' as const,
    isActive: true,
    applicationDeadline: '',
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing position if editing
  useEffect(() => {
    if (isEditing) {
      // In practice, fetch position data from API
      // setPosition({...});
    }
  }, [isEditing]);

  const handleChange = (field: string, value: any) => {
    setPosition(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayItemChange = (arrayField: 'responsibilities' | 'requirements', index: number, value: string) => {
    setPosition(prev => {
      const updatedArray = [...prev[arrayField]];
      updatedArray[index] = value;
      return { ...prev, [arrayField]: updatedArray };
    });
  };

  const handleRemoveArrayItem = (arrayField: 'responsibilities' | 'requirements', index: number) => {
    setPosition(prev => {
      const updatedArray = prev[arrayField].filter((_, i) => i !== index);
      return { ...prev, [arrayField]: updatedArray };
    });
  };

  const handleAddArrayItem = (arrayField: 'responsibilities' | 'requirements') => {
    setPosition(prev => ({
      ...prev,
      [arrayField]: [...prev[arrayField], '']
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/recruitment/positions/${id}`, position);
      } else {
        await api.post('/recruitment/positions', position);
      }
      navigate('/admin/positions', { replace: true });
    } catch (error) {
      console.error('Error saving position:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Position' : 'Create Position'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm border p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={position.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
            placeholder="Position Title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={position.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
            placeholder="Job description"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
          <div className="space-y-2">
            {position.responsibilities.map((resp, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleArrayItemChange('responsibilities', idx, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
                  placeholder={`Responsibility ${idx + 1}`}
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveArrayItem('responsibilities', idx)}
                  className="px-3 py-2 text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('responsibilities')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Add Responsibility
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
          <div className="space-y-2">
            {position.requirements.map((req, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayItemChange('requirements', idx, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
                  placeholder={`Requirement ${idx + 1}`}
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveArrayItem('requirements', idx)}
                  className="px-3 py-2 text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('requirements')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Add Requirement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Status *</label>
            <select
              value={position.hiringStatus}
              onChange={(e) => handleChange('hiringStatus', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={position.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Make position visible</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
          <input
            type="datetime-local"
            value={position.applicationDeadline}
            onChange={(e) => handleChange('applicationDeadline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={position.sortOrder}
            onChange={(e) => handleChange('sortOrder', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary"
          />
        </div>

        <div className="pt-4 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Position'}
          </button>
          <Link to="/admin/positions" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminPositionsForm;
