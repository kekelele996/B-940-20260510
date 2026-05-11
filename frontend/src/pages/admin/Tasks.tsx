import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { Task, TASK_STATUS_MAP, TASK_CATEGORIES } from '../../types';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';

export const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTasks({
        page,
        limit: 10,
        ...filters,
      });
      setTasks(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDelete = async (task: Task) => {
    if (!confirm(`确定要删除任务「${task.title}」吗？`)) return;
    try {
      await adminApi.deleteTask(task.id);
      loadTasks();
      toast({ title: '删除成功', variant: 'success' });
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const statusOptions = [
    { value: 'ALL', label: '全部状态' },
    { value: 'pending', label: '待接单' },
    { value: 'in_progress', label: '进行中' },
    { value: 'submitted', label: '待验收' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const categoryOptions = [
    { value: 'ALL', label: '全部分类' },
    ...TASK_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">任务管理</h2>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="搜索任务标题..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(value) => {
              setFilters({ ...filters, status: value === 'ALL' ? '' : value });
              setPage(1);
            }}
            options={statusOptions}
            placeholder="全部状态"
          />
          <Select
            value={filters.category || 'ALL'}
            onValueChange={(value) => {
              setFilters({ ...filters, category: value === 'ALL' ? '' : value });
              setPage(1);
            }}
            options={categoryOptions}
            placeholder="全部分类"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无任务</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">预算</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发布者</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => {
                const statusInfo = TASK_STATUS_MAP[task.status];
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-medium text-gray-900 hover:text-gray-600 line-clamp-1"
                      >
                        {task.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        截止: {new Date(task.deadline).toLocaleDateString('zh-CN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ¥{Number(task.budget).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.publisher_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          查看
                        </Link>
                        <button
                          onClick={() => handleDelete(task)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            第 {page} / {totalPages} 页
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};
