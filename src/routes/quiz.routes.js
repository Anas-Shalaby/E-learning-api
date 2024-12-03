const express = require('express');
const quizController = require('../controllers/quiz.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { quizSubmissionLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/',
  authenticateToken,
  authorize('instructor', 'admin'),
  quizController.createQuiz
);

router.post('/:quizId/submit',
  authenticateToken,
  authorize('student'),
  quizSubmissionLimiter, // Add rate limiting middleware
  quizController.submitQuiz
);

module.exports = router;