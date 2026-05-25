export type ProductType = {
  id: string | number;
  name: string;
  barcode?: string;
  category: string;
  expiryDate: string;
  price: number;
  status: string;
  quantity: number;
  batch?: string | number;
};

export type ProductStatus = 'valid' | 'alert' | 'critical' | 'expired';