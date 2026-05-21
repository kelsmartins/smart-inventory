from app import db
from datetime import datetime

class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='sales')

    def __repr__(self):
        return f"<Sale {self.id} - Total: {self.total}>"

class SaleItem(db.Model):
    __tablename__ = 'sale_items'

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    sale = db.relationship('Sale', backref='items')

    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product', backref='sale_items')

    batch_id = db.Column(db.Integer, db.ForeignKey('batches.id'), nullable=False)
    batch = db.relationship('Batch', backref='sale_items')

    def __repr__(self):
        return f"<SaleItem {self.product_id} x{self.quantity}>"
