from django.urls import path
from .views import (
    MyLevelView,
    AvailableTestsView,
    TestDetailView,
    StartTestView,
    AttemptDetailView,
    SaveAnswerView,
    SubmitTestView,
    ResultView,
    AdminTestListCreateView,
    AdminTestScoresView,
)

urlpatterns = [
    # Student Abacus Endpoints
    path('my-level/', MyLevelView.as_view(), name='abacus_my_level'),
    path('tests/', AvailableTestsView.as_view(), name='abacus_available_tests'),
    path('tests/<int:test_id>/', TestDetailView.as_view(), name='abacus_test_detail'),
    path('tests/<int:test_id>/start/', StartTestView.as_view(), name='abacus_start_test'),
    path('attempts/<int:attempt_id>/', AttemptDetailView.as_view(), name='abacus_attempt_detail'),
    path('attempts/<int:attempt_id>/answers/', SaveAnswerView.as_view(), name='abacus_save_answer'),
    path('attempts/<int:attempt_id>/submit/', SubmitTestView.as_view(), name='abacus_submit_test'),
    path('attempts/<int:attempt_id>/result/', ResultView.as_view(), name='abacus_result'),

    # Admin Abacus Endpoints
    path('admin/tests/', AdminTestListCreateView.as_view(), name='admin_abacus_test_list_create'),
    path('admin/tests/<int:test_id>/scores/', AdminTestScoresView.as_view(), name='admin_abacus_test_scores'),
]
