from flask import Blueprint, jsonify
from app import db
from app.models.sale import Sale
from app.models.product import Product
from sqlalchemy import func

from app.auth_middleware import require_supabase_auth

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@require_supabase_auth
def get_stats(user_id):
    """
    Calcula métricas globais do inventário e financeiro do usuário.
    Utiliza funções de agregação do SQLAlchemy para performance.
    """
    
    # Receita Total: Soma de todos os totais da tabela Sale
    total_revenue = db.session.query(func.sum(Sale.total)).filter_by(user_id=user_id).scalar() or 0.0
    
    # Total de Produtos Únicos cadastrados
    total_products = Product.query.filter_by(user_id=user_id).count()
    
    # Quantidade total de itens somando todos os produtos no estoque
    total_items = db.session.query(func.sum(Product.quantity)).filter_by(user_id=user_id).scalar() or 0.0
    
    return jsonify({
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_items": total_items
    }), 200