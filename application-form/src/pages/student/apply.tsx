import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { submitApplication } from '@/api/recruitment.api';
import DocumentUploadField from '@/components/ui/document-upload-field';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import type { RecruitmentPosition } from '../../types/recruitment';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

const StudentApply = () => {
  const navigate = useNavigate();
  const { positionId } = useParams();
  const [resume, setResume] = useState<File | null>(null);
  const [letter, setLetter] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<RecruitmentPosition | null>(null);
  const [positionLoading, setPositionLoading] = useState(true);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        if (positionId) {
          const resp = await api.get(`/v2/recruitment/positions/${positionId}`);
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
      toast.error('Both resume and application letter are required.');
      return;
    }

    if (!positionId) {
      toast.error('Invalid position ID.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('applicationLetter', letter);

      await submitApplication(positionId, formData);

      toast.success('Application submitted successfully!');
      navigate('/applications', { replace: true });
    } catch (error) {
      toast.error('Application submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (positionLoading || !position) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading position details...
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-3">
              <Send className="h-6 w-6 text-primary" />
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

              <div className="border-t border-gray-100 pt-4">
                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="-ml-1 mr-2 h-5 w-5 animate-spin" />
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
