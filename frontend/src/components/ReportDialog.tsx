import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from './ui/Dialog';
import { taskApi, reportApi } from '../api';
import { useToast } from './ui/Toast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  onSuccess?: () => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onOpenChange,
  taskId,
  onSuccess,
}) => {
  const [reasons, setReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const loadReasons = async () => {
        try {
          const response = await reportApi.getReasons();
          setReasons(response.data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '';
          if (errorMessage.includes('未授权') || errorMessage.includes('登录')) {
            toast({
              title: '请先登录',
              description: '登录后才能举报任务',
              variant: 'error',
            });
            onOpenChange(false);
            navigate('/login');
          }
          console.error('加载举报理由失败', error);
        }
      };
      loadReasons();
      setSelectedReason('');
      setDescription('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({ title: '请选择举报理由', variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await taskApi.report(taskId, {
        reason: selectedReason,
        description: description || undefined,
      });
      toast({ title: '举报提交成功', variant: 'success' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请稍后重试';
      if (errorMessage.includes('未授权') || errorMessage.includes('登录')) {
        toast({
          title: '请先登录',
          description: '登录后才能举报任务',
          variant: 'error',
        });
        onOpenChange(false);
        navigate('/login');
      } else {
        toast({
          title: '举报失败',
          description: errorMessage,
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="举报任务"
      description="请选择举报理由，管理员会尽快处理"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            举报理由 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {reasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-900">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            详细说明（可选）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="请详细描述违规情况..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {description.length}/500
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交举报'}
        </button>
      </div>
    </Dialog>
  );
};
