// src/api/recruitment.api.ts

import api from './client';
import type { ApplicantFilters } from '../types/recruitment';

// Public endpoints
export const listPositions = (params: any) => api.get('/recruitment/positions', { params });

export const getPositionById = (id: string) => api.get(`/recruitment/positions/${id}`);

// Student endpoints
export const submitApplication = (positionId: string, formData: any) => 
  api.post(`/recruitment/positions/${positionId}/applications`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getApplicationsForUser = () => api.get('/recruitment/applications/me');

export const getApplicationForUser = (id: string) => api.get(`/recruitment/applications/me/${id}`);

// Admin endpoints
export const createPosition = (data: any) => api.post('/recruitment/positions', data);

export const updatePosition = (id: string, data: any) => api.patch(`/recruitment/positions/${id}`, data);

export const toggleHiringStatus = (id: string, status: string) => 
  api.patch(`/recruitment/positions/${id}/hiring-status`, { status });

export const deletePosition = (id: string) => api.delete(`/recruitment/positions/${id}`);

export const getApplicants = (params: ApplicantFilters) => 
  api.get('/recruitment/applicants', { params });

export const getApplicationDetails = (id: string) => api.get(`/recruitment/applications/${id}`);

export const updateApplicationStatus = (id: string, data: any) => 
  api.patch(`/recruitment/applications/${id}/status`, data);

export const createInterview = (applicationId: string, data: any) => 
  api.post(`/recruitment/applications/${applicationId}/interview`, data);

export const updateInterview = (applicationId: string, data: any) => 
  api.patch(`/recruitment/applications/${applicationId}/interview`, data);

export const cancelInterview = (applicationId: string) => 
  api.delete(`/recruitment/applications/${applicationId}/interview`);
