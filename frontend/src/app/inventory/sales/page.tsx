'use client'
import { useSalesContext } from "@/hooks/useSalesContext";
import { ShoppingCart, Eye, Trash } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SalesPage() {
    const { sales, fetchSales } = useSalesContext();
    const router = useRouter();

    useEffect(() => {
        fetchSales();
    }, []);

    // Função auxiliar para deixar a data no formato brasileiro (DD/MM/YYYY às HH:MM)
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 h-full p-4 sm:p-8 font-sans">

            {/* Topo da Página */}
            <div className="flex flex-row justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Histórico de Vendas</h2>
                
                {/* Botão para ir para a tela do Caixa que construímos antes */}
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-10 px-4 flex items-center gap-2 transition-colors duration-200 shadow-sm shadow-blue-600/30 active:scale-95" 
                    onClick={() => router.push('/nova-venda')} // Ajuste a rota para a sua página do PDV
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
                    // Calcula a quantidade total de produtos dentro desta venda específica
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
                                R$ {sale.total_price.toFixed(2)}
                            </span>

                            <div className="w-[10%] flex justify-center items-center gap-2 sm:gap-4">
                                {/* Botão para ver os detalhes da venda (ex: imprimir recibo) */}
                                <button 
                                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Ver Detalhes"
                                >
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                
                                {/* Mantive o botão de lixeira caso você queira implementar estorno/cancelamento no futuro */}
                                <button 
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Estornar Venda"
                                >
                                    <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </li>
                    )
                })}
                
                {/* Tratativa de Estado Vazio */}
                {sales.length === 0 && (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ShoppingCart className="w-10 h-10 opacity-30" />
                        <li className="text-center text-sm font-medium">
                            Nenhuma venda registrada até o momento.
                        </li>
                    </div>
                )}
            </ul>
        </div>
    )
}