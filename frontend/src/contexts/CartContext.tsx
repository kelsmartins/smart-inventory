'use client'
import { createContext, useState } from "react";
import { ItemCartData } from '@/types/ItemCart';
import { ProductType } from "@/types/ProductType";

interface CartContextInterface {
    cart: ItemCartData[];
    addToCart: (item: ProductType) => void; 
    deleteFromCart: (id: number) => void;
    totalCart: number; 
}

export const CartContext = createContext({} as CartContextInterface);

export function CartContextProvider({children}: {children: React.ReactNode}){

    const [cart, setCart] = useState<ItemCartData[]>([]);
    const [totalCart, setTotalCart] = useState(0);
    
    for (const c of cart) {
        setTotalCart(prev => prev + c.total_price);
    }

    function addToCart(product: ProductType){

        const item: ItemCartData = {
            id: product.id,
            name: product.name,
            quantity: 1,
            total_price: product.price
        }
        setCart([...cart, item])
    }

    function deleteFromCart(id: number){
        setCart(cart.filter(item => item.id !== id))
    }

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart,
            deleteFromCart,
            totalCart
            }}>
            {children}
        </CartContext.Provider>
    )

}

