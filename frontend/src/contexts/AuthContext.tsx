'use client'

import { createContext, useState, ReactNode } from "react";
import { axios_api } from "@/api/axios_api";

// Interface para o usuário
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Interface para o que o contexto fornece
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  getUsers: () => Promise<User[]>;
}

// Exportando o contexto (Isso resolve o erro no hook)
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const getUsers = async () => {
    const response = await axios_api.get('/users');
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getUsers }}>
      {children}
    </AuthContext.Provider>
  );
}