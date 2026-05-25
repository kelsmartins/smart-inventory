import { ProductType } from "@/types/ProductType";

type ExpiringProductsItemProps = {
    data: ProductType;
    putOnSale: (id: number | string) => Promise<void>;
}

export function ExpiringProductsItem({ data, putOnSale }: ExpiringProductsItemProps) {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(Number(data.price) || 0);

    return (
        <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0">

            {/* Voltamos o padding para py-3 sm:py-4 nas linhas */}
            <td className="px-3 sm:px-4 py-3 sm:py-4">
                <span className="font-medium text-slate-800 text-xs sm:text-sm block truncate max-w-[150px] sm:max-w-xs">
                    {data.name}
                </span>
            </td>

            <td className="px-3 sm:px-4 py-3 sm:py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                    {data.expiryDate}
                </span>
            </td>

            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-700">
                {formattedPrice}
            </td>

            <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-slate-700">
                {data.quantity}
            </td>

            <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                    {/* Botão com um tamanho mais padrão */}
                    <button
                    onClick={() => putOnSale(data.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all active:scale-95 px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs shadow-sm shadow-blue-600/20">
                        Promover
                    </button>
                </div>
            </td>

        </tr>
    )
}