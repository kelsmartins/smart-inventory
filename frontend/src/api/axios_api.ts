// frontend/src/api/axios_api.ts
import axios from 'axios';

// Define a URL da API (Lê do .env do Vercel/Local)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const axios_api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// INTERCEPTOR: Função que roda antes de CADA requisição enviada ao servidor
// Ela anexa automaticamente o Token JWT no cabeçalho 'Authorization' para que o backend saiba quem é o usuário
axios_api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('smart_inventory_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);