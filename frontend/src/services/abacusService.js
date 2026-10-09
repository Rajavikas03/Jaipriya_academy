import { apiClient } from './api';

export const abacusService = {
  /**
   * Fetch current student's assigned Abacus level
   */
  async getMyLevel() {
    return await apiClient('/abacus/my-level/', {
      method: 'GET',
    });
  },

  /**
   * Fetch active tests available for the student's assigned level
   */
  async getAvailableTests() {
    return await apiClient('/abacus/tests/', {
      method: 'GET',
    });
  },

  /**
   * Fetch test details and questions (without correct options)
   */
  async getTest(testId) {
    return await apiClient(`/abacus/tests/${testId}/`, {
      method: 'GET',
    });
  },

  /**
   * Start a test attempt or return existing active attempt
   */
  async startTest(testId) {
    return await apiClient(`/abacus/tests/${testId}/start/`, {
      method: 'POST',
    });
  },

  /**
   * Retrieve active attempt questions, saved answers, and server remaining time
   */
  async getAttempt(attemptId) {
    return await apiClient(`/abacus/attempts/${attemptId}/`, {
      method: 'GET',
    });
  },

  /**
   * Save or update an MCQ answer choice
   */
  async saveAnswer(attemptId, questionId, selectedOption) {
    return await apiClient(`/abacus/attempts/${attemptId}/answers/`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option: selectedOption,
      }),
    });
  },

  /**
   * Submit test for backend scoring and evaluation
   */
  async submitTest(attemptId) {
    return await apiClient(`/abacus/attempts/${attemptId}/submit/`, {
      method: 'POST',
    });
  },

  /**
   * Retrieve summary results for a completed attempt
   */
  async getResult(attemptId) {
    return await apiClient(`/abacus/attempts/${attemptId}/result/`, {
      method: 'GET',
    });
  },
};

