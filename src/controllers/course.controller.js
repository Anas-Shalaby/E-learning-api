const Course = require('../models/course.model');
const User = require('../models/user.model');

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    const course = new Course({
      title,
      description,
      instructor: req.user._id,
      category, 
      level,
      price
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course' });
  }
};

// Get all courses with pagination
exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate('instructor', 'username email')
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments();

    res.json({
      courses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push(userId);
    await course.save();

    // Add course to user's enrolled courses
    const user = await User.findById(userId);
    user.enrolledCourses.push(courseId);
    await user.save();

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in course' });
  }
};