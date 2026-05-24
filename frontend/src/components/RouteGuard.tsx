'use client';

import { useAuthContext } from "@/hooks/useAuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

// Defina as rotas que não precisam de login
const publicRoutes = ['/welcome', '/login', '/create-account'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Se ainda está carregando o status do Supabase, não faz nada
        if (isLoading) return;

        const isPublicRoute = publicRoutes.includes(pathname);

        if (!user && !isPublicRoute) {
            // Sem usuário tentando acessar rota privada
            router.push('/welcome');
        } else if (user && isPublicRoute) {
            // Com usuário logado tentando acessar tela de login/welcome
            router.push('/');
        }
    }, [user, isLoading, pathname, router]);

    //  Enquanto carrega, trava a renderização do sistema e mostra um loading
    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
                <Image src="/logo_smart_inventory.png" alt='Carregando...' width={80} height={80} className="animate-pulse mb-4" />
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-1/2 animate-bounce bg-blue-600 rounded-full"></div>
                </div>
            </div>
        );
    }

    // se o useEffect ainda não redirecionou, evita que o HTML vaze
    const isPublicRoute = publicRoutes.includes(pathname);
    if (!user && !isPublicRoute) return null;

    // Renderiza a página requisitada
    return <>{children}</>;
}