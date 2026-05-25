'use client';
import { createContext, useState, useMemo } from "react";
import { axios_api } from "@/api/axios_api";
import { ProductService } from '@/services/product-service';
import { ProductType, ProductStatus } from "@/types/ProductType";
import { toast } from "sonner";

// ---------------------------------------------------------
// 1. CONFIGURAÇÕES E UTILITÁRIOS
// ---------------------------------------------------------

// Função para calcular o status baseado na data de validade (Blindada)
export function calculateProductStatus(expiryDate: string): ProductStatus {
    if (!expiryDate) return 'valid';

    // 1. Pega o exato momento de hoje e zera as horas (horário local)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expDate: Date;

    try {
        // 2. Arranca a data limpa (ex: "2026-05-25") ignorando qualquer fuso horário
        const datePart = expiryDate.split('T')[0];
        const [year, month, day] = datePart.split('-');

        // 3. Monta a data no horário local para a matemática bater exato com o 'today'
        expDate = new Date(Number(year), Number(month) - 1, Number(day));
    } catch (e) {
        // Fallback de segurança
        expDate = new Date(expiryDate);
    }

    // 4. Calcula a diferença real em dias
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Regras
    if (diffDays < 0) return 'expired';      // Ontem ou antes
    if (diffDays <= 7) return 'critical';    // De hoje (0) até 7 dias
    if (diffDays <= 30) return 'alert';      // De 8 a 30 dias

    return 'valid';                          // 31+ dias
}

// ---------------------------------------------------------
// 2. INTERFACES E TIPAGENS
// ---------------------------------------------------------

export interface BlueSoftResponse {
    description: string;
    category?: {
        description: string;
    };
    avg_price: string;
    gtin: string;
    thumbnail?: string;
}

type ProductsContextType = {
    products: ProductType[];
    addProduct: (product: Omit<ProductType, 'status'>) => Promise<void>;
    getProducts: () => Promise<void>;
    isLoading: boolean;
    expiredProducts: ProductType[];
    criticalProducts: ProductType[];
    alertProducts: ProductType[];
    validProducts: ProductType[];
    financialRisk: number;
    deleteProduct: (id: number | string) => Promise<void>;
    getProductToFillForm: (barCode: string) => Promise<BlueSoftResponse>;
    putOnSale: (id: number | string) => Promise<void>;
    expiringProducts: ProductType[];
    riskyProducts: ProductType[];
};

export const ProductsContext = createContext({} as ProductsContextType);

// ---------------------------------------------------------
// 3. PROVIDER DO CONTEXTO
// ---------------------------------------------------------

export const ProductsContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [products, setProducts] = useState<ProductType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {
        expiredProducts,
        criticalProducts,
        alertProducts,
        validProducts,
        financialRisk
    } = useMemo(() => ProductService(products), [products]);

      const riskyProducts = [...expiredProducts, ...criticalProducts, ...alertProducts];
      const [expiringProducts, setExpiringProducts] = useState<ProductType[]>(criticalProducts.concat(alertProducts));

    // Funções API Flask (CRUD PRINCIPAL)
    async function getProducts() {
        try {
            setIsLoading(true);
            const response = await axios_api.get('/products');
            const productsData = response.data.products || response.data;

            const transformedProducts: ProductType[] = [];

            for (const product of productsData) {
                if (product.batches && Array.isArray(product.batches)) {
                    for (const batch of product.batches) {
                        transformedProducts.push({
                            id: `${product.id}-${batch.id}`,
                            name: product.name,
                            barcode: product.barcode,
                            category: product.category || '',
                            expiryDate: batch.expiry_date,
                            price: product.price,
                            // Usa a função para calcular o status real na hora
                            status: calculateProductStatus(batch.expiry_date),
                            quantity: batch.quantity,
                            batch: batch.id
                        });
                    }
                } else {
                    transformedProducts.push({
                        id: product.id,
                        name: product.name,
                        barcode: product.barcode,
                        category: product.category || '',
                        expiryDate: product.expiryDate || product.expiry_date,
                        price: product.price,
                        status: calculateProductStatus(product.expiryDate || product.expiry_date),
                        quantity: product.quantity || 0,
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
            const savedData = response.data;

            const transformedProduct: ProductType = {
                id: `${savedData.id}-${savedData.batch}`,
                name: savedData.name,
                barcode: savedData.barcode,
                category: savedData.category || '',
                expiryDate: savedData.expiryDate,
                price: savedData.price,
                // Define o status do produto novo na hora de salvar
                status: calculateProductStatus(savedData.expiryDate),
                quantity: savedData.quantity,
                batch: savedData.batch
            };

            setProducts(prev => [...prev, transformedProduct]);
            toast.success('Produto cadastrado com sucesso!');

        } catch (error: unknown) {
            console.error('Erro ao adicionar produto:', error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Erro ao cadastrar produto');
        }
    }

    async function deleteProduct(id: number | string) {
        try {
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

    async function getProductToFillForm(barCode: string): Promise<BlueSoftResponse> {
        try {
            const response = await axios_api.get(`/products/barcode/${barCode}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produto por código de barras:', error);
            return {
                description: '',
                avg_price: '0',
                gtin: barCode
            };
        }
    }

    // FUNCOES SECUNDARIAS
    async function putOnSale(id: number | string) {
    try {
        await axios_api.put(`/products/expiring/${id}`);
        setProducts(currentProducts =>
            currentProducts.map(product => {
                const productProductId = typeof product.id === 'string'
                    ? parseInt(product.id.split('-')[0])
                    : product.id;

                return productProductId === id ? { ...product } : product;
            })
        );
        setExpiringProducts(prev => prev.filter(product => {
            const productProductId = typeof product.id === 'string'
                ? parseInt(product.id.split('-')[0])
                : product.id;
            return productProductId !== id;
        }));

        toast.success('Produto promovido com sucesso!');

    } catch (error) {
        console.error('Erro ao promover produto:', error);
        toast.error('Erro ao promover produto');
    }
}


    return (
        <ProductsContext.Provider value={{
            products,
            addProduct,
            getProducts,
            isLoading,
            expiredProducts,
            criticalProducts,
            alertProducts,
            validProducts,
            financialRisk,
            deleteProduct,
            getProductToFillForm,
            putOnSale,
            expiringProducts,
            riskyProducts
        }}>
            {children}
        </ProductsContext.Provider>
    );
};
