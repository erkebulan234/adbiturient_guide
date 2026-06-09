const pool = require('../config/db');

async function getTests(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM tests
      ORDER BY id
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getTests error:', error);
    res.status(500).json({ message: 'Ошибка получения тестов' });
  }
}

async function getTestById(req, res) {
  try {
    const testResult = await pool.query(
      'SELECT * FROM tests WHERE id = $1',
      [req.params.id]
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({ message: 'Тест не найден' });
    }

    const questionsResult = await pool.query(
      `
      SELECT
        q.id AS question_id,
        q.question_text,
        q.category,
        a.id AS answer_id,
        a.answer_text,
        a.score,
        a.tag
      FROM questions q
      LEFT JOIN answers a ON a.question_id = q.id
      WHERE q.test_id = $1
      ORDER BY q.id, a.id
      `,
      [req.params.id]
    );

    const questionsMap = new Map();

    for (const row of questionsResult.rows) {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: row.question_id,
          questionText: row.question_text,
          category: row.category,
          answers: []
        });
      }

      if (row.answer_id) {
        questionsMap.get(row.question_id).answers.push({
          id: row.answer_id,
          text: row.answer_text,
          score: row.score,
          tag: row.tag
        });
      }
    }

    return res.json({
      test: testResult.rows[0],
      questions: Array.from(questionsMap.values())
    });
  } catch (error) {
    console.error('getTestById error:', error);
    return res.status(500).json({ message: 'Ошибка получения теста' });
  }
}

function normalizeAnswerIds(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error('Ответы обязательны');
    error.statusCode = 400;
    throw error;
  }

  const answerIds = answers.map(Number);
  const hasInvalidIds = answerIds.some(id => !Number.isInteger(id) || id <= 0);

  if (hasInvalidIds) {
    const error = new Error('Некорректный список ответов');
    error.statusCode = 400;
    throw error;
  }

  if (new Set(answerIds).size !== answerIds.length) {
    const error = new Error('Нельзя отправлять один и тот же ответ несколько раз');
    error.statusCode = 400;
    throw error;
  }

  return answerIds;
}

async function submitTest(req, res) {
  try {
    const testId = Number(req.params.id);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({ message: 'Некорректный тест' });
    }

    const answerIds = normalizeAnswerIds(req.body.answers);

    const questionsResult = await pool.query(
      `
      SELECT id
      FROM questions
      WHERE test_id = $1
      ORDER BY id
      `,
      [testId]
    );

    if (questionsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Тест не найден или в нем нет вопросов' });
    }

    const answersResult = await pool.query(
      `
      SELECT
        a.id,
        a.question_id,
        a.score,
        a.tag
      FROM answers a
      JOIN questions q ON q.id = a.question_id
      WHERE a.id = ANY($1::int[])
        AND q.test_id = $2
      `,
      [answerIds, testId]
    );

    if (answersResult.rows.length !== answerIds.length) {
      return res.status(400).json({ message: 'Некоторые ответы не относятся к выбранному тесту' });
    }

    const expectedQuestionIds = questionsResult.rows.map(item => Number(item.id));
    const answeredQuestionIds = answersResult.rows.map(item => Number(item.question_id));

    if (answeredQuestionIds.length !== expectedQuestionIds.length) {
      return res.status(400).json({ message: 'Ответьте на все вопросы теста' });
    }

    if (new Set(answeredQuestionIds).size !== answeredQuestionIds.length) {
      return res.status(400).json({ message: 'Выберите только один ответ на каждый вопрос' });
    }

    const expectedSet = new Set(expectedQuestionIds);
    const hasUnexpectedQuestion = answeredQuestionIds.some(id => !expectedSet.has(id));

    if (hasUnexpectedQuestion) {
      return res.status(400).json({ message: 'Ответы не соответствуют вопросам теста' });
    }

    const totalScore = answersResult.rows.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    const resultTags = answersResult.rows.map(item => item.tag).filter(Boolean);

    const result = await pool.query(
      `
      INSERT INTO test_results (
        user_id,
        test_id,
        result_tags,
        total_score
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        req.user.id,
        testId,
        resultTags,
        totalScore
      ]
    );

    return res.json({
      message: 'Тест завершён',
      result: result.rows[0]
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('submitTest error:', error);
    return res.status(500).json({ message: 'Ошибка сохранения результата теста' });
  }
}

async function getMyResults(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT tr.*, t.title
      FROM test_results tr
      JOIN tests t ON t.id = tr.test_id
      WHERE tr.user_id = $1
      ORDER BY tr.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getMyResults error:', error);
    res.status(500).json({ message: 'Ошибка получения результатов' });
  }
}

module.exports = {
  getTests,
  getTestById,
  submitTest,
  getMyResults,
  _normalizeAnswerIds: normalizeAnswerIds
};
