from flask import Blueprint, jsonify
from app import db
from app.models.sale import Sale
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    
    # Total Revenue
    total_revenue = db.session.query(func.sum(Sale.total)).filter_by(user_id=user_id).scalar() or 0.0
    
    # Total Products
    total_products = Product.query.filter_by(user_id=user_id).count()
    
    # Total Items in Stock
    total_items = db.session.query(func.sum(Product.quantity)).filter_by(user_id=user_id).scalar() or 0.0
    
    return jsonify({
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_items": total_items
    }), 200