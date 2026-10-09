import { apiClient } from './api';

export const spokenEnglishService = {
  // ==========================================
  // Batch 6: Modern Spoken English Endpoints
  // ==========================================

  async getModules(sectionType) {
    const query = sectionType ? `?section_type=${encodeURIComponent(sectionType)}` : '';
    return await apiClient(`/spoken-english/modules/${query}`, { method: 'GET' });
  },

  async getModuleDetail(moduleId) {
    return await apiClient(`/spoken-english/modules/${moduleId}/`, { method: 'GET' });
  },

  /**
   * Get Theory content items (Read + Listen mode)
   * @param {string} [contentType] - 'WORD', 'SENTENCE', or 'PARAGRAPH'
   */
  async getTheoryContent(contentType) {
    const query = contentType ? `?content_type=${encodeURIComponent(contentType)}` : '';
    return await apiClient(`/spoken-english/theory/${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get Practice content items (Read + Listen + Record mode)
   * @param {string} [contentType] - 'WORD', 'SENTENCE', or 'PARAGRAPH'
   */
  async getPracticeContent(contentType) {
    const query = contentType ? `?content_type=${encodeURIComponent(contentType)}` : '';
    return await apiClient(`/spoken-english/practice/${query}`, {
      method: 'GET',
    });
  },

  /**
   * Submit student voice recording for a practice item
   * @param {number} contentId
   * @param {Blob|File} audioBlob
   */
  async submitPracticeRecording(contentId, audioBlob) {
    const formData = new FormData();
    formData.append('recorded_audio', audioBlob, 'practice_voice.wav');

    return await apiClient(`/spoken-english/practice/${contentId}/record/`, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Get Test items (Read + Record + Evaluate mode) - strictly NO reference audio
   * @param {number} moduleId
   * @param {string} [contentType]
   */
  async getTestItems(moduleId, contentType) {
    const params = new URLSearchParams();
    if (moduleId) params.append('module_id', moduleId);
    if (contentType) params.append('content_type', contentType);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`/spoken-english/test/items/${query}`, {
      method: 'GET',
    });
  },

  /**
   * Start a new independent test attempt
   * @param {number} moduleId
   * @param {string} [contentType] - 'ALL', 'WORD', 'SENTENCE', or 'PARAGRAPH'
   */
  async startTestAttempt(moduleId, contentType = 'ALL') {
    return await apiClient('/spoken-english/test/start/', {
      method: 'POST',
      body: JSON.stringify({ module_id: moduleId, content_type: contentType }),
    });
  },

  /**
   * Upload student recording for a specific test item in an active attempt
   * @param {number} attemptId
   * @param {number} contentItemId
   * @param {Blob|File} audioBlob
   */
  async uploadTestRecording(attemptId, contentItemId, audioBlob) {
    const formData = new FormData();
    formData.append('content_item_id', contentItemId);
    formData.append('recorded_audio', audioBlob, `test_item_${contentItemId}.wav`);

    return await apiClient(`/spoken-english/test/${attemptId}/record/`, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Submit test attempt for pronunciation assessment
   * @param {number} attemptId
   */
  async submitTestAttempt(attemptId) {
    return await apiClient(`/spoken-english/test/${attemptId}/submit/`, {
      method: 'POST',
    });
  },

  /**
   * Get test attempt evaluation result and recordings
   * @param {number} attemptId
   */
  async getTestResult(attemptId) {
    return await apiClient(`/spoken-english/test/${attemptId}/result/`, {
      method: 'GET',
    });
  },

  // ==========================================
  // Legacy Methods (Preserved for compatibility)
  // ==========================================

  async getTopics() {
    return await apiClient('/spoken-english/topics/', {
      method: 'GET',
    });
  },

  async getTopic(topicId) {
    return await apiClient(`/spoken-english/topics/${topicId}/`, {
      method: 'GET',
    });
  },

  async getTheory(topicId) {
    return await apiClient(`/spoken-english/topics/${topicId}/theory/`, {
      method: 'GET',
    });
  },

  async startPractice(topicId) {
    return await apiClient(`/spoken-english/topics/${topicId}/start/`, {
      method: 'POST',
    });
  },

  async getAttempt(attemptId) {
    return await apiClient(`/spoken-english/attempts/${attemptId}/`, {
      method: 'GET',
    });
  },

  async saveAnswer(attemptId, questionId, selectedOption) {
    return await apiClient(`/spoken-english/attempts/${attemptId}/answers/`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option: selectedOption,
      }),
    });
  },

  async submitPractice(attemptId) {
    return await apiClient(`/spoken-english/attempts/${attemptId}/submit/`, {
      method: 'POST',
    });
  },

  async getResult(attemptId) {
    return await apiClient(`/spoken-english/attempts/${attemptId}/result/`, {
      method: 'GET',
    });
  },
};


