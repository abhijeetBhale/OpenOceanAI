import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const askQuestion = async (question) => {
  const response = await axios.post(`${API_BASE}/ask`, { question });
  return response.data;
};

export const getSuggestedQuestions = async (
  category = "general",
  documentText = "",
) => {
  const response = await axios.get(`${API_BASE}/suggested-questions`, {
    params: { category, documentText },
  });
  return response.data;
};

export const compareDocument = async (file, doc1Text, doc1Name) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doc1Text", doc1Text);
  formData.append("doc1Name", doc1Name);

  const response = await axios.post(`${API_BASE}/compare`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const findJobs = async (search = "", location = "") => {
  const response = await axios.post(`${API_BASE}/jobs`, { search, location });
  return response.data;
};

export const analyzeAtsScore = async (resumeText, jdText = "") => {
  const response = await axios.post(`${API_BASE}/ats-score`, { resumeText, jdText });
  return response.data;
};

export default {
  uploadDocument,
  askQuestion,
  getSuggestedQuestions,
  compareDocument,
  findJobs,
  analyzeAtsScore,
};
