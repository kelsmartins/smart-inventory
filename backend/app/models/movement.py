from app import db
from datetime import datetime
import enum

class MovementType(enum.Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"

class Movement(db.Model):
    __tablename__ = 'movements'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.Enum(MovementType), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='movements')

    batch_id = db.Column(db.Integer, db.ForeignKey('batches.id'), nullable=False)
    batch = db.relationship('Batch', backref='movements')

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='movements')

    def __repr__(self):
        return f"<Movement {self.type.value} - Qty: {self.quantity} - Product: {self.product_id}>"
