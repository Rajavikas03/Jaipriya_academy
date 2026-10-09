from django.core.management.base import BaseCommand
from accounts.models import User
from students.models import StudentProfile
import datetime

class Command(BaseCommand):
    help = 'Creates development admin account (admin123) and sample students.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Setting up development accounts..."))

        # 1. Development Admin Account
        admin_user, _ = User.objects.get_or_create(
            username='9999999999',
            defaults={
                'email': 'admin@jaipriya.edu',
                'first_name': 'Academy',
                'last_name': 'Admin',
                'role': User.ROLE_ACADEMY_ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.role = User.ROLE_ACADEMY_ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        admin_profile, _ = StudentProfile.objects.get_or_create(user=admin_user)
        admin_profile.mobile_number = '9999999999'
        admin_profile.phone_number = '9999999999'
        admin_profile.full_name = 'Academy Administrator'
        admin_profile.save()

        # 2. Sample Student: Ananya (Level 3)
        s1_user, _ = User.objects.get_or_create(
            username='9876543210',
            defaults={
                'first_name': 'Ananya',
                'last_name': 'Sharma',
                'role': User.ROLE_STUDENT,
            }
        )
        s1_user.role = User.ROLE_STUDENT
        s1_user.save()
        s1_profile, _ = StudentProfile.objects.get_or_create(user=s1_user)
        s1_profile.full_name = 'Ananya Sharma'
        s1_profile.mobile_number = '9876543210'
        s1_profile.phone_number = '9876543210'
        s1_profile.standard = 'Class 4'
        s1_profile.abacus_level = 'LEVEL_3'
        s1_profile.date_of_birth = datetime.date(2015, 6, 15)
        s1_profile.parent_name = 'Ramesh Sharma'
        s1_profile.school_name = 'Delhi Public School'
        s1_profile.save()

        # 3. Sample Student: Priya (Level 1)
        s2_user, _ = User.objects.get_or_create(
            username='9876543211',
            defaults={
                'first_name': 'Priya',
                'last_name': 'Patel',
                'role': User.ROLE_STUDENT,
            }
        )
        s2_user.role = User.ROLE_STUDENT
        s2_user.save()
        s2_profile, _ = StudentProfile.objects.get_or_create(user=s2_user)
        s2_profile.full_name = 'Priya Patel'
        s2_profile.mobile_number = '9876543211'
        s2_profile.phone_number = '9876543211'
        s2_profile.standard = 'Class 2'
        s2_profile.abacus_level = 'LEVEL_1'
        s2_profile.date_of_birth = datetime.date(2017, 3, 20)
        s2_profile.parent_name = 'Sanjay Patel'
        s2_profile.save()

        # 4. Sample Student: Aarav (Junior Level)
        s3_user, _ = User.objects.get_or_create(
            username='9876543212',
            defaults={
                'first_name': 'Aarav',
                'last_name': 'Kumar',
                'role': User.ROLE_STUDENT,
            }
        )
        s3_user.role = User.ROLE_STUDENT
        s3_user.save()
        s3_profile, _ = StudentProfile.objects.get_or_create(user=s3_user)
        s3_profile.full_name = 'Aarav Kumar'
        s3_profile.mobile_number = '9876543212'
        s3_profile.phone_number = '9876543212'
        s3_profile.standard = 'UKG'
        s3_profile.abacus_level = 'JUNIOR'
        s3_profile.date_of_birth = datetime.date(2019, 8, 10)
        s3_profile.parent_name = 'Vikram Kumar'
        s3_profile.save()

        # 5. Sample Student: Rahul (Level 3)
        s4_user, _ = User.objects.get_or_create(
            username='9876543213',
            defaults={
                'first_name': 'Rahul',
                'last_name': 'Verma',
                'role': User.ROLE_STUDENT,
            }
        )
        s4_user.role = User.ROLE_STUDENT
        s4_user.save()
        s4_profile, _ = StudentProfile.objects.get_or_create(user=s4_user)
        s4_profile.full_name = 'Rahul Verma'
        s4_profile.mobile_number = '9876543213'
        s4_profile.phone_number = '9876543213'
        s4_profile.standard = 'Class 4'
        s4_profile.abacus_level = 'LEVEL_3'
        s4_profile.date_of_birth = datetime.date(2015, 11, 5)
        s4_profile.save()

        self.stdout.write(self.style.SUCCESS("\n=========================================="))
        self.stdout.write(self.style.SUCCESS("  DEVELOPMENT ACCOUNTS READY TO TEST"))
        self.stdout.write(self.style.SUCCESS("=========================================="))
        self.stdout.write("1. Academy Administrator:")
        self.stdout.write("   Mobile: 9999999999 | Password: admin123")
        self.stdout.write("\n2. Student 1 (Level 3):")
        self.stdout.write("   Mobile: 9876543210 (No password needed)")
        self.stdout.write("\n3. Student 2 (Level 1):")
        self.stdout.write("   Mobile: 9876543211 (No password needed)")
        self.stdout.write("\n4. Student 3 (Junior Level):")
        self.stdout.write("   Mobile: 9876543212 (No password needed)")
        self.stdout.write("\n5. Student 4 (Level 3):")
        self.stdout.write("   Mobile: 9876543213 (No password needed)")
        self.stdout.write("==========================================\n")
