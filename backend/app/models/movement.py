from app.extensions.db import db
from datetime import datetime
import enum

class MovementType(enum.Enum):
    """
    Enumeração para tipos de movimentação:
    IN: Entrada de novo estoque.
    OUT: Saída via venda ou perda.
    ADJUSTMENT: Ajuste manual de inventário.
    """
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"

class Movement(db.Model):
    """
    Modelo de Movimentação: Registra cada alteração de quantidade no estoque.
    Isso permite reconstruir o histórico de qualquer produto em qualquer data.
    """
    __tablename__ = 'movements'

    # Identificador único da movimentação
    id = db.Column(db.Integer, primary_key=True)
    
    # Tipo da operação (entrada, saída ou ajuste)
    type = db.Column(db.Enum(MovementType), nullable=False)
    
    # Quantidade movimentada
    quantity = db.Column(db.Float, nullable=False)
    
    # Motivo da movimentação (ex: "Venda #123", "Ajuste de Inventário")
    reason = db.Column(db.String(255), nullable=True)
    
    # Data e hora exata da operação
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos para saber o que, de onde e quem moveu
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='movements')

    batch_id = db.Column(db.Integer, db.ForeignKey('batches.id'), nullable=False)
    batch = db.relationship('Batch', backref='movements')

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='movements')

    def __repr__(self):
        return f"<Movement {self.type.value} - Qty: {self.quantity} - Product: {self.product_id}>"
