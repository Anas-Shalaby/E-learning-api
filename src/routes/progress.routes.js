const express = require('express');
const progressController = require('../controllers/progress.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/update',
  authenticateToken,
  progressController.updateProgress
);

router.get('/:courseId',
  authenticateToken,
  progressController.getStudentProgress
);

module.exports = router;