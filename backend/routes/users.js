const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('location')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim(),
  body('linkedin')
    .optional()
    .trim(),
  body('github')
    .optional()
    .trim(),
  body('website')
    .optional()
    .trim()
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

    const allowedUpdates = ['name', 'bio', 'location', 'phone', 'linkedin', 'github', 'website']
    const updates = {}
    
    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    })
  }
})

// @desc    Add or update skill
// @route   POST /api/users/skills
// @access  Private
router.post('/skills', [
  protect,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required'),
  body('level')
    .isInt({ min: 0, max: 100 })
    .withMessage('Skill level must be between 0 and 100'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Skill category is required')
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

    const { name, level, category } = req.body

    const user = await User.findById(req.user._id)
    
    // Check if skill already exists
    const existingSkillIndex = user.skills.findIndex(skill => 
      skill.name.toLowerCase() === name.toLowerCase()
    )

    if (existingSkillIndex !== -1) {
      // Update existing skill
      user.skills[existingSkillIndex].level = level
      user.skills[existingSkillIndex].category = category
    } else {
      // Add new skill
      user.skills.push({ name, level, category })
    }

    await user.save()

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: { skills: user.skills }
    })
  } catch (error) {
    console.error('Skill update error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during skill update'
    })
  }
})

// @desc    Remove skill
// @route   DELETE /api/users/skills/:skillId
// @access  Private
router.delete('/skills/:skillId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    user.skills = user.skills.filter(skill => skill._id.toString() !== req.params.skillId)
    await user.save()

    res.json({
      success: true,
      message: 'Skill removed successfully',
      data: { skills: user.skills }
    })
  } catch (error) {
    console.error('Skill removal error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during skill removal'
    })
  }
})

// @desc    Add goal
// @route   POST /api/users/goals
// @access  Private
router.post('/goals', [
  protect,
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Goal title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Goal description is required'),
  body('targetDate')
    .isISO8601()
    .withMessage('Valid target date is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
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

    const { title, description, targetDate, priority = 'medium' } = req.body

    const user = await User.findById(req.user._id)
    
    user.goals.push({
      title,
      description,
      targetDate,
      priority,
      status: 'planned'
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'Goal added successfully',
      data: { goals: user.goals }
    })
  } catch (error) {
    console.error('Goal addition error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during goal addition'
    })
  }
})

// @desc    Update goal
// @route   PUT /api/users/goals/:goalId
// @access  Private
router.put('/goals/:goalId', [
  protect,
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Goal title cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Goal description cannot be empty'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Valid target date is required'),
  body('status')
    .optional()
    .isIn(['planned', 'in-progress', 'completed'])
    .withMessage('Status must be planned, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
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

    const user = await User.findById(req.user._id)
    const goal = user.goals.id(req.params.goalId)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      })
    }

    // Update goal fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key]
      }
    })

    await user.save()

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goals: user.goals }
    })
  } catch (error) {
    console.error('Goal update error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during goal update'
    })
  }
})

// @desc    Delete goal
// @route   DELETE /api/users/goals/:goalId
// @access  Private
router.delete('/goals/:goalId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const goal = user.goals.id(req.params.goalId)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      })
    }

    goal.remove()
    await user.save()

    res.json({
      success: true,
      message: 'Goal deleted successfully',
      data: { goals: user.goals }
    })
  } catch (error) {
    console.error('Goal deletion error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during goal deletion'
    })
  }
})

// @desc    Update learning progress
// @route   PUT /api/users/progress
// @access  Private
router.put('/progress', [
  protect,
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
  body('progressPercent')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100')
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

    const { courseId, courseName, progressPercent } = req.body

    const user = await User.findById(req.user._id)
    
    // Check if progress already exists for this course
    const existingProgressIndex = user.progress.findIndex(p => p.courseId === courseId)

    if (existingProgressIndex !== -1) {
      // Update existing progress
      user.progress[existingProgressIndex].progressPercent = progressPercent
      user.progress[existingProgressIndex].courseName = courseName
      
      // Mark as completed if 100%
      if (progressPercent === 100) {
        user.progress[existingProgressIndex].completedAt = new Date()
      }
    } else {
      // Add new progress
      user.progress.push({
        courseId,
        courseName,
        progressPercent,
        startedAt: new Date(),
        ...(progressPercent === 100 && { completedAt: new Date() })
      })
    }

    await user.save()

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress: user.progress }
    })
  } catch (error) {
    console.error('Progress update error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during progress update'
    })
  }
})

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    const stats = {
      totalSkills: user.skills.length,
      completedGoals: user.goals.filter(goal => goal.status === 'completed').length,
      totalGoals: user.goals.length,
      completedCourses: user.progress.filter(p => p.progressPercent === 100).length,
      totalCourses: user.progress.length,
      totalStudyHours: user.progress.reduce((total, p) => {
        // Assuming each course takes 10 hours on average
        return total + (p.progressPercent / 100) * 10
      }, 0),
      currentStreak: 7 // This would be calculated based on login history
    }

    res.json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    console.error('Stats retrieval error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during stats retrieval'
    })
  }
})

module.exports = router
