from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Disabled sample content seeder. All content must be created and published by the academy admin.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Sample content auto-seeding is disabled. All Spoken English content is created and published exclusively by the academy admin."))
