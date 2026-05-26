import { ItemCartType } from "./ItemCartType";

export type SaleType = {
  id: number;
  total: number;
  created_at: string;
  items: ItemCartType[]; 
};