import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from students.models import StudentProfile
from abacus.models import AbacusTest, AbacusQuestion, AbacusAttempt, AbacusAnswer

client = APIClient()

print("=== RUNNING BATCH 4 ABACUS INTEGRATION TESTS ===")

# Clean up any leftover test users
User.objects.filter(username='abacus_tester').delete()
User.objects.filter(email='abacus_tester@example.com').delete()

# 1. Register student
reg_res = client.post('/api/auth/register/', data={
    'username': 'abacus_tester',
    'email': 'abacus_tester@example.com',
    'password': 'RohanSecure@2026',
    'first_name': 'Rohan',
    'last_name': 'Patel',
    'phone_number': '9876543210'
}, format='json')
if reg_res.status_code != 201:
    print("Registration error:", reg_res.data)
assert reg_res.status_code == 201
access_token = reg_res.data['access']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

# 2. Check level before assignment
level_res1 = client.get('/api/abacus/my-level/')
print("1. Level before assignment:", level_res1.data)
assert level_res1.status_code == 200
assert level_res1.data['has_assigned_level'] is False

tests_res1 = client.get('/api/abacus/tests/')
assert tests_res1.status_code == 200
assert len(tests_res1.data) == 0

# 3. Assign Level 1 to student
user = User.objects.get(username='abacus_tester')
profile = user.student_profile
profile.abacus_level = 'LEVEL_1'
profile.save()

# 4. Check level after assignment
level_res2 = client.get('/api/abacus/my-level/')
print("2. Level after assignment:", level_res2.data)
assert level_res2.data['abacus_level'] == 'LEVEL_1'
assert level_res2.data['abacus_level_display'] == 'Level 1'

# 5. Check available tests
tests_res2 = client.get('/api/abacus/tests/')
print(f"3. Available tests for Level 1: {len(tests_res2.data)}")
assert len(tests_res2.data) >= 1
level_1_test = tests_res2.data[0]
test_id = level_1_test['id']
print("   Test Name:", level_1_test['title'])

# 6. Verify security: Accessing Junior test should be 403 Forbidden
junior_test = AbacusTest.objects.filter(level='JUNIOR').first()
if junior_test:
    forbidden_res = client.get(f'/api/abacus/tests/{junior_test.id}/')
    print("4. Forbidden test access status:", forbidden_res.status_code)
    assert forbidden_res.status_code == 403

# 7. Start Level 1 test
start_res = client.post(f'/api/abacus/tests/{test_id}/start/')
print("5. Start test status:", start_res.status_code)
assert start_res.status_code in [200, 201]
attempt_id = start_res.data['id']
questions = start_res.data['questions']
print(f"   Attempt ID: {attempt_id}, Questions: {len(questions)}, Remaining Seconds: {start_res.data['remaining_seconds']}")

# Verify correct_option is NEVER in the public question payload
for q in questions:
    assert 'correct_option' not in q, "Security breach: correct_option exposed in public serializer!"

# 8. Save answers
# Answer first 2 questions with 'A', skip the rest
q1_id = questions[0]['id']
q2_id = questions[1]['id']

ans1_res = client.post(f'/api/abacus/attempts/{attempt_id}/answers/', data={
    'question_id': q1_id,
    'selected_option': 'A'
}, format='json')
assert ans1_res.status_code == 200
assert ans1_res.data['selected_option'] == 'A'

ans2_res = client.post(f'/api/abacus/attempts/{attempt_id}/answers/', data={
    'question_id': q2_id,
    'selected_option': 'B'
}, format='json')
assert ans2_res.status_code == 200

# 9. Retrieve active attempt (page reload test)
attempt_detail = client.get(f'/api/abacus/attempts/{attempt_id}/')
assert attempt_detail.status_code == 200
saved_answers = attempt_detail.data['saved_answers']
assert saved_answers.get(str(q1_id)) == 'A'
assert saved_answers.get(str(q2_id)) == 'B'
print("6. Page reload test: Saved answers recovered successfully:", saved_answers)

# 10. Submit test manually
submit_res = client.post(f'/api/abacus/attempts/{attempt_id}/submit/')
print("7. Submission Result:", submit_res.data)
assert submit_res.status_code == 200
result = submit_res.data
assert result['status'] == 'SUBMITTED'
assert result['total_questions'] == len(questions)
assert result['attended_questions'] == 2
assert result['skipped_questions'] == len(questions) - 2

# 11. View Results endpoint
final_result_res = client.get(f'/api/abacus/attempts/{attempt_id}/result/')
assert final_result_res.status_code == 200
assert final_result_res.data['id'] == attempt_id

# 12. Test login via mobile number
client.credentials() # Clear token
mobile_login_res = client.post('/api/auth/login/', data={
    'username': '9876543210',
    'password': 'RohanSecure@2026'
}, format='json')
print("8. Mobile Number Login Status:", mobile_login_res.status_code)
assert mobile_login_res.status_code == 200
assert mobile_login_res.data['user']['username'] == 'abacus_tester'
assert mobile_login_res.data['user']['abacus_level'] == 'LEVEL_1'
print("   Logged in user from mobile number:", mobile_login_res.data['user'])

# Clean up test user
user.delete()
print("=== ALL BATCH 4 BACKEND INTEGRATION TESTS PASSED ===")

