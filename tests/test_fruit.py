import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestFruitEndpoints(unittest.TestCase):
    def test_get_fruits(self):
        response = client.get("/fruits")
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main(verbosity=2)
