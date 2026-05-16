import { Link } from 'react-router-dom';
import { useDashboardStats } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban, CheckCircle2, AlertTriangle, ListTodo,
  Clock, ArrowRight, TrendingUp, Zap
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentTasks = data?.recentTasks || [];

  const cards = [
    {
      label: 'Total Projects', value: stats.totalProjects || 0,
      icon: FolderKanban, color: 'from-primary-500 to-blue-500',
      shadow: 'shadow-primary-500/20'
    },
    {
      label: 'Assigned to Me', value: stats.assignedTasks || 0,
      icon: ListTodo, color: 'from-cyan-500 to-teal-500',
      shadow: 'shadow-cyan-500/20'
    },
    {
      label: 'Overdue Tasks', value: stats.overdueTasks || 0,
      icon: AlertTriangle, color: 'from-red-500 to-orange-500',
      shadow: 'shadow-red-500/20', pulse: stats.overdueTasks > 0
    },
    {
      label: 'Completed', value: stats.completedTasks || 0,
      icon: CheckCircle2, color: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  const statusColors = {
    TODO: 'bg-surface-500/20 text-surface-300',
    IN_PROGRESS: 'bg-amber-500/20 text-amber-300',
    DONE: 'bg-emerald-500/20 text-emerald-300'
  };

  const priorityDots = {
    HIGH: 'bg-red-400',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-surface-400'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 slide-up">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-surface-400">Here's an overview of your tasks and projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`glass rounded-2xl p-5 slide-up hover:scale-[1.02] transition-transform duration-300 ${card.shadow}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon size={20} className="text-white" />
              </div>
              {card.pulse && <span className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-red" />}
            </div>
            <p className="text-3xl font-bold text-white mb-0.5">{card.value}</p>
            <p className="text-sm text-surface-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="glass rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Task Progress</h2>
          </div>
          <span className="text-sm text-surface-400">
            {stats.completedTasks || 0} of {stats.assignedTasks || 0} completed
          </span>
        </div>
        <div className="w-full h-3 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${stats.assignedTasks ? (stats.completedTasks / stats.assignedTasks * 100) : 0}%` }}
          />
        </div>
        <div className="flex gap-6 mt-3 text-xs text-surface-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-surface-500" /> Todo: {stats.todoTasks || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress: {stats.inProgressTasks || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Done: {stats.completedTasks || 0}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-6 slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-surface-500">
            <ListTodo size={32} className="mx-auto mb-2 opacity-50" />
            <p>No recent activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                to={`/projects/${task.projectId}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className={`w-2 h-2 rounded-full ${priorityDots[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
                    {task.project?.name}
                    {task.assignedTo ? ` · ${task.assignedTo.name}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.isOverdue && (
                    <span className="text-[10px] font-semibold bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> Overdue
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
