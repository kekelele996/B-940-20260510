import { ApiResponse, LoginResponse, User, Task, PaginatedResponse, Review, TaskReport } from '../types';

const API_BASE = '/api';

// 获取存储的Token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

// 认证API
export const authApi = {
  register: (data: { username: string; password: string; email: string; phone?: string }) =>
    request<ApiResponse<LoginResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<ApiResponse>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<ApiResponse<User>>('/auth/me'),
};

// 任务API
export const taskApi = {
  getList: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<Task>>>(`/tasks?${searchParams}`);
  },

  getById: (id: number) =>
    request<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: string;
    skills?: string[];
  }) =>
    request<ApiResponse<Task>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Task>) =>
    request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<ApiResponse>(`/tasks/${id}`, { method: 'DELETE' }),

  accept: (id: number) =>
    request<ApiResponse<Task>>(`/tasks/${id}/accept`, { method: 'POST' }),

  submit: (id: number, data: { content: string; attachment_url?: string }) =>
    request<ApiResponse<Task>>(`/tasks/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  complete: (id: number) =>
    request<ApiResponse<Task>>(`/tasks/${id}/complete`, { method: 'POST' }),

  cancel: (id: number) =>
    request<ApiResponse>(`/tasks/${id}/cancel`, { method: 'POST' }),

  review: (id: number, data: { rating: number; content?: string }) =>
    request<ApiResponse<Review>>(`/tasks/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  report: (id: number, data: { reason: string; description?: string }) =>
    request<ApiResponse<TaskReport>>(`/tasks/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyPublished: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<Task>>>(`/tasks/my-published?${searchParams}`);
  },

  getMyAccepted: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<Task>>>(`/tasks/my-accepted?${searchParams}`);
  },

  getCategories: () =>
    request<ApiResponse<string[]>>('/tasks/categories'),
};

// 用户API
export const userApi = {
  getById: (id: number) =>
    request<ApiResponse<User>>(`/users/${id}`),

  update: (id: number, data: { email?: string; phone?: string }) =>
    request<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getReviews: (id: number, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<Review> & { avg_rating: number }>>(
      `/users/${id}/reviews?${searchParams}`
    );
  },
};

// 举报API
export const reportApi = {
  getReasons: () =>
    request<ApiResponse<string[]>>('/report/reasons'),
};

// 管理员API
export const adminApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<User>>>(`/admin/users?${searchParams}`);
  },

  updateUserStatus: (id: number, status: number) =>
    request<ApiResponse<User>>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getTasks: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<Task>>>(`/admin/tasks?${searchParams}`);
  },

  deleteTask: (id: number) =>
    request<ApiResponse>(`/admin/tasks/${id}`, { method: 'DELETE' }),

  getStats: () =>
    request<ApiResponse<{
      total_users: number;
      total_tasks: number;
      pending_tasks: number;
      completed_tasks: number;
    }>>('/admin/stats'),

  getReports: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    return request<ApiResponse<PaginatedResponse<TaskReport>>>(`/admin/reports?${searchParams}`);
  },

  resolveReport: (id: number, handle_note?: string) =>
    request<ApiResponse<TaskReport>>(`/admin/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ handle_note }),
    }),

  rejectReport: (id: number, handle_note?: string) =>
    request<ApiResponse<TaskReport>>(`/admin/reports/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ handle_note }),
    }),

  removeTaskByReport: (id: number, handle_note?: string) =>
    request<ApiResponse<TaskReport>>(`/admin/reports/${id}/remove-task`, {
      method: 'POST',
      body: JSON.stringify({ handle_note }),
    }),
};
