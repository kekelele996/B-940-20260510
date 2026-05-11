import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { adminApi } from '../../api';
import { useToast } from '../../components/ui/Toast';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total_users: 0,
    total_tasks: 0,
    pending_tasks: 0,
    completed_tasks: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (error) {
        toast({
          title: '加载统计数据失败',
          variant: 'error',
        });
      }
    };
    loadStats();
  }, [toast]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500 mt-1">管理平台用户和任务</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总用户数</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总任务数</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_tasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">待接单任务</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pending_tasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">已完成任务</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed_tasks}</p>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <Link
          to="/admin/users"
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive('/admin/users') || isActive('/admin')
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          用户管理
        </Link>
        <Link
          to="/admin/tasks"
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive('/admin/tasks')
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          任务管理
        </Link>
      </div>

      {/* 内容区域 */}
      <Outlet />
    </div>
  );
};
