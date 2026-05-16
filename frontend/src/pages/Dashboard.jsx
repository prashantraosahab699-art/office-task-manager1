import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../api/hooks';
import { 
  CheckCircle2, Clock, ListTodo, AlertCircle, 
  TrendingUp, Calendar, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-surface-500 mt-1">Here's what's happening with your projects today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-5">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">{stat.label}</p>
              <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" /> Recent Activity
            </h2>
          </div>
          
          <div className="card divide-y divide-surface-100">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div key={i} className="p-4 flex items-start gap-4 hover:bg-surface-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {activity.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-900">
                      <span className="font-semibold">{activity.user.name}</span>
                      <span className="text-surface-500"> {activity.action} </span>
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-surface-400">
                <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Calendar size={32} />
                </div>
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Summary */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-surface-900">Active Projects</h2>
          <div className="space-y-3">
            {stats?.activeProjects?.map((project) => (
              <Link 
                key={project.id} 
                to={`/projects/${project.id}`}
                className="card p-4 flex items-center justify-between group hover:border-primary-600 transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{project.name}</p>
                  <p className="text-xs text-surface-500 mt-1">{project._count.tasks} tasks • {project._count.members} members</p>
                </div>
                <ChevronRight size={16} className="text-surface-300 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))}
            <Link to="/projects" className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2">
              View all projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
