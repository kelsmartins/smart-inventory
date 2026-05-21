from app import db
from datetime import datetime

class Batch(db.Model):
    __tablename__ = 'batches'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(100), nullable=False)
    manufacturing_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0.0)
    initial_quantity = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='batches')

    def __repr__(self):
        return f"<Batch {self.code} - Expires: {self.expiry_date}>"
