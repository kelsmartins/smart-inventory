from flask import Blueprint
from flask import jsonify

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/products', methods=['GET'])
def get_products():
    # Lógica para buscar todos os produtos do banco (usando Product.query.all())
    return jsonify({"message": "Lista de produtos"}), 200

@inventory_bp.route('/products', methods=['POST'])
def create_product():
    # Lógica para adicionar produto novo
    return jsonify({"message": "Produto criado com sucesso"}), 201