import * as testRepository from '../repositories/testRepository.js';

function buildQuestionsMap(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.question_id)) {
      map.set(row.question_id, {
        id: row.question_id,
        questionText: row.question_text,
        category: row.category,
        answers: []
      });
    }

    if (row.answer_id) {
      map.get(row.question_id).answers.push({
        id: row.answer_id,
        text: row.answer_text,
        score: row.score,
        tag: row.tag
      });
    }
  }

  return Array.from(map.values());
}

function validateAnswerIds(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error('Ответы обязательны');
    error.status = 400;
    throw error;
  }

  const answerIds = answers.map(Number);
  const hasInvalid = answerIds.some(id => !Number.isInteger(id) || id <= 0);

  if (hasInvalid) {
    const error = new Error('Некорректный список ответов');
    error.status = 400;
    throw error;
  }

  if (new Set(answerIds).size !== answerIds.length) {
    const error = new Error('Нельзя отправлять один и тот же ответ несколько раз');
    error.status = 400;
    throw error;
  }

  return answerIds;
}

async function getAllTests() {
  return testRepository.findAll();
}

async function getTestById(testId) {
  const test = await testRepository.findById(testId);

  if (!test) {
    const error = new Error('Тест не найден');
    error.status = 404;
    throw error;
  }

  const rows = await testRepository.findQuestionsWithAnswers(testId);
  const questions = buildQuestionsMap(rows);

  return { test, questions };
}

async function submitTest(userId, testId, rawAnswers) {
  const answerIds = validateAnswerIds(rawAnswers);

  const questionIds = await testRepository.findQuestionIdsByTestId(testId);

  if (questionIds.length === 0) {
    const error = new Error('Тест не найден или в нем нет вопросов');
    error.status = 404;
    throw error;
  }

  const answers = await testRepository.findAnswersByIdsAndTest(answerIds, testId);

  if (answers.length !== answerIds.length) {
    const error = new Error('Некоторые ответы не относятся к выбранному тесту');
    error.status = 400;
    throw error;
  }

  const answeredQuestionIds = answers.map(a => Number(a.question_id));

  if (answeredQuestionIds.length !== questionIds.length) {
    const error = new Error('Ответьте на все вопросы теста');
    error.status = 400;
    throw error;
  }

  if (new Set(answeredQuestionIds).size !== answeredQuestionIds.length) {
    const error = new Error('Выберите только один ответ на каждый вопрос');
    error.status = 400;
    throw error;
  }

  const expectedSet = new Set(questionIds);
  if (answeredQuestionIds.some(id => !expectedSet.has(id))) {
    const error = new Error('Ответы не соответствуют вопросам теста');
    error.status = 400;
    throw error;
  }

  const totalScore = answers.reduce((sum, a) => sum + Number(a.score || 0), 0);
  const resultTags = answers.map(a => a.tag).filter(Boolean);

  return testRepository.saveResult(userId, testId, resultTags, totalScore);
}

async function getMyResults(userId) {
  return testRepository.findResultsByUserId(userId);
}

export { getAllTests, getTestById, submitTest, getMyResults };