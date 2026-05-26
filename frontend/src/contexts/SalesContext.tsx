import { SaleType } from "@/types/SaleType";
import { createContext, useState } from "react";

interface SalesContextInterface {
    sales: SaleType[];
    addSale: (sale: SaleType) => void;
}

export const SalesContext = createContext({} as SalesContextInterface);

export function SalesContextProvider({ children }: { children: React.ReactNode }) {

    const [sales, setSales] = useState<SaleType[]>([]);

    const addSale = (sale: SaleType) => {
        setSales(prevSales => [...prevSales, sale]);
    };

    return (
        <SalesContext.Provider value={{ sales, addSale }}>
            {children}
        </SalesContext.Provider>);
}