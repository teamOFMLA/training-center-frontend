import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../features/auth/authStore';

const BASE_URL = 'https://trainingcenterapi.runasp.net';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to track refreshing state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling errors and Token Refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request and wait for the token to refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, email, logout, updateTokens } = useAuthStore.getState();

      if (refreshToken && email) {
        try {
          // Perform refresh token request directly via Axios to prevent interceptor loop
          const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken,
            email,
          });

          if (response.status === 200 && response.data) {
            const data = response.data;
            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;
            const expiresAt = data.expiresAt;

            updateTokens(newAccessToken, newRefreshToken, expiresAt);
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            isRefreshing = false;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        logout();
      }
    }

    return Promise.reject(error);
  }
);
