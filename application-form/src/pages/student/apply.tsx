// src/pages/student/apply.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import DocumentUploadField from '@/components/ui/document-upload-field';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import type { RecruitmentPosition } from '../../types/recruitment';

const StudentApply = () => {
  const navigate = useNavigate();
  const { positionId } = useParams();
  const [resume, setResume] = useState<File | null>(null);
  const [letter, setLetter] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<RecruitmentPosition | null>(null);
  const [positionLoading, setPositionLoading] = useState(true);

  // Fetch position details
  useEffect(() => {
    const fetchPosition = async () => {
      try {
        if (positionId) {
          const resp = await api.get(`/recruitment/positions/${positionId}`);
          setPosition(resp.data.data || null);
        }
      } catch (err) {
        console.error('Error fetching position:', err);
      } finally {
        setPositionLoading(false);
      }
    };
    fetchPosition();
  }, [positionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume || !letter) {
      alert('Both resume and application letter are required.');
      return;
    }

    if (!positionId) {
      alert('Invalid position ID.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('applicationLetter', letter);

      await api.post(`/recruitment/positions/${positionId}/applications`, formData);
      
      navigate('/applications', { replace: true });
    } catch (error) {
      alert('Application submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (positionLoading || !position) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading position details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Submit Application for: {position.title}
            </Card.Title>
            <Card.Description>{position.description}</Card.Description>
          </Card.Header>

          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <DocumentUploadField
                label="Resume"
                value={resume}
                onChange={setResume}
                error=""
              />

              <DocumentUploadField
                label="Application Letter"
                value={letter}
                onChange={setLetter}
                error=""
              />

              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  {loading ? (
                    <>
                      <svg className="inline-block animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </Card.Content>

          <Card.Footer>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Note:</span> All files must be PDF format, maximum 5MB each.
            </p>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

export default StudentApply;
