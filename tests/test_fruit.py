import unittest
from fastapi.testclient import TestClient
from src.app.main import app, simulate_and_store_daily_prices
from src.app.database import session_local
from src.app.models.fruit import Fruit, FruitPrice

client = TestClient(app)

class TestFruitEndpoints(unittest.TestCase):
    def test_get_fruits(self):
        response = client.get("/fruits")
        self.assertEqual(response.status_code, 200)

    def test_fruits_pagination(self):
        response = client.get("/fruits?page=1&limit=2")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_fruits_filtering(self):
        # This will pass if at least one fruit with rarity=1 exists, otherwise should return an empty list
        response = client.get("/fruits?rarity=1")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_get_prices_basic(self):
        response = client.get("/prices")
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            data = response.json()
            self.assertIn("prices", data)
            self.assertIsInstance(data["prices"], list)

    def test_get_prices_filtering(self):
        # Try with fruit_id=1 (should exist if seeded)
        response = client.get("/prices?fruit_id=1")
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            data = response.json()
            self.assertIn("prices", data)
            for price in data["prices"]:
                self.assertEqual(price["fruit_id"], 1)

    def test_get_prices_not_found(self):
        # Use a likely non-existent fruit_id
        response = client.get("/prices?fruit_id=99999")
        self.assertEqual(response.status_code, 404)

    def test_background_job_simulation(self):
        db = session_local()
        # Ensure at least one fruit exists
        if not db.query(Fruit).first():
            db.add(Fruit(name="TestFruit", flavor_profile="Sweet", dimension_origin="Earth", rarity_level=1, base_value=10.0))
            db.commit()
        db.close()
        # Run the job manually and check if prices are inserted
        simulate_and_store_daily_prices()
        db = session_local()
        prices = db.query(FruitPrice).all()
        db.close()
        self.assertGreaterEqual(len(prices), 1)

if __name__ == "__main__":
    unittest.main(verbosity=2)
