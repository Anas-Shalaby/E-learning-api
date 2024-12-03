const { body, validationResult } = require('express-validator');

// Validation middleware for lessons
exports.validateLesson = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  
  body('resources.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Resource title is required'),
  
  body('resources.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Resource URL must be valid'),
  
  body('resources.*.type')
    .optional()
    .isIn(['video', 'document', 'link'])
    .withMessage('Resource type must be video, document, or link'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateUpdatedLesson = [
  body("title")
  .optional()
  .trim()
  .isLength({ min: 3, max: 100 })
  .withMessage("Title must be between 3 and 100 characters"),
  
  body("content")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("Content is required"),
  
  body("courseId")
  .optional()
  .isMongoId()
  .withMessage("Valid course ID is required"),
  
  body("order")
  .optional()
  .isInt({ min: 0 })
  .withMessage("Order must be a non-negative integer"),
  
  body("duration")
  .optional()
  .isInt({ min: 1 })
  .withMessage("Duration must be a positive integer"),
  
  body("resources")
  .optional()
  .isArray()
  .withMessage("Resources must be an array"),
  
  body("resources.*.title")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("Resource title is required"),
  
  body("resources.*.url")
  .optional()
  .trim()
  .isURL()
  .withMessage("Resource URL must be valid"),
  
  body("resources.*.type")
  .optional()
  .isIn(["video", "document", "link"])
  .withMessage("Resource type must be video, document, or link"),
  
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];