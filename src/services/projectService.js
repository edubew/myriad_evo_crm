import api from "./api";

export const projectService = {
  async getProjects(params = {}) {
    const response = await api.get("/projects", { params });
    return response.data.data;
  },

  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data) {
    const response = await api.post("/projects", { project: data });
    return response.data.data;
  },

  async updateProject(id, data) {
    const response = await api.put(`/projects/${id}`, { project: data });
    return response.data.data;
  },

  async deleteProject(id) {
    await api.delete(`/projects/${id}`);
  },

  async createTask(projectId, data) {
    const response = await api.post(`/projects/${projectId}/tasks`, {
      task: data,
    });
    return response.data.data;
  },

  async updateTask(projectId, taskId, data) {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, {
      task: data,
    });
    return response.data.data;
  },

  async deleteTask(projectId, taskId) {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  async reorderTasks(projectId, tasks) {
    await api.post(`/projects/${projectId}/tasks/reorder`, { tasks });
  },
};
