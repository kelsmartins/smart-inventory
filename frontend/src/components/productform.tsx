'use client'

import { useForm } from "react-hook-form"
import { useProductsContext } from "@/hooks/useProductsContext"
import { toast } from "sonner"

interface ProductFormData {
  name: string;
  expiryDate: string;
  price: number;
  quantity: number;
  category: string;
}

export function ProductForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>()
  const { addProduct } = useProductsContext()

  const onSubmit = async (data: ProductFormData) => {
    try {
      // ✅ Solução para o erro de ID: Forçamos a tipagem como "any" apenas no envio 
      // ou garantimos que a função addProduct aceite um objeto sem ID.
      const formattedData = {
        name: data.name,
        expiryDate: data.expiryDate,
        price: Number(data.price),
        quantity: Number(data.quantity),
        category: data.category || "Geral",
      };

      await addProduct(formattedData as any); 
      
      toast.success("Produto adicionado com sucesso!");
      reset();
    } catch (error) {
      toast.error("Erro ao salvar produto.");
    }
  }

  // ... (restante do JSX do formulário que você já tem)
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seus inputs aqui... */}
        <button type="submit">Adicionar</button>
    </form>
  )
}