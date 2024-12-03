const express = require('express');
const courseController = require('../controllers/course.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all courses (public)
router.get('/', courseController.getCourses);

// Create course (instructors only)
router.post('/',
  authenticateToken,
  authorize('instructor', 'admin'),
  courseController.createCourse
);

// Enroll in course (students only)
router.post('/:id/enroll',
  authenticateToken,
  authorize('student'),
  courseController.enrollCourse
);

module.exports = router;