'use client'
import { createContext, useState, useEffect } from "react";
import { ItemCartType } from '@/types/ItemCartType';
import { ProductType } from "@/types/ProductType";
import { useSalesContext } from "@/hooks/useSalesContext";

interface CartContextInterface {
    cart: ItemCartType[];
    addToCart: (item: ProductType) => void;
    deleteFromCart: (id: number) => void;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    totalCart: number;
    finalizeCart: () => Promise<void>;
}

export const CartContext = createContext({} as CartContextInterface);

export function CartContextProvider({ children }: { children: React.ReactNode }) {

    const { addNewSale } = useSalesContext();

    const [cart, setCart] = useState<ItemCartType[]>([]);
    const [totalCart, setTotalCart] = useState(0);

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.total_price, 0);
        setTotalCart(total);
    }, [cart]);

    function addToCart(product: ProductType) {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // TRAVA 1: Impede de adicionar se já bateu o limite
                if (existingItem.quantity >= existingItem.stock) {
                    alert(`Estoque insuficiente! Você só tem ${existingItem.stock} unidades de ${product.name}.`);
                    return prevCart; // Retorna o carrinho intacto
                }

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
                // TRAVA 2: Impede de adicionar um produto que já está zerado no sistema
                if (product.quantity <= 0) {
                    alert(`O produto ${product.name} está esgotado!`);
                    return prevCart;
                }

                const newItem: ItemCartType = {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    total_price: product.price,
                    stock: product.quantity // 👇 Guarda o estoque real que veio do banco
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
                // TRAVA 3: Impede de aumentar pelo botão "+"
                if (item.quantity >= item.stock) {
                    alert(`Estoque máximo atingido para este item!`);
                    return item;
                }

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

    async function finalizeCart() {
        await addNewSale(cart);
        setCart([]);
    }

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            deleteFromCart,
            increaseQuantity,
            decreaseQuantity,
            totalCart,
            finalizeCart
        }}>
            {children}
        </CartContext.Provider>
    )

}

