// frontend/src/api/axios_api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-smart-inventory.onrender.com';

export const axios_api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Permite que o navegador envie e receba os cookies de segurança automaticamente!
});