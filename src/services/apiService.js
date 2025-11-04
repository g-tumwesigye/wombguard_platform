import axios from 'axios';

// FastAPI backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
  'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add request interceptor for error handling
apiClient.interceptors.request.use(
  (config) => {
  // Add JWT token if available
  const token = localStorage.getItem('wombguard_token');
  if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  console.log(' JWT token added to request headers');
  }
  return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
  if (error.response?.status === 401) {
  // Handle unauthorized access
  localStorage.removeItem('authToken');
  localStorage.removeItem('wombguard_token'); 
  localStorage.removeItem('wombguard_user'); 
  window.location.href = '/login';
  }
  return Promise.reject(error);
  }
);

// Prediction endpoints
export const predictionService = {
  async predict(patientData, userEmail) {
  try {
  const response = await apiClient.post('/predict', patientData, {
  params: { user_email: userEmail },
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Prediction failed');
  }
  },

  async getDashboard(role) {
  try {
  const response = await apiClient.get('/dashboard', {
  params: { role },
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard');
  }
  },

  async getPredictionHistory(userEmail) {
  try {
  const response = await apiClient.get('/prediction-history', {
  params: { user_email: userEmail },
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to fetch history');
  }
  },
};

// Chatbot endpoints
export const chatbotService = {
  async sendMessage(message, userId, conversationId = null) {
  try {
  const response = await apiClient.post('/chat', {
  message,
  user_id: userId,
  conversation_id: conversationId,
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Chat request failed');
  }
  },

  async getChatHistory(userId) {
  try {
  const response = await apiClient.get('/chat-history', {
  params: { user_id: userId },
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to fetch chat history');
  }
  },

  async startNewConversation(userId) {
  try {
  const response = await apiClient.post('/chat/new-conversation', {
  user_id: userId,
  });
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to start conversation');
  }
  },
};

// User endpoints
export const userService = {
  async register(userData) {
  try {
  const response = await apiClient.post('/register', userData);
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Registration failed');
  }
  },

  async login(credentials) {
  try {
  const response = await apiClient.post('/login', credentials);
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Login failed');
  }
  },

  async getProfile(userId) {
  try {
  const response = await apiClient.get(`/user/${userId}`);
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
  }
  },

  async updateProfile(userId, updates) {
  try {
  const response = await apiClient.put(`/user/${userId}`, updates);
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.detail || 'Failed to update profile');
  }
  },
};

// Health check
export const healthService = {
  async checkAPI() {
  try {
  const response = await apiClient.get('/');
  return response.data;
  } catch (error) {
  throw new Error('API is not available');
  }
  },
};

export default apiClient;

