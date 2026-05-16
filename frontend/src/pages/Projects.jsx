import { useState } from 'react';
import { useProjects, useCreateProject } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, Calendar, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await createProject.mutateAsync(formData);
    setFormData({ name: '', description: '' });
    setShowModal(false);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Projects</h1>
          <p className="text-surface-500 mt-1">Manage your team's workspaces and goals.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length > 0 ? (
          projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="card p-6 card-hover group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                  <FolderKanban size={24} />
                </div>
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-surface-200 flex items-center justify-center text-[10px] font-bold text-surface-600 overflow-hidden">
                      {m.user.name.charAt(0)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-surface-100 flex items-center justify-center text-[10px] font-bold text-surface-400">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-surface-500 line-clamp-2 mb-6 h-10">
                {project.description || 'No description provided.'}
              </p>

              <div className="pt-4 border-t border-surface-100 flex items-center justify-between text-xs font-medium text-surface-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><Users size={14} /> {project.members?.length}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary-600" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6 text-surface-300">
                <FolderKanban size={40} />
             </div>
             <h3 className="text-xl font-bold text-surface-900 mb-2">No projects yet</h3>
             <p className="text-surface-500 mb-8">Get started by creating your first team workspace.</p>
             {isAdmin && <button onClick={() => setShowModal(true)} className="btn-primary">Create First Project</button>}
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Create New Project">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Project Name</label>
              <input 
                type="text" 
                required
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What is this project about?"
                className="h-24 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 text-surface-600 hover:bg-surface-50 font-medium">
                Cancel
              </button>
              <button type="submit" disabled={createProject.isPending} className="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
