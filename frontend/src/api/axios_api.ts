// frontend/src/api/axios_api.ts
import axios from 'axios';

export const axios_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://smart-inventory-5zwz.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});
