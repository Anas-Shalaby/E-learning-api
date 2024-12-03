const express = require('express');
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { validateLesson, validateUpdatedLesson } = require('../middleware/validation.middleware');

const router = express.Router();

// Create new lesson (instructors only)
router.post('/',
  authenticateToken,
  authorize('instructor'),
  validateLesson,
  lessonController.createLesson
);

// Get specific lesson
router.get('/:id',
  authenticateToken,
  lessonController.getLesson
);

// Update lesson (instructors only)
router.put('/:id',
  authenticateToken,
  authorize('instructor'),
  validateUpdatedLesson,
  lessonController.updateLesson
);

// Delete lesson (instructors only)
router.delete('/:id',
  authenticateToken,
  authorize('instructor'),
  lessonController.deleteLesson
);

// Get all lessons for a course
router.get('/course/:courseId',
  authenticateToken,
  lessonController.getCourseLessons
);

module.exports = router;