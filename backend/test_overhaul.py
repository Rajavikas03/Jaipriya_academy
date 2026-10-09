import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from students.models import StudentProfile
from abacus.models import AbacusTest, AbacusQuestion, AbacusAttempt

client = APIClient()

print("=== RUNNING FULL-STACK AUTH & ADMIN OVERHAUL INTEGRATION TESTS ===")

# Clean up any leftover test data
User.objects.filter(username='9812345678').delete()
StudentProfile.objects.filter(mobile_number='9812345678').delete()
AbacusTest.objects.filter(title='Week 3 Abacus - Level 3 Grand Sprint').delete()

# 1. Passwordless Student Login (Existing Student: Ananya)
s_res = client.post('/api/auth/student-login/', data={'mobile_number': '9876543210'}, format='json')
print("1. Student Login (9876543210):", s_res.status_code)
assert s_res.status_code == 200
s_data = s_res.data
assert s_data['user']['role'] == 'STUDENT'
assert s_data['user']['full_name'] == 'Ananya Sharma'
assert s_data['user']['abacus_level'] == 'LEVEL_3'
ananya_token = s_data['access']

# 2. Student Login with Non-Existent Mobile
invalid_res = client.post('/api/auth/student-login/', data={'mobile_number': '9000000000'}, format='json')
print("2. Non-existent Student Login:", invalid_res.status_code)
assert invalid_res.status_code == 400
assert 'Your account has not been added yet' in str(invalid_res.data)

# 3. Admin Login (Mobile: 9999999999, Password: admin123)
admin_res = client.post('/api/auth/admin-login/', data={'mobile_number': '9999999999', 'password': 'admin123'}, format='json')
print("3. Admin Login (9999999999 / admin123):", admin_res.status_code)
assert admin_res.status_code == 200
admin_token = admin_res.data['access']
assert admin_res.data['user']['role'] == 'ACADEMY_ADMIN'

# 4. Admin Creates a New Student
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
new_student_payload = {
    'full_name': 'Kavya Singh',
    'mobile_number': '9812345678',
    'standard': 'Class 5',
    'date_of_birth': '2014-05-12',
    'abacus_level': 'LEVEL_3',
    'parent_name': 'Harish Singh',
    'school_name': 'St. Xavier Academy'
}
create_student_res = client.post('/api/admin/students/', data=new_student_payload, format='json')
print("4. Admin Created Student Status:", create_student_res.status_code)
if create_student_res.status_code != 201:
    print("Create student error:", create_student_res.data)
assert create_student_res.status_code == 201
new_student_data = create_student_res.data
assert new_student_data['full_name'] == 'Kavya Singh'
assert new_student_data['abacus_level'] == 'LEVEL_3'
assert new_student_data['student_id'].startswith('JPA-2026-')

# 5. Immediate Passwordless Login by Newly Created Student (Kavya)
client.credentials() # Reset credentials
kavya_login_res = client.post('/api/auth/student-login/', data={'mobile_number': '9812345678'}, format='json')
print("5. Newly Created Student Login (9812345678):", kavya_login_res.status_code)
assert kavya_login_res.status_code == 200
assert kavya_login_res.data['user']['full_name'] == 'Kavya Singh'
kavya_token = kavya_login_res.data['access']

# 6. Admin Publishes a New Abacus Test with 5 Questions
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
new_test_payload = {
    'title': 'Week 3 Abacus - Level 3 Grand Sprint',
    'level': 'LEVEL_3',
    'duration_minutes': 10,
    'questions': [
        {'question_text': 'Compute: 25 x 4 + 50', 'option_a': '150', 'option_b': '140', 'option_c': '160', 'option_d': '130', 'correct_option': 'A'},
        {'question_text': 'Compute: 180 / 2 + 10', 'option_a': '100', 'option_b': '90', 'option_c': '110', 'option_d': '95', 'correct_option': 'A'},
        {'question_text': 'Compute: 75 + 75 - 25', 'option_a': '125', 'option_b': '120', 'option_c': '130', 'option_d': '115', 'correct_option': 'A'},
        {'question_text': 'Compute: 300 - 150 + 20', 'option_a': '170', 'option_b': '160', 'option_c': '180', 'option_d': '175', 'correct_option': 'A'},
        {'question_text': 'Compute: 60 x 3 - 30', 'option_a': '150', 'option_b': '140', 'option_c': '160', 'option_d': '130', 'correct_option': 'A'},
    ]
}
publish_res = client.post('/api/admin/abacus/tests/', data=new_test_payload, format='json')
print("6. Admin Published Test Status:", publish_res.status_code)
if publish_res.status_code != 201:
    print("Publish test error:", publish_res.data)
assert publish_res.status_code == 201
published_test_id = publish_res.data['test']['id']

# 7. Student (Kavya - Level 3) Sees & Takes the Published Test
client.credentials(HTTP_AUTHORIZATION=f'Bearer {kavya_token}')
tests_list_res = client.get('/api/abacus/tests/')
assert any(t['id'] == published_test_id for t in tests_list_res.data)

# Start test
start_test_res = client.post(f'/api/abacus/tests/{published_test_id}/start/')
assert start_test_res.status_code in [200, 201]
attempt_id = start_test_res.data['id']
q_ids = [q['id'] for q in start_test_res.data['questions']]

# Answer 4 questions correctly, skip 1
for q_id in q_ids[:4]:
    client.post(f'/api/abacus/attempts/{attempt_id}/answers/', data={'question_id': q_id, 'selected_option': 'A'}, format='json')

# Submit test
submit_res = client.post(f'/api/abacus/attempts/{attempt_id}/submit/')
assert submit_res.status_code == 200
assert submit_res.data['total_questions'] == 5
assert submit_res.data['attended_questions'] == 4
assert submit_res.data['correct_answers'] == 4
assert submit_res.data['skipped_questions'] == 1
print("7. Kavya Test Score:", submit_res.data['score_display'])

# 8. Admin Views Test Scores
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
scores_res = client.get(f'/api/admin/abacus/tests/{published_test_id}/scores/')
print("8. Admin Test Scores Query Status:", scores_res.status_code)
assert scores_res.status_code == 200
scores_data = scores_res.data
assert scores_data['total_submissions'] == 1
student_score_entry = scores_data['scores'][0]
assert student_score_entry['student_name'] == 'Kavya Singh'
assert student_score_entry['student_mobile'] == '9812345678'
assert student_score_entry['score_display'] == '4 / 5'
print("   Admin verified score record:", student_score_entry)

# Clean up Kavya & test
User.objects.filter(username='9812345678').delete()
StudentProfile.objects.filter(mobile_number='9812345678').delete()
AbacusTest.objects.filter(id=published_test_id).delete()

print("=== ALL FULL-STACK AUTH & ADMIN OVERHAUL TESTS PASSED ===")

