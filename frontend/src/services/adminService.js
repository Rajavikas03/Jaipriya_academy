import { apiClient } from './api';

export const adminService = {
  // ==========================================
  // Students Management
  // ==========================================
  async getStudents(search = '', level = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (level) params.append('level', level);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient(`/admin/students/${queryString}`, {
      method: 'GET',
    });
  },

  async createStudent(studentData) {
    return await apiClient('/admin/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async updateStudent(id, studentData) {
    return await apiClient(`/admin/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  async deleteStudent(id) {
    return await apiClient(`/admin/students/${id}/`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // Abacus Management
  // ==========================================
  async getAdminTests(level = '') {
    const queryString = level ? `?level=${encodeURIComponent(level)}` : '';
    return await apiClient(`/admin/abacus/tests/${queryString}`, {
      method: 'GET',
    });
  },

  async publishTest(testData) {
    return await apiClient('/admin/abacus/tests/', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  async getTestScores(testId) {
    return await apiClient(`/admin/abacus/tests/${testId}/scores/`, {
      method: 'GET',
    });
  },

  // ==========================================
  // Spoken English Modern Management (Batch 6)
  // ==========================================
  // Batch/Module Management
  async getSpokenModules(sectionType = '') {
    const query = sectionType ? `?section_type=${encodeURIComponent(sectionType)}` : '';
    return await apiClient(`/admin/spoken-english/modules/${query}`, { method: 'GET' });
  },

  async createSpokenModule(data) {
    return await apiClient('/admin/spoken-english/modules/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSpokenModuleDetail(moduleId) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/`, { method: 'GET' });
  },

  async updateSpokenModule(moduleId, data) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSpokenModule(moduleId) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/`, { method: 'DELETE' });
  },

  async addModuleItem(moduleId, formData) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/items/`, {
      method: 'POST',
      body: formData,  // FormData for file uploads
    });
  },

  async updateModuleItem(moduleId, itemId, formData) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/items/${itemId}/`, {
      method: 'PUT',
      body: formData,
    });
  },

  async deleteModuleItem(moduleId, itemId) {
    return await apiClient(`/admin/spoken-english/modules/${moduleId}/items/${itemId}/`, {
      method: 'DELETE',
    });
  },

  async getStudentSpokenTestHistory(studentId) {
    return await apiClient(`/admin/students/${studentId}/spoken-test-history/`, { method: 'GET' });
  },

  async getSpokenContent(sectionType = '', contentType = '') {
    const params = new URLSearchParams();
    if (sectionType) params.append('section_type', sectionType);
    if (contentType) params.append('content_type', contentType);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient(`/admin/spoken-english/content/${queryString}`, {
      method: 'GET',
    });
  },

  async getSpokenContentDetail(id) {
    return await apiClient(`/admin/spoken-english/content/${id}/`, {
      method: 'GET',
    });
  },

  async createSpokenContent(contentData) {
    // contentData can be FormData or JSON object
    const isForm = contentData instanceof FormData;
    return await apiClient('/admin/spoken-english/content/', {
      method: 'POST',
      body: isForm ? contentData : JSON.stringify(contentData),
    });
  },

  async updateSpokenContent(id, contentData) {
    const isForm = contentData instanceof FormData;
    return await apiClient(`/admin/spoken-english/content/${id}/`, {
      method: 'PUT',
      body: isForm ? contentData : JSON.stringify(contentData),
    });
  },

  async deleteSpokenContent(id) {
    return await apiClient(`/admin/spoken-english/content/${id}/`, {
      method: 'DELETE',
    });
  },

  async getSpokenTestScores() {
    return await apiClient('/admin/spoken-english/test-scores/', {
      method: 'GET',
    });
  },

  async getSpokenTestScoreDetail(attemptId) {
    return await apiClient(`/admin/spoken-english/test-scores/${attemptId}/`, {
      method: 'GET',
    });
  },

  async getSpokenPracticeHistory() {
    return await apiClient('/admin/spoken-english/practice-history/', {
      method: 'GET',
    });
  },

  async scoreTestRecording(recordingId, score) {
    return await apiClient(`/admin/spoken-english/test-recordings/${recordingId}/score/`, {
      method: 'PATCH',
      body: JSON.stringify({ teacher_score: Number(score) }),
    });
  },

  // ==========================================
  // Legacy Spoken English Methods
  // ==========================================
  async getAdminSpokenTopics() {
    return await apiClient('/admin/spoken-english/topics/', {
      method: 'GET',
    });
  },

  async getAdminSpokenTopic(topicId) {
    return await apiClient(`/admin/spoken-english/topics/${topicId}/`, {
      method: 'GET',
    });
  },

  async createSpokenTopic(topicData) {
    return await apiClient('/admin/spoken-english/topics/', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  },

  async updateSpokenTopic(topicId, topicData) {
    return await apiClient(`/admin/spoken-english/topics/${topicId}/`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
  },

  async deleteSpokenTopic(topicId) {
    return await apiClient(`/admin/spoken-english/topics/${topicId}/`, {
      method: 'DELETE',
    });
  },

  async getSpokenTopicScores(topicId) {
    return await apiClient(`/admin/spoken-english/topics/${topicId}/scores/`, {
      method: 'GET',
    });
  },

  // ==========================================
  // Documents Management
  // ==========================================
  async getDocuments() {
    return await apiClient('/admin/documents/', { method: 'GET' });
  },

  async uploadDocument(formData) {
    return await apiClient('/admin/documents/', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteDocument(docId) {
    return await apiClient(`/admin/documents/${docId}/`, { method: 'DELETE' });
  },
};

