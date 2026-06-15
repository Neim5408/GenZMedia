import axios from 'axios';

const getToken = () => localStorage.getItem('token');

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  return instance;
};

export const authApi = createAxiosInstance(import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5000');
export const userApi = createAxiosInstance(import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:50052');
userApi.updateUserProfile = (userId, formData) => {
    return userApi.put(`/user/update/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
export const postApi = createAxiosInstance(import.meta.env.VITE_POST_SERVICE_URL || 'http://localhost:50053');
export const commentApi = createAxiosInstance(import.meta.env.VITE_COMMENT_SERVICE_URL || 'http://localhost:50054');
export const reactionApi = createAxiosInstance(import.meta.env.VITE_REACTION_SERVICE_URL || 'http://localhost:50055');
export const notificationApi = createAxiosInstance(import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:50056');
export const chatApi = createAxiosInstance(import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:50057');
export const adminApi = createAxiosInstance(import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:50060');