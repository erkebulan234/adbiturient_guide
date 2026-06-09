const { submitTest } = require('../src/controllers/testController');
const pool = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

function mockResponse() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('submitTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('400 if answers are duplicated', async () => {
    const req = {
      params: { id: '1' },
      body: { answers: [10, 10] },
      user: { id: 1 }
    };
    const res = mockResponse();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('400 if some answers do not belong to selected test', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, question_id: 1, score: 1, tag: 'it' }] });

    const req = {
      params: { id: '1' },
      body: { answers: [10, 99] },
      user: { id: 1 }
    };
    const res = mockResponse();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Некоторые ответы не относятся к выбранному тесту' });
  });

  test('400 if not all questions are answered', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, question_id: 1, score: 1, tag: 'it' }] });

    const req = {
      params: { id: '1' },
      body: { answers: [10] },
      user: { id: 1 }
    };
    const res = mockResponse();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ответьте на все вопросы теста' });
  });

  test('400 if multiple answers are selected for one question', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 10, question_id: 1, score: 1, tag: 'it' },
          { id: 11, question_id: 1, score: 2, tag: 'design' }
        ]
      });

    const req = {
      params: { id: '1' },
      body: { answers: [10, 11] },
      user: { id: 1 }
    };
    const res = mockResponse();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Выберите только один ответ на каждый вопрос' });
  });

  test('saves result when answers are valid', async () => {
    const savedResult = {
      id: 7,
      user_id: 1,
      test_id: 1,
      result_tags: ['it', 'logic'],
      total_score: 5
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 10, question_id: 1, score: 2, tag: 'it' },
          { id: 20, question_id: 2, score: 3, tag: 'logic' }
        ]
      })
      .mockResolvedValueOnce({ rows: [savedResult] });

    const req = {
      params: { id: '1' },
      body: { answers: [10, 20] },
      user: { id: 1 }
    };
    const res = mockResponse();

    await submitTest(req, res);

    expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO test_results'), [
      1,
      1,
      ['it', 'logic'],
      5
    ]);
    expect(res.json).toHaveBeenCalledWith({ message: 'Тест завершён', result: savedResult });
  });
});
