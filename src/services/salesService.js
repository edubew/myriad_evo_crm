import api from "./api";

export const salesService = {
  // Deals
  async getDeals(params = {}) {
    const response = await api.get("/deals", { params });
    return response.data;
  },

  async createDeal(data) {
    const response = await api.post("/deals", { deal: data });
    return response.data.data;
  },

  async updateDeal(id, data) {
    const response = await api.put(`/deals/${id}`, { deal: data });
    return response.data.data;
  },

  async deleteDeal(id) {
    await api.delete(`/deals/${id}`);
  },

  async reorderDeals(deals) {
    await api.post("/deals/reorder", { deals });
  },

  // Leads
  async getLeads(params = {}) {
    const response = await api.get("/leads", { params });
    return response.data.data;
  },

  async createLead(data) {
    const response = await api.post("/leads", { lead: data });
    return response.data.data;
  },

  async updateLead(id, data) {
    const response = await api.put(`/leads/${id}`, { lead: data });
    return response.data.data;
  },

  async deleteLead(id) {
    await api.delete(`/leads/${id}`);
  },
};
