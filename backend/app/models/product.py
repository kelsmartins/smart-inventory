from app.extensions.db import db
import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    # Identificador único do produto
    id = db.Column(db.Integer, primary_key=True)

    available = db.Column(db.Boolean, default=True, nullable=False)
    
    # Nome descritivo do item (obrigatório)
    name = db.Column(db.String(200), nullable=False)
    
    # Código de barras para identificação rápida via scanner (opcional e único)
    barcode = db.Column(db.String(50), unique=True, nullable=True)
    
    # Categoria para organização (ex: Medicamentos, Higiene)
    category = db.Column(db.String(50), nullable=True)
    
    # Data de validade geral do produto (utilizada para alertas de vencimento)
    expiry_date = db.Column(db.Date, nullable=False)
    
    # Preço de venda unitário
    price = db.Column(db.Float, nullable=False, default=0.0)
    
    # Quantidade total disponível (soma de todos os lotes)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    
    # Código do lote principal ou referência
    batch_code = db.Column(db.String(20), nullable=True)

    # Relacionamento com a tabela de Usuários (Posse do produto)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='products')

    def __repr__(self):
        """Representação textual do produto para debugging."""
        return f"<Product {self.name} - barcode: {self.barcode}>"
    
    @property
    def status(self):
        """Retorna o status do produto baseado na data de validade."""
        today = datetime.date.today()
        days_left = (self.expiry_date - today).days

        if days_left < 0:
            return "expired"
        elif days_left <= 7:
            return "critical"
        elif days_left <= 30:
            return "alert"
        else:
            return "valid"

    
    def to_dict(self):
        """
        Converte o objeto Product em um dicionário para retorno em JSON.
        Inclui os campos principais, exceto chaves estrangeiras ou relacionamentos.
        """
        return {
            'id': self.id,
            'name': self.name,
            'barcode': self.barcode,
            'category': self.category,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'price': self.price,
            'quantity': self.quantity,
            'batch_code': self.batch_code,
            'status': self.status,  # já inclui o status calculado
            'available': self.available
        }