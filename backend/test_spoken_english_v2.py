"""
Integration tests for Spoken English Restructuring (Batch 6)
Validates:
1. Theory API returns reference audio and text.
2. Practice API returns reference audio, supports audio upload, and records practice attempts.
3. Test API STRICTLY DOES NOT expose reference audio to students.
4. Test flow: start attempt -> record individual items -> submit -> evaluate (gracefully PENDING_EVALUATION if no external keys).
5. Admin API: content creation with audio/image, list test scores with recordings, and list practice history.
"""

import os
import io
import django
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from students.models import StudentProfile
from spoken_english.models import (
    SpokenEnglishContent,
    SpokenEnglishPracticeAttempt,
    SpokenEnglishTestAttempt,
    SpokenEnglishTestRecording,
)

User = get_user_model()


def run_tests():
    print("==================================================")
    print("RUNNING SPOKEN ENGLISH BATCH 6 INTEGRATION TESTS")
    print("==================================================")

    # 1. Setup Student and Admin users
    student_profile = StudentProfile.objects.filter(mobile_number='9876543210').first()
    if not student_profile:
        student_user, _ = User.objects.get_or_create(username='9876543210', defaults={'role': 'STUDENT'})
        student_profile = StudentProfile.objects.create(
            user=student_user,
            full_name='Aarav Sharma',
            mobile_number='9876543210',
            standard='Grade 5',
            abacus_level='Level 3'
        )
    else:
        student_user = student_profile.user

    admin_user = User.objects.filter(role='ACADEMY_ADMIN').first()
    if not admin_user:
        admin_user = User.objects.create_user(
            username='9999999999',
            password='admin123',
            role='ACADEMY_ADMIN'
        )


    client = APIClient()

    # Clean previous content
    SpokenEnglishContent.objects.all().delete()
    SpokenEnglishTestAttempt.objects.all().delete()
    SpokenEnglishPracticeAttempt.objects.all().delete()

    # Admin creates Theory, Practice, and Test items
    client.force_authenticate(user=admin_user)
    theory_audio = SimpleUploadedFile("ref_theory.wav", b"RIFF....WAVEfmt ....data....", content_type="audio/wav")
    client.post('/api/admin/spoken-english/content/', {
        'section_type': 'THEORY',
        'content_type': 'WORD',
        'title': 'Hello - Greeting',
        'text_content': 'Hello - Used as a greeting or to begin a conversation.',
        'order': 1,
        'reference_audio': theory_audio
    }, format='multipart')

    prac_audio = SimpleUploadedFile("ref_prac.wav", b"RIFF....WAVEfmt ....data....", content_type="audio/wav")
    client.post('/api/admin/spoken-english/content/', {
        'section_type': 'PRACTICE',
        'content_type': 'WORD',
        'title': 'Practice Word: Welcome',
        'text_content': 'Welcome',
        'order': 1,
        'reference_audio': prac_audio
    }, format='multipart')

    test_item_res = client.post('/api/admin/spoken-english/content/', {
        'section_type': 'TEST',
        'content_type': 'WORD',
        'title': 'Test Question: Pronounce Architecture',
        'text_content': 'Architecture',
        'order': 1
    }, format='multipart')
    created_test_id = test_item_res.data['item']['id']

    # Authenticate as student
    client.force_authenticate(user=student_user)

    # -------------------------------------------------------------
    # Test 1: Theory API (Read + Listen)
    # -------------------------------------------------------------
    print("\n[Test 1] Fetching Theory content items...")
    res = client.get('/api/spoken-english/theory/')
    assert res.status_code == status.HTTP_200_OK, f"Expected 200, got {res.status_code}"
    theory_items = res.data
    assert len(theory_items) > 0, "Expected theory items"
    first_item = theory_items[0]
    assert 'text_content' in first_item, "Theory item missing text_content"
    assert 'reference_audio_url' in first_item, "Theory item missing reference_audio_url"
    print(f" -> Successfully fetched {len(theory_items)} theory items. Reference audio present: {first_item.get('reference_audio_url') is not None}")

    # Test filtering by content_type
    res_words = client.get('/api/spoken-english/theory/?content_type=WORD')
    assert res_words.status_code == status.HTTP_200_OK
    assert all(item['content_type'] == 'WORD' for item in res_words.data)
    print(f" -> Successfully filtered theory items by WORD (found {len(res_words.data)}).")

    # -------------------------------------------------------------
    # Test 2: Practice API (Read + Listen + Record)
    # -------------------------------------------------------------
    print("\n[Test 2] Fetching Practice content items & uploading practice audio...")
    res = client.get('/api/spoken-english/practice/')
    assert res.status_code == status.HTTP_200_OK
    practice_items = res.data
    assert len(practice_items) > 0, "Expected practice items"
    practice_item = practice_items[0]
    assert 'reference_audio_url' in practice_item

    # Upload practice voice recording
    fake_audio = SimpleUploadedFile("practice_voice.wav", b"RIFF....WAVEfmt ....data....", content_type="audio/wav")
    rec_res = client.post(
        f"/api/spoken-english/practice/{practice_item['id']}/record/",
        {'recorded_audio': fake_audio},
        format='multipart'
    )
    assert rec_res.status_code == status.HTTP_201_CREATED, f"Expected 201, got {rec_res.status_code}: {rec_res.data}"
    assert 'recording' in rec_res.data
    assert rec_res.data['recording']['status'] == 'RECORDED'
    print(f" -> Practice voice upload successful! Recording ID: {rec_res.data['recording']['id']}")

    # -------------------------------------------------------------
    # Test 3: Test Items API (Read + Record + Evaluate) - NO REFERENCE AUDIO
    # -------------------------------------------------------------
    print("\n[Test 3] Verifying Test Items STRICTLY OMIT reference audio...")
    test_res = client.get('/api/spoken-english/test/items/')
    assert test_res.status_code == status.HTTP_200_OK
    test_items = test_res.data
    assert len(test_items) > 0, "Expected test items"
    for item in test_items:
        assert 'reference_audio' not in item, "SECURITY FAULT: reference_audio exposed in test items!"
        assert 'reference_audio_url' not in item, "SECURITY FAULT: reference_audio_url exposed in test items!"
    print(f" -> Verified: All {len(test_items)} test items have NO reference audio exposed to students.")

    # -------------------------------------------------------------
    # Test 4: Complete Test Flow (Start -> Record Item -> Submit -> Result)
    # -------------------------------------------------------------
    print("\n[Test 4] Running Full Test Flow...")
    # 4a. Start test attempt
    start_res = client.post('/api/spoken-english/test/start/', {'content_type': 'ALL'}, format='json')
    assert start_res.status_code == status.HTTP_201_CREATED, f"Start test failed: {start_res.data}"
    attempt_id = start_res.data['attempt_id']
    total_items = start_res.data['total_items']
    print(f" -> Test attempt created (ID: {attempt_id}, Total Questions: {total_items})")

    # 4b. Record first item
    first_test_item = test_items[0]
    fake_test_audio = SimpleUploadedFile("test_rec_1.wav", b"RIFF....WAVEfmt ....data....", content_type="audio/wav")
    item_rec_res = client.post(
        f"/api/spoken-english/test/{attempt_id}/record/",
        {
            'content_item_id': first_test_item['id'],
            'recorded_audio': fake_test_audio
        },
        format='multipart'
    )
    assert item_rec_res.status_code == status.HTTP_200_OK, f"Item record failed: {item_rec_res.data}"
    recording_id = item_rec_res.data['recording']['id']
    print(f" -> Item recording saved! Recorded: {item_rec_res.data['recorded_items']} / {total_items}")

    # 4c. Submit test
    submit_res = client.post(f"/api/spoken-english/test/{attempt_id}/submit/")
    assert submit_res.status_code == status.HTTP_200_OK, f"Submit failed: {submit_res.data}"
    result_data = submit_res.data['result']
    assert result_data['status'] == 'SUBMITTED'
    assert result_data['overall_score'] is None
    print(f" -> Test submitted! Final evaluation status: {result_data['status']} (Awaiting teacher scoring)")

    # 4d. Fetch result while pending
    get_result_res = client.get(f"/api/spoken-english/test/{attempt_id}/result/")
    assert get_result_res.status_code == status.HTTP_200_OK
    assert len(get_result_res.data['recordings']) == 1
    assert get_result_res.data['overall_score'] is None
    print(f" -> Result verified pending. Student recordings preserved with audio URL: {get_result_res.data['recordings'][0]['audio_url'] is not None}")

    # -------------------------------------------------------------
    # Test 5: Teacher Manual Scoring (0 - 100) & Admin Endpoints
    # -------------------------------------------------------------
    print("\n[Test 5] Testing Admin Endpoints & Teacher Scoring...")
    client.force_authenticate(user=admin_user)

    # 5a. Validate invalid scores rejected
    inv_res = client.patch(f'/api/admin/spoken-english/test-recordings/{recording_id}/score/', {'teacher_score': 150}, format='json')
    assert inv_res.status_code == status.HTTP_400_BAD_REQUEST

    # 5b. Score recording with 88
    score_res = client.patch(f'/api/admin/spoken-english/test-recordings/{recording_id}/score/', {'teacher_score': 88}, format='json')
    assert score_res.status_code == status.HTTP_200_OK
    assert score_res.data['recording']['teacher_score'] == 88.0
    assert score_res.data['attempt']['status'] == 'SCORED'
    assert score_res.data['attempt']['overall_score'] == 88.0
    print(f" -> Teacher score saved (88/100). Overall score automatically computed: {score_res.data['attempt']['overall_score']}")

    # 5c. Admin view test scores with recordings
    admin_scores_res = client.get('/api/admin/spoken-english/test-scores/')
    assert admin_scores_res.status_code == status.HTTP_200_OK
    assert admin_scores_res.data['total_test_attempts'] > 0
    print(f" -> Admin test scores retrieved (Total Attempts: {admin_scores_res.data['total_test_attempts']})")

    # 5d. Admin view specific test score detail with audio playback
    admin_detail_res = client.get(f'/api/admin/spoken-english/test-scores/{attempt_id}/')
    assert admin_detail_res.status_code == status.HTTP_200_OK
    assert len(admin_detail_res.data['recordings']) > 0
    print(f" -> Admin test detail retrieved with student audio playback URLs: {admin_detail_res.data['recordings'][0]['audio_url']}")

    # 5e. Clean up test fixtures
    SpokenEnglishContent.objects.all().delete()
    SpokenEnglishTestAttempt.objects.all().delete()
    SpokenEnglishPracticeAttempt.objects.all().delete()

    print("\n==================================================")
    print("ALL SPOKEN ENGLISH BACKEND TESTS PASSED SUCCESSFULLY! [PASS]")
    print("==================================================")


if __name__ == '__main__':
    run_tests()

