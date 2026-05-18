import { CartContext } from "@/contexts/CartContext"
import { useContext } from "react"

export function useCartContext(){
    const context = useContext(CartContext);
    return context
}