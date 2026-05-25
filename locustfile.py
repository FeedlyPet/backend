"""
FeedlyPet Load Test
Usage:
  1 replica:  locust -f locustfile.py --host=http://104.248.45.74:3000 --users=50 --spawn-rate=5 --run-time=60s --headless
  3 replicas: locust -f locustfile.py --host=http://104.248.45.74:3000 --users=150 --spawn-rate=10 --run-time=60s --headless
"""

import random
from locust import HttpUser, task, between

# Fill in a real token after login, or use the login task to get one dynamically
TEST_EMAIL = "loadtest@feedlypet.com"
TEST_PASSWORD = "LoadTest123!"


class FeedlyPetUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Login and save token."""
        response = self.client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        })
        if response.status_code == 200:
            self.token = response.json().get("accessToken")
        else:
            self.token = None

    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(5)
    def get_devices(self):
        self.client.get("/devices", headers=self.auth_headers())

    @task(3)
    def get_pets(self):
        self.client.get("/pets", headers=self.auth_headers())

    @task(2)
    def get_notifications(self):
        self.client.get("/notifications", headers=self.auth_headers())

    @task(1)
    def get_profile(self):
        self.client.get("/users/profile", headers=self.auth_headers())
