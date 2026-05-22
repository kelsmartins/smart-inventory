from app.models.batch import Batch
from app import db

class FEFOService:
    """
    Serviço especializado em gestão de lotes por data de validade.
    """
    
    @staticmethod
    def get_best_batch(product_id, quantity):
        """
        Identifica os melhores lotes para satisfazer a quantidade solicitada.
        A regra é: Lotes com data de validade mais próxima são escolhidos primeiro.
        
        Args:
            product_id (int): ID do produto a ser vendido.
            quantity (float): Quantidade total necessária.
            
        Returns:
            List[Tuple[Batch, float]]: Lista de tuplas contendo (Lote, Quantidade a retirar).
            None: Se não houver estoque suficiente somando todos os lotes.
        """
        # Busca todos os lotes do produto, ordenando pela data de validade ascendente (mais antiga primeiro)
        batches = Batch.query.filter_by(product_id=product_id).order_by(Batch.expiry_date.asc()).all()
        
        allocated_batches = []
        remaining_qty = quantity
        
        for batch in batches:
            if batch.quantity <= 0:
                continue # Pula lotes que já estão zerados
            
            # Define quanto retirar deste lote: ou tudo o que ele tem, ou apenas o que falta para completar a venda
            take = min(batch.quantity, remaining_qty)
            allocated_batches.append((batch, take))
            remaining_qty -= take
            
            if remaining_qty <= 0:
                break # Quantidade total satisfeito, para a busca
        
        # Se após percorrer todos os lotes ainda faltar quantidade, a venda não pode ser concluída
        if remaining_qty > 0:
            return None 
            
        return allocated_batches

    @staticmethod
    def reduce_stock_fefo(product_id, quantity):
        """
        Executa a redução de estoque nos lotes seguindo a regra FEFO e persiste no banco.
        """
        allocation = FEFOService.get_best_batch(product_id, quantity)
        if not allocation:
            return False
            
        for batch, take in allocation:
            batch.quantity -= take
            
        db.session.commit()
        return True