// frontend/src/api/axios_api.ts
import axios from 'axios';
import { supabase } from './supabase'; // a ponte de conexão

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const axios_api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adicionar o token JWT do Supabase nas requisições
axios_api.interceptors.request.use(
  async (config) => {
    // 1. Pede a sessão atual diretamente para o Supabase 
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. Se o usuário estiver logado, injeta o token oficial no cabeçalho
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);