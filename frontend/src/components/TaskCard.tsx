import { Link } from 'react-router-dom';
import { Task, TASK_STATUS_MAP } from '../types';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const statusInfo = TASK_STATUS_MAP[task.status];

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {task.title}
          </h3>
          <p className="text-sm text-gray-500">
            发布者: {task.publisher_name || '未知'}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
          {task.category}
        </span>
        {task.skills?.slice(0, 3).map((skill, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
        <div className="flex items-center space-x-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100/50">
            <p className="text-xs text-gray-500 font-medium mb-1">预算</p>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ¥{Number(task.budget).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">截止日期</p>
            <p className="text-sm font-semibold text-gray-700">
              {new Date(task.deadline).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
