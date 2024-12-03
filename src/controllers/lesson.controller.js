const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const { title, content, courseId, order, duration, resources } = req.body;

    // Verify course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only course instructor can add lessons' 
      });
    }

    const lesson = new Lesson({
      title,
      content,
      courseId,
      order,
      duration,
      resources
    });

    await lesson.save();

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lesson' });
  }
};

// Get lesson by ID
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course or is the instructor
    const course = await Course.findById(lesson.courseId);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({ 
        message: 'You must be enrolled in this course to access lessons' 
      });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson' });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { title, content, order, duration, resources } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify user is the course instructor
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only course instructor can update lessons' 
      });
    }

    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.order = order || lesson.order;
    lesson.duration = duration || lesson.duration;
    lesson.resources = resources || lesson.resources;

    await lesson.save();
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson' });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify user is the course instructor
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only course instructor can delete lessons' 
      });
    }

    // Remove lesson from course
    course.lessons = course.lessons.filter(
      id => id.toString() !== lesson._id.toString()
    );
    await course.save();

    // Delete lesson
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lesson', error:error.message });
  }
};

// Get all lessons for a course
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({ 
        message: 'You must be enrolled in this course to access lessons' 
      });
    }

    const lessons = await Lesson.find({ courseId }).sort('order');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lessons' });
  }
};