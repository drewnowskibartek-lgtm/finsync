import axios from 'axios';
import { getAuthStorage } from '../utils/authStorage';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const storage = getAuthStorage();
  const token = storage?.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


