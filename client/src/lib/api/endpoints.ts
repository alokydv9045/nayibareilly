import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { config } from '../constants/app.config'
import { tokenStorage, userStorage } from '../auth/auth-utils'

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

interface IssueData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attachments?: string[];
}

interface IssueUpdate {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
}

interface UserData {
  email: string;
  name: string;
  roles: string[];
  departments: string[];
  password?: string;
}

interface UserUpdate {
  name?: string;
  roles?: string[];
  departments?: string[];
  isActive?: boolean;
}

interface DepartmentUpdate {
  name?: string;
  description?: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
  slaHours?: number;
  isActive?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.api.fullUrl,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = tokenStorage.get()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshResponse = await axios.post(
              `${config.api.fullUrl}/auth/refresh`,
              {},
              { withCredentials: true }
            )

            const newToken = refreshResponse.data.data.accessToken
            tokenStorage.set(newToken)

            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            tokenStorage.remove()
            userStorage.remove()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  async login(credentials: LoginCredentials) {
  const response = await this.axiosInstance.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
  const response = await this.axiosInstance.post('/auth/logout');
    return response.data;
  }

  async refreshToken() {
  const response = await this.axiosInstance.post('/auth/refresh');
    return response.data;
  }

  // Issue methods
  async getIssues(params?: {
    status?: string;
    priority?: string;
    department?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
  const response = await this.axiosInstance.get('/issues', { params });
    return response.data;
  }

  async getIssue(id: string) {
  const response = await this.axiosInstance.get(`/issues/${id}`);
    return response.data;
  }

  async createIssue(issueData: IssueData) {
  const response = await this.axiosInstance.post('/issues', issueData);
    return response.data;
  }

  async updateIssue(id: string, updates: IssueUpdate) {
  const response = await this.axiosInstance.put(`/issues/${id}`, updates);
    return response.data;
  }

  async deleteIssue(id: string) {
  const response = await this.axiosInstance.delete(`/issues/${id}`);
    return response.data;
  }

  async assignIssue(id: string, assigneeId: string) {
  const response = await this.axiosInstance.put(`/issues/${id}`, { assignedToId: assigneeId });
    return response.data;
  }

  async escalateIssue(id: string, reason: string) {
  const response = await this.axiosInstance.put(`/issues/${id}/status`, { status: 'ESCALATED', note: reason });
    return response.data;
  }

  async addIssueComment(id: string, comment: string) {
  const response = await this.axiosInstance.post(`/issues/${id}/comments`, { comment });
    return response.data;
  }

  async checkDuplicates(params: {
    lat: number;
    lng: number;
    categoryId?: string;
    radius?: number;
  }) {
    const response = await this.axiosInstance.get('/issues/check-duplicates', { params });
    return response.data;
  }

  // Department methods
  async getDepartments() {
  const response = await this.axiosInstance.get('/departments');
    return response.data;
  }

  async getDepartment(id: string) {
  const response = await this.axiosInstance.get(`/departments/${id}`);
    return response.data;
  }

  async updateDepartment(id: string, updates: DepartmentUpdate) {
  const response = await this.axiosInstance.patch(`/departments/${id}`, updates);
    return response.data;
  }

  // User methods
  async getUsers(params?: {
    role?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
  const response = await this.axiosInstance.get('/users', { params });
    return response.data;
  }

  async getUser(id: string) {
  const response = await this.axiosInstance.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: UserData) {
  const response = await this.axiosInstance.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, updates: UserUpdate) {
  const response = await this.axiosInstance.patch(`/users/${id}`, updates);
    return response.data;
  }

  async deleteUser(id: string) {
  const response = await this.axiosInstance.delete(`/users/${id}`);
    return response.data;
  }

  // Dashboard methods
  async getDashboardStats() {
  const response = await this.axiosInstance.get('/dashboard/stats');
    return response.data;
  }

  async getDepartmentStats(departmentId?: string) {
  const url = departmentId ? `/dashboard/departments/${departmentId}` : '/dashboard/departments';
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    granularity?: 'day' | 'week' | 'month';
  }) {
  const response = await this.axiosInstance.get('/dashboard/analytics', { params });
    return response.data;
  }

  // Activity logs
  async getActivityLogs(params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
  const response = await this.axiosInstance.get('/dashboard/logs', { params });
    return response.data;
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await this.axiosInstance(config);
    return response.data;
  }

  // Generic HTTP methods
  async get(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  async patch(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;