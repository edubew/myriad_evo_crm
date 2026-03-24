import api from "./api";

export const clientService = {
  async getClients(params = {}) {
    const response = await api.get("/clients", { params });
    return response.data.data;
  },

  async getClient(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  },

  async createClient(data) {
    const response = await api.post("/clients", { client: data });
    return response.data.data;
  },

  async updateClient(id, data) {
    const response = await api.put(`/clients/${id}`, { client: data });
    return response.data.data;
  },

  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  async createContact(clientId, data) {
    const response = await api.post(`/clients/${clientId}/contacts`, {
      contact: data,
    });
    return response.data.data;
  },

  async updateContact(clientId, contactId, data) {
    const response = await api.put(
      `/clients/${clientId}/contacts/${contactId}`,
      { contact: data },
    );
    return response.data.data;
  },

  async deleteContact(clientId, contactId) {
    const response = await api.delete(
      `/clients/${clientId}/contacts/${contactId}`,
    );
    return response.data;
  },
};
