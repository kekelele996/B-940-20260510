import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api';
import { Report, REPORT_REASON_MAP, REPORT_STATUS_MAP, ReportStatus } from '../../types';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [handleDialog, setHandleDialog] = useState<Report | null>(null);
  const [handleAction, setHandleAction] = useState<'resolved' | 'rejected'>('resolved');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReports({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setReports(response.data.data);
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
  }, [page, statusFilter, toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleReport = async () => {
    if (!handleDialog) return;
    setActionLoading(true);
    try {
      await adminApi.handleReport(handleDialog.id, {
        action: handleAction,
        admin_note: adminNote || undefined,
      });
      setHandleDialog(null);
      setAdminNote('');
      loadReports();
      toast({ title: handleAction === 'resolved' ? '已下架任务' : '已驳回举报', variant: 'success' });
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

  const statusOptions = [
    { value: 'ALL', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'resolved', label: '已下架' },
    { value: 'rejected', label: '已驳回' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">举报管理</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            value={statusFilter || 'ALL'}
            onValueChange={(value) => {
              setStatusFilter(value === 'ALL' ? '' : value);
              setPage(1);
            }}
            options={statusOptions}
            placeholder="全部状态"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无举报记录</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">举报理由</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">举报人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => {
                const statusInfo = REPORT_STATUS_MAP[report.status as ReportStatus];
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {report.task_title || `任务#${report.task_id}`}
                      </p>
                      {report.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{report.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {REPORT_REASON_MAP[report.reason]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.reporter_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      {report.status === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setHandleDialog(report);
                              setHandleAction('resolved');
                              setAdminNote('');
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            下架
                          </button>
                          <button
                            onClick={() => {
                              setHandleDialog(report);
                              setHandleAction('rejected');
                              setAdminNote('');
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                          >
                            驳回
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {report.handler_name && `处理人: ${report.handler_name}`}
                          {report.admin_note && (
                            <p className="mt-1 text-gray-400">{report.admin_note}</p>
                          )}
                        </div>
                      )}
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

      <Dialog
        open={!!handleDialog}
        onOpenChange={(open) => { if (!open) setHandleDialog(null); }}
        title={handleAction === 'resolved' ? '下架任务' : '驳回举报'}
        description={
          handleAction === 'resolved'
            ? `确定要下架任务「${handleDialog?.task_title}」吗？下架后任务将被取消。`
            : `确定要驳回对任务「${handleDialog?.task_title}」的举报吗？`
        }
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">处理备注（可选）</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="填写处理说明..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setHandleDialog(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={handleReport}
            disabled={actionLoading}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              handleAction === 'resolved'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {actionLoading ? '处理中...' : handleAction === 'resolved' ? '确认下架' : '确认驳回'}
          </button>
        </div>
      </Dialog>
    </div>
  );
};
