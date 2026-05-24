// frontend/src/contexts/AuthContext.tsx
"use client";

import { createContext, ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { axios_api } from "@/api/axios_api";
import { supabase } from "@/api/supabase";

// ==================================================
// TIPO USUÁRIO (compatível com backend Flask)
// ==================================================
export type User = {
  id: string;          // ATUALIZADO: Agora é string (UUID do Supabase)
  name: string;
  email: string;
  document?: string;
  role: string;        // 'admin' ou 'collaborator'
  isAdmin: boolean;    // permissão de administrador
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
      // O axios_api vai mandar o token do Supabase automaticamente
      const response = await axios_api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setUser(null);
      return null;
    }
  };

  // ==========================================
  // ESCUTA A SESSÃO DO SUPABASE AO ABRIR O APP
  // ==========================================
  useEffect(() => {
    // 1. Checa se já tem alguém logado ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Fica escutando mudanças de login/logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ==========================================
// LOGIN DIRETO NO SUPABASE
// ==========================================
async function login(email: string, password: string): Promise<User | null> {
    try {
      console.log("1. Iniciando login no Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      console.log("2. Supabase logou! Token gerado:", data.session?.access_token ? "SIM" : "NÃO");

      console.log("3. Indo buscar o perfil no Flask...");
      const response = await axios_api.get('/auth/me');
      
      const userData = response.data;
      setUser(userData);
      toast.success('Login realizado com sucesso!');
      return userData; 

    } catch (error: any) {
      console.error('❌ ERRO NO LOGIN:', error);
      
      if (error.response) {
        console.error('❌ O FLASK REJEITOU POR CAUSA DISSO:', error.response.data);
        alert("O Flask disse: " + JSON.stringify(error.response.data));
      }
      
      toast.error('Email ou senha incorretos ou erro de servidor.');
      return null;
    }
  }

  // ==========================================
  // REGISTRO DE NOVO DONO (Admin Automático)
  // ==========================================
  async function register(userData: RegisterData): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { 
            name: userData.name,
            document: userData.document || null
          }
        }
      });

      if (error) throw error;
      
      toast.success('Conta criada com sucesso!');
      // Quando logar, o useEffect vai buscar o perfil automaticamente
      const profile = await fetchUserProfile();
      return profile;

    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta');
      return null;
    }
  }

  // ==========================================
  // REGISTRA UM COLABORADOR (Via Backend Flask)
  // ==========================================
  const registerUser = async (userData: RegisterData) => {
    try {
      // Chama a rota protegida que nós criamos no Flask
      await axios_api.post('/auth/collaborator', userData);
      toast.success('Colaborador adicionado com sucesso!');
      await getUsers(); // atualiza a lista da tela
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar colaborador');
      throw error;
    }
  };

  // ==========================================
  // BUSCA TODOS OS USUÁRIOS
  // ==========================================
  const getUsers = useCallback(async () => {
    try {
      // Nota: Certifique-se de que a rota /users exista no seu Flask para listar todos
      const response = await axios_api.get('/users');
      const users = Array.isArray(response.data) ? response.data : response.data.users ?? [];
      setUsersList(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de colaboradores');
    }
  }, []);

  // ==========================================
  // LOGOUT NO SUPABASE
  // ==========================================
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
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