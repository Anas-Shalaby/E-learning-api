const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/user.model');
const Course = require('../src/models/course.model');
const Payment = require('../src/models/payment.model');
const { generateToken } = require('./helpers');

jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'test_secret'
      })
    }
  }));
});

describe('Payment Routes', () => {
  let studentToken;
  let student;
  let course;

  beforeEach(async () => {
    student = await User.create({
      username: 'student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    studentToken = generateToken(student._id);

    course = await Course.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: '507f1f77bcf86cd799439011',
      category: 'Programming',
      level: 'beginner',
      price: 99.99
    });
  });

  describe('POST /api/payments/create-payment-intent', () => {
    it('should create a payment intent', async () => {
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: course._id
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body).toHaveProperty('paymentId');
    });
  });

  describe('POST /api/payments/confirm/:paymentId', () => {
    it('should confirm payment and enroll student', async () => {
      const payment = await Payment.create({
        userId: student._id,
        courseId: course._id,
        amount: course.price,
        stripePaymentId: 'pi_test123'
      });

      const response = await request(app)
        .post(`/api/payments/confirm/${payment._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      
      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.status).toBe('completed');

      const updatedCourse = await Course.findById(course._id);
      expect(updatedCourse.enrolledStudents).toContainEqual(student._id);
    });
  });
});