from flask import Blueprint, jsonify, request
from app import db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.movement import Movement, MovementType
from app.services.fefo_service import FEFOService

# 1. IMPORTAÇÕES ATUALIZADAS
from flask_jwt_extended import jwt_required, get_jwt_identity

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/', methods=['GET'])
@jwt_required() # 2. NOVA PROTEÇÃO
def get_sales():
    # 3. PEGA O USUÁRIO LOGADO
    user_id = get_jwt_identity()
    
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
@jwt_required()
def create_sale():
    user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data or 'items' not in data or not data['items']:
        return jsonify({"message": "Sale items are required"}), 400
    
    total = 0.0
    sale = Sale(user_id=user_id)
    db.session.add(sale)
    db.session.flush() 
    
    try:
        for item_data in data['items']:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity')
            
            if not product_id or not quantity:
                return jsonify({"message": "Product ID and quantity are required for each item"}), 400
            
            product = Product.query.filter_by(id=product_id, user_id=user_id).first()
            if not product:
                return jsonify({"message": f"Product {product_id} not found"}), 404
            
            if product.quantity < quantity:
                return jsonify({"message": f"Insufficient stock for product {product.name}"}), 400
            
            allocation = FEFOService.get_best_batch(product.id, quantity)
            if not allocation:
                return jsonify({"message": f"No batches available for product {product.name}"}), 400
            
            product.quantity -= quantity
            unit_price = product.price
            total += unit_price * quantity
            
            for batch, take in allocation:
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=take,
                    unit_price=unit_price,
                    batch_id=batch.id
                )
                db.session.add(sale_item)
                
                batch.quantity -= take
                
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
        db.session.commit()
        return jsonify({"message": "Sale created successfully", "sale_id": sale.id, "total": total}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500