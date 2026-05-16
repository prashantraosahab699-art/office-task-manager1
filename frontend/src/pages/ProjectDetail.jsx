import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useProject, useUpdateProject, useDeleteProject,
  useCreateTask, useUpdateTask, useDeleteTask,
  useAddMember, useRemoveMember
} from '../api/hooks';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import {
  ArrowLeft, Settings, Users, ListTodo, Plus, Trash2,
  Timer, CheckCircle2, Circle, UserPlus, Shield
} from 'lucide-react';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', icon: Circle, color: 'bg-surface-500/20 text-surface-300', colBg: 'border-surface-500/20' },
  IN_PROGRESS: { label: 'In Progress', icon: Timer, color: 'bg-amber-500/20 text-amber-300', colBg: 'border-amber-500/20' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-300', colBg: 'border-emerald-500/20' }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTaskMut = useDeleteTask();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '' });
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;
  if (!project) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><p className="text-surface-400 text-lg">Project not found</p></div>;

  const isProjectAdmin = user?.role === 'ADMIN' || project.members?.some(m => m.userId === user?.id && m.role === 'ADMIN');
  const tasks = project.tasks || [];
  const members = project.members || [];
  let filteredTasks = tasks;
  if (filterPriority) filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
  if (filterAssignee) filteredTasks = filteredTasks.filter(t => t.assignedToId === filterAssignee);
  const tasksByStatus = { TODO: filteredTasks.filter(t => t.status === 'TODO'), IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'), DONE: filteredTasks.filter(t => t.status === 'DONE') };

  function openCreateTask() { setEditingTask(null); setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '' }); setShowTaskModal(true); }
  function openEditTask(task) { setEditingTask(task); setTaskForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', assignedToId: task.assignedToId || '' }); setShowTaskModal(true); }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const payload = { ...taskForm, assignedToId: taskForm.assignedToId || null, dueDate: taskForm.dueDate || null };
    if (editingTask) await updateTask.mutateAsync({ projectId: id, taskId: editingTask.id, ...payload });
    else await createTask.mutateAsync({ projectId: id, ...payload });
    setShowTaskModal(false);
  }

  async function handleStatusChange(taskId, newStatus) { await updateTask.mutateAsync({ projectId: id, taskId, status: newStatus }); }
  async function handleDeleteTask(taskId) { if (confirm('Delete this task?')) await deleteTaskMut.mutateAsync({ projectId: id, taskId }); }
  async function handleAddMember(e) { e.preventDefault(); if (!memberForm.email.trim()) return; await addMember.mutateAsync({ projectId: id, ...memberForm }); setMemberForm({ email: '', role: 'MEMBER' }); setShowMemberModal(false); }
  async function handleRemoveMember(userId) { if (confirm('Remove this member?')) await removeMember.mutateAsync({ projectId: id, userId }); }

  async function handleUpdateProject(e) { e.preventDefault(); await updateProject.mutateAsync({ id, ...settingsForm }); setShowSettings(false); }
  async function handleDeleteProject() { if (confirm('Delete this project?')) { await deleteProject.mutateAsync(id); navigate('/projects'); } }
  function openSettings() { setSettingsForm({ name: project.name, description: project.description || '' }); setShowSettings(true); }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 slide-up">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && <p className="text-sm text-surface-400 mt-0.5">{project.description}</p>}
          </div>
        </div>
        {isProjectAdmin && <button onClick={openSettings} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"><Settings size={18} /></button>}
      </div>

      <div className="flex items-center gap-1 mb-6 glass rounded-xl p-1 w-fit slide-up" style={{ animationDelay: '0.1s' }}>
        {[{ key: 'tasks', label: 'Tasks', icon: ListTodo, count: tasks.length }, { key: 'members', label: 'Members', icon: Users, count: members.length }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white'}`}>
            <tab.icon size={15} /> {tab.label} <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-500/30 text-primary-200' : 'bg-white/10 text-surface-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button onClick={openCreateTask} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium text-sm hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25"><Plus size={16} /> Add Task</button>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 rounded-xl bg-surface-800/50 border border-surface-700 text-sm text-surface-300 focus:border-primary-500"><option value="">All Priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
            <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="px-3 py-2 rounded-xl bg-surface-800/50 border border-surface-700 text-sm text-surface-300 focus:border-primary-500"><option value="">All Assignees</option>{members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className={`glass rounded-2xl p-4 border-t-2 ${cfg.colBg}`}>
                  <div className="flex items-center gap-2 mb-4"><cfg.icon size={16} className={cfg.color.split(' ')[1]} /><h3 className="font-semibold text-white text-sm">{cfg.label}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{statusTasks.length}</span></div>
                  <div className="space-y-2 min-h-[100px]">
                    {statusTasks.length === 0 ? <div className="text-center py-8 text-surface-600 text-sm">No tasks</div> : statusTasks.map(task => <TaskCard key={task.id} task={task} isProjectAdmin={isProjectAdmin} onEdit={() => openEditTask(task)} onDelete={() => handleDeleteTask(task.id)} onStatusChange={(s) => handleStatusChange(task.id, s)} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="slide-up" style={{ animationDelay: '0.2s' }}>
          {isProjectAdmin && <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium text-sm mb-5 hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25"><UserPlus size={16} /> Add Member</button>}
          <div className="glass rounded-2xl divide-y divide-white/5">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">{member.user.name.charAt(0)}</div>
                  <div><p className="text-sm font-medium text-white">{member.user.name}</p><p className="text-xs text-surface-500">{member.user.email}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${member.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-300' : 'bg-surface-500/20 text-surface-300'}`}><Shield size={10} /> {member.role}</span>
                  {isProjectAdmin && member.userId !== project.createdById && <button onClick={() => handleRemoveMember(member.userId)} className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && <Modal onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Title *</label><input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all" placeholder="Task title" autoFocus /></div>
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all resize-none h-20" placeholder="Description..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Status</label><select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500"><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></div>
            <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label><select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Assignee</label><select value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500"><option value="">Unassigned</option>{members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:bg-white/5 transition-all font-medium">Cancel</button>
            <button type="submit" disabled={createTask.isPending || updateTask.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50">{editingTask ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>}

      {showMemberModal && <Modal onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label><input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all" placeholder="member@example.com" autoFocus /></div>
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Role</label><select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500"><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:bg-white/5 transition-all font-medium">Cancel</button>
            <button type="submit" disabled={addMember.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold disabled:opacity-50">{addMember.isPending ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </Modal>}

      {showSettings && <Modal onClose={() => setShowSettings(false)} title="Project Settings">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label><input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500 transition-all" /></div>
          <div><label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label><textarea value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white focus:border-primary-500 transition-all resize-none h-24" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:bg-white/5 font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold">Save</button>
          </div>
          <div className="pt-4 border-t border-white/10"><button type="button" onClick={handleDeleteProject} className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium flex items-center justify-center gap-2"><Trash2 size={16} /> Delete Project</button></div>
        </form>
      </Modal>}
    </div>
  );
}
