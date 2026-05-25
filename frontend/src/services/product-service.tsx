
import { ProductType } from '@/types/ProductType'; 

export function ProductService(products: ProductType[]) {
    // Array functions para filtrar os produtos diretamente
    const expiredProducts = products.filter(p => p.status === 'expired');
    const criticalProducts = products.filter(p => p.status === 'critical');
    const alertProducts = products.filter(p => p.status === 'alert');
    const validProducts = products.filter(p => p.status === 'valid');

    // Calcula o risco financeiro baseando-se nos produtos problemáticos
    const financialRisk = [...alertProducts, ...criticalProducts, ...expiredProducts].reduce(
        (acc, product) => acc + (product.price * product.quantity),
        0
    );

    return {
        expiredProducts,
        criticalProducts,
        alertProducts,
        validProducts,
        financialRisk
    };
}