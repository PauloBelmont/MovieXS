// Cliente axios com renovação automática do access token via refresh token.
// Qualquer chamada autenticada deve usar este client em vez do axios "puro".
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const axiosClient = axios.create({ baseURL: BASE_URL });

// Anexa o access token em toda requisição, se existir
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = []; // requisições que aguardam o novo accessToken

function resolveQueue(newAccessToken) {
  pendingQueue.forEach(({ resolve }) => resolve(newAccessToken));
  pendingQueue = [];
}

function rejectQueue(error) {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
}

function clearSessionAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Em caso de 401/403 (access token expirado/inválido), tenta renovar uma única vez por requisição
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if ((status === 401 || status === 403) && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Já existe uma renovação em andamento: aguarda o resultado
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { token: refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        resolveQueue(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        rejectQueue(refreshError);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
