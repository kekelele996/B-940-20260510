import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api';
import { TaskReport, REPORT_STATUS_MAP, ReportStatus } from '../../types';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [selectedReport, setSelectedReport] = useState<TaskReport | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processType, setProcessType] = useState<'resolve' | 'reject'>('resolve');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, resolved: 0, rejected: 0, total: 0 });
  const { toast } = useToast();

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReports({
        page,
        limit: 10,
        ...filters,
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
  }, [page, filters, toast]);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminApi.getReportStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadReports();
  };

  const handleResolve = (report: TaskReport) => {
    setSelectedReport(report);
    setProcessType('resolve');
    setAdminNote('');
    setShowProcessDialog(true);
  };

  const handleReject = (report: TaskReport) => {
    setSelectedReport(report);
    setProcessType('reject');
    setAdminNote('');
    setShowProcessDialog(true);
  };

  const handleConfirmProcess = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      if (processType === 'resolve') {
        await adminApi.resolveReport(selectedReport.id, { admin_note: adminNote || undefined });
        toast({ title: '举报已处理，任务已下架', variant: 'success' });
      } else {
        await adminApi.rejectReport(selectedReport.id, { admin_note: adminNote || undefined });
        toast({ title: '举报已驳回', variant: 'success' });
      }
      setShowProcessDialog(false);
      setSelectedReport(null);
      setPage(1);
      loadStats();
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
    { value: 'resolved', label: '已处理' },
    { value: 'rejected', label: '已驳回' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">举报管理</h2>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">待处理</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">已处理</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">已驳回</p>
          <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">总计</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
            placeholder="搜索任务或举报人..."
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
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无举报</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">理由</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">举报人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">举报时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => {
                const statusInfo = REPORT_STATUS_MAP[report.status];
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {report.task_title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        {report.reason}
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailDialog(true);
                          }}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          详情
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolve(report)}
                              className="text-sm font-medium text-green-600 hover:text-green-800"
                            >
                              下架
                            </button>
                            <button
                              onClick={() => handleReject(report)}
                              className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                              驳回
                            </button>
                          </>
                        )}
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

      {/* 详情对话框 */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        title="举报详情"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">任务标题</label>
              <p className="text-gray-900">{selectedReport.task_title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">举报理由</label>
              <p className="text-gray-900">{selectedReport.reason}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">详细说明</label>
              <p className="text-gray-900">{selectedReport.description || '无'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">举报人</label>
              <p className="text-gray-900">{selectedReport.reporter_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">举报时间</label>
              <p className="text-gray-900">
                {new Date(selectedReport.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
            {selectedReport.admin_note && (
              <div>
                <label className="block text-sm font-medium text-gray-500">管理员备注</label>
                <p className="text-gray-900">{selectedReport.admin_note}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* 处理对话框 */}
      <Dialog
        open={showProcessDialog}
        onOpenChange={setShowProcessDialog}
        title={processType === 'resolve' ? '确认下架任务' : '确认驳回举报'}
        description={processType === 'resolve' 
          ? '下架后任务将不再显示在列表中' 
          : '驳回后举报状态将更新为已驳回'
        }
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">管理员备注（可选）</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            placeholder="请输入备注..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowProcessDialog(false);
              setSelectedReport(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={handleConfirmProcess}
            disabled={actionLoading}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              processType === 'resolve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {actionLoading ? '处理中...' : (processType === 'resolve' ? '确认下架' : '确认驳回')}
          </button>
        </div>
      </Dialog>
    </div>
  );
};
