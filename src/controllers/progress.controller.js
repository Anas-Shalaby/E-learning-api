const Progress = require('../models/progress.model');
const Course = require('../models/course.model');
const moment = require('moment');

exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        completedLessons: []
      });
    }

    // Add completed lesson if not already completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    progress.progressPercentage = (progress.completedLessons.length / totalLessons) * 100;
    progress.lastAccessed = Date.now();

    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress' });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId
    }).populate('completedLessons', 'title');

    if (!progress) {
      return res.status(404).json({ message: 'No progress found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress' });
  }
};