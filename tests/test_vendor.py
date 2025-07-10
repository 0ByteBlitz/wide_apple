import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestVendorEndpoints(unittest.TestCase):
    def setUp(self):
        self.username = "vendoruser"
        self.password = "Vendorpass1!"
        client.post("/auth/register", json={"username": self.username, "password": self.password})
        login_resp = client.post("/auth/token", data={"username": self.username, "password": self.password})
        self.token = login_resp.json()["access_token"]

    def test_get_vendors(self):
        response = client.get("/vendors")
        self.assertEqual(response.status_code, 200)

    def test_get_my_vendor(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = client.get("/vendors/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.json())
        self.assertIn("name", response.json())

if __name__ == "__main__":
    unittest.main(verbosity=2)
