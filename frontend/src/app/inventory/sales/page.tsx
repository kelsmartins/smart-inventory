'use client'
import { useSalesContext } from "@/hooks/useSalesContext";
import { ShoppingCart, Eye, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SaleType } from "@/types/SaleType";

// Função auxiliar movida para fora para ser acessível por ambos os componentes
const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function SalesPage() {
    const { sales, fetchSales } = useSalesContext();
    const router = useRouter();

    const [selectedSale, setSelectedSale] = useState<SaleType | null>(null);

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-slate-50 h-full p-4 sm:p-8 font-sans relative">

            {/* Topo da Página */}
            <div className="flex flex-row justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Histórico de Vendas</h2>
                
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-10 px-4 flex items-center gap-2 transition-colors duration-200 shadow-sm shadow-blue-600/30 active:scale-95" 
                    onClick={() => router.push('/nova-venda')} 
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-sm">Ir para o Caixa</span>
                </button>
            </div>

            {/* Cabeçalho da Lista */}
            <div className="flex flex-row h-12 items-center px-6 bg-white border border-slate-200 rounded-t-xl border-b-0 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                <span className="w-[15%] flex justify-start">ID da Venda</span>
                <span className="w-[30%] flex justify-start">Data e Hora</span>
                <span className="w-[25%] flex justify-start">Volume de Itens</span>
                <span className="w-[20%] flex justify-start">Valor Total</span>
                <span className="w-[10%] flex justify-center">Ações</span>
            </div>

            {/* Corpo da Lista */}
            <ul className="flex flex-1 flex-col bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-y-auto max-h-[530px] hide-scrollbar">
                {sales.map((sale) => {
                    const totalItems = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

                    return (
                        <li key={sale.id} className="flex flex-row h-16 items-center px-6 text-slate-600 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 shrink-0">

                            <span className="w-[15%] flex justify-start font-bold text-slate-700">
                                #{sale.id.toString().padStart(4, '0')}
                            </span>

                            <span className="w-[30%] flex justify-start text-sm truncate pr-4 text-slate-500">
                                {formatDateTime(sale.created_at)}
                            </span>

                            <span className="w-[25%] flex justify-start text-sm">
                                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                                </span>
                            </span>

                            <span className="w-[20%] flex justify-start font-bold text-blue-600 truncate pr-4">
                                R$ {sale.total_price?.toFixed(2)}
                            </span>

                            <div className="w-[10%] flex justify-center items-center gap-2 sm:gap-4">
                                <button 
                                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Ver Detalhes"
                                    onClick={() => setSelectedSale(sale)}
                                >
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                
                                {/* <button 
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Estornar Venda"
                                >
                                    <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button> */}
                            </div>
                        </li>
                    )
                })}
                
                {sales.length === 0 && (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ShoppingCart className="w-10 h-10 opacity-30" />
                        <li className="text-center text-sm font-medium">
                            Nenhuma venda registrada até o momento.
                        </li>
                    </div>
                )}
            </ul>

            {/* Renderização condicional do novo componente Modal */}
            {selectedSale && (
                <SaleDetailsModal 
                    sale={selectedSale} 
                    onClose={() => setSelectedSale(null)} 
                />
            )}
            
        </div>
    )
}


// MODAL DE DETALHES
interface SaleDetailsModalProps {
    sale: SaleType;
    onClose: () => void;
}

function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
            onClick={onClose} 
        >
            <div 
                className="w-full max-w-3xl flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" 
                onClick={e => e.stopPropagation()} 
            >
                {/* Header do Modal */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Detalhes da Venda #{sale.id.toString().padStart(4, '0')}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Realizada em {formatDateTime(sale.created_at)}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo do Modal - Lista de Produtos */}
                <div className="p-6 overflow-y-auto min-h-[350px] max-h-[60vh] hide-scrollbar bg-white">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-200">
                                <th className="pb-3 w-[45%] font-semibold uppercase tracking-wider text-xs">Produto</th>
                                <th className="pb-3 w-[15%] font-semibold uppercase tracking-wider text-xs text-center">Qtd</th>
                                <th className="pb-3 w-[20%] font-semibold uppercase tracking-wider text-xs text-right">V. Unitário</th>
                                <th className="pb-3 w-[20%] font-semibold uppercase tracking-wider text-xs text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                    <td className="py-4 font-medium text-slate-700 pr-4">{item.name}</td>
                                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                    
                                    <td className="py-4 text-right text-slate-600">
                                        R$ {item.unit_price?.toFixed(2)}
                                    </td>
                                    
                                    <td className="py-4 text-right font-semibold text-slate-800">
                                        R$ {(item.quantity * item.unit_price).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer do Modal - Totalizador */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-end items-center">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Pago</span>
                        <span className="text-2xl font-bold text-blue-600">
                            R$ {sale.total_price?.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}