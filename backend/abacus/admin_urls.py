from django.urls import path
from .views import (
    AdminTestListCreateView,
    AdminTestScoresView,
)

urlpatterns = [
    path('tests/', AdminTestListCreateView.as_view(), name='admin_abacus_tests'),
    path('tests/<int:test_id>/scores/', AdminTestScoresView.as_view(), name='admin_abacus_test_scores'),
]

