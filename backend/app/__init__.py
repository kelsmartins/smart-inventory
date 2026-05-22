# Cria e configura a instância do Flask, registra extensões e blueprints
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

# Inicializa as extensões sem o app
db = SQLAlchemy()      
migrate = Migrate()    
jwt = JWTManager()     

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Conecta as extensões ao app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Envia as tabelas para o SQLAlchemy reconhecer antes de criar o banco

    from app.models.product import Product 
    from app.models.user import User    
    from app.models.sale import Sale
    from app.models.movement import Movement
    from app.models.batch import Batch   

    # ---------- Rotas públicas básicas ----------
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'Smart Inventory API'})

    @app.route('/')
    def home():
        return '''
        <h1>Smart Inventory API</h1>
        <p>API funcionando.</p>
        '''

    # ---------- BLUEPRINTS (AQUI ESTÁ A CORREÇÃO) ----------

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