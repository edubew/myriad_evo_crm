import api from "./api";

export const authService = {
  async register(data) {
    const response = await api.post("/register", { user: data });
    return response.data;
  },

  async login(data) {
    const response = await api.post("/login", { user: data });

    const token = response.data.token;
    const user = response.data.user

    if (!token || !user) {
      throw new Error("Login failed: missing token or user");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return { user, token}
  },

  async logout() {
    await api.delete("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
