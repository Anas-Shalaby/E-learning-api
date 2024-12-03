const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/create-payment-intent',
  authenticateToken,
  paymentController.createPaymentIntent
);

router.post('/confirm/:paymentId',
  authenticateToken,
  paymentController.confirmPayment
);

module.exports = router;