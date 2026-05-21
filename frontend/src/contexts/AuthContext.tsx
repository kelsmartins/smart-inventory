"use client";
import { axios_api } from "@/api/axios_api";
import { createContext, ReactNode, useState, useEffect } from "react";
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
  role: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  document?: string;
  role?: string;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega o usuário do localStorage ao iniciar
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

  const logout = () => {
    setUser(null);
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  // Login usando API Flask
  async function login(email: string, password: string): Promise<User | null> {
    try {
      const response = await axios_api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      // Armazena o token JWT
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_inventory_token', access_token);
      }

      // Converte role para isAdmin (compatibilidade)
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

  // Registro usando API Flask
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

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}