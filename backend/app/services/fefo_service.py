from app.models.batch import Batch
from app import db

class FEFOService:
    @staticmethod
    def get_best_batch(product_id, quantity):
        """
        Finds the best batches to satisfy the required quantity based on FEFO.
        Returns a list of (batch, quantity_to_take) tuples.
        """
        # Get all batches for the product, sorted by expiry date (earliest first)
        batches = Batch.query.filter_by(product_id=product_id).order_by(Batch.expiry_date.asc()).all()
        
        allocated_batches = []
        remaining_qty = quantity
        
        for batch in batches:
            if batch.quantity <= 0:
                continue
            
            take = min(batch.quantity, remaining_qty)
            allocated_batches.append((batch, take))
            remaining_qty -= take
            
            if remaining_qty <= 0:
                break
        
        if remaining_qty > 0:
            return None # Not enough stock across all batches
            
        return allocated_batches

    @staticmethod
    def reduce_stock_fefo(product_id, quantity):
        """
        Reduces stock from batches following FEFO.
        """
        allocation = FEFOService.get_best_batch(product_id, quantity)
        if not allocation:
            return False
            
        for batch, take in allocation:
            batch.quantity -= take
            
        db.session.commit()
        return True