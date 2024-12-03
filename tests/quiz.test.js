const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/user.model');
const Quiz = require('../src/models/quiz.model');
const { generateToken } = require('./helpers');

describe('Quiz Routes', () => {
  let instructorToken;
  let studentToken;
  let instructor;
  let student;
  let quiz;

  beforeEach(async () => {
    instructor = await User.create({
      username: 'instructor',
      email: 'instructor@example.com',
      password: 'password123',
      role: 'instructor'
    });

    student = await User.create({
      username: 'student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    instructorToken = generateToken(instructor._id);
    studentToken = generateToken(student._id);

    quiz = await Quiz.create({
      title: 'Test Quiz',
      lessonId: '507f1f77bcf86cd799439011', // Mock ObjectId
      questions: [
        {
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          points: 1
        }
      ],
      timeLimit: 30,
      passingScore: 1
    });
  });

  describe('POST /api/quizzes/:quizId/submit', () => {
    it('should submit quiz answers and calculate score', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quiz._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [0] // Correct answer
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('score', 1);
      expect(response.body).toHaveProperty('passed', true);
    });

    it('should enforce rate limiting', async () => {
      // Make 4 submissions (1 over the limit)
      for (let i = 0; i < 4; i++) {
        const response = await request(app)
          .post(`/api/quizzes/${quiz._id}/submit`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            answers: [0]
          });

        if (i === 3) {
          expect(response.status).toBe(429); // Too Many Requests
          expect(response.body).toHaveProperty('message');
        }
      }
    });
  });
});