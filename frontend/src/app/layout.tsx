import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductsContextProvider } from '@/contexts/ProductsContext';
import { RouteGuard } from '@/components/RouteGuard'; // <-- Importe o Guardião aqui!

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', // Define o nome da variável CSS
});

export const metadata: Metadata = {
  title: 'Smart Inventory',
  description: 'Gestão preventiva de estoque com foco em redução de desperdício',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} min-h-screen flex flex-col bg-[#E8E9E8] font-sans `}>
        <AuthProvider>
          <RouteGuard>
           
            <ProductsContextProvider>
              <Navbar />
              
              <main className="flex-1 flex flex-col">
                {children}
              </main>

              <Toaster richColors position="top-right" />
            </ProductsContextProvider>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}