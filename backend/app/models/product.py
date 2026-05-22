from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    barcode = db.Column(db.String(50), unique=True, nullable=True) # 'barcode'
    category = db.Column(db.String(100), nullable=True)
    expiry_date = db.Column(db.Date, nullable=False)              # 'expiryDate'
    price = db.Column(db.Float, nullable=False, default=0.0)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    batch_code = db.Column(db.String(100), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='products')

    def __repr__(self):
        return f"<Product {self.name} - barcode: {self.barcode}>"
