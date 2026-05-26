'use client'

import { useCartContext } from "@/hooks/useCartContext";
import { useSalesContext } from "@/hooks/useSalesContext";
import { CreditCardIcon, QrCodeIcon, Banknote, X } from "lucide-react";

type Props = {
    openPayment: () => void;
};

export function PaymentMethods({ openPayment }: Props) {

    const { finalizeCart } = useCartContext();

    function handleFinalize() {
        finalizeCart();
        openPayment();
    }
    
    const methods = [
        { 
            name: "Cartão", 
            icon: <CreditCardIcon className="size-6 md:size-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" /> 
        },
        { 
            name: "Pix", 
            icon: <QrCodeIcon className="size-6 md:size-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" /> 
        },
        { 
            name: "Dinheiro", 
            icon: <Banknote className="size-6 md:size-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" /> 
        }
    ];

    return (
        <div 
            className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" 
            onClick={openPayment}
        >
            <div 
                className="w-full max-w-[460px] bg-white border border-slate-100 rounded-2xl flex flex-col shadow-2xl overflow-hidden transform transition-all" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabeçalho Clean e Claro */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-slate-800 font-bold text-base md:text-lg tracking-tight">Forma de pagamento</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Escolha como deseja finalizar o pedido</p>
                    </div>
                    <button 
                        onClick={openPayment} 
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Área de Métodos com fundo levemente contrastante */}
                <div className="p-6 md:p-8 bg-slate-50/50">
                    <div className="grid grid-cols-3 gap-3 md:gap-4 w-full">
                        {methods.map((method, index) => (
                            <button 
                                key={index} 
                                onClick={handleFinalize}
                                className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-white border border-slate-200/70 hover:border-blue-500 active:scale-95 transition-all rounded-xl aspect-square w-full shadow-sm hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]"
                            >
                                {/* Container do Ícone com tom pastel de azul */}
                                <div className="p-3 bg-blue-50 rounded-xl mb-3 transition-colors group-hover:bg-blue-100/80">
                                    {method.icon}
                                </div>
                                
                                <span className="text-slate-600 group-hover:text-blue-600 text-xs md:text-sm font-semibold tracking-wide transition-colors">
                                    {method.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}