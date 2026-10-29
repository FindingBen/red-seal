// src/api/tokenService.js

export const tokenService = {
  getAccess() {
    return localStorage.getItem("accessToken");
  },

  getRefresh() {
    return localStorage.getItem("refreshToken");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setTokens({ access, refresh, user }) {
    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);
    if (user !== undefined) localStorage.setItem("user", JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};