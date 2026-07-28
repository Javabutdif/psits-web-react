// src/pages/student/preview.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../api/client';
import type { RecruitmentPosition, Application } from '../../types/recruitment';
import Card from '@/components/ui/card';
import DocumentUploadField from '@/components/ui/document-upload-field';
import Button from '@/components/ui/button';
import ApplicationTimeline from '@/components/ui/application-timeline';

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
   
  // Get position ID from either route or stored data
  const positionId = routePositionId || location.state?.positionId;
   
  // Retrieve preview data from sessionStorage
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
  const [position, setPosition] = useState<RecruitmentPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getPreviewData();
    if (data) {
      setPreviewData(data);
      // Also check if we have position details stored
      if (data.positionId) {
        // Fetch position details
        const fetchPosition = async () => {
          try {
            const resp = await api.get(`/recruitment/positions/${data.positionId}`);
            setPosition(resp.data.data || null);
          } catch (err) {
            console.error('Error fetching position:', err);
          } finally {
            setLoading(false);
          }
        };
        if (data.positionId) fetchPosition();
      } else {
        setLoading(false);
      }
    } else {
      // No preview data, redirect to apply page
      navigate('/apply/' + (positionId || ''), { replace: true });
    }
  }, [getPreviewData, positionId, navigate]);

  const handleSubmit = async () => {
    if (!previewData || !previewData.positionId) {
      alert('No application data found. Please go back and try again.');
      return;
    }

    try {
      // In a full implementation, this would submit the actual files
      const formData = new FormData();
      formData.append('positionId', previewData.positionId);
      
      // Call API endpoint
      const resp = await api.post(`/recruitment/positions/${previewData.positionId}/applications`, formData);
      
      // Clear preview data from sessionStorage
      const key = `previewFormData_${previewData.positionId}`;
      sessionStorage.removeItem(key);
      
      // Navigate to applications dashboard
      navigate('/applications', { replace: true });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Application submission failed. Please try again.');
    }
  };

  const handleBack = () => {
    // Keep the data in sessionStorage for the apply page to access if needed
    navigate('/apply/' + (positionId || ''), { 
      replace: true,
      state: { fromPreview: true }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading preview...</div>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Edit
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Review Your Application</h1>
          <p className="text-gray-600 mt-2">Please verify all information before submitting</p>
        </header>

        <section className="space-y-6">
          {/* Position Details */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Position Details
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Position Title</div>
                  <div className="text-xl font-semibold text-gray-900">{previewData.positionTitle}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <div className="text-gray-700 line-clamp-3">{previewData.positionDescription || ''}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Application Deadline</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(previewData.positionDeadline || '')}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Documents */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="normal" onClick={handleBack} className="flex-1">
              Edit Application
            </Button>
            <Button size="normal" onClick={handleSubmit} className="flex-1">
              Submit Application
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentPreview;
