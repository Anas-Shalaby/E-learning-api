const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const Course = require('../models/course.model');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        courseId: courseId,
        userId: req.user._id.toString()
      }
    });

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      courseId: courseId,
      amount: course.price,
      stripePaymentId: paymentIntent.id
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    payment.status = 'completed';
    await payment.save();

    // Enroll student in course
    await Course.findByIdAndUpdate(payment.courseId, {
      $addToSet: { enrolledStudents: payment.userId }
    });

    res.json({ message: 'Payment confirmed and enrollment completed' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
};