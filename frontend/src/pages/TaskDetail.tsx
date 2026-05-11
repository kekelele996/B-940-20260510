import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../api';
import { Task, TASK_STATUS_MAP } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Dialog } from '../components/ui/Dialog';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [reviewData, setReviewData] = useState({ rating: 5, content: '' });
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      try {
        const response = await taskApi.getById(parseInt(id));
        setTask(response.data);
      } catch (error) {
        toast({
          title: '加载失败',
          description: error instanceof Error ? error.message : '任务不存在',
          variant: 'error',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [id, navigate, toast]);

  const handleAccept = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      const response = await taskApi.accept(task.id);
      setTask(response.data);
      toast({ title: '接单成功', variant: 'success' });
    } catch (error) {
      toast({
        title: '接单失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task || !submitContent) return;
    setActionLoading(true);
    try {
      const response = await taskApi.submit(task.id, { content: submitContent });
      setTask(response.data);
      setShowSubmitDialog(false);
      setSubmitContent('');
      toast({ title: '提交成功，等待验收', variant: 'success' });
    } catch (error) {
      toast({
        title: '提交失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      const response = await taskApi.complete(task.id);
      setTask(response.data);
      toast({ title: '任务已完成', variant: 'success' });
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      await taskApi.review(task.id, reviewData);
      const response = await taskApi.getById(task.id);
      setTask(response.data);
      setShowReviewDialog(false);
      toast({ title: '评价成功', variant: 'success' });
    } catch (error) {
      toast({
        title: '评价失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!task) return;
    if (!confirm('确定要取消此任务吗？')) return;
    setActionLoading(true);
    try {
      await taskApi.cancel(task.id);
      navigate('/my-tasks');
      toast({ title: '任务已取消', variant: 'success' });
    } catch (error) {
      toast({
        title: '取消失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) return null;

  const statusInfo = TASK_STATUS_MAP[task.status];
  const isPublisher = user?.id === task.publisher_id;
  const isWorker = user?.id === task.worker_id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* 任务详情卡片 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color} mb-3`}>
                {statusInfo.label}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">预算</p>
              <p className="text-2xl font-bold text-gray-900">¥{Number(task.budget).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              发布者: {task.publisher_name}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {task.category}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              截止日期: {new Date(task.deadline).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">任务描述</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
        </div>

        {/* 技能要求 */}
        {task.skills && task.skills.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">技能要求</h2>
            <div className="flex flex-wrap gap-2">
              {task.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 接单者信息 */}
        {task.worker_id && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">接单者</h2>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-700">
                  {task.worker_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{task.worker_name}</p>
                <p className="text-sm text-gray-500">{task.worker_email}</p>
              </div>
            </div>
          </div>
        )}

        {/* 提交内容 */}
        {task.submission && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">提交内容</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 whitespace-pre-wrap">{task.submission.content}</p>
              <p className="text-sm text-gray-400 mt-2">
                提交时间: {new Date(task.submission.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        )}

        {/* 评价 */}
        {task.rating && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">评价</h2>
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= task.rating! ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-gray-600">{task.rating} 分</span>
            </div>
            {task.review_content && (
              <p className="text-gray-600">{task.review_content}</p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="p-6 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {/* 接单按钮 */}
            {isAuthenticated && !isPublisher && task.status === 'pending' && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {actionLoading ? '处理中...' : '立即接单'}
              </button>
            )}

            {/* 提交任务按钮 */}
            {isWorker && task.status === 'in_progress' && (
              <button
                onClick={() => setShowSubmitDialog(true)}
                disabled={actionLoading}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                提交任务
              </button>
            )}

            {/* 确认完成按钮 */}
            {isPublisher && task.status === 'submitted' && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? '处理中...' : '确认完成'}
              </button>
            )}

            {/* 评价按钮 */}
            {isPublisher && task.status === 'completed' && !task.rating && (
              <button
                onClick={() => setShowReviewDialog(true)}
                disabled={actionLoading}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                评价接单者
              </button>
            )}

            {/* 取消任务按钮 */}
            {isPublisher && ['pending', 'in_progress'].includes(task.status) && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                取消任务
              </button>
            )}

            {/* 未登录提示 */}
            {!isAuthenticated && task.status === 'pending' && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                登录后接单
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 提交对话框 */}
      <Dialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        title="提交任务"
        description="请描述你完成的工作内容"
      >
        <textarea
          value={submitContent}
          onChange={(e) => setSubmitContent(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
          placeholder="请详细描述你的工作成果..."
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowSubmitDialog(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!submitContent || actionLoading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {actionLoading ? '提交中...' : '确认提交'}
          </button>
        </div>
      </Dialog>

      {/* 评价对话框 */}
      <Dialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        title="评价接单者"
        description="为接单者的工作表现打分"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewData({ ...reviewData, rating: star })}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-300 transition-colors`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">评价内容（可选）</label>
          <textarea
            value={reviewData.content}
            onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="请输入评价内容..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowReviewDialog(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={handleReview}
            disabled={actionLoading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {actionLoading ? '提交中...' : '提交评价'}
          </button>
        </div>
      </Dialog>
    </div>
  );
};
