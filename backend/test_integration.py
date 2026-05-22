import unittest
import os
# Set environment variable BEFORE importing create_app to avoid config issues
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
from app import create_app, db
from app.models.user import User
from app.models.product import Product
import json

class IntegrationTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()


    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_flow(self):
        # 1. Register
        reg_res = self.client.post('/auth/register', 
                                  json={'username': 'testuser', 'password': 'password123'})
        self.assertEqual(reg_res.status_code, 201)

        # 2. Login
        login_res = self.client.post('/auth/login', 
                                    json={'username': 'testuser', 'password': 'password123'})
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        # 3. Create Product
        prod_res = self.client.post('/products/', 
                                   headers=headers,
                                   json={
                                       'name': 'Painkiller', 
                                       'expiry_date': '2026-12-31', 
                                       'price': 10.0, 
                                       'quantity': 100
                                   })
        self.assertEqual(prod_res.status_code, 201)
        product_id = prod_res.get_json()['id']

        # 4. Create Sale
        sale_res = self.client.post('/sales/', 
                                   headers=headers,
                                   json={
                                       'items': [{'product_id': product_id, 'quantity': 5}]
                                   })
        self.assertEqual(sale_res.status_code, 201)
        
        # 5. Verify Dashboard
        dash_res = self.client.get('/dashboard/stats', headers=headers)
        self.assertEqual(dash_res.status_code, 200)
        stats = dash_res.get_json()
        self.assertEqual(stats['total_revenue'], 50.0)
        self.assertEqual(stats['total_products'], 1)

if __name__ == '__main__':
    unittest.main()
