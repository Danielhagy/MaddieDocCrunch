import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth methods
  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Generic methods
  async get(url) {
    return this.client.get(url);
  }

  async post(url, data) {
    return this.client.post(url, data);
  }

  async put(url, data) {
    return this.client.put(url, data);
  }

  async delete(url) {
    return this.client.delete(url);
  }
}

const api = new ApiService();
export default api;
