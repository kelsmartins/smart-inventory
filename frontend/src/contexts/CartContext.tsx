'use client'
import { createContext, useState, useEffect } from "react";
import { ItemCartType } from '@/types/ItemCartType';
import { ProductType } from "@/types/ProductType";

interface CartContextInterface {
    cart: ItemCartType[];
    addToCart: (item: ProductType) => void;
    deleteFromCart: (id: number) => void;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    totalCart: number;
}

export const CartContext = createContext({} as CartContextInterface);

export function CartContextProvider({ children }: { children: React.ReactNode }) {

    const [cart, setCart] = useState<ItemCartType[]>([]);
    const [totalCart, setTotalCart] = useState(0);

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.total_price, 0);
        setTotalCart(total);
    }, [cart]);

    function addToCart(product: ProductType) {
        setCart(prevCart => {
            // 1. Procura se o produto já está no carrinho
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // 2. Se já existe, atualiza SÓ a quantidade e o preço dele
                return prevCart.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                            total_price: (item.quantity + 1) * product.price
                        }
                        : item
                );
            } else {
                // 3. Se não existe, adiciona como um item novo
                const newItem: ItemCartType = {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    total_price: product.price
                }
                return [...prevCart, newItem];
            }
        });
    }
    function deleteFromCart(id: number) {
        setCart(cart.filter(item => item.id !== id))
    }

    function increaseQuantity(id: number) {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === id) {
                const unitPrice = item.total_price / item.quantity;
                return {
                    ...item,
                    quantity: item.quantity + 1,
                    total_price: unitPrice * (item.quantity + 1)
                };
            }
            return item;
        }));
    }

    function decreaseQuantity(id: number) {
        setCart(prevCart => prevCart.map(item => {
            // O if verifica se a quantidade é maior que 1 para não deixar ficar negativo ou zero
            if (item.id === id && item.quantity > 1) {
                const unitPrice = item.total_price / item.quantity;
                return {
                    ...item,
                    quantity: item.quantity - 1,
                    total_price: unitPrice * (item.quantity - 1)
                };
            }
            return item;
        }));
    }

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            deleteFromCart,
            increaseQuantity,
            decreaseQuantity,
            totalCart
        }}>
            {children}
        </CartContext.Provider>
    )

}

