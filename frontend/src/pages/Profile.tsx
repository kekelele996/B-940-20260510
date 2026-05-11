import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api';
import { useToast } from '../components/ui/Toast';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await userApi.update(user.id, formData);
      await refreshUser();
      setEditing(false);
      toast({ title: '保存成功', variant: 'success' });
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        <p className="text-gray-500 mt-1">管理你的账户信息</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 头像区域 */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-gray-700">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user.role === 'admin' ? '管理员' : '普通用户'}
          </p>
        </div>

        {/* 信息区域 */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">用户名</label>
              <p className="text-gray-900">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">邮箱</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">手机号</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="未设置"
                />
              ) : (
                <p className="text-gray-900">{user.phone || '未设置'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">注册时间</label>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({ email: user.email, phone: user.phone || '' });
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                编辑资料
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
