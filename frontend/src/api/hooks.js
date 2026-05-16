import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';
import toast from 'react-hot-toast';

// ─── Auth ────────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.user;
    },
    retry: false
  });
}

// ─── Dashboard ───────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/projects/dashboard/stats');
      return data;
    }
  });
}

// ─── Projects ────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data.projects;
    }
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data.project;
    },
    enabled: !!id
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectData) => {
      const { data } = await api.post('/projects', projectData);
      return data.project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Project created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create project')
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: res } = await api.put(`/projects/${id}`, data);
      return res.project;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['project', variables.id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update project')
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Project deleted!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete project')
  });
}

// ─── Members ─────────────────────────────────────────────
export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, email, role }) => {
      const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
      return data.member;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success('Member added!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add member')
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success('Member removed!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to remove member')
  });
}

// ─── Tasks ───────────────────────────────────────────────
export function useTasks(projectId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (filters.overdue) params.set('overdue', 'true');
  if (filters.priority) params.set('priority', filters.priority);
  const query = params.toString();

  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
      return data.tasks;
    },
    enabled: !!projectId
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...taskData }) => {
      const { data } = await api.post(`/projects/${projectId}/tasks`, taskData);
      return data.task;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['project', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task')
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, taskId, ...taskData }) => {
      const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
      return data.task;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['project', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update task')
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, taskId }) => {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['project', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Task deleted!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete task')
  });
}
