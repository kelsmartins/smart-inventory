'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, Home, HandCoins } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Rammetto_One } from 'next/font/google';

const right = Rammetto_One({
  subsets: ['latin'],
  weight: ['400'],
});

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/profile', label: 'Perfil', icon: User },
  { to: '/inventory', label: 'Estoque', icon: Package },
  { to: '/new-sale', label: 'Vender', icon: HandCoins },
];

export function Navbar() {
  const pathname = usePathname();
  const [isInventory, setIsInventory] = useState(false);

  useEffect(() => {
    setIsInventory(pathname === '/inventory');
  }, [pathname]);

  if (
    pathname === '/welcome' ||
    pathname === '/login' ||
    pathname === '/create-account' ||
    pathname === '/new-sale'
  ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#222222] h-[60px] text-white">
      <div className="w-full flex h-16 items-center justify-between px-2 sm:px-4">
        <Link href="/" className="flex items-center gap-1 sm:gap-2 text-base md:text-xl font-bold text-[#6b9dff]">
          <Image src="/logo_smart_inventory.png" alt='logo' width={50} height={50} />
          <div className={`${right.className} text-blue-500 text-base leading-none flex flex-col items-start justify-start h-full`}>
               <span className='text-blue-400'>Smart</span>
               <span>Inventory</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }, index) => (
            <Link
              key={index}
              href={to}
              className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors
                ${pathname === to
                  ? 'border-b-2 border-[#6b9dff] text-[#7faeff]' 
                  : 'text-white hover:border-b-2 border-[#6b9dff]'
                }
              ${to === '/new-sale' ? 'bg-blue-500 hover:bg-[#6b9dff]/70' : ''}
                 ${to === '/new-sale' 
                  ? pathname.includes('/inventory')
                    ? 'bg-[#222222] text-white hover:bg-[#6b9dff]/70'
                    : 'bg-[#6b9dff] hover:bg-[#6b9dff]/70'
                  : ''}
                `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}