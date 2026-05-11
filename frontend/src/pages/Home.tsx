import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api';
import { Task, TASK_CATEGORIES } from '../types';
import { TaskCard } from '../components/TaskCard';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

export const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: 'pending',
    search: '',
    sort: '',
  });
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskApi.getList({
        page,
        limit: 9,
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const categoryOptions = [
    { value: 'ALL', label: '全部分类' },
    ...TASK_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const statusOptions = [
    { value: 'ALL', label: '全部状态' },
    { value: 'pending', label: '待接单' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
  ];

  const sortOptions = [
    { value: 'ALL', label: '默认排序' },
    { value: 'budget_desc', label: '预算从高到低' },
    { value: 'budget_asc', label: '预算从低到高' },
    { value: 'deadline', label: '截止日期最近' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              任务大厅
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              发现优质任务，开启你的自由职业之旅
            </p>
          </div>
        </div>
      </div>

      {/* 筛选栏 - Enhanced with modern design */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="搜索任务..."
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm hover:shadow-md"
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              setFilters({ ...filters, category: value === 'ALL' ? '' : value });
              setPage(1);
            }}
            options={categoryOptions}
            placeholder="全部分类"
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
            value={filters.sort || 'ALL'}
            onValueChange={(value) => {
              setFilters({ ...filters, sort: value === 'ALL' ? '' : value });
              setPage(1);
            }}
            options={sortOptions}
            placeholder="默认排序"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 任务列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-24 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无任务</h3>
          <p className="text-gray-500">当前没有符合条件的任务，请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-12 mb-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all bg-white"
          >
            上一页
          </button>
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
            <span className="text-sm font-semibold text-gray-700">
              第 {page} / {totalPages} 页
            </span>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md transition-all bg-white"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};
