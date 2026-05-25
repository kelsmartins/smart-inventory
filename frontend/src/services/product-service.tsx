
import { ProductStatus, ProductType } from '@/types/ProductType'; 

export function ProductService(products: ProductType[]) {

    const calculateProductStatus = (expiryDate: string): ProductStatus => {
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
        calculateProductStatus,
        expiredProducts,
        criticalProducts,
        alertProducts,
        validProducts,
        financialRisk
    };
}