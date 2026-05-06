import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? "https://rag-doc-backend.onrender.com/api" : "/api");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      let delay = 1000;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await new Promise(resolve => setTimeout(resolve, delay));
          const testResponse = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
          if (testResponse.status === 200) {
            return api.request(originalRequest);
          }
        } catch (testError) {
          delay *= 2;
        }
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (!navigator.onLine) {
      throw new Error('You are offline. Please check your internet connection.');
    }
    
    return Promise.reject(error);
  }
);

export const isOnline = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF or image file' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File appears to be empty or corrupted' };
  }
  
  return { valid: true };
};

export const uploadDocument = async (file) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`${API_BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const askQuestion = async (question) => {
  if (!question || typeof question !== 'string') {
    throw new Error('Invalid question');
  }
  
  const sanitized = question.trim().slice(0, 2000);
  
  const response = await api.post(`${API_BASE}/ask`, { question: sanitized });
  return response.data;
};

export const getSuggestedQuestions = async (
  category = "general",
  documentText = "",
) => {
  const response = await api.get(`${API_BASE}/suggested-questions`, {
    params: { category, documentText },
  });
  return response.data;
};

export const compareDocument = async (file, doc1Text, doc1Name) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doc1Text", doc1Text);
  formData.append("doc1Name", doc1Name);

  const response = await api.post(`${API_BASE}/compare`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const findJobs = async (search = "", location = "") => {
  const response = await api.post(`${API_BASE}/jobs`, { search, location });
  return response.data;
};

export const analyzeAtsScore = async (resumeText, jdText = "") => {
  const response = await api.post(`${API_BASE}/ats-score`, {
    resumeText,
    jdText,
  });
  return response.data;
};

export const analyzeFinancial = async (documentText, category = 'financial') => {
  const response = await api.post(`${API_BASE}/financial-analysis`, {
    documentText,
    category,
  });
  return response.data;
};

export default {
  uploadDocument,
  askQuestion,
  getSuggestedQuestions,
  compareDocument,
  findJobs,
  analyzeAtsScore,
  analyzeFinancial,
  isOnline,
  validateFile,
};
