import axios from 'axios';
import { getSession } from 'next-auth/react';

// Check if running in localhost environment
const isLocalhost = typeof window !== 'undefined' && 
                   window.location.hostname === 'localhost';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 second timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for authentication
api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  } catch (error) {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      // No response means backend is unreachable
      error.message = 'Cannot connect to server. Please check your network.';
      console.error('Backend connection failed:', error.message);
      
      // Store offline state
      if (typeof window !== 'undefined') {
        localStorage.setItem('isBackendOffline', 'true');
      }

      // For local development, return mock data
      if (isLocalhost) {
        console.warn('Offline mode - using mock data');
        return Promise.resolve({
          data: {
            id: 'mock-' + Math.random().toString(36).substring(2, 9),
            ...error.config.data ? JSON.parse(error.config.data) : {},
            createdAt: new Date().toISOString()
          }
        });
      }
    }
    
    // Handle unauthorized errors
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login?sessionExpired=true';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Fetches patients for a specific doctor
 * @param {string} doctorId - ID of the doctor
 * @returns {Promise<Object>} - Response data
 */
export const getDoctorsPatients = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/patients`);
    
    // Handle different response formats
    if (response.data.success !== undefined) {
      return response.data; // If using success wrapper
    }
    
    return { 
      success: true, 
      doctor: response.data.doctor || {}, 
      patients: response.data.patients || response.data,
      count: response.data.count || (response.data.patients || response.data).length
    };
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const requestData = {
      name: patientData.name?.trim() || '',
      dob: patientData.dob,
      gender: patientData.gender || 'Other',
      contact_phone: patientData.contact_phone || null,
      contact_email: patientData.contact_email || null,
      medical_history: patientData.medical_history || null,
      doctor_id: patientData.doctor_id || '6d165e14-6b99-47e2-a8cf-1bf50e561c9b'
    };

    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create patient');
    }

    const result = await response.json();
    
    if (!result?.id) {
      throw new Error('Invalid patient data returned from server');
    }

    return result;
  } catch (error) {
    console.error('Patient creation failed:', error);
    throw error;
  }
};

// utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetches patient data including patch tests
 * @param {string} patientId 
 * @returns {Promise<Object>} Combined patient and patch test data
 */
export const getPatientWithPatchTests = async (patientId) => {
  try {
    const [patientRes, patchTestsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/patients/${patientId}`),
      fetch(`${API_BASE_URL}/api/patch-tests/${patientId}`)
    ]);

    if (!patientRes.ok) {
      throw new Error(`Patient fetch failed: ${patientRes.status}`);
    }

    const patient = await patientRes.json();
    const patchTests = patchTestsRes.ok ? await patchTestsRes.json() : { patch_tests: [] };

    return {
      ...patient,
      patchTests: patchTests.patch_tests || []
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Fetches patch tests for a specific patient
 * @param {string} patientId 
 * @returns {Promise<Array>} Array of patch tests
 */

// Enhanced error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
};

// Enhanced fetch wrapper
const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error at ${url}:`, error);
    throw error;
  }
};



/**
 * Creates a new patch test entry
 * @param {Object} testData - { patient_id, test_date, notes }
 * @returns {Promise<Object>} Created test data
 */
export const createPatchTest = async (testData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patch-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Failed to create patch test: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in createPatchTest:', {
      error: error.message,
      testData,
      url: `${API_BASE_URL}/api/patch-tests`
    });
    throw error;
  }
};

/**
 * Schedules all required patch test entries (initial, 48h, 96h, 7d)
 * @param {string} patientId 
 * @param {string} initialDate - YYYY-MM-DD format
 * @returns {Promise<Array>} Array of created test IDs
 */
export const schedulePatchTests = async (patientId, initialDate) => {
  try {
    const testDates = [
      { date: initialDate, note: 'Initial patch test' },
      { date: addDays(initialDate, 2), note: '48th hour' },
      { date: addDays(initialDate, 4), note: '96th hour' },
      { date: addDays(initialDate, 7), note: '7th day' }
    ];

    // Create tests sequentially to avoid race conditions
    const createdTests = [];
    for (const { date, note } of testDates) {
      const test = await createPatchTest({
        patient_id: patientId,
        test_date: date,
        notes: note
      });
      createdTests.push(test);
    }

    return createdTests.map(test => test.id);
  } catch (error) {
    console.error('Error in schedulePatchTests:', {
      error: error.message,
      patientId,
      initialDate
    });
    throw new Error(`Failed to schedule tests: ${error.message}`);
  }
};

// Helper function to add days to a date
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}






/**
 * Get patch tests for a patient
 * @param {string} patientId 
 * @returns {Promise<Array>} Array of patch tests with images
 */
export const getPatchTests = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patch-tests/${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch patch tests');
    const data = await response.json();
    return data.patch_tests || [];
  } catch (error) {
    console.error('Failed to fetch patch tests:', error);
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login?sessionExpired=true';
    }
    return Promise.reject(error);
  }
);



/**
 * Patch Test Image Upload APIs
 */
export const uploadPatchTestImage = async (patientId, testId, file, hoursAfterPatch, notes = '') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('patch_test_id', testId);
  formData.append('hours_after_patch', hoursAfterPatch.toString());
  formData.append('notes', notes);

  const response = await api.post(
    `/patients/${patientId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const uploadPatchTestImages = async (patientId, testId, files, hoursAfterPatch, notes = '') => {
  const uploadResults = [];
  
  // Process files sequentially
  for (const file of files) {
    const result = await uploadPatchTestImage(patientId, testId, file, hoursAfterPatch, notes);
    uploadResults.push(result);
  }
  
  return uploadResults;
};

// Legacy upload functions (maintained for backward compatibility)
export const uploadFiles = async ({ files, testId, fieldName = 'images', onProgress }) => {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append(fieldName, file));
  formData.append('test_id', testId);

  return api.post(`/patients/${testId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress ? (progress) => {
      if (progress.lengthComputable) {
        onProgress(Math.round((progress.loaded / progress.total) * 100));
      }
    } : undefined
  });
};

export const uploadFile = async (file, testId) => {
  return uploadFiles({ files: [file], testId, fieldName: 'image' });
};




export default api;