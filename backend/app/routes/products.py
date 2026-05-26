import os
import requests
from flask import Blueprint, jsonify, request
from app import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.product import Product
from app.models.batch import Batch

products_bp = Blueprint('products', __name__)

# ====================//  GET PRODUCTS  //========================
@products_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    user_id = get_jwt_identity()
    # Retorna apenas os produtos do usuário logado
    products = Product.query.filter_by(user_id=user_id, available=True).all()

    result = [p.to_dict() for p in products]
    return jsonify(result), 200


# ====================//  POST PRODUCT  //========================
@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    received_expiry = data.get('expiryDate') or data.get('expiry_date')
    
    if not data or 'name' not in data or not received_expiry:
        return jsonify({"message": "Name and expiryDate are required"}), 400
    
    try:
        date_str = received_expiry.split('T')[0]
        expiry_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    product = Product(
        name=data.get('name'),
        barcode=data.get('barcode'),
        category=data.get('category'),
        expiry_date=expiry_date,
        price=data.get('price', 0.0),
        quantity=data.get('quantity', 1.0),
        batch_code=data.get('batch_code'),
        user_id=user_id,  # <--- Salva o produto para este usuário!
        available=True  # <--- Inicialmente, o produto está disponível
    )
    
    db.session.add(product)
    db.session.flush() 
    
    batch = Batch(
        code=data.get('batch_code') or f"BATCH-{product.id}",
        expiry_date=expiry_date,
        quantity=product.quantity,
        initial_quantity=product.quantity,
        product_id=product.id
    )
    db.session.add(batch)
    db.session.commit()
    
    return jsonify({
        "id": product.id,
        "name": product.name,
        "barcode": product.barcode,
        "category": product.category,
        "price": product.price,
        "expiryDate": product.expiry_date.isoformat(),
        "quantity": product.quantity,
        "batch": product.batch_code or batch.code
    }), 201


# ====================//  PROMOVER PRODUTOS QUE ESTÃO EXPIRANDO  //========================
@products_bp.route('/expiring/<expiring_id>', methods=['PUT'])
@jwt_required()
def put_product_on_sale(expiring_id):
    user_id = get_jwt_identity()
    
    # Garante que o usuário só pode promover produtos que pertencem a ele
    expiring_product = Product.query.filter_by(id=expiring_id, user_id=user_id).first()

    if not expiring_product:
        return jsonify({"error": "Produto não encontrado ou acesso negado"}), 404

    # Aqui você pode manter sua lógica de status (alert/critical) dependendo de como você a calcula.
    # Opcional: ajustar preços se houver status guardado no banco. Se o status é calculado no frontend,
    # você pode apenas aplicar um desconto base aqui ou receber o desconto via JSON.
    if hasattr(expiring_product, 'status'):
        if expiring_product.status == 'alert':
            expiring_product.price = expiring_product.price * 0.8
        elif expiring_product.status == 'critical':
            expiring_product.price = expiring_product.price * 0.5
    else:
        # Exemplo caso não tenha o campo 'status' no banco: apenas reduz 20%
        expiring_product.price = expiring_product.price * 0.8

    db.session.commit()
    return jsonify({"message": "Produto promovido com sucesso!"}), 200


# ====================//  DELETE PRODUCT  //========================
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    
    # Busca o produto garantindo que ele existe e pertence a este usuário
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({"message": "Produto não encontrado ou acesso negado"}), 404
        
    # SOFT DELETE: Não apaga do banco, apenas torna indisponivel, oq o esconde da tela
    product.available = False
    
    # 3. Salva a alteração
    db.session.commit()
    
    return jsonify({"message": "Produto removido com sucesso!"}), 200


# ====================//  BUSCAR CÓDIGO DE BARRAS (BLUESOFT)  //========================
@products_bp.route('/barcode/<barcode>', methods=['GET'])
@jwt_required()
def buscar_produto(barcode):
    token = os.getenv("BLUESOFT_TOKEN") 
    user_agent = os.getenv("USER_AGENT")
    
    url = f"https://api.cosmos.bluesoft.com.br/gtins/{barcode}.json"
    
    headers = {
        "X-Cosmos-Token": token,
        "Content-Type": "application/json",
        "User-Agent": user_agent
    }
    
    try:
        resp = requests.get(url, headers=headers)
        
        if resp.status_code == 404:
            return jsonify({"message": "Produto não encontrado na base da Bluesoft"}), 404
            
        elif resp.status_code != 200:
            return jsonify({"message": f"Erro na API externa. Código: {resp.status_code}"}), resp.status_code
            
        return jsonify(resp.json()), 200

    except Exception as e:
        return jsonify({"message": f"Falha na comunicação: {str(e)}"}), 500
    
