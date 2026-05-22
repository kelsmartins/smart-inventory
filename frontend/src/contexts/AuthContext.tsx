// frontend/src/contexts/AuthContext.tsx
"use client";

import { axios_api } from "@/api/axios_api";
import { createContext, ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ==================================================
// TIPO USUÁRIO (compatível com backend Flask)
// ==================================================
export type User = {
  id: number;
  name: string;
  email: string;
  document?: string;
  role: string;        // 'admin' ou 'operator'
  created_at?: string;
};

// ==================================================
// TIPO DO CONTEXTO
// ==================================================
type AuthContextType = {
  user: User | null;
  usersList: User[];                       // lista de colaboradores
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<User | null>;
  logout: () => void;
  getUsers: () => Promise<void>;           // busca todos os usuários
  registerUser: (userData: any) => Promise<void>; // para formulário de colaborador
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Dados necessários para registro
type RegisterData = {
  name: string;
  email: string;
  password: string;
  document?: string;
  role?: string;
};

// Cria o contexto (inicialmente vazio)
export const AuthContext = createContext({} as AuthContextType);

// ==================================================
// PROVIDER: encapsula a lógica de autenticação
// ==================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega o usuário e o token do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedUser = localStorage.getItem('smart_inventory_user');
          const token = localStorage.getItem('smart_inventory_token');
          if (savedUser && token) {
            setUserState(JSON.parse(savedUser));
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Atualiza o localStorage quando o usuário muda
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('smart_inventory_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('smart_inventory_user');
        localStorage.removeItem('smart_inventory_token');
      }
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {
    setUser(null);
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  // ==========================================
  // LOGIN (usa API Flask)
  // ==========================================
  async function login(email: string, password: string): Promise<User | null> {
    try {
      const response = await axios_api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_inventory_token', access_token);
      }

      // Converte role para isAdmin (compatibilidade com frontend antigo)
      const userWithAdmin = {
        ...userData,
        isAdmin: userData.role === 'admin'
      };

      setUser(userWithAdmin);
      toast.success('Login realizado com sucesso!');
      return userWithAdmin;
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      const axiosError = error as { response?: { data?: { msg?: string } } };
      const message = axiosError.response?.data?.msg || 'Credenciais inválidas';
      toast.error(message);
      return null;
    }
  }

  // ==========================================
  // REGISTRO DE NOVO USUÁRIO (colaborador)
  // ==========================================
  async function register(userData: RegisterData): Promise<User | null> {
    try {
      const response = await axios_api.post('/auth/register', userData);
      const { user: newUser } = response.data;
      toast.success('Usuário criado com sucesso!');
      return newUser;
    } catch (error: unknown) {
      console.error('Erro no registro:', error);
      const axiosError = error as { response?: { data?: { msg?: string } } };
      const message = axiosError.response?.data?.msg || 'Erro ao criar usuário';
      toast.error(message);
      return null;
    }
  }

  // ==========================================
  // BUSCA TODOS OS USUÁRIOS (para lista de colaboradores)
  // ==========================================
  const getUsers = useCallback(async () => {
    try {
      const response = await axios_api.get('/users');
      // Garante que response.data seja um array
      const users = Array.isArray(response.data) ? response.data : response.data.users ?? [];
      setUsersList(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de colaboradores');
    }
  }, []);

  // ==========================================
  // REGISTRA UM COLABORADOR (usado no formulário)
  // ==========================================
  const registerUser = async (userData: any) => {
    try {
      await axios_api.post('/users', userData);
      toast.success('Colaborador adicionado com sucesso!');
      await getUsers(); // atualiza a lista automaticamente
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      toast.error('Erro ao adicionar colaborador');
      throw error;
    }
  };

  // ==========================================
  // VALOR DO CONTEXTO
  // ==========================================
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