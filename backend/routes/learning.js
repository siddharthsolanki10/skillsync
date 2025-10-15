const express = require('express')
const { body, validationResult } = require('express-validator')
const LearningPath = require('../models/LearningPath')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Get all learning paths with filtering and pagination
// @route   GET /api/learning/paths
// @access  Public
router.get('/paths', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      search,
      sortBy = 'popularity',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    const filter = { isActive: true }
    
    if (category) {
      filter.category = category
    }
    
    if (difficulty) {
      filter.difficulty = difficulty
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const learningPaths = await LearningPath.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedCareers', 'title category')

    const total = await LearningPath.countDocuments(filter)

    res.json({
      success: true,
      data: {
        learningPaths,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPaths: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    })
  } catch (error) {
    console.error('Get learning paths error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching learning paths'
    })
  }
})

// @desc    Get learning path by ID
// @route   GET /api/learning/paths/:id
// @access  Public
router.get('/paths/:id', async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id)
      .populate('relatedCareers', 'title category description')

    if (!learningPath || !learningPath.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      })
    }

    res.json({
      success: true,
      data: { learningPath }
    })
  } catch (error) {
    console.error('Get learning path error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching learning path'
    })
  }
})

// @desc    Get personalized learning paths for user
// @route   GET /api/learning/personalized
// @access  Private
router.get('/personalized', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    // Get user's skills and goals
    const userSkills = user.skills.map(skill => skill.name.toLowerCase())
    const userGoals = user.goals.filter(goal => goal.status !== 'completed')

    // Find learning paths that match user's goals and skill level
    const learningPaths = await LearningPath.find({
      isActive: true,
      $or: [
        { relatedCareers: { $in: userGoals.map(goal => goal.title) } },
        { category: user.field }
      ]
    })
    .populate('relatedCareers', 'title category')
    .limit(10)

    // Calculate relevance score for each path
    const personalizedPaths = learningPaths.map(path => {
      let relevanceScore = 0

      // Check if path matches user's goals
      userGoals.forEach(goal => {
        if (path.title.toLowerCase().includes(goal.title.toLowerCase()) ||
            goal.title.toLowerCase().includes(path.title.toLowerCase())) {
          relevanceScore += 2
        }
      })

      // Check if path matches user's field
      if (path.category === user.field) {
        relevanceScore += 1
      }

      // Check difficulty match with user's skill level
      const avgUserSkillLevel = user.skills.reduce((sum, skill) => sum + skill.level, 0) / user.skills.length
      
      if (path.difficulty === 'beginner' && avgUserSkillLevel < 40) {
        relevanceScore += 1
      } else if (path.difficulty === 'intermediate' && avgUserSkillLevel >= 40 && avgUserSkillLevel < 70) {
        relevanceScore += 1
      } else if (path.difficulty === 'advanced' && avgUserSkillLevel >= 70) {
        relevanceScore += 1
      }

      return {
        ...path.toObject(),
        relevanceScore
      }
    })

    // Sort by relevance score
    personalizedPaths.sort((a, b) => b.relevanceScore - a.relevanceScore)

    res.json({
      success: true,
      data: { learningPaths: personalizedPaths.slice(0, 5) }
    })
  } catch (error) {
    console.error('Get personalized paths error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching personalized learning paths'
    })
  }
})

// @desc    Get learning path categories
// @route   GET /api/learning/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await LearningPath.distinct('category', { isActive: true })
    
    res.json({
      success: true,
      data: { categories }
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    })
  }
})

// @desc    Search learning paths
// @route   GET /api/learning/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params
    const { limit = 10 } = req.query

    const learningPaths = await LearningPath.find({
      isActive: true,
      $text: { $search: query }
    })
    .limit(parseInt(limit))
    .populate('relatedCareers', 'title category')

    res.json({
      success: true,
      data: { learningPaths }
    })
  } catch (error) {
    console.error('Search learning paths error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while searching learning paths'
    })
  }
})

// @desc    Get popular learning paths
// @route   GET /api/learning/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query

    const learningPaths = await LearningPath.find({
      isActive: true
    })
    .sort({ popularity: -1, rating: -1 })
    .limit(parseInt(limit))
    .populate('relatedCareers', 'title category')

    res.json({
      success: true,
      data: { learningPaths }
    })
  } catch (error) {
    console.error('Get popular learning paths error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular learning paths'
    })
  }
})

// @desc    Rate learning path
// @route   POST /api/learning/paths/:id/rate
// @access  Private
router.post('/paths/:id/rate', [
  protect,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { rating } = req.body

    const learningPath = await LearningPath.findById(req.params.id)
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      })
    }

    // Update rating (simplified - in production, you'd want to track individual user ratings)
    const newRatingCount = learningPath.rating.count + 1
    const newAverageRating = ((learningPath.rating.average * learningPath.rating.count) + rating) / newRatingCount

    learningPath.rating.average = Math.round(newAverageRating * 10) / 10
    learningPath.rating.count = newRatingCount

    await learningPath.save()

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { rating: learningPath.rating }
    })
  } catch (error) {
    console.error('Rate learning path error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating'
    })
  }
})

module.exports = router
