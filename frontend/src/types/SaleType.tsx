import { ItemCartType } from "./ItemCartType";

// Para itens que vêm do banco de dados
export type SaleItemType = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  sale_id?: number;
  product_id: number;
  batch_id?: number;
};

// Para Venda principal
export type SaleType = {
  id: number;
  total_price: number;
  created_at: string; 
  user_id?: number | null; 
  
  items: SaleItemType[]; 
};