'use client';
import { createContext, useState, useMemo } from "react";
import { axios_api } from "@/api/axios_api";
import { DashBoardService } from '@/services/dashboard-service';
import { toast } from "sonner";

export type ProductStatus = 'valid' | 'alert' | 'critical' | 'expired';

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
    valid: { label: 'Válido', className: 'bg-green-100 text-green-800 border-green-200' },
    alert: { label: 'Alerta', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    critical: { label: 'Crítico', className: 'bg-red-100 text-red-800 border-red-200' },
    expired: { label: 'Vencido', className: 'bg-gray-100 text-gray-800 border-gray-300' },
};

// Tipo compatível com backend Flask
export type ProductType = {
    id: number | string;
    name: string;
    barcode?: string;
    category: string;
    expiryDate: string;
    price: number;
    status: ProductStatus;
    quantity: number;
    batch?: number | string;
};

type ProductsContextType = {
    products: ProductType[];
    addProduct: (product: Omit<ProductType, 'status'>) => Promise<void>;
    getProducts: () => Promise<void>;
    isLoading: boolean;
    expiredProducts: ProductType[];
    nearExpiryProducts: ProductType[];
    validProducts: ProductType[];
    statusConfig: typeof statusConfig;
    financialRisk: number;
    deleteProduct: (id: number | string) => Promise<void>;
    getProductToFillForm: (barCode: string) => Promise<BlueSoftResponse>;
    getDashboardData: () => Promise<DashboardData>;
};

export interface BlueSoftResponse {
    description: string;
    category?: {
        description: string;
    };
    avg_price: string;
    gtin: string;
    thumbnail?: string;
}

interface DashboardData {
    total_products: number;
    total_batches: number;
    total_stock: number;
    total_value: number;
    monthly_sales: number;
    monthly_revenue: number;
}

export const ProductsContext = createContext({} as ProductsContextType);

export const ProductsContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { 
        productsWithStatus, 
        expiredProducts, 
        nearExpiryProducts, 
        validProducts, 
        financialRisk 
    } = useMemo(() => DashBoardService(products), [products]);

    // Funções API Flask
    async function getProducts() {
        try {
            setIsLoading(true);
            const response = await axios_api.get('/products');
            const productsData = response.data.products || response.data;
            
            // Transforma dados do backend para o formato do frontend
            const transformedProducts: ProductType[] = [];
            
            for (const product of productsData) {
                if (product.batches && Array.isArray(product.batches)) {
                    // Backend retorna produto com lotes - cria um ProductType para cada lote
                    for (const batch of product.batches) {
                        transformedProducts.push({
                            id: `${product.id}-${batch.id}`,
                            name: product.name,
                            barcode: product.barcode,
                            category: product.category || '',
                            expiryDate: batch.expiry_date,
                            price: product.price,
                            status: batch.status as ProductStatus,
                            quantity: batch.quantity,
                            batch: batch.id
                        });
                    }
                } else {
                    // Produto sem lotes
                    transformedProducts.push({
                        id: product.id,
                        name: product.name,
                        barcode: product.barcode,
                        category: product.category || '',
                        expiryDate: product.expiryDate,
                        price: product.price,
                        status: 'valid',
                        quantity: 0,
                        batch: undefined
                    });
                }
            }
            
            setProducts(transformedProducts);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            toast.error('Erro ao carregar produtos');
        } finally {
            setIsLoading(false);
        }
    }

    async function addProduct(newProduct: Omit<ProductType, 'status'>) {
        try {
            const response = await axios_api.post('/products', newProduct);
            
            // Agora o response.data JÁ É o produto certinho que o Backend devolveu
            const savedData = response.data;

            // Transforma para o formato que a tabela do React usa
            const transformedProduct: ProductType = {
                // Combina o ID do produto com o código do lote gerado
                id: `${savedData.id}-${savedData.batch}`,
                name: savedData.name,
                barcode: savedData.barcode,
                category: savedData.category || '',
                expiryDate: savedData.expiryDate,
                price: savedData.price,
                status: 'valid', // O DashBoardService recalcula automaticamente se estiver perto de vencer
                quantity: savedData.quantity,
                batch: savedData.batch
            };

            // Adiciona na lista atual sem precisar recarregar a página!
            setProducts(prev => [...prev, transformedProduct]);
            toast.success('Produto cadastrado com sucesso!');
            
        } catch (error: unknown) {
            console.error('Erro ao adicionar produto:', error);
            // Ajustei de "msg" para "message" para casar exatamente com o erro que o Flask manda
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Erro ao cadastrar produto');
        }
    }

    async function deleteProduct(id: number | string) {
        try {
            // Extrai o productId do formato "productId-batchId"
            const productId = typeof id === 'string' ? parseInt(id.split('-')[0]) : id;
            
            await axios_api.delete(`/products/${productId}`);
            setProducts(currentProducts =>
                currentProducts.filter(product => {
                    const productProductId = typeof product.id === 'string' 
                        ? parseInt(product.id.split('-')[0]) 
                        : product.id;
                    return productProductId !== productId;
                })
            );
            toast.success('Produto excluído com sucesso!');
        } catch (error: unknown) {
            console.error('Erro ao deletar produto:', error);
            const axiosError = error as { response?: { data?: { msg?: string } } };
            toast.error(axiosError.response?.data?.msg || 'Erro ao excluir produto');
        }
    }

    // Função para buscar dados do dashboard
    async function getDashboardData(): Promise<DashboardData> {
        try {
            const response = await axios_api.get('/dashboard/summary');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            return {
                total_products: 0,
                total_batches: 0,
                total_stock: 0,
                total_value: 0,
                monthly_sales: 0,
                monthly_revenue: 0
            };
        }
    }

    // FUNÇÃO FILL PRODUCT FORM (API BlueSoft)
    async function getProductToFillForm(barCode: string): Promise<BlueSoftResponse> {
        try {
            const response = await axios_api.get(`/products/barcode/${barCode}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produto por código de barras:', error);
            // Retorna dados vazios em caso de erro
            return {
                description: '',
                avg_price: '0',
                gtin: barCode
            };
        }
    }

    return (
        <ProductsContext.Provider value={{
            products: productsWithStatus,
            addProduct,
            getProducts,
            isLoading,
            expiredProducts,
            nearExpiryProducts,
            validProducts,
            statusConfig,
            financialRisk,
            deleteProduct,
            getProductToFillForm,
            getDashboardData
        }}>
            {children}
        </ProductsContext.Provider>
    );
};

// StatusBadge
interface StatusBadgeProps {
    status: ProductStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className } = statusConfig[status];
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}