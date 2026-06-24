import pool from '../config/db.js';

async function findAll() {
  const result = await pool.query('SELECT * FROM tests ORDER BY id');
  return result.rows;
}

async function findById(testId) {
  const result = await pool.query('SELECT * FROM tests WHERE id = $1', [testId]);
  return result.rows[0] || null;
}

async function findQuestionsWithAnswers(testId) {
  const result = await pool.query(
    `SELECT
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
    ORDER BY q.id, a.id`,
    [testId]
  );
  return result.rows;
}

async function findQuestionIdsByTestId(testId) {
  const result = await pool.query(
    'SELECT id FROM questions WHERE test_id = $1 ORDER BY id',
    [testId]
  );
  return result.rows.map(row => Number(row.id));
}

async function findAnswersByIdsAndTest(answerIds, testId) {
  const result = await pool.query(
    `SELECT a.id, a.question_id, a.score, a.tag
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.id = ANY($1::int[])
       AND q.test_id = $2`,
    [answerIds, testId]
  );
  return result.rows;
}

async function saveResult(userId, testId, resultTags, totalScore) {
  const result = await pool.query(
    `INSERT INTO test_results (user_id, test_id, result_tags, total_score)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, testId, resultTags, totalScore]
  );
  return result.rows[0];
}

async function findResultsByUserId(userId) {
  const result = await pool.query(
    `SELECT tr.*, t.title
     FROM test_results tr
     JOIN tests t ON t.id = tr.test_id
     WHERE tr.user_id = $1
     ORDER BY tr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getLastTestTags(userId) {
  const result = await pool.query(
    `SELECT result_tags FROM test_results
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.result_tags || [];
}

export {
  findAll,
  findById,
  findQuestionsWithAnswers,
  findQuestionIdsByTestId,
  findAnswersByIdsAndTest,
  saveResult,
  findResultsByUserId,
  getLastTestTags
};
