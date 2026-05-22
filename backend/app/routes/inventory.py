from flask import Blueprint, jsonify
from app import db
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/expiring', methods=['GET'])
@jwt_required()
def get_expiring_products():
    """
    Identifica produtos que vencerão nos próximos 30 dias.
    Lógica: Filtra produtos onde a data de validade está entre 'hoje' e 'hoje + 30 dias'.
    """
    user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    thirty_days_later = today + timedelta(days=30)
    
    products = Product.query.filter(
        Product.user_id == user_id,
        Product.expiry_date >= today,
        Product.expiry_date <= thirty_days_later
    ).order_by(Product.expiry_date.asc()).all()
    
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "expiryDate": p.expiry_date.isoformat(),
            "quantity": p.quantity
        })
        
    return jsonify(result), 200

@inventory_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_inventory_summary():
    """
    Gera um resumo quantitativo do inventário do usuário.
    Retorno: Quantidade de produtos únicos e total de itens em estoque.
    """
    user_id = get_jwt_identity()
    total_products = Product.query.filter_by(user_id=user_id).count()
    total_items = db.session.query(db.func.sum(Product.quantity)).filter_by(user_id=user_id).scalar() or 0
    
    return jsonify({
        "total_products": total_products,
        "total_items": total_items
    }), 200