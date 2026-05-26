import { ItemCartType } from "./ItemCartType";

export type SaleType = {
  id: number;
  total_price: number;
  created_at: string;
  items: ItemCartType[]; 
};