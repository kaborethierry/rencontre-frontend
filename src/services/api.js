// src/services/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
    } catch (error) {
      console.error('Erreur parsing:', error);
      data = { message: 'Erreur de communication' };
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      const errorMessages = {
        429: 'Trop de requêtes. Veuillez patienter.',
        404: 'Service non trouvé.',
        500: 'Erreur serveur.',
      };
      
      throw new Error(data.message || errorMessages[response.status] || `Erreur ${response.status}`);
    }
    
    return data;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data) {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? {
      'Authorization': `Bearer ${this.getToken()}`
    } : this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data) {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? {
      'Authorization': `Bearer ${this.getToken()}`
    } : this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();