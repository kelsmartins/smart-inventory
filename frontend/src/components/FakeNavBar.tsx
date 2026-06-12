'use client';

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Rammetto_One } from 'next/font/google';

const right = Rammetto_One({
    subsets: ['latin'],
    weight: ['400'],
});

export function FakeNavBar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-[#222222] text-white h-[60px] flex items-center shadow-md shadow-black/20 transition-all">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Lado Esquerdo: Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#6b9dff] hover:opacity-80 transition-opacity">
                    <Image src="/logo_smart_inventory.png" alt='logo' width={50} height={50} />
                    <div className={`${right.className} text-blue-500 text-base leading-none flex flex-col items-start justify-start h-full`}>
                        <span>Smart</span>
                        <span>Inventory</span>
                    </div>
                </Link>


                <div className="hidden md:flex items-center gap-8">
                    <Link href="#problema" className="text-sm font-medium text-white/70 hover:text-[#6b9dff] transition-colors">
                        O Problema
                    </Link>
                    <Link href="#funcionalidades" className="text-sm font-medium text-white/70 hover:text-[#6b9dff] transition-colors">
                        Funcionalidades
                    </Link>
                    <Link href="#tecnologias" className="text-sm font-medium text-white/70 hover:text-[#6b9dff] transition-colors">
                        Tecnologias
                    </Link>
                </div>



                <div className="flex items-center gap-6">

                    <div className="hidden md:flex items-center gap-6">

                    </div>

                    <button className="md:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors -mr-2">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}