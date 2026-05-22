
from flask import Blueprint
products_bp = Blueprint('products', __name__)

# # O nome da variável TEM que ser products_bp para casar com o seu __init__.py
# products_bp = Blueprint('products', __name__)

# @products_bp.route('/', methods=['GET'])
# def get_products():
#     # Lógica para buscar todos os produtos do banco (usando Product.query.all())
#     return jsonify({"message": "Lista de produtos"}), 200

# @products_bp.route('/', methods=['POST'])
# def create_product():
#     # Lógica para adicionar produto novo
#     return jsonify({"message": "Produto criado com sucesso"}), 201