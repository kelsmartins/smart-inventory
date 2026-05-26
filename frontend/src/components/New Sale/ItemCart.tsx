import { Package, Trash, Minus, Plus } from "lucide-react";
import { ItemCartData } from "@/types/ItemCartData";

interface ItemCartProps {
    item: ItemCartData;
    deleteFromCart: (id: number) => void;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    index: number;
}

export function ItemCart({ 
    item, 
    deleteFromCart, 
    increaseQuantity, 
    decreaseQuantity, 
    index 
}: ItemCartProps) {
    return (
        <div
            key={index}
            className="bg-slate-50 w-full min-h-[64px] border border-slate-100 flex flex-row items-center justify-between rounded-xl p-3 gap-3 hover:bg-slate-100 transition-colors"
        >
            {/* Secção de Informações do Produto */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center shrink-0 rounded-lg">
                    <Package className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex flex-col overflow-hidden flex-1">
                    <span className="font-semibold text-slate-700 text-sm truncate">
                        {item.name}
                    </span>
                    <span className="text-xs font-medium text-slate-500 truncate mt-0.5">
                        R$ {item.total_price.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Secção de Controlo de Quantidade (+ e -) */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shrink-0 shadow-sm">
                {/* Botão de Diminuir */}
                <button
                    type="button"
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => decreaseQuantity(item.id)}
                    disabled={item.quantity <= 1} // Bloqueia se a quantidade for 1
                    aria-label="Diminuir quantidade"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                
                {/* Mostrador Numérico da Quantidade */}
                <span className="text-sm font-bold text-slate-700 min-w-[20px] text-center select-none">
                    {item.quantity}
                </span>

                {/* Botão de Aumentar */}
                <button
                    type="button"
                    className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-50 transition-colors"
                    onClick={() => increaseQuantity(item.id)}
                    aria-label="Aumentar quantidade"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Botão de Excluir o Item Inteiro */}
            <button 
                type="button"
                className="p-2 rounded-md hover:bg-red-50 group transition-colors shrink-0"
                onClick={() => deleteFromCart(item.id)}
                aria-label="Remover item do carrinho"
            >
                <Trash className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            </button>
        </div>
    );
}