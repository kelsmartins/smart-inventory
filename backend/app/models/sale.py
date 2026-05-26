from app.extensions.db import db
from datetime import datetime 

class Sale(db.Model):
    """
    Modelo de Venda: Representa o cabeçalho de uma transação de saída.
    """
    __tablename__ = 'sales'

    # Identificador único da venda
    id = db.Column(db.Integer, primary_key=True)
    
    # Valor total da venda (Soma de todos os itens)
    total_price = db.Column(db.Float, nullable=False, default=0.0)
    
    # Data e hora da ocorrência da venda
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com o usuário que realizou a venda
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='sales')

    def __repr__(self):
        return f"<Sale {self.id} - Total: {self.total_price}>"

class SaleItem(db.Model):
    """
    Modelo de Item de Venda: Detalha cada produto vendido em uma transação.
    Crucial para saber de qual LOTE saiu o produto (Rastreabilidade).
    """
    __tablename__ = 'sale_items'

    # Identificador único do item
    id = db.Column(db.Integer, primary_key=True)

    # Nome do produto no momento da venda (evita erros se o nome do produto mudar depois)
    name = db.Column(db.String(255), nullable=False)
    
    # Quantidade vendida deste item
    quantity = db.Column(db.Float, nullable=False)
    
    # Preço unitário no momento da venda (evita erros se o preço do produto mudar depois)
    unit_price = db.Column(db.Float, nullable=False)

    # Relacionamento com a venda principal
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    sale = db.relationship('Sale', backref='items')

    # Relacionamento com o produto vendido
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='sale_items')

    # Relacionamento com o lote específico (Essencial para comprovar a lógica FEFO)
    batch_id = db.Column(db.Integer, db.ForeignKey('batches.id'), nullable=False)
    batch = db.relationship('Batch', backref='sale_items')

    def __repr__(self):
        return f"<SaleItem {self.name} x{self.quantity}>"