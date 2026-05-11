import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api';
import { Task } from '../types';
import { TaskCard } from '../components/TaskCard';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

export const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskApi.getMyPublished({
        page,
        limit: 9,
        status: status || undefined,
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
  }, [page, status, toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const statusOptions = [
    { value: 'ALL', label: '全部状态' },
    { value: 'pending', label: '待接单' },
    { value: 'in_progress', label: '进行中' },
    { value: 'submitted', label: '待验收' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我发布的任务</h1>
          <p className="text-gray-500 mt-1">管理你发布的所有任务</p>
        </div>
        <Select
          value={status || 'ALL'}
          onValueChange={(value) => {
            setStatus(value === 'ALL' ? '' : value);
            setPage(1);
          }}
          options={statusOptions}
          placeholder="全部状态"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">暂无任务</h3>
          <p className="text-gray-500">你还没有发布过任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
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
