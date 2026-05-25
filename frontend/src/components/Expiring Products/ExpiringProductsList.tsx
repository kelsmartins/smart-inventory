import { ProductType } from "@/types/ProductType"
import { ExpiringProductsItem } from "./ExpiringProductsItem"

type ExpiringProductsListProps = {
    expiringData: ProductType[];
    putOnSale: (id: number | string) => Promise<void>;
}

export function ExpiringProductsList({ expiringData, putOnSale }: ExpiringProductsListProps) {
    return (
        <div className="overflow-auto w-full min-h-[400px]">

          <table className="w-full text-left text-sm whitespace-nowrap">

            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] sm:text-xs sticky top-0 z-10">
              <tr>
                {/* Voltamos o padding para py-3 sm:py-4 no cabeçalho */}
                <th className="px-3 sm:px-4 py-3 sm:py-4">PRODUTO</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4">VALIDADE</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4">PREÇO</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">QTD. ESTOQUE</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">AÇÕES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {expiringData.map((product) => (
                <ExpiringProductsItem key={product.id} data={product} putOnSale={putOnSale}/>
              ))}
              
              {expiringData.length === 0 && (
                  <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-medium text-sm">
                          Nenhum produto próximo do vencimento.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
    )
}