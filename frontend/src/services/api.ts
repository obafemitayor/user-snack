import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'usersnap_auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const initializeAuth = async (): Promise<void> => {
  const existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) {
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/token`, {
      user_id: 'demo-user-123'
    });
    const token = response.data.access_token;
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to initialize auth token:', error);
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const data = token ? { Authorization: `Bearer ${token}` } : {};
  return data;
};

const handleAuthError = (error: any): void => {
  if (axios.isAxiosError(error) && error.message === 'Network Error') {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
};

export const pizzaAPI = {
  getAll: async (page: number = 1, limit: number = 10): Promise<AxiosResponse> => {
    try {
      return await api.get(`/pizzas/?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<AxiosResponse> => {
    try {
      return await api.get(`/pizzas/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  create: async (data: FormData): Promise<AxiosResponse> => {
    try {
      return await api.post('/pizzas/', data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  update: async (id: string, data: FormData): Promise<AxiosResponse> => {
    try {
      return await api.put(`/pizzas/${id}`, data, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<AxiosResponse> => {
    try {
      return await api.delete(`/pizzas/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }
};

export const ordersAPI = {
  getAll: async (page: number = 1, limit: number = 10, status: string = 'all'): Promise<AxiosResponse> => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status !== 'all') {
        params.append('status', status);
      }
      return await api.get(`/orders/?${params.toString()}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<AxiosResponse> => {
    try {
      return await api.get(`/orders/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  create: async (data: any): Promise<AxiosResponse> => {
    try {
      return await api.post('/orders/', data, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  update: async (id: string, data: any): Promise<AxiosResponse> => {
    try {
      return await api.put(`/orders/${id}`, data, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<AxiosResponse> => {
    try {
      return await api.put(`/orders/${id}/status`, { status }, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<AxiosResponse> => {
    try {
      return await api.delete(`/orders/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }
};

export const extrasAPI = {
  getAll: async (): Promise<AxiosResponse> => {
    try {
      return await api.get('/extras/', { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<AxiosResponse> => {
    try {
      return await api.get(`/extras/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }
};

export default api;
