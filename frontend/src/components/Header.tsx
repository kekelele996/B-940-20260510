import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">任务平台</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              任务大厅
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/create-task"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/create-task') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  发布任务
                </Link>
                <Link
                  to="/my-tasks"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-tasks') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  我的发布
                </Link>
                <Link
                  to="/my-orders"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-orders') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  我的接单
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    管理后台
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.username}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center px-3 py-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-100 outline-none"
                      onSelect={() => navigate('/profile')}
                    >
                      个人中心
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                    <DropdownMenu.Item
                      className="flex items-center px-3 py-2 text-sm text-red-600 rounded cursor-pointer hover:bg-red-50 outline-none"
                      onSelect={handleLogout}
                    >
                      退出登录
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
