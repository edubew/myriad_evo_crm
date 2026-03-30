import api from "./api";

export const financeService = {
  async getAllocation() {
    const response = await api.get("/allocation_setting");
    return response.data.data;
  },

  async updateAllocation(data) {
    const response = await api.put("/allocation_setting", {
      allocation_setting: data,
    });
    return response.data.data;
  },

  async getRevenue(params = {}) {
    const response = await api.get("/revenue_entries", { params });
    return response.data;
  },

  async createEntry(data) {
    const response = await api.post("/revenue_entries", {
      revenue_entry: data,
    });
    return response.data.data;
  },

  async updateEntry(id, data) {
    const response = await api.put(`/revenue_entries/${id}`, {
      revenue_entry: data,
    });
    return response.data.data;
  },

  async deleteEntry(id) {
    await api.delete(`/revenue_entries/${id}`);
  },

  async getInvoices(params = {}) {
    const response = await api.get("/invoices", { params });
    return response.data;
  },

  async createInvoice(data) {
    const response = await api.post("/invoices", { invoice: data });
    return response.data.data;
  },

  async updateInvoice(id, data) {
    const response = await api.put(`/invoices/${id}`, { invoice: data });
    return response.data.data;
  },

  async deleteInvoice(id) {
    await api.delete(`/invoices/${id}`);
  },
};
