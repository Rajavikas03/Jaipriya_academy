from django.urls import path
from .admin_views import (
    # Modern Batch 6 & 7 Admin Views
    AdminSpokenEnglishContentListCreateView,
    AdminSpokenEnglishContentDetailView,
    AdminSpokenEnglishTestScoresView,
    AdminSpokenEnglishTestScoreDetailView,
    AdminSpokenEnglishScoreRecordingView,
    AdminSpokenEnglishPracticeHistoryView,
    # Legacy Admin Views
    AdminTopicListCreateView,
    AdminTopicDetailView,
    AdminTopicScoresView,
)
from .module_views import (
    AdminSpokenEnglishModuleListCreateView,
    AdminSpokenEnglishModuleDetailView,
    AdminModuleItemCreateView,
    AdminModuleItemDetailView,
)

urlpatterns = [
    path('modules/', AdminSpokenEnglishModuleListCreateView.as_view(), name='admin_spoken_module_list_create'),
    path('modules/<int:module_id>/', AdminSpokenEnglishModuleDetailView.as_view(), name='admin_spoken_module_detail'),
    path('modules/<int:module_id>/items/', AdminModuleItemCreateView.as_view(), name='admin_spoken_module_item_create'),
    path('modules/<int:module_id>/items/<int:item_id>/', AdminModuleItemDetailView.as_view(), name='admin_spoken_module_item_detail'),
    # Modern Spoken English Admin Endpoints
    path('content/', AdminSpokenEnglishContentListCreateView.as_view(), name='admin_spoken_content_list_create'),
    path('content/<int:item_id>/', AdminSpokenEnglishContentDetailView.as_view(), name='admin_spoken_content_detail'),
    path('test-scores/', AdminSpokenEnglishTestScoresView.as_view(), name='admin_spoken_test_scores'),
    path('test-scores/<int:attempt_id>/', AdminSpokenEnglishTestScoreDetailView.as_view(), name='admin_spoken_test_score_detail'),
    path('test-recordings/<int:recording_id>/score/', AdminSpokenEnglishScoreRecordingView.as_view(), name='admin_spoken_score_recording'),
    path('tests/', AdminSpokenEnglishTestScoresView.as_view(), name='admin_spoken_tests'),
    path('tests/<int:attempt_id>/', AdminSpokenEnglishTestScoreDetailView.as_view(), name='admin_spoken_test_detail'),
    path('practice-history/', AdminSpokenEnglishPracticeHistoryView.as_view(), name='admin_spoken_practice_history'),

    # Legacy Batch 5 Endpoints (Preserved for compatibility)
    path('topics/', AdminTopicListCreateView.as_view(), name='admin_spoken_topics'),
    path('topics/<int:topic_id>/', AdminTopicDetailView.as_view(), name='admin_spoken_topic_detail'),
    path('topics/<int:topic_id>/scores/', AdminTopicScoresView.as_view(), name='admin_spoken_topic_scores'),
]


