import api from "./api";

export const companyService = {
  async getTeam() {
    const response = await api.get("/team_members");
    return response.data.data;
  },

  async createMember(data) {
    const response = await api.post("/team_members", {
      team_member: data,
    });
    return response.data.data;
  },

  async updateMember(id, data) {
    const response = await api.put(`/team_members/${id}`, {
      team_member: data,
    });
    return response.data.data;
  },

  async deleteMember(id) {
    await api.delete(`/team_members/${id}`);
  },

  async getGoals(params = {}) {
    const response = await api.get("/goals", { params });
    return response.data.data;
  },

  async createGoal(data) {
    const response = await api.post("/goals", { goal: data });
    return response.data.data;
  },

  async updateGoal(id, data) {
    const response = await api.put(`/goals/${id}`, { goal: data });
    return response.data.data;
  },

  async deleteGoal(id) {
    await api.delete(`/goals/${id}`);
  },

  async getDocuments(params) {
    const response = await api.get("/documents", { params });
    return response.data.data;
  },

  async createDocument(formData) {
    const response = await api.post("/documents", formData, {
      headers: { 'Content-Type': 'multipart/form-data'}
    });
    return response.data.data;
  },

  async updateDocument(id, formData) {
    const response = await api.put(`/documents/${id}`, formData, {
      headers: { 'Content-Type' : 'multipart/form-data'}
    });
    return response.data.data;
  },

  async deleteDocument(id) {
    await api.delete(`/documents/${id}`);
  },
};
