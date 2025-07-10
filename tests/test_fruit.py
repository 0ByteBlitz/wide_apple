import unittest
from fastapi.testclient import TestClient
from app.main import app

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

if __name__ == "__main__":
    unittest.main(verbosity=2)
