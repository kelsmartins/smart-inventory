from app.extensions.db import db
from datetime import datetime

class Batch(db.Model):
    """
    Modelo de Lote (Batch): Permite que um mesmo produto tenha diferentes 
    datas de validade e quantidades, essencial para a lógica FEFO.
    """
    __tablename__ = 'batches'

    # Identificador único do lote
    id = db.Column(db.Integer, primary_key=True)
    
    # Código de identificação do lote (ex: LOTE-2024-001)
    code = db.Column(db.String(100), nullable=False)
    
    # Data em que o lote foi fabricado
    manufacturing_date = db.Column(db.Date, nullable=False)
    
    # Data de validade específica deste lote (Crucial para FEFO)
    expiry_date = db.Column(db.Date, nullable=False)
    
    # Quantidade atual disponível neste lote específico
    quantity = db.Column(db.Float, nullable=False, default=0.0)
    
    # Quantidade original com que o lote entrou no estoque
    initial_quantity = db.Column(db.Float, nullable=False, default=0.0)
    
    # Timestamp de criação do registro
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com a tabela de Produtos
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='batches')

    def __repr__(self):
        return f"<Batch {self.code} - Expires: {self.expiry_date}>"
