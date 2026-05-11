import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { TaskReport, REPORT_STATUS_MAP, TASK_STATUS_MAP } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { Dialog } from '../../components/ui/Dialog';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const { toast } = useToast();

  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [handleDialog, setHandleDialog] = useState<{
    open: boolean;
    reportId: number | null;
    action: 'resolve' | 'reject' | 'remove-task';
    handleNote: string;
  }>({
    open: false,
    reportId: null,
    action: 'resolve',
    handleNote: '',
  });

  useEffect(() => {
    loadReports();
  }, [page, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReports({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setReports(response.data.data);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const openHandleDialog = (reportId: number, action: 'resolve' | 'reject' | 'remove-task') => {
    setHandleDialog({
      open: true,
      reportId,
      action,
      handleNote: '',
    });
  };

  const handleAction = async () => {
    if (!handleDialog.reportId) return;

    setActionLoading(true);
    try {
      if (handleDialog.action === 'resolve') {
        await adminApi.resolveReport(handleDialog.reportId, handleDialog.handleNote || undefined);
        toast({ title: '举报已处理', variant: 'success' });
      } else if (handleDialog.action === 'reject') {
        await adminApi.rejectReport(handleDialog.reportId, handleDialog.handleNote || undefined);
        toast({ title: '举报已驳回', variant: 'success' });
      } else if (handleDialog.action === 'remove-task') {
        if (!confirm('确定要下架该任务吗？此操作不可恢复。')) {
          setActionLoading(false);
          return;
        }
        await adminApi.removeTaskByReport(handleDialog.reportId, handleDialog.handleNote || undefined);
        toast({ title: '任务已下架', variant: 'success' });
      }

      setHandleDialog({ open: false, reportId: null, action: 'resolve', handleNote: '' });
      loadReports();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 筛选器 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="resolved">已处理</option>
          <option value="rejected">已驳回</option>
        </select>
      </div>

      {/* 举报列表 */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">暂无举报数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${REPORT_STATUS_MAP[report.status].color}`}
                      >
                        {REPORT_STATUS_MAP[report.status].label}
                      </span>
                      <span className="text-sm text-gray-500">#{report.id}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      任务: {report.task_title || `任务 #${report.task_id}`}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>举报理由: {report.reason}</span>
                      <span>举报人: {report.reporter_name}</span>
                      <span>举报时间: {new Date(report.created_at).toLocaleString('zh-CN')}</span>
                    </div>
                    {report.task_status && (
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${TASK_STATUS_MAP[report.task_status].color}`}
                        >
                          任务状态: {TASK_STATUS_MAP[report.task_status].label}
                        </span>
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === report.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expandedId === report.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  {report.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">详细说明</p>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {report.handle_note && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">处理备注</p>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                        {report.handle_note}
                      </p>
                    </div>
                  )}

                  {report.handler_name && (
                    <p className="text-sm text-gray-500">
                      处理人: {report.handler_name} · 处理时间:{' '}
                      {new Date(report.updated_at).toLocaleString('zh-CN')}
                    </p>
                  )}

                  {report.status === 'pending' && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHandleDialog(report.id, 'remove-task');
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        下架任务
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHandleDialog(report.id, 'resolve');
                        }}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        标记已处理
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHandleDialog(report.id, 'reject');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 处理对话框 */}
      <Dialog
        open={handleDialog.open}
        onOpenChange={(open) =>
          setHandleDialog({ ...handleDialog, open })
        }
        title={
          handleDialog.action === 'remove-task'
            ? '下架任务'
            : handleDialog.action === 'resolve'
            ? '标记已处理'
            : '驳回举报'
        }
        description={
          handleDialog.action === 'remove-task'
            ? '确认下架该任务，任务将被删除'
            : handleDialog.action === 'resolve'
            ? '标记该举报为已处理状态'
            : '驳回该举报，不采取任何行动'
        }
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            处理备注（可选）
          </label>
          <textarea
            value={handleDialog.handleNote}
            onChange={(e) =>
              setHandleDialog({ ...handleDialog, handleNote: e.target.value })
            }
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="输入处理备注..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() =>
              setHandleDialog({ open: false, reportId: null, action: 'resolve', handleNote: '' })
            }
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={handleAction}
            disabled={actionLoading}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              handleDialog.action === 'remove-task'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {actionLoading
              ? '处理中...'
              : handleDialog.action === 'remove-task'
              ? '确认下架'
              : handleDialog.action === 'resolve'
              ? '确认处理'
              : '确认驳回'}
          </button>
        </div>
      </Dialog>
    </div>
  );
};
