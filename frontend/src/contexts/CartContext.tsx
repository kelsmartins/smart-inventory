import { createContext } from "react";

interface CartContextInterface {
    // cartItems: CartItem[];
}

export const CartContext = createContext({} as CartContextInterface);

export function CartContextProvider({children}: {children: React.ReactNode}){

    return (
        <CartContext.Provider value={{}}>
            {children}
        </CartContext.Provider>
    )

}

