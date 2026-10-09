from django.urls import path
from .views import (
    # Modern Batch 6 Views
    SpokenEnglishTheoryListView,
    SpokenEnglishPracticeListView,
    SpokenEnglishPracticeRecordView,
    SpokenEnglishTestItemsView,
    SpokenEnglishTestStartView,
    SpokenEnglishTestRecordItemView,
    SpokenEnglishTestSubmitView,
    SpokenEnglishTestResultView,
    # Legacy Views
    TopicListView,
    TopicDetailView,
    TheorySectionsView,
    StartPracticeView,
    AttemptDetailView,
    SaveAnswerView,
    SubmitPracticeView,
    ResultView,
)
from .module_views import SpokenEnglishModuleListView, SpokenEnglishModuleDetailView

urlpatterns = [
    path('modules/', SpokenEnglishModuleListView.as_view(), name='spoken_module_list'),
    path('modules/<int:module_id>/', SpokenEnglishModuleDetailView.as_view(), name='spoken_module_detail'),
    # Modern Batch 6 Endpoints
    path('theory/', SpokenEnglishTheoryListView.as_view(), name='spoken_theory_list'),
    path('practice/', SpokenEnglishPracticeListView.as_view(), name='spoken_practice_list'),
    path('practice/<int:content_id>/record/', SpokenEnglishPracticeRecordView.as_view(), name='spoken_practice_record'),
    path('test/items/', SpokenEnglishTestItemsView.as_view(), name='spoken_test_items'),
    path('test/start/', SpokenEnglishTestStartView.as_view(), name='spoken_test_start'),
    path('test/<int:attempt_id>/record/', SpokenEnglishTestRecordItemView.as_view(), name='spoken_test_record_item'),
    path('test/<int:attempt_id>/submit/', SpokenEnglishTestSubmitView.as_view(), name='spoken_test_submit'),
    path('test/<int:attempt_id>/result/', SpokenEnglishTestResultView.as_view(), name='spoken_test_result'),

    # Legacy Batch 5 Endpoints (Preserved for compatibility)
    path('topics/', TopicListView.as_view(), name='spoken_topic_list'),
    path('topics/<int:topic_id>/', TopicDetailView.as_view(), name='spoken_topic_detail'),
    path('topics/<int:topic_id>/theory/', TheorySectionsView.as_view(), name='spoken_theory_sections'),
    path('topics/<int:topic_id>/start/', StartPracticeView.as_view(), name='spoken_start_practice'),
    path('attempts/<int:attempt_id>/', AttemptDetailView.as_view(), name='spoken_attempt_detail'),
    path('attempts/<int:attempt_id>/answers/', SaveAnswerView.as_view(), name='spoken_save_answer'),
    path('attempts/<int:attempt_id>/submit/', SubmitPracticeView.as_view(), name='spoken_submit_practice'),
    path('attempts/<int:attempt_id>/result/', ResultView.as_view(), name='spoken_result'),
]


