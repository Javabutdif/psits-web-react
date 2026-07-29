import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Card from '@/components/ui/card';
import DocumentUploadField from '@/components/ui/document-upload-field';
import Button from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, FileText, Briefcase } from 'lucide-react';
import api from '@/api/client';

interface PreviewFormData {
  positionId?: string;
  positionTitle?: string;
  positionDescription?: string;
  positionDeadline?: string;
  resumeBase64?: string;
  letterBase64?: string;
  resumeName?: string;
  letterName?: string;
}

const StudentPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { positionId: routePositionId } = useParams();

  const positionId = routePositionId || location.state?.positionId;

  const getPreviewData = useCallback(() => {
    const key = `previewFormData_${positionId}`;
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }, [positionId]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const [previewData, setPreviewData] = useState<PreviewFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = getPreviewData();
    if (data) {
      setPreviewData(data);
      setLoading(false);
    } else {
      navigate('/apply/' + (positionId || ''), { replace: true });
    }
  }, [getPreviewData, positionId, navigate]);

  const handleSubmit = async () => {
    if (!previewData || !previewData.positionId) {
      toast.error('No application data found. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('positionId', previewData.positionId);

      await api.post(`/v2/recruitment/positions/${previewData.positionId}/applications`, formData);

      const key = `previewFormData_${previewData.positionId}`;
      sessionStorage.removeItem(key);

      toast.success('Application submitted successfully!');
      navigate('/applications', { replace: true });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Application submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/apply/' + (positionId || ''), {
      replace: true,
      state: { fromPreview: true },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-gray-600">Loading preview...</div>
      </div>
    );
  }

  if (!previewData) return null;

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Review Your Application</h1>
          <p className="mt-2 text-gray-600">Please verify all information before submitting</p>
        </header>

        <section className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Position Details
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Position Title</div>
                  <div className="text-xl font-semibold text-gray-900">{previewData.positionTitle}</div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Description</div>
                  <div className="line-clamp-3 text-gray-700">{previewData.positionDescription || ''}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Application Deadline</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{formatDate(previewData.positionDeadline || '')}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Uploaded Documents
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <DocumentUploadField
                  label="Resume"
                  value={previewData.resumeName || null}
                  onChange={() => null}
                  disabled={true}
                />
                <DocumentUploadField
                  label="Application Letter"
                  value={previewData.letterName || null}
                  onChange={() => null}
                  disabled={true}
                />
              </div>
            </Card.Content>
          </Card>

          <div className="flex gap-4 border-t border-gray-200 pt-4">
            <Button variant="outline" size="normal" onClick={handleBack} className="flex-1">
              Edit Application
            </Button>
            <Button size="normal" onClick={handleSubmit} className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentPreview;
