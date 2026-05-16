'use client';

// Importações necessárias
import { useState } from 'react';               // Estado local (email, senha, loading)
import { useRouter } from 'next/navigation';   // Redirecionamento após login
import { useAuthContext } from '@/hooks/useAuthContext'; // Contexto de autenticação
import { axios_api } from '@/api/axios_api';   // Instância do axios (baseURL configurada)
import { toast } from 'sonner';                // Notificações estilo toast

export default function LoginPage() {
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Controle do botão e feedback

  // Funções do contexto de autenticação
  const { login } = useAuthContext();
  const router = useRouter();

  // Função chamada ao enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();               // Evita recarregar a página
    setIsLoading(true);               // Desabilita o botão e mostra "Entrando..."

    try {
      // Busca o usuário na API mock (consulta por email e senha)
      // `.trim()` remove espaços extras que possam quebrar a autenticação
      const response = await axios_api.get(
        `/users?email=${email.trim()}&password=${password.trim()}`
      );

      // Garante que response.data seja um array (trata diferentes formatos)
      const users = Array.isArray(response.data) ? response.data : response.data.users ?? [];

      if (users.length > 0) {
        // Credenciais corretas: salva usuário no contexto, mostra sucesso e redireciona
        toast.success('Login realizado!');
        login(users[0]);        // Armazena o usuário logado globalmente
        router.push('/');       // Vai para o Dashboard
      } else {
        // Nenhum usuário encontrado com esses dados
        toast.error('Email ou senha inválidos.');
      }
    } catch (error) {
      // Erro de rede ou servidor
      console.error(error);
      toast.error('Erro ao conectar. Tente novamente.');
    } finally {
      // Reativa o botão independente do resultado
      setIsLoading(false);
    }
  };

  // Renderização da tela de login (aparência mantida exatamente como no HEAD)
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#212121] p-4 text-white font-sans">
      <div className="w-full max-w-md rounded-2xl bg-[#333333] p-10 shadow-2xl border border-gray-600">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#6b9dff]">Smart Inventory</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de e-mail */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">E-mail</label>
            <input
              type="email"
              required
              className="w-full rounded-lg bg-[#d9d9d9] p-4 text-black focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Campo de senha */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Senha</label>
            <input
              type="password"
              required
              className="w-full rounded-lg bg-[#d9d9d9] p-4 text-black focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* Botão de envio */}jj
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#6b9dff] py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Acessar Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}