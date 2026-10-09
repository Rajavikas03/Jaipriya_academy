import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from students.models import StudentProfile

client = APIClient()

print("=== RUNNING BATCH 3 INTEGRATION TESTS ===")

# Clean up any leftover test data
User.objects.filter(username='priya_student').delete()
User.objects.filter(email='priya.student@example.com').delete()

# Test 1: Register a new student
reg_payload = {
    "username": "priya_student",
    "email": "priya.student@example.com",
    "password": "strongPassword123",
    "first_name": "Priya",
    "last_name": "Academy"
}

res = client.post('/api/auth/register/', data=reg_payload, format='json')
print(f"1. Registration Status: {res.status_code}")
if res.status_code != 201:
    print("Error response:", res.data)
assert res.status_code == 201, f"Expected 201, got {res.status_code}"
reg_data = res.data
print("   Registered User:", reg_data.get('user'))
assert 'access' in reg_data
assert 'refresh' in reg_data
assert reg_data['user']['role'] == 'STUDENT'
assert reg_data['user']['student_id'] is not None
access_token = reg_data['access']
refresh_token = reg_data['refresh']

# Verify database records
user = User.objects.get(username='priya_student')
assert user.role == User.ROLE_STUDENT
profile = StudentProfile.objects.get(user=user)
print(f"   Database Student Profile Created: {profile.student_id}")

# Test 2: Login
login_payload = {
    "username": "priya_student",
    "password": "strongPassword123"
}
res_login = client.post('/api/auth/login/', data=login_payload, format='json')
print(f"2. Login Status: {res_login.status_code}")
if res_login.status_code != 200:
    print("Error login response:", res_login.data)
assert res_login.status_code == 200, f"Expected 200, got {res_login.status_code}"
login_data = res_login.data
assert 'access' in login_data
assert 'user' in login_data
assert login_data['user']['username'] == 'priya_student'

# Test 3: /api/auth/me/ with access token
client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
res_me = client.get('/api/auth/me/')
print(f"3. /api/auth/me/ Status: {res_me.status_code}")
assert res_me.status_code == 200
me_data = res_me.data
print("   Current User Data:", me_data)
assert me_data['username'] == 'priya_student'
assert me_data['role'] == 'STUDENT'
assert me_data['student_id'] == profile.student_id

# Test 4: /api/auth/me/ without token (should fail 401)
client.credentials() # reset credentials
res_unauth = client.get('/api/auth/me/')
print(f"4. Unauthenticated /api/auth/me/ Status: {res_unauth.status_code}")
assert res_unauth.status_code == 401

# Test 5: Token Refresh
refresh_payload = {
    "refresh": refresh_token
}
res_refresh = client.post('/api/auth/token/refresh/', data=refresh_payload, format='json')
print(f"5. Token Refresh Status: {res_refresh.status_code}")
assert res_refresh.status_code == 200
assert 'access' in res_refresh.data

# Clean up test user
user.delete()
print("=== ALL BATCH 3 BACKEND INTEGRATION TESTS PASSED ===")

