'use client'
import { SaleType } from "@/types/SaleType";
import { createContext, useState } from "react";
import { axios_api } from "@/api/axios_api";
import { ItemCartType } from "../types/ItemCartType";

interface SalesContextInterface {
    sales: SaleType[];
    fetchSales: () => Promise<void>;
    addNewSale: (cart: ItemCartType[]) => Promise<void>;
}

export const SalesContext = createContext({} as SalesContextInterface);

export function SalesContextProvider({ children }: { children: React.ReactNode }) {

    const [sales, setSales] = useState<SaleType[]>([]);

    async function fetchSales() {
        try {
            const response = await axios_api.get('/sales');
            setSales(response.data);
        } catch (error) {
            console.error("Erro ao buscar vendas:", error);
        }
    }

    async function addNewSale(cart: ItemCartType[]) {
    try {
        // 1. Mapeamos (traduzimos) o carrinho para o formato que o Flask exige
        const itemsParaOBackend = cart.map(item => ({
            product_id: item.id, // Transformamos 'id' em 'product_id'
            quantity: item.quantity
        }));

        // 2. Enviamos todos os produtos de uma vez só!
        const response = await axios_api.post('/sales', { 
            items: itemsParaOBackend 
        });

        // (Opcional) Pode ser útil retornar os dados da nova venda
        return response.data; 

    } catch (error: any) {
        // Isso vai forçar o Axios a imprimir a mensagem exata que o Flask mandou!
        const mensagemDoFlask = error.response?.data?.message || error.message;
        console.error("Motivo da recusa do Flask:", mensagemDoFlask);
        
        throw error; // Mantemos o throw para o carrinho NÃO limpar em caso de falha
    }
}

    return (
        <SalesContext.Provider value={{ sales, fetchSales, addNewSale }}>
            {children}
        </SalesContext.Provider>);
}