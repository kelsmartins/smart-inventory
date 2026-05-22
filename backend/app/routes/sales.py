from flask import Blueprint
from flask import jsonify

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/sales', methods=['GET'])
def get_sales():
    # Lógica para buscar todas as vendas do banco (usando Sale.query.all())
    return jsonify({"message": "Lista de vendas"}), 200

@sales_bp.route('/sales', methods=['POST'])
def create_sale():
    # Lógica para adicionar nova venda
    return jsonify({"message": "Venda criada com sucesso"}), 201