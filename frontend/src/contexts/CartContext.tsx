'use client'
import { createContext, useState } from "react";
import { ItemCart } from '@/types/ItemCart';
import { ProductType } from "@/types/ProductType";

interface CartContextInterface {
    cart: ItemCart[];
    addToCart: (item: ProductType) => void; 
    deleteFromCart: (id: number) => void;
}

export const CartContext = createContext({} as CartContextInterface);

export function CartContextProvider({children}: {children: React.ReactNode}){

    const [cart, setCart] = useState<ItemCart[]>([]);

    function addToCart(product: ProductType){

        const item: ItemCart = {
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
            deleteFromCart
            }}>
            {children}
        </CartContext.Provider>
    )

}

