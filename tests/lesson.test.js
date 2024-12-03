const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/user.model');
const Course = require('../src/models/course.model');
const Lesson = require('../src/models/lesson.model');
const { generateToken } = require('./helpers');

describe('Lesson Routes', () => {
  let instructorToken;
  let studentToken;
  let instructor;
  let student;
  let course;
  let lesson;

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

    // Create test course
    course = await Course.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: instructor._id,
      category: 'Programming',
      level: 'beginner',
      price: 99.99
    });

    // Create test lesson
    lesson = await Lesson.create({
      title: 'Test Lesson',
      content: 'Test Content',
      courseId: course._id,
      order: 1,
      duration: 30
    });
  });

  describe('POST /api/lessons', () => {
    it('should create a new lesson when instructor is authenticated', async () => {
      const lessonData = {
        title: 'New Lesson',
        content: 'Lesson Content',
        courseId: course._id,
        order: 2,
        duration: 45,
        resources: [{
          title: 'Resource 1',
          url: 'https://example.com',
          type: 'document'
        }]
      };

      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(lessonData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', lessonData.title);
      expect(response.body.resources).toHaveLength(1);
    });

    it('should not allow students to create lessons', async () => {
      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'New Lesson',
          content: 'Content',
          courseId: course._id,
          order: 1,
          duration: 30
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/lessons/:id', () => {
    beforeEach(async () => {
      // Enroll student in course
      course.enrolledStudents.push(student._id);
      await course.save();
    });

    it('should return lesson for enrolled student', async () => {
      const response = await request(app)
        .get(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', lesson.title);
    });

    it('should not return lesson for non-enrolled student', async () => {
      // Remove student from enrolled students
      course.enrolledStudents = [];
      await course.save();

      const response = await request(app)
        .get(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/lessons/:id', () => {
    it('should update lesson when instructor is authenticated', async () => {
      const updateData = {
        title: 'Updated Lesson',
        content: 'Updated Content',
        courseId: course._id
      };

      const response = await request(app)
        .put(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('content', updateData.content);
    });
  });

  describe('DELETE /api/lessons/:id', () => {
    it('should delete lesson when instructor is authenticated', async () => {
      const response = await request(app)
        .delete(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);

      const deletedLesson = await Lesson.findById(lesson._id);
      expect(deletedLesson).toBeNull();
    });
  });
});