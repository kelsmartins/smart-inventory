import { ProductType } from "@/types/ProductType";
import { ClockAlert, Percent } from "lucide-react";
import { useState } from "react";
import { ExpiringProductsModal } from "./ExpiringProductsModal";
import { useProductsContext } from "@/hooks/useProductsContext";

type ExpiryAlertBannerProps = {
  ExpiringProductsData: ProductType[];
}
export function ExpiringAlertBanner({ExpiringProductsData}: ExpiryAlertBannerProps){

  const { putOnSale } = useProductsContext();

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="rounded-xl border border-blue-500 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5 shadow-sm">
              <ClockAlert size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Atenção com a validade!</h3>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                Estes produtos estão prestes a vencer. Escolha o que fazer para evitar perdas no estoque.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95 w-full sm:w-auto"
          >
            <Percent size={16} />
            Aplicar Promoções
          </button>

          {showModal && 
            <ExpiringProductsModal
              onClose={() => setShowModal(false)}
              ExpiringProductsData={ExpiringProductsData}
              putOnSale={(id: number) => putOnSale(id)}
            />
          }

        </div>
  )
}