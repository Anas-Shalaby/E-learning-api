const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Create MongoDB store for rate limiting
const mongoStore = new MongoStore({
  uri: process.env.MONGODB_URI,
  collectionName: 'rateLimits',
  expireTimeMs: 15 * 60 * 1000, // Store rate limit data for 15 minutes
});

// Rate limiter for quiz submissions
exports.quizSubmissionLimiter = rateLimit({
  store: mongoStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each user to 3 submissions per windowMs
  message: {
    message: 'Too many quiz submissions. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.user._id}-${req.params.quizId}`; // Rate limit per user per quiz
  }
});