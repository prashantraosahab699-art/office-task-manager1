import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects, useCreateProject } from '../api/hooks';
import {
  FolderKanban, Plus, Users, ListTodo, ArrowRight,
  Search, X
} from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createProject.mutateAsync(form);
    setForm({ name: '', description: '' });
    setShowModal(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 slide-up">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-surface-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              id="project-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all text-sm w-48"
              placeholder="Search projects..."
            />
          </div>
          {user?.role === 'ADMIN' && (
            <button
              id="create-project-btn"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium text-sm hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <FolderKanban size={48} className="mx-auto mb-4 text-surface-600" />
          <p className="text-surface-400 text-lg mb-2">
            {search ? 'No projects match your search' : 'No projects yet'}
          </p>
          {user?.role === 'ADMIN' && !search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-primary-400 hover:text-primary-300 font-medium text-sm inline-flex items-center gap-1"
            >
              Create your first project <ArrowRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="glass rounded-2xl p-6 group hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-purple-500/30 transition-all">
                  <FolderKanban size={20} className="text-primary-400" />
                </div>
                <ArrowRight size={16} className="text-surface-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-surface-400 line-clamp-2 mb-4">{project.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-surface-500 pt-3 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <Users size={12} /> {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <ListTodo size={12} /> {project.openTaskCount} open
                </span>
                <span className="text-surface-600">
                  {project.taskCount} total task{project.taskCount !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="glass rounded-2xl p-6 w-full max-w-md slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Project Name</label>
                <input
                  id="project-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all"
                  placeholder="e.g. Website Redesign"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea
                  id="project-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-white placeholder-surface-500 focus:border-primary-500 transition-all resize-none h-24"
                  placeholder="Brief project description..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  id="project-submit"
                  type="submit"
                  disabled={createProject.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
                >
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
