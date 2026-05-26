from flask import Blueprint, jsonify, request
from app import db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.movement import Movement, MovementType
from app.services.fefo_service import FEFOService

from app.auth_middleware import require_supabase_auth

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/', methods=['GET'])
@require_supabase_auth
def get_sales(user_id):
    """
    Lista todas as vendas realizadas pelo usuário logado.
    Retorno: Detalhes da venda, valor total e lista de itens vendidos.
    """
    sales = Sale.query.filter_by(user_id=user_id).all()
    
    result = []
    for s in sales:
        items = []
        for item in s.items:
            items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price
            })
        result.append({
            "id": s.id,
            "total": s.total,
            "created_at": s.created_at.isoformat(),
            "items": items
        })
    
    return jsonify(result), 200

@sales_bp.route('/', methods=['POST'])
@require_supabase_auth
def create_sale(user_id):
    """
    Processa uma nova venda, aplicando a lógica FEFO para baixa de estoque.
    Requisito: JSON com lista de 'items' contendo 'product_id' e 'quantity'.
    """
    data = request.get_json()
    
    if not data or 'items' not in data or not data['items']:
        return jsonify({"message": "Sale items are required"}), 400
    
    total = 0.0
    sale = Sale(user_id=user_id)
    db.session.add(sale)
    db.session.flush() # Gera o ID da venda para vincular os itens
    
    try:
        for item_data in data['items']:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity')
            
            if not product_id or not quantity:
                return jsonify({"message": "Product ID and quantity are required for each item"}), 400
            
            # Verifica se o produto existe e pertence ao usuário
            product = Product.query.filter_by(id=product_id, user_id=user_id).first()
            if not product:
                return jsonify({"message": f"Product {product_id} not found"}), 404
            
            # Verifica se há estoque suficiente no total
            if product.quantity < quantity:
                return jsonify({"message": f"Insufficient stock for product {product.name}"}), 400
            
            # --- APLICAÇÃO DA LÓGICA FEFO ---
            # O serviço busca quais lotes devem ser consumidos primeiro (os que vencem antes)
            allocation = FEFOService.get_best_batch(product.id, quantity)
            if not allocation:
                return jsonify({"message": f"No batches available for product {product.name}"}), 400
            
            # Atualiza a quantidade total do produto
            product.quantity -= quantity
            
            # Cálculo do valor total da venda
            unit_price = product.price
            total += unit_price * quantity
            
            # Para cada lote selecionado pelo FEFO, cria um item de venda e um log de movimentação
            for batch, take in allocation:
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=take,
                    unit_price=unit_price,
                    batch_id=batch.id
                )
                db.session.add(sale_item)
                
                # Reduz a quantidade especificamente do lote
                batch.quantity -= take
                
                # Registra a movimentação de saída para auditoria
                movement = Movement(
                    type=MovementType.OUT,
                    quantity=take,
                    reason="Sale",
                    product_id=product.id,
                    batch_id=batch.id,
                    user_id=user_id
                )
                db.session.add(movement)
            
        sale.total = total
        db.session.commit() # Finaliza a transação
        return jsonify({"message": "Sale created successfully", "sale_id": sale.id, "total": total}), 201
        
    except Exception as e:
        db.session.rollback() # Reverte tudo se houver erro para evitar estoque inconsistente
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500