from django.core.management.base import BaseCommand
from abacus.models import AbacusTest, AbacusQuestion

class Command(BaseCommand):
    help = 'Seeds sample development/testing Abacus tests and MCQ questions.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding sample Abacus tests for testing/development..."))

        # Test 1: Junior Level Sample Test
        test_junior, _ = AbacusTest.objects.get_or_create(
            title="Week 1 Abacus - Junior Basics",
            level="JUNIOR",
            defaults={
                'duration_minutes': 10,
                'is_active': True,
            }
        )
        
        junior_questions = [
            ("What is 2 + 2?", "3", "4", "5", "6", "B"),
            ("What is 5 + 3?", "7", "8", "9", "6", "B"),
            ("What is 9 - 4?", "5", "4", "6", "3", "A"),
            ("What is 6 + 1 - 2?", "4", "5", "6", "7", "B"),
            ("What is 3 + 3 + 2?", "8", "7", "9", "6", "A"),
            ("What is 8 - 3 + 1?", "5", "6", "7", "4", "B"),
            ("What is 4 + 5 - 3?", "6", "7", "5", "8", "A"),
            ("What is 7 - 2 - 1?", "4", "5", "3", "6", "A"),
            ("What is 1 + 2 + 3 + 4?", "9", "10", "11", "8", "B"),
            ("What is 10 - 5 + 2?", "6", "8", "7", "5", "C"),
        ]

        if not test_junior.questions.exists():
            for idx, (q_text, a, b, c, d, correct) in enumerate(junior_questions, start=1):
                AbacusQuestion.objects.create(
                    test=test_junior,
                    question_text=q_text,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    order=idx
                )
            self.stdout.write(self.style.SUCCESS(f"Created Junior test with {len(junior_questions)} questions."))

        # Test 2: Level 1 Sample Test
        test_l1, _ = AbacusTest.objects.get_or_create(
            title="Week 1 Abacus - Level 1",
            level="LEVEL_1",
            defaults={
                'duration_minutes': 10,
                'is_active': True,
            }
        )

        l1_questions = [
            ("Calculate: 14 + 23 - 12", "25", "27", "23", "29", "A"),
            ("Calculate: 35 + 14 - 9", "40", "38", "42", "39", "A"),
            ("Calculate: 50 + 25 - 15", "60", "65", "55", "70", "A"),
            ("Calculate: 18 + 12 + 15", "45", "40", "48", "42", "A"),
            ("Calculate: 72 - 20 + 8", "60", "58", "62", "56", "A"),
            ("Calculate: 26 + 31 - 17", "40", "42", "38", "44", "A"),
            ("Calculate: 45 - 15 + 30", "60", "50", "55", "65", "A"),
            ("Calculate: 19 + 21 - 10", "30", "28", "32", "35", "A"),
            ("Calculate: 64 + 16 - 30", "50", "45", "55", "60", "A"),
            ("Calculate: 88 - 44 + 12", "56", "54", "58", "52", "A"),
        ]

        if not test_l1.questions.exists():
            for idx, (q_text, a, b, c, d, correct) in enumerate(l1_questions, start=1):
                AbacusQuestion.objects.create(
                    test=test_l1,
                    question_text=q_text,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    order=idx
                )
            self.stdout.write(self.style.SUCCESS(f"Created Level 1 test with {len(l1_questions)} questions."))

        # Test 3: Level 3 Sample Test (Week 1)
        test_l3, _ = AbacusTest.objects.get_or_create(
            title="Week 1 Abacus - Level 3",
            level="LEVEL_3",
            defaults={
                'duration_minutes': 10,
                'is_active': True,
            }
        )

        l3_questions = [
            ("Calculate: 125 + 75 - 50", "150", "140", "160", "155", "A"),
            ("Calculate: 240 - 120 + 80", "200", "190", "210", "180", "A"),
            ("Calculate: 45 x 2 + 10", "100", "90", "110", "95", "A"),
            ("Calculate: 300 - 150 + 50", "200", "180", "220", "210", "A"),
            ("Calculate: 65 + 35 + 100", "200", "190", "210", "180", "A"),
            ("Calculate: 500 - 250 - 50", "200", "210", "190", "220", "A"),
            ("Calculate: 80 x 3 - 40", "200", "190", "210", "220", "A"),
            ("Calculate: 150 + 150 - 100", "200", "180", "220", "190", "A"),
            ("Calculate: 90 x 2 + 20", "200", "190", "210", "180", "A"),
            ("Calculate: 400 / 2", "200", "150", "250", "180", "A"),
        ]

        if not test_l3.questions.exists():
            for idx, (q_text, a, b, c, d, correct) in enumerate(l3_questions, start=1):
                AbacusQuestion.objects.create(
                    test=test_l3,
                    question_text=q_text,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    order=idx
                )
            self.stdout.write(self.style.SUCCESS(f"Created Level 3 test with {len(l3_questions)} questions."))

        # Test 4: Level 3 Sample Test (Week 2)
        test_l3_w2, _ = AbacusTest.objects.get_or_create(
            title="Week 2 Abacus - Level 3",
            level="LEVEL_3",
            defaults={
                'duration_minutes': 10,
                'is_active': True,
            }
        )
        if not test_l3_w2.questions.exists():
            for idx, (q_text, a, b, c, d, correct) in enumerate(l3_questions, start=1):
                AbacusQuestion.objects.create(
                    test=test_l3_w2,
                    question_text=q_text,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    order=idx
                )
            self.stdout.write(self.style.SUCCESS(f"Created Week 2 Level 3 test."))

        self.stdout.write(self.style.SUCCESS("Sample Abacus tests successfully created!"))
