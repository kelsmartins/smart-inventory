from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.config import Config
from app.extensions.db import db

# Inicializa as outras extensões
# Migrate: Gerencia migrações do banco de dados
migrate = Migrate()
# JWTManager: Gerencia a criação e validação de tokens de acesso (Login)
jwt = JWTManager()

def create_app():
    """
    Fábrica de aplicação Flask. Configura extensões, 
    modelos e registra as rotas (Blueprints).
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Vincula extensões ao app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # CORS Agressivo: Permite que o frontend (React/Next.js) faça requisições para a API
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Importa modelos para o SQLAlchemy reconhecer as tabelas
    from app.models.product import Product
    from app.models.user import User
    from app.models.sale import Sale
    from app.models.movement import Movement
    from app.models.batch import Batch

    # ---------- ROTAS PÚBLICAS ----------
    @app.route('/health')
    def health():
        """Endpoint de verificação de saúde da API."""
        return jsonify({'status': 'ok', 'message': 'Smart Inventory API'})

    @app.route('/')
    def home():
        """Página inicial"""
        return '''
        <h1>Smart Inventory API</h1>
        <p><a href="/health">❤️ /health</a> - Status da API</p>
        '''

    # ---------- REGISTRO DOS BLUEPRINTS ----------
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.inventory import inventory_bp
    from app.routes.sales import sales_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(sales_bp, url_prefix='/sales')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    return app