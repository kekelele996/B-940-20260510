// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: number;
  created_at: string;
  avg_rating?: number;
  published_tasks?: number;
  accepted_tasks?: number;
}

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';

// 任务类型
export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  skills: string[];
  status: TaskStatus;
  publisher_id: number;
  worker_id?: number;
  publisher_name?: string;
  publisher_email?: string;
  worker_name?: string;
  worker_email?: string;
  rating?: number;
  review_content?: string;
  submission?: TaskSubmission;
  created_at: string;
  updated_at: string;
}

// 任务提交
export interface TaskSubmission {
  id: number;
  task_id: number;
  content: string;
  attachment_url?: string;
  created_at: string;
}

// 评价类型
export interface Review {
  id: number;
  task_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  content?: string;
  reviewer_name?: string;
  reviewee_name?: string;
  task_title?: string;
  created_at: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// API响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// 登录响应
export interface LoginResponse {
  user: User;
  token: string;
}

// 任务分类
export const TASK_CATEGORIES = [
  '技术开发',
  '设计创意',
  '文案写作',
  '数据处理',
  '翻译服务',
  '其他'
] as const;

// 任务状态显示
export const TASK_STATUS_MAP: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: '待接单', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  submitted: { label: '待验收', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700' }
};
