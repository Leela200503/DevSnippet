import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// User Service
export const userService = {
  getUserProfile: (id) => apiClient.get(`/users/${id}/profile`),
  updateProfile: (data) => apiClient.put('/users/profile', data),
};

// Snippet Service
export const snippetService = {
  createSnippet: (data) => apiClient.post('/snippets', data),
  getSnippetById: (id) => apiClient.get(`/snippets/${id}`),
  getUserSnippets: (page = 0, size = 10) =>
    apiClient.get('/snippets/user/all', { params: { page, size } }),
  searchUserSnippets: (title, language, page = 0, size = 10) =>
    apiClient.get('/snippets/user/search', {
      params: { title, language, page, size },
    }),
  getPublicSnippets: (title, language, tag, page = 0, size = 10) =>
    apiClient.get('/snippets/public', {
      params: { title, language, tag, page, size },
    }),
  updateSnippet: (id, data) => apiClient.put(`/snippets/${id}`, data),
  deleteSnippet: (id) => apiClient.delete(`/snippets/${id}`),
  getFavoriteSnippets: () => apiClient.get('/snippets/favorites'),
};

// Social Service
export const socialService = {
  likeSnippet: (id) => apiClient.post(`/social/snippets/${id}/like`),
  unlikeSnippet: (id) => apiClient.post(`/social/snippets/${id}/unlike`),
  favoriteSnippet: (id) => apiClient.post(`/social/snippets/${id}/favorite`),
  unfavoriteSnippet: (id) => apiClient.post(`/social/snippets/${id}/unfavorite`),
  addComment: (id, content) =>
    apiClient.post(`/social/snippets/${id}/comment`, { content }),
  getComments: (id) => apiClient.get(`/social/snippets/${id}/comments`),
  followUser: (id) => apiClient.post(`/social/users/${id}/follow`),
  unfollowUser: (id) => apiClient.post(`/social/users/${id}/unfollow`),
};
