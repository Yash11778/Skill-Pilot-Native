import axios from 'axios/dist/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/network-config';

const API_BASE_URL = API_URL;

// Create axios instance with a generous timeout
// 60s to handle Render free-tier cold starts (can take up to 50s)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// ─── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // AsyncStorage failure should not block the request
    }
    if (__DEV__) {
      console.log('▶ API Request:', (config.method || 'UNKNOWN').toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request setup error:', error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('❌ API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // ── Clear token on 401 ──────────────────────────────────────────────────
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
      } catch (_) {}
    }

    // ── Map raw network/timeout errors to user-friendly messages ─────────────
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage =
        'Server is starting up (first request takes ~30s). Please try again.';
    } else if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      !error.response
    ) {
      error.userMessage =
        'Unable to reach the server. Please check your internet connection and try again.';
    } else if (error.response?.data?.message) {
      error.userMessage = error.response.data.message;
    } else {
      error.userMessage = 'Something went wrong. Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;
