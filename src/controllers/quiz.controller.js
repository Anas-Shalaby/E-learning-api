const Quiz = require('../models/quiz.model');
const Progress = require('../models/progress.model');

exports.createQuiz = async (req, res) => {
  try {
    const { title, lessonId, questions, timeLimit, passingScore } = req.body;

    const quiz = new Quiz({
      title,
      lessonId,
      questions,
      timeLimit,
      passingScore
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz',error :error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has already passed this quiz
    const existingProgress = await Progress.findOne({
      userId: req.user._id,
      'quizScores.quizId': quizId,
      'quizScores.score': { $gte: quiz.passingScore }
    });

    if (existingProgress) {
      return res.status(400).json({ 
        message: 'You have already passed this quiz'
      });
    }

    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score += quiz.questions[index].points;
      }
    });

    // Update progress with quiz score
    let progress = await Progress.findOne({
      userId: req.user._id,
      lessonId: quiz.lessonId
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        lessonId: quiz.lessonId,
        completedLessons: [],
        quizScores: []
      });
    }

    progress.quizScores.push({
      quizId: quiz._id,
      score,
      completedAt: Date.now()
    });

    await progress.save();

    const passed = score >= quiz.passingScore;
    res.json({
      score,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      passed,
      feedback: passed ? 'Congratulations! You passed the quiz.' : 'Please review the material and try again.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz'  , error :error.message });
  }
};

// Get quiz attempts for a user
exports.getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const progress = await Progress.findOne({
      userId: req.user._id,
      'quizScores.quizId': quizId
    });

    if (!progress) {
      return res.json({ attempts: [] });
    }

    const attempts = progress.quizScores
      .filter(score => score.quizId.toString() === quizId)
      .map(score => ({
        score: score.score,
        completedAt: score.completedAt
      }));

    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz attempts' });
  }
};