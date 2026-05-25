'use client'
import { ScanBarcodeIcon, X } from 'lucide-react';
import { BarcodeScanner } from "@/components/Forms/Product Form/barcodescanner";
import { DatePickerComponent } from "@/components/Forms/Product Form/datepicker";
import { useState, type FormEvent } from "react";
import { useProductsContext } from '@/hooks/useProductsContext';
import { ProductType } from '@/types/ProductType';

export function ProductForm({ showProductForm }: { showProductForm: () => void }) {

    const { addProduct, getProductToFillForm } = useProductsContext();

    const [barCode, setBarCode] = useState('');
    const [productName, setProductName] = useState('');
    const [batch, setBatch] = useState('');       // se o tipo ProductType não tiver batch, ignore no envio
    const [category, setCategory] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [quantity, setQuantity] = useState('');

    const [openScanner, setOpenScanner] = useState(false);

    function expiryDatePicker(newDate: Date) {
        setExpiryDate(newDate);
    }

    function fillFormWithBarcodeData(productToFill: ProductType) {
        setBarCode(productToFill.barcode || '');
        setProductName(productToFill.name);
        setCategory(productToFill.category || '');
        setProductPrice(String(productToFill.price || ''));
        // se o scanner retornar quantidade, pode setar também
        if (productToFill.quantity) setQuantity(String(productToFill.quantity));
        if (productToFill.batch) setBatch(productToFill.batch);
    }

    // ============================================================
    // SUBMIT DO FORMULÁRIO – CORRIGIDO
    // ============================================================
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const year = expiryDate.getFullYear();
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
        const day = String(expiryDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Monta o objeto SEM o campo 'id' (o backend irá gerar)
        // E SEM o campo 'batch' se o tipo ProductType não o possuir.
        // Se o tipo ProductType tiver batch, descomente a linha abaixo.
        const productData = {
            barcode: barCode,
            name: productName,
            category: category,
            price: parseFloat(productPrice),
            expiryDate: formattedDate,
            quantity: parseInt(quantity),
            // batch: batch,   // descomente apenas se ProductType tiver a propriedade batch
        };

        await addProduct(productData);   // aguarda a Promise
        showProductForm();               // fecha o formulário
    }

    return (
        <main className="w-full h-full flex items-center justify-center p-2 sm:p-4 select-none text-slate-800 bg-slate-900/40 fixed inset-0 z-50 backdrop-blur-sm animate-fade-in" onClick={showProductForm}>

            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl relative w-full max-w-md h-[570px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

                <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100 shrink-0 bg-white rounded-t-xl">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Registrar Produto</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Adicione um novo produto ao estoque</p>
                    </div>
                    <button
                        onClick={showProductForm}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                    <button
                        type="button"
                        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm transition-all hover:bg-blue-100 flex flex-row items-center justify-center text-blue-600 active:scale-[0.98] mb-2 group"
                        onClick={() => setOpenScanner(true)}
                    >
                        <ScanBarcodeIcon className="inline-block h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                        <p className="text-sm font-semibold">Ler código de barras</p>
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-2.5 flex-1 flex flex-col justify-between">

                        <div>
                            <label htmlFor="barcode" className="mb-0.5 block text-xs font-semibold text-slate-700">Código de barras</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                onChange={(e) => setBarCode(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const response = await getProductToFillForm(barCode);
                                        if (response) {
                                            console.log(response);
                                            // CORREÇÃO: id deve ser número (0 temporário)
                                            const productToFill: ProductType = {
                                                id: 0,   // número (back-end gerará o real)
                                                name: response.description,
                                                barcode: String(response.gtin),
                                                category: response.category?.description || '',
                                                expiryDate: '',
                                                price: Number(response.avg_price) || 0,
                                                status: "valid",
                                                quantity: 1,
                                                batch: ''   // se não existir em ProductType, remova esta linha
                                            };
                                            fillFormWithBarcodeData(productToFill);
                                        }
                                    }
                                }}
                                value={barCode}
                                placeholder="Ex: 7891234567890"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="col-span-2">
                                <label htmlFor="productName" className="mb-0.5 block text-xs font-semibold text-slate-700">Nome do Produto</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                    onChange={(e) => setProductName(e.target.value)}
                                    value={productName}
                                    placeholder="Ex: Leite Integral 1L"
                                />
                            </div>

                            <div>
                                <label htmlFor="lote" className="mb-0.5 block text-xs font-semibold text-slate-700">Lote</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                    onChange={(e) => setBatch(e.target.value)}
                                    value={batch}
                                    placeholder="Ex: L-12345"
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="mb-0.5 block text-xs font-semibold text-slate-700">Categoria</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                    onChange={(e) => setCategory(e.target.value)}
                                    value={category}
                                    placeholder="Ex: Laticínios"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="expiryDate" className="mb-0.5 block text-xs font-semibold text-slate-700">Data de Validade</label>
                            <div className="w-full">
                                <DatePickerComponent expiryDatePicker={expiryDatePicker} selectedDate={expiryDate} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label htmlFor="productPrice" className="mb-0.5 block text-xs font-semibold text-slate-700">Valor Unitário</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm font-medium">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min='0'
                                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        value={productPrice}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="quantity" className="mb-0.5 block text-xs font-semibold text-slate-700">Quantidade</label>
                                <input
                                    type="number"
                                    min='1'
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-sm"
                                    onChange={(e) => setQuantity(e.target.value)}
                                    value={quantity}
                                    placeholder="Ex: 50"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
                            >
                                Registrar Produto
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {openScanner && (
                <BarcodeScanner setOpenScanner={() => setOpenScanner(false)} fillFormWithBarcodeData={fillFormWithBarcodeData} />
            )}
        </main>
    )
}