import api from "./api";

export const dashboardService = {
  async getDashboard() {
    const response = await api.get("/dashboard");
    return response.data.data;
  },

  async getTodos() {
    const response = await api.get("/daily_todos");
    return response.data.data;
  },

  async createTodo(text) {
    const response = await api.post("/daily_todos", { text });
    return response.data.data;
  },

  async toggleTodo(id, done) {
    const response = await api.put(`/daily_todos/${id}`, { done });
    return response.data.data;
  },

  async deleteTodo(id) {
    await api.delete(`/daily_todos/${id}`);
  },
};
