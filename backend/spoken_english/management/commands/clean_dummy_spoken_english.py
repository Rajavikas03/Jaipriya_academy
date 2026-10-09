import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from spoken_english.models import (
    SpokenEnglishContent,
    SpokenEnglishPracticeAttempt,
    SpokenEnglishTestAttempt,
    SpokenEnglishTestRecording,
    SpokenEnglishTopic,
    TheorySection,
    SpokenEnglishQuestion,
    SpokenEnglishAttempt,
    SpokenEnglishAnswer,
)

class Command(BaseCommand):
    help = 'Safely removes all dummy/sample Spoken English content, practice recordings, and test attempts while preserving real accounts.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Purging all dummy Spoken English content and test attempts..."))

        # 1. Delete test attempts and recordings
        test_rec_count = SpokenEnglishTestRecording.objects.count()
        SpokenEnglishTestRecording.objects.all().delete()

        test_att_count = SpokenEnglishTestAttempt.objects.count()
        SpokenEnglishTestAttempt.objects.all().delete()

        # 2. Delete practice attempts
        prac_count = SpokenEnglishPracticeAttempt.objects.count()
        SpokenEnglishPracticeAttempt.objects.all().delete()

        # 3. Delete modern content items (Theory, Practice, Test)
        content_count = SpokenEnglishContent.objects.count()
        SpokenEnglishContent.objects.all().delete()

        # 4. Delete legacy topic attempts and topics
        legacy_ans_count = SpokenEnglishAnswer.objects.count()
        SpokenEnglishAnswer.objects.all().delete()

        legacy_att_count = SpokenEnglishAttempt.objects.count()
        SpokenEnglishAttempt.objects.all().delete()

        legacy_q_count = SpokenEnglishQuestion.objects.count()
        SpokenEnglishQuestion.objects.all().delete()

        legacy_sec_count = TheorySection.objects.count()
        TheorySection.objects.all().delete()

        legacy_top_count = SpokenEnglishTopic.objects.count()
        SpokenEnglishTopic.objects.all().delete()

        # 5. Clean up sample dummy audio files from media storage
        spoken_media_dir = os.path.join(settings.MEDIA_ROOT, 'spoken_english')
        if os.path.exists(spoken_media_dir):
            try:
                shutil.rmtree(spoken_media_dir)
                os.makedirs(os.path.join(settings.MEDIA_ROOT, 'spoken_english', 'audio'), exist_ok=True)
                os.makedirs(os.path.join(settings.MEDIA_ROOT, 'spoken_english', 'images'), exist_ok=True)
                os.makedirs(os.path.join(settings.MEDIA_ROOT, 'spoken_english', 'practice_recordings'), exist_ok=True)
                os.makedirs(os.path.join(settings.MEDIA_ROOT, 'spoken_english', 'test_recordings'), exist_ok=True)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Note on media cleanup: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Successfully purged:\n"
            f" - {content_count} SpokenEnglishContent items\n"
            f" - {prac_count} Practice Attempts\n"
            f" - {test_att_count} Test Attempts\n"
            f" - {test_rec_count} Test Recordings\n"
            f" - {legacy_top_count} Legacy Topics\n"
            f"Database is now completely clean of dummy content."
        ))

