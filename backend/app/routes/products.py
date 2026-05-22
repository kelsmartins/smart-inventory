
from flask import Blueprint
from flask import jsonify
products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    # Lógica para buscar todos os produtos do banco (usando Product.query.all())
    return jsonify({"message": "Lista de produtos"}), 200

@products_bp.route('/', methods=['POST'])
def create_product():
    # Lógica para adicionar produto novo
    return jsonify({"message": "Produto criado com sucesso"}), 201