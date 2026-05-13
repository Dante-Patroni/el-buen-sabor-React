const API_URL = import.meta.env.VITE_API_URL;

/**
 * @description Wrapper de fetch que agrega automáticamente el JWT.
 */
export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};