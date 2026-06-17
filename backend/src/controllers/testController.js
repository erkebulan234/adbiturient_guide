const testService = require('../services/testService');

async function getTests(req, res, next) {
  try {
    const tests = await testService.getAllTests();
    res.json(tests);
  } catch (error) {
    next(error);
  }
}

async function getTestById(req, res, next) {
  try {
    const data = await testService.getTestById(Number(req.params.id));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function submitTest(req, res, next) {
  try {
    const testId = Number(req.params.id);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({ message: 'Некорректный тест' });
    }

    const result = await testService.submitTest(req.user.id, testId, req.body.answers);
    res.json({ message: 'Тест завершён', result });
  } catch (error) {
    next(error);
  }
}

async function getMyResults(req, res, next) {
  try {
    const results = await testService.getMyResults(req.user.id);
    res.json(results);
  } catch (error) {
    next(error);
  }
}

module.exports = { getTests, getTestById, submitTest, getMyResults };
