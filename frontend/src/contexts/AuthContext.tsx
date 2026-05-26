"use client";

import { createContext, ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { axios_api } from "@/api/axios_api";

// ==================================================
// TIPO USUÁRIO
// ==================================================
export type User = {
  id: string; 
  name: string;
  email: string;
  document?: string;
  role: string; 
  isAdmin: boolean;
  created_at?: string;
};

// ==================================================
// TIPO DO CONTEXTO
// ==================================================
type AuthContextType = {
  user: User | null;
  usersList: User[];
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<User | null>;
  logout: () => void;
  getUsers: () => Promise<void>;
  registerUser: (userData: RegisterData) => Promise<void>; 
  isAuthenticated: boolean;
  isLoading: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  document?: string;
};

export const AuthContext = createContext({} as AuthContextType);

// ==================================================
// PROVIDER
// ==================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ==========================================
  // BUSCA O PERFIL DO BANCO DE DADOS (FLASK)
  // ==========================================
  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      // Como o withCredentials do Axios está True, o cookie viaja sozinho aqui!
      const response = await axios_api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Usuário não autenticado ou sessão expirada.");
      setUser(null);
      return null;
    }
  };

  // ==========================================
  // VERIFICA A SESSÃO AO ABRIR O APP
  // ==========================================
  useEffect(() => {
    // Apenas tenta buscar o perfil. O Flask e o Cookie resolvem o resto.
    fetchUserProfile().finally(() => setIsLoading(false));
  }, []);

  // ==========================================
  // LOGIN NO SEU BACKEND PYTHON (FLASK)
  // ==========================================
  async function login(email: string, password: string): Promise<User | null> {
    try {
      const response = await axios_api.post('/auth/login', { email, password });
      
      const userData = response.data.user;
      setUser(userData);
      
      toast.success('Login realizado com sucesso!');
      return userData; 

    } catch (error: any) {
      console.error('❌ ERRO NO LOGIN:', error);
      toast.error('Email ou senha incorretos.');
      return null;
    }
  }

  // ==========================================
  // REGISTRO DE NOVO DONO (Admin Automático)
  // ==========================================
  async function register(userData: RegisterData): Promise<User | null> {
    try {
      await axios_api.post('/auth/register', userData);
      
      toast.success('Conta criada com sucesso! Entrando...');

      // Faz o login automaticamente para receber o cookie de segurança
      const loggedUser = await login(userData.email, userData.password);
      return loggedUser;

    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
      return null;
    }
  }

  // ==========================================
  // REGISTRA UM COLABORADOR (Via Backend Flask)
  // ==========================================
  const registerUser = async (userData: RegisterData) => {
    try {
      await axios_api.post('/auth/collaborator', userData);
      toast.success('Colaborador adicionado com sucesso!');
      await getUsers(); 
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar colaborador');
      throw error;
    }
  };

  // ==========================================
  // BUSCA TODOS OS USUÁRIOS (COLABORADORES)
  // ==========================================
  const getUsers = useCallback(async () => {
    try {
      const response = await axios_api.get('/auth/collaborator');
      const users = Array.isArray(response.data) ? response.data : response.data.users ?? [];
      setUsersList(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de colaboradores');
    }
  }, []);

  // ==========================================
  // LOGOUT (Destrói a sessão no Flask)
  // ==========================================
  const logout = async () => {
    try {
      // Avisa o backend para apagar o cookie do navegador
      await axios_api.post('/auth/logout');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        login,
        register,
        logout,
        getUsers,
        registerUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}