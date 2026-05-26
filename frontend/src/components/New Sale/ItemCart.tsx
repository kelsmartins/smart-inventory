import { Package, Trash } from "lucide-react";
import { ItemCartData } from "@/types/ItemCart";

interface ItemCartProps {
    item: ItemCartData;
    deleteFromCart: (id: number) => void;
    index: number;
}

export function ItemCart({ item, deleteFromCart, index }: ItemCartProps) {
    return (
        <div
                                key={index}
                                className="bg-slate-50 w-full min-h-[64px] border border-slate-100 flex flex-row items-center justify-between rounded-xl p-3 gap-3 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center shrink-0 rounded-lg">
                                        <Package className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-semibold text-slate-700 text-sm truncate">{item.name}</span>
                                        <span className="text-xs font-medium text-slate-500 truncate">R$ {item.total_price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button 
                                    className="p-2 rounded-md hover:bg-red-50 group transition-colors"
                                    onClick={() => deleteFromCart(item.id)}
                                >
                                    <Trash className="h-4 w-4 text-slate-400 group-hover:text-red-500 shrink-0 cursor-pointer transition-colors" />
                                </button>
                            </div>
    )
}