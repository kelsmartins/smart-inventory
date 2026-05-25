import { useProductsContext } from "@/hooks/useProductsContext";
import { ProductType } from "@/types/ProductType";
import { Scan, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";


type Props = {
  setOpenScanner: () => void;
  fillFormWithBarcodeData: (productToFill: ProductType) => void;
};

export const BarcodeScanner = ({ setOpenScanner, fillFormWithBarcodeData }: Props) => {

  const { getProductToFillForm } = useProductsContext();
  const [result, setResult] = useState("");
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  useEffect(() => {
    if (!result) return;

    async function request() {

      const response = await getProductToFillForm(result);

      if (response) {

        const productToFill: ProductType = {
          id: 0,
          name: response.description || '',
          barcode: String(response.gtin),
          category: response.category?.description || '',
          expiryDate: '',
          price: Number(response.avg_price) || 0,
          status: "valid",
          quantity: 1,
          batch: ''
        }
        console.log(response)
        fillFormWithBarcodeData(productToFill)

        setOpenScanner();
        setResult('');

      } else {

      }
    }
    request();
  }, [result, fillFormWithBarcodeData, setOpenScanner]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 select-none text-slate-800 bg-transparent fixed inset-0 z-[60] animate-fade-in" onClick={setOpenScanner}>

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl relative overflow-hidden w-full max-w-md h-[570px] flex flex-col" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Ler Código de Barras</h2>
            <p className="text-xs text-slate-500 mt-0.5">Aponte a câmera para buscar automaticamente.</p>
          </div>
          <button
            onClick={setOpenScanner}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fechar Scanner">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center p-4 flex-1 h-full justify-between">

          <div className="w-full flex-1 relative overflow-hidden rounded-xl border-2 border-slate-100 shadow-sm bg-black">
            <video ref={ref} className="absolute inset-0 w-full h-full object-cover" />
          </div>

          <div className="mt-4 flex items-center justify-center w-full min-h-[40px] shrink-0">
            {result ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full shadow-sm animate-fade-in">
                <Check className="size-4" />
                <span className="text-sm font-bold font-mono tracking-wider">{result}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-full shadow-sm">
                <Scan className="size-4 animate-pulse text-blue-500" />
                <span className="text-sm font-medium">Aguardando leitura...</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};