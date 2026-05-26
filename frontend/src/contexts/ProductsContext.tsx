'use client';
import { createContext, useState, useMemo } from "react";
import { axios_api } from "@/api/axios_api";
import { ProductService } from '@/services/product-service';
import { ProductType } from "@/types/ProductType";
import { toast } from "sonner";

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
    deleteProduct: (id: number) => Promise<void>;
    getProductToFillForm: (barCode: string) => Promise<BlueSoftResponse>;
    putOnSale: (id: number) => Promise<void>;
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
        calculateProductStatus,
        expiredProducts,
        criticalProducts,
        alertProducts,
        validProducts,
        financialRisk
    } = useMemo(() => ProductService(products), [products]);

    const riskyProducts = [...expiredProducts, ...criticalProducts, ...alertProducts];

    // Array puramente numérico para guardar os IDs
    const [idsResolvidos, setIdsResolvidos] = useState<number[]>([]);
    
    // Variável super limpa (sem split!)
    const expiringProducts = [...criticalProducts, ...alertProducts].filter(
        (product) => !idsResolvidos.includes(product.id as number)
    );

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
                            id: product.id, // <-- Apenas Number direto
                            name: product.name,
                            barcode: product.barcode,
                            category: product.category || '',
                            expiryDate: batch.expiry_date,
                            price: product.price,
                            status: calculateProductStatus(batch.expiry_date),
                            quantity: batch.quantity,
                            batch: batch.id
                        });
                    }
                } else {
                    transformedProducts.push({
                        id: product.id, // <-- Apenas Number direto
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
                id: savedData.id, // <-- Apenas Number direto
                name: savedData.name,
                barcode: savedData.barcode,
                category: savedData.category || '',
                expiryDate: savedData.expiryDate,
                price: savedData.price,
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

    async function deleteProduct(id: number) {
    try {
        await axios_api.delete(`/products/${id}`);
        
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));

    } catch (error) {
        console.error("Erro ao deletar produto:", error);
    }
}

    async function getProductToFillForm(barCode: string): Promise<BlueSoftResponse> {
        try {
            const response = await axios_api.get(`/products/barcode/${barCode}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return {
                description: '',
                avg_price: '0',
                gtin: barCode
            };
        }
    }

    // FUNCOES SECUNDARIAS
    async function putOnSale(id: number) {
        try {
            await axios_api.put(`/products/expiring/${id}`);
            
            // Map direto, sem splits!
            setProducts(currentProducts =>
                currentProducts.map(product => product.id === id ? { ...product } : product)
            );

            // Adiciona o ID na lista de resolvidos para esconder do banner
            setIdsResolvidos(prev => [...prev, id]);

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