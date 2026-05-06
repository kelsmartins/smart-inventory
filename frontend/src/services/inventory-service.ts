// Centraliza cálculos e regras de validade para ADS
export const InventoryService = {
  
  // Cálculo de valor total do estoque para Dashboard
  calculateTotalValue: (products: any[]) => {
    return products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },

  // REGRA FEFO: Determina o status visual baseado nos dias restantes
  getFEFOStatus: (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Vencido', color: 'bg-red-700' };
    if (diffDays <= 7) return { label: 'Crítico', color: 'bg-orange-600' };
    if (diffDays <= 30) return { label: 'Atenção', color: 'bg-yellow-500' };
    return { label: 'Em Dia', color: 'bg-green-600' };
  },

  // Ordenação automática para a lista do InventoryPage
  sortByExpiry: (products: any[]) => {
    return [...products].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }
};