from django.core.management.base import BaseCommand
from spoken_english.models import (
    SpokenEnglishContent,
    SpokenEnglishModule,
    SpokenEnglishPracticeAttempt,
    SpokenEnglishTestAttempt,
    SpokenEnglishTestRecording,
    SpokenEnglishTopic,
    TheorySection,
    SpokenEnglishQuestion,
    SpokenEnglishAttempt,
    SpokenEnglishAnswer
)

class Command(BaseCommand):
    help = 'Deletes all Spoken English related records'

    def handle(self, *args, **kwargs):
        models_to_reset = [
            SpokenEnglishContent,
            SpokenEnglishModule,
            SpokenEnglishPracticeAttempt,
            SpokenEnglishTestAttempt,
            SpokenEnglishTestRecording,
            SpokenEnglishTopic,
            TheorySection,
            SpokenEnglishQuestion,
            SpokenEnglishAttempt,
            SpokenEnglishAnswer
        ]

        total_deleted = 0
        for model in models_to_reset:
            count, _ = model.objects.all().delete()
            self.stdout.write(f"Deleted {count} records from {model.__name__}")
            total_deleted += count

        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {total_deleted} total records"))
