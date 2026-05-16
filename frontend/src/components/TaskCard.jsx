import { Trash2, Clock, Calendar } from 'lucide-react';

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  LOW: { label: 'Low', color: 'text-surface-400', bg: 'bg-surface-500/10', dot: 'bg-surface-400' }
};

export default function TaskCard({ task, isProjectAdmin, onEdit, onDelete, onStatusChange }) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      className="glass-light rounded-xl p-3.5 group hover:border-primary-500/20 transition-all duration-200 cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white leading-snug pr-2 group-hover:text-primary-300 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {task.status !== 'DONE' && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-[10px] bg-surface-800 border border-surface-700 rounded-md px-1 py-0.5 text-surface-300"
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          )}
          {isProjectAdmin && (
            <button onClick={onDelete} className="p-1 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-surface-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${priorityConfig.bg} ${priorityConfig.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
          {priorityConfig.label}
        </span>

        {isOverdue && (
          <span className="text-[10px] font-semibold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full flex items-center gap-1 pulse-red">
            <Clock size={9} /> Overdue
          </span>
        )}

        {task.dueDate && !isOverdue && (
          <span className="text-[10px] text-surface-500 flex items-center gap-1">
            <Calendar size={9} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}

        {task.assignedTo && (
          <span className="text-[10px] text-surface-500 flex items-center gap-1 ml-auto">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
              {task.assignedTo.name.charAt(0)}
            </div>
            {task.assignedTo.name.split(' ')[0]}
          </span>
        )}
      </div>
    </div>
  );
}
