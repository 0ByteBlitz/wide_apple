import unittest
from fastapi.testclient import TestClient
from src.app.main import app

client = TestClient(app)

class TestTradeEndpoints(unittest.TestCase):
    def setUp(self):
        self.username = "tradeuser"
        self.password = "Tradepass1!"
        # Register and login to get token
        client.post("/auth/register", json={"username": self.username, "password": self.password})
        login_resp = client.post("/auth/token", data={"username": self.username, "password": self.password})
        self.token = login_resp.json()["access_token"]
        # Get own vendor id
        headers = {"Authorization": f"Bearer {self.token}"}
        vendor_resp = client.get("/vendors/me", headers=headers)
        self.vendor_id = vendor_resp.json()["id"]

    def test_trade_from_own_vendor(self):
        # This will fail if there is no to_vendor_id=2 and fruit_id=1, but checks 403 logic
        headers = {"Authorization": f"Bearer {self.token}"}
        trade_data = {"from_vendor_id": self.vendor_id, "to_vendor_id": 999, "fruit_id": 999, "quantity": 1}
        response = client.post("/trade", json=trade_data, headers=headers)
        # Should not be 403, but may be 400 due to missing vendor/fruit
        self.assertNotEqual(response.status_code, 403)

    def test_trade_from_other_vendor_forbidden(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        trade_data = {"from_vendor_id": self.vendor_id + 1, "to_vendor_id": 999, "fruit_id": 999, "quantity": 1}
        response = client.post("/trade", json=trade_data, headers=headers)
        self.assertEqual(response.status_code, 403)

if __name__ == "__main__":
    unittest.main(verbosity=2)
