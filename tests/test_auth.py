import unittest
from fastapi.testclient import TestClient
from src.app.main import app

client = TestClient(app)

class TestAuthEndpoints(unittest.TestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "Testpass1!"

    def test_register(self):
        response = client.post("/auth/register", json={"username": self.username, "password": self.password})
        self.assertIn(response.status_code, [200, 400])  # 400 if already exists

    def test_login_and_refresh(self):
        # Ensure user exists
        client.post("/auth/register", json={"username": self.username, "password": self.password})
        response = client.post("/auth/token", data={"username": self.username, "password": self.password})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        # Test /auth/me
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        me_response = client.get("/auth/me", headers=headers)
        self.assertEqual(me_response.status_code, 200)
        # Test refresh
        refresh_response = client.post(f"/auth/refresh?refresh_token={data['refresh_token']}")
        self.assertEqual(refresh_response.status_code, 200)
        self.assertIn("access_token", refresh_response.json())

if __name__ == "__main__":
    unittest.main(verbosity=2)
