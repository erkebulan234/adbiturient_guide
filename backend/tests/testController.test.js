import { describe, test, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/repositories/testRepository.js', () => ({
  findQuestionIdsByTestId: vi.fn(),
  findAnswersByIdsAndTest: vi.fn(),
  saveResult: vi.fn()
}));

import * as testRepository from '../src/repositories/testRepository.js';
import { submitTest } from '../src/controllers/testController.js';

function mockResponse() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('submitTest', () => {
  beforeEach(() => vi.clearAllMocks());

  test('400 if answers are duplicated', async () => {
    const req = { params: { id: '1' }, body: { answers: [10, 10] }, user: { id: 1 } };
    const next = vi.fn();
    await submitTest(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
    expect(testRepository.findQuestionIdsByTestId).not.toHaveBeenCalled();
  });

  test('400 if some answers do not belong to selected test', async () => {
    testRepository.findQuestionIdsByTestId.mockResolvedValueOnce([1]);
    testRepository.findAnswersByIdsAndTest.mockResolvedValueOnce([
      { id: 10, question_id: 1, score: 1, tag: 'it' }
    ]);
    const req = { params: { id: '1' }, body: { answers: [10, 99] }, user: { id: 1 } };
    const next = vi.fn();
    await submitTest(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, message: 'Некоторые ответы не относятся к выбранному тесту' })
    );
  });

  test('400 if not all questions are answered', async () => {
    testRepository.findQuestionIdsByTestId.mockResolvedValueOnce([1, 2]);
    testRepository.findAnswersByIdsAndTest.mockResolvedValueOnce([
      { id: 10, question_id: 1, score: 1, tag: 'it' }
    ]);
    const req = { params: { id: '1' }, body: { answers: [10] }, user: { id: 1 } };
    const next = vi.fn();
    await submitTest(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, message: 'Ответьте на все вопросы теста' })
    );
  });

  test('400 if multiple answers are selected for one question', async () => {
    testRepository.findQuestionIdsByTestId.mockResolvedValueOnce([1, 2]);
    testRepository.findAnswersByIdsAndTest.mockResolvedValueOnce([
      { id: 10, question_id: 1, score: 1, tag: 'it' },
      { id: 11, question_id: 1, score: 2, tag: 'design' }
    ]);
    const req = { params: { id: '1' }, body: { answers: [10, 11] }, user: { id: 1 } };
    const next = vi.fn();
    await submitTest(req, mockResponse(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, message: 'Выберите только один ответ на каждый вопрос' })
    );
  });

  test('saves result when answers are valid', async () => {
    const savedResult = { id: 7, user_id: 1, test_id: 1, result_tags: ['it', 'logic'], total_score: 5 };
    testRepository.findQuestionIdsByTestId.mockResolvedValueOnce([1, 2]);
    testRepository.findAnswersByIdsAndTest.mockResolvedValueOnce([
      { id: 10, question_id: 1, score: 2, tag: 'it' },
      { id: 20, question_id: 2, score: 3, tag: 'logic' }
    ]);
    testRepository.saveResult.mockResolvedValueOnce(savedResult);
    const req = { params: { id: '1' }, body: { answers: [10, 20] }, user: { id: 1 } };
    const res = mockResponse();
    const next = vi.fn();
    await submitTest(req, res, next);
    expect(testRepository.saveResult).toHaveBeenCalledWith(1, 1, ['it', 'logic'], 5);
    expect(res.json).toHaveBeenCalledWith({ message: 'Тест завершён', result: savedResult });
  });
});