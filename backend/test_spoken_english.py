import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from students.models import StudentProfile
from spoken_english.models import (
    SpokenEnglishTopic,
    TheorySection,
    SpokenEnglishQuestion,
    SpokenEnglishAttempt,
)

client = APIClient()

print("=== RUNNING BATCH 5 SPOKEN ENGLISH INTEGRATION TESTS ===")

# 1. Student Login (Ananya)
s_res = client.post('/api/auth/student-login/', data={'mobile_number': '9876543210'}, format='json')
assert s_res.status_code == 200
ananya_token = s_res.data['access']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {ananya_token}')

# 2. Get Spoken English Topics List
topics_res = client.get('/api/spoken-english/topics/')
print("1. Student Topics List Status:", topics_res.status_code)
assert topics_res.status_code == 200
assert len(topics_res.data) >= 1
topic = topics_res.data[0]
topic_id = topic['id']
print(f"   Found Topic: {topic['title']} ({topic['theory_count']} Theory Sections, {topic['questions_count']} Questions)")

# 3. Get Theory Sections
theory_res = client.get(f'/api/spoken-english/topics/{topic_id}/theory/')
print("2. Student Theory Sections Status:", theory_res.status_code)
assert theory_res.status_code == 200
assert len(theory_res.data['sections']) >= 1
print(f"   Retrieved {len(theory_res.data['sections'])} theory sections")

# 4. Start Practice Attempt
start_res = client.post(f'/api/spoken-english/topics/{topic_id}/start/')
print("3. Student Start Practice Status:", start_res.status_code)
assert start_res.status_code in [200, 201]
attempt_id = start_res.data['id']
questions = start_res.data['questions']
assert len(questions) >= 1

# Verify correct_option is NOT exposed in the questions payload
for q in questions:
    assert 'correct_option' not in q

# 5. Save Answers (Answer 4, Skip 1)
for q in questions[:4]:
    save_res = client.post(
        f'/api/spoken-english/attempts/{attempt_id}/answers/',
        data={'question_id': q['id'], 'selected_option': 'A'},
        format='json'
    )
    assert save_res.status_code == 200

# 6. Submit Practice
submit_res = client.post(f'/api/spoken-english/attempts/{attempt_id}/submit/')
print("4. Student Submit Practice Status:", submit_res.status_code)
assert submit_res.status_code == 200
assert submit_res.data['total_questions'] == len(questions)
assert submit_res.data['attended_questions'] == 4
assert submit_res.data['skipped_questions'] == len(questions) - 4
print("   Score Result:", submit_res.data['score_display'])

# 7. Admin Login & Topic Creation
client.credentials()
admin_login_res = client.post('/api/auth/admin-login/', data={'mobile_number': '9999999999', 'password': 'admin123'}, format='json')
assert admin_login_res.status_code == 200
admin_token = admin_login_res.data['access']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

new_topic_payload = {
    'title': 'Parts of Speech Masterclass',
    'description': 'Comprehensive overview of nouns, verbs, adjectives, and adverbs.',
    'order': 3,
    'is_active': True,
    'theory_sections': [
        {'title': '1. Nouns and Pronouns', 'content': 'A noun is a naming word. A pronoun replaces a noun.', 'order': 1},
        {'title': '2. Verbs and Adverbs', 'content': 'A verb is an action word. An adverb describes the action.', 'order': 2},
    ],
    'questions': [
        {'question_text': 'Identify the verb: "The runner sprinted across the finish line."', 'option_a': 'runner', 'option_b': 'sprinted', 'option_c': 'across', 'option_d': 'line', 'correct_option': 'B'},
        {'question_text': 'Identify the adverb: "She spoke softly to the baby."', 'option_a': 'softly', 'option_b': 'spoke', 'option_c': 'baby', 'option_d': 'she', 'correct_option': 'A'},
    ]
}

admin_create_res = client.post('/api/admin/spoken-english/topics/', data=new_topic_payload, format='json')
print("5. Admin Topic Creation Status:", admin_create_res.status_code)
assert admin_create_res.status_code == 201
new_topic_id = admin_create_res.data['topic']['id']

# 8. Admin View Scores for Topic 1
scores_res = client.get(f'/api/admin/spoken-english/topics/{topic_id}/scores/')
print("6. Admin Topic Scores Status:", scores_res.status_code)
assert scores_res.status_code == 200
assert scores_res.data['total_submissions'] >= 1
print("   Found submission for student:", scores_res.data['scores'][0]['student_name'])

# Cleanup created test topic
SpokenEnglishTopic.objects.filter(id=new_topic_id).delete()

print("=== ALL BATCH 5 SPOKEN ENGLISH INTEGRATION TESTS PASSED ===")

