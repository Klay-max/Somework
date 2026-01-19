import axios from 'axios';
import { 
  UploadResponse, 
  AnalysisResponse, 
  AnalysisResultResponse, 
  FixRequest, 
  FixResponse 
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const documentApi = {
  // Upload document
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Analyze document
  analyze: async (documentId: string): Promise<AnalysisResponse> => {
    const response = await apiClient.post(`/api/documents/${documentId}/analyze`);
    return response.data;
  },

  // Get analysis results
  getAnalysis: async (documentId: string, analysisId: string): Promise<AnalysisResultResponse> => {
    const response = await apiClient.get(`/api/documents/${documentId}/analysis/${analysisId}`);
    return response.data;
  },

  // Apply fixes
  fix: async (documentId: string, fixRequest: FixRequest): Promise<FixResponse> => {
    const response = await apiClient.post(`/api/documents/${documentId}/fix`, fixRequest);
    return response.data;
  },

  // Download document
  download: async (documentId: string, format: 'original' | 'fixed' = 'fixed'): Promise<Blob> => {
    const response = await apiClient.get(`/api/documents/${documentId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default apiClient;