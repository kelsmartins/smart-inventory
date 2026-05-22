from flask import Blueprint, jsonify, request
from app import db, jwt
from app.models.product import Product
from app.models.batch import Batch
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    """
    Lista todos os produtos vinculados ao usuário logado.
    Retorno: Lista de produtos com detalhes de estoque e validade.
    """
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=user_id).all()
    
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "barcode": p.barcode,
            "category": p.category,
            "expiryDate": p.expiry_date.isoformat() if p.expiry_date else None,
            "price": p.price,
            "quantity": p.quantity,
            "batch": p.batch_code
        })
    
    return jsonify(result), 200

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """
    Cria um novo produto e automaticamente gera o primeiro lote associado.
    Requisito: JSON com 'name' e 'expiry_date'.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or 'name' not in data or 'expiry_date' not in data:
        return jsonify({"message": "Name and expiry_date are required"}), 400
    
    try:
        expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # 1. Cria a entidade Produto
    product = Product(
        name=data.get('name'),
        barcode=data.get('barcode'),
        category=data.get('category'),
        expiry_date=expiry_date,
        price=data.get('price', 0.0),
        quantity=data.get('quantity', 1.0),
        batch_code=data.get('batch_code'),
        user_id=user_id
    )
    
    db.session.add(product)
    db.session.flush() # Garante a criação do ID do produto para usar no lote
    
    # 2. Cria automaticamente o Lote inicial (Essencial para FEFO)
    batch = Batch(
        code=data.get('batch_code') or f"BATCH-{product.id}",
        manufacturing_date=datetime.utcnow().date(),
        expiry_date=expiry_date,
        quantity=product.quantity,
        initial_quantity=product.quantity,
        product_id=product.id
    )
    db.session.add(batch)
    
    db.session.commit()
    
    return jsonify({"message": "Product and batch created successfully", "id": product.id}), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """
    Atualiza os dados de um produto existente.
    Verifica se o produto pertence ao usuário logado antes de editar.
    """
    user_id = get_jwt_identity()
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    data = request.get_json()
    
    # Atualiza apenas os campos fornecidos no JSON
    if 'name' in data: product.name = data['name']
    if 'barcode' in data: product.barcode = data['barcode']
    if 'category' in data: product.category = data['category']
    if 'price' in data: product.price = data['price']
    if 'quantity' in data: product.quantity = data['quantity']
    if 'batch_code' in data: product.batch_code = data['batch_code']
    if 'expiry_date' in data:
        try:
            product.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
            
    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """
    Remove um produto do sistema.
    """
    user_id = get_jwt_identity()
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({"message": "Product deleted successfully"}), 200