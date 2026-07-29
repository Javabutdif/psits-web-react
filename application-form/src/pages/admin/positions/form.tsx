import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/client';
import { toast } from 'sonner';
import type { ApiResponse, RecruitmentPosition } from '../../../types/recruitment';

type HiringStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

type PositionFormState = {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  hiringStatus: HiringStatus;
  isActive: boolean;
  applicationDeadline: string;
  sortOrder: number;
};

const emptyPosition: PositionFormState = {
  title: '',
  description: '',
  responsibilities: [''],
  requirements: [''],
  hiringStatus: 'OPEN',
  isActive: true,
  applicationDeadline: '',
  sortOrder: 0,
};

const toDateTimeLocalValue = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const normalizeListField = (values: string[]) => {
  return values.length > 0 ? values : [''];
};

const AdminPositionsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [position, setPosition] = useState<PositionFormState>(emptyPosition);
  const [fetchingPosition, setFetchingPosition] = useState(isEditing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) {
      setFetchingPosition(false);
      setPosition(emptyPosition);
      return;
    }

    let cancelled = false;

    const fetchPosition = async () => {
      setFetchingPosition(true);
      try {
        const response = await api.get<ApiResponse<RecruitmentPosition>>(
          `/v2/recruitment/positions/${id}`
        );
        const currentPosition = response.data.data;

        if (cancelled) return;

        setPosition({
          title: currentPosition.title,
          description: currentPosition.description,
          responsibilities: normalizeListField(currentPosition.responsibilities),
          requirements: normalizeListField(currentPosition.requirements),
          hiringStatus: currentPosition.hiringStatus,
          isActive: currentPosition.isActive,
          applicationDeadline: toDateTimeLocalValue(currentPosition.applicationDeadline),
          sortOrder: currentPosition.sortOrder,
        });
      } catch (error) {
        console.error('Error fetching position:', error);
        toast.error('Failed to load position details');
        navigate('/admin/positions', { replace: true });
      } finally {
        if (!cancelled) setFetchingPosition(false);
      }
    };

    fetchPosition();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, navigate]);

  const updateField = <K extends keyof PositionFormState>(
    field: K,
    value: PositionFormState[K]
  ) => {
    setPosition((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (
    field: 'responsibilities' | 'requirements',
    index: number,
    value: string
  ) => {
    setPosition((prev) => {
      const nextValues = [...prev[field]];
      nextValues[index] = value;
      return { ...prev, [field]: nextValues };
    });
  };

  const addArrayItem = (field: 'responsibilities' | 'requirements') => {
    setPosition((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'responsibilities' | 'requirements', index: number) => {
    setPosition((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        await api.patch(`/v2/recruitment/positions/${id}`, position);
      } else {
        await api.post('/v2/recruitment/positions', position);
      }
      toast.success('Position saved successfully');
      navigate('/admin/positions', { replace: true });
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save position');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPosition) {
    return <div className="py-12 text-center text-sm text-gray-600">Loading position...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {isEditing ? 'Edit Position' : 'Create Position'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure recruitment details, visibility, and deadlines.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="surface space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">Title *</label>
          <input
            type="text"
            value={position.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            placeholder="Position title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">Description *</label>
          <textarea
            value={position.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={5}
            className="flex w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            placeholder="Job description"
            required
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Responsibilities</div>
            {position.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  placeholder={`Responsibility ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('responsibilities', index)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Add Responsibility
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">Requirements</div>
            {position.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  placeholder={`Requirement ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('requirements', index)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Add Requirement
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Hiring Status *</label>
            <select
              value={position.hiringStatus}
              onChange={(e) => updateField('hiringStatus', e.target.value as HiringStatus)}
              className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Active</label>
            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={position.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
              />
              Make position visible
            </label>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Application Deadline</label>
            <input
              type="datetime-local"
              value={position.applicationDeadline}
              onChange={(e) => updateField('applicationDeadline', e.target.value)}
              className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Sort Order</label>
            <input
              type="number"
              value={position.sortOrder}
              onChange={(e) => updateField('sortOrder', Number(e.target.value) || 0)}
              className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Position'}
          </button>
          <Link
            to="/admin/positions"
            className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminPositionsForm;
