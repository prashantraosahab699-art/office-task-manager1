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
  Timer, CheckCircle2, Circle, UserPlus, Shield, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', icon: Circle, color: 'bg-surface-100 text-surface-600', colBg: 'border-surface-200' },
  IN_PROGRESS: { label: 'In Progress', icon: Timer, color: 'bg-amber-100 text-amber-700', colBg: 'border-amber-200' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', colBg: 'border-emerald-200' }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-surface-100 transition-all"><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-surface-900">{project.name}</h1>
              {isProjectAdmin && <button onClick={openSettings} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all"><Settings size={16} /></button>}
            </div>
            {project.description && <p className="text-sm text-surface-500 mt-1">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-xl">
            {[{ key: 'tasks', label: 'Tasks', icon: ListTodo }, { key: 'members', label: 'Members', icon: Users }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-900'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'tasks' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={openCreateTask} className="btn-primary flex items-center gap-2 shadow-sm"><Plus size={18} /> New Task</button>
            <div className="h-6 w-px bg-surface-200 mx-1 hidden sm:block" />
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-auto py-2"><option value="">All Priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
            <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="w-auto py-2"><option value="">All Assignees</option>{members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className={`flex flex-col h-full bg-surface-50/50 rounded-2xl p-4 border border-surface-200`}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <cfg.icon size={18} className={cfg.color.split(' ')[1]} />
                      <h3 className="font-bold text-surface-900 text-sm uppercase tracking-wider">{cfg.label}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.color}`}>{statusTasks.length}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {statusTasks.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-surface-200 rounded-xl text-surface-400 text-xs">No tasks here</div>
                    ) : (
                      statusTasks.map(task => <TaskCard key={task.id} task={task} isProjectAdmin={isProjectAdmin} onEdit={() => openEditTask(task)} onDelete={() => handleDeleteTask(task.id)} onStatusChange={(s) => handleStatusChange(task.id, s)} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-surface-900">Project Team</h2>
             {isProjectAdmin && <button onClick={() => setShowMemberModal(true)} className="btn-primary text-sm flex items-center gap-2"><UserPlus size={16} /> Add Member</button>}
          </div>
          <div className="card divide-y divide-surface-100 overflow-hidden">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white hover:bg-surface-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">{member.user.name.charAt(0)}</div>
                  <div><p className="font-bold text-surface-900">{member.user.name}</p><p className="text-xs text-surface-500">{member.user.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${member.role === 'ADMIN' ? 'border-primary-200 bg-primary-50 text-primary-600' : 'border-surface-200 bg-surface-50 text-surface-500'}`}>{member.role}</span>
                  {isProjectAdmin && member.userId !== project.createdById && (
                    <button onClick={() => handleRemoveMember(member.userId)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && <Modal onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">Title *</label><input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" autoFocus /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="h-24 resize-none" placeholder="Details..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-surface-700 mb-2">Status</label><select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></div>
            <div><label className="block text-sm font-semibold text-surface-700 mb-2">Priority</label><select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-surface-700 mb-2">Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            <div><label className="block text-sm font-semibold text-surface-700 mb-2">Assignee</label><select value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}><option value="">Unassigned</option>{members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select></div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium">Cancel</button>
            <button type="submit" disabled={createTask.isPending || updateTask.isPending} className="flex-1 btn-primary py-2.5">{editingTask ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>}

      {showMemberModal && <Modal onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">User Email</label><input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="email@company.com" autoFocus /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">Project Role</label><select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium">Cancel</button>
            <button type="submit" disabled={addMember.isPending} className="flex-1 btn-primary py-2.5">{addMember.isPending ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </Modal>}

      {showSettings && <Modal onClose={() => setShowSettings(false)} title="Project Settings">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">Project Name</label><input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-2">Description</label><textarea value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} className="h-24 resize-none" /></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium">Cancel</button>
            <button type="submit" className="btn-primary flex-1 py-2.5">Save Changes</button>
          </div>
          <div className="pt-6 border-t border-surface-100">
            <button type="button" onClick={handleDeleteProject} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold flex items-center justify-center gap-2"><Trash2 size={18} /> Delete Project</button>
          </div>
        </form>
      </Modal>}
    </div>
  );
}
