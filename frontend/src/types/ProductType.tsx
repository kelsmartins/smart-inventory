export type ProductStatus = 'valid' | 'alert' | 'critical' | 'expired';

export type ProductType = {
  id: string | number;
  name: string;
  barcode?: string;
  category: string;
  expiryDate: string;
  price: number;
  status: ProductStatus;
  quantity: number;
  batch?: string | number;
};