const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/user.model');
const Course = require('../src/models/course.model');
const { generateToken } = require('./helpers');

describe('Course Routes', () => {
  let instructorToken;
  let studentToken;
  let instructor;
  let student;

  beforeEach(async () => {
    // Create test users
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
  });

  describe('POST /api/courses', () => {
    it('should create a new course when instructor is authenticated', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        level: 'beginner',
        price: 99.99
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', courseData.title);
      expect(response.body).toHaveProperty('instructor', instructor._id.toString());
    });

    it('should not allow students to create courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          level: 'beginner',
          price: 99.99
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructor._id,
        category: 'Programming',
        level: 'beginner',
        price: 99.99
      });
    });

    it('should allow students to enroll in courses', async () => {
      const response = await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      
      const updatedCourse = await Course.findById(course._id);
      expect(updatedCourse.enrolledStudents).toContainEqual(student._id);
    });

    it('should not allow duplicate enrollments', async () => {
      // First enrollment
      await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Second enrollment attempt
      const response = await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Already enrolled in this course');
    });
  });
});