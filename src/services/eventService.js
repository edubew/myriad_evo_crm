import api from "./api";

export const eventService = {
  async getEvents(start, end) {
    const response = await api.get("/events", {
      params: { start, end },
    });
    return response.data.data;
  },

  async createEvent(data) {
    const response = await api.post("/events", { event: data });
    return response.data.data;
  },

  async updateEvent(id, data) {
    const response = await api.put(`/events/${id}`, { event: data });
    return response.data.data;
  },

  async deleteEvent(id) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
