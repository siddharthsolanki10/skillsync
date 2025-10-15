const express = require('express')
const Career = require('../models/Career')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Get all careers with filtering and pagination
// @route   GET /api/careers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      experienceLevel,
      educationLevel,
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query

    // Build filter object
    const filter = { isActive: true }
    
    if (category) {
      filter.category = category
    }
    
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel
    }
    
    if (educationLevel) {
      filter.educationLevel = educationLevel
    }
    
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const careers = await Career.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedCareers', 'title category')
      .populate('learningPaths', 'title difficulty estimatedDuration')

    const total = await Career.countDocuments(filter)

    res.json({
      success: true,
      data: {
        careers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCareers: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    })
  } catch (error) {
    console.error('Get careers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching careers'
    })
  }
})

// @desc    Get career by ID
// @route   GET /api/careers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id)
      .populate('relatedCareers', 'title category description')
      .populate('learningPaths', 'title description difficulty estimatedDuration totalHours')

    if (!career || !career.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Career not found'
      })
    }

    res.json({
      success: true,
      data: { career }
    })
  } catch (error) {
    console.error('Get career error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching career'
    })
  }
})

// @desc    Get career recommendations for user
// @route   GET /api/careers/recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    // Get user's skills and field
    const userSkills = user.skills.map(skill => skill.name.toLowerCase())
    const userField = user.field

    // Find careers that match user's field and skills
    const careers = await Career.find({
      isActive: true,
      $or: [
        { category: userField },
        { requiredSkills: { $elemMatch: { name: { $in: userSkills } } } }
      ]
    })
    .populate('learningPaths', 'title difficulty estimatedDuration')
    .limit(10)

    // Calculate match percentage for each career
    const recommendations = careers.map(career => {
      let matchScore = 0
      let totalSkills = career.requiredSkills.length

      // Check skill matches
      career.requiredSkills.forEach(requiredSkill => {
        if (userSkills.includes(requiredSkill.name.toLowerCase())) {
          matchScore += 1
        }
      })

      // Add field match bonus
      if (career.category === userField) {
        matchScore += 0.5
      }

      const matchPercentage = Math.round((matchScore / (totalSkills + 0.5)) * 100)

      return {
        ...career.toObject(),
        matchPercentage
      }
    })

    // Sort by match percentage
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage)

    res.json({
      success: true,
      data: { recommendations: recommendations.slice(0, 5) }
    })
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    })
  }
})

// @desc    Get career categories
// @route   GET /api/careers/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Career.distinct('category', { isActive: true })
    
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

// @desc    Search careers
// @route   GET /api/careers/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params
    const { limit = 10 } = req.query

    const careers = await Career.find({
      isActive: true,
      $text: { $search: query }
    })
    .limit(parseInt(limit))
    .populate('learningPaths', 'title difficulty')

    res.json({
      success: true,
      data: { careers }
    })
  } catch (error) {
    console.error('Search careers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while searching careers'
    })
  }
})

// @desc    Get trending careers
// @route   GET /api/careers/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 5 } = req.query

    // Get careers with high growth rate and good job outlook
    const careers = await Career.find({
      isActive: true,
      growthRate: { $gte: 10 },
      jobOutlook: { $in: ['excellent', 'good'] }
    })
    .sort({ growthRate: -1 })
    .limit(parseInt(limit))
    .populate('learningPaths', 'title difficulty')

    res.json({
      success: true,
      data: { careers }
    })
  } catch (error) {
    console.error('Get trending careers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending careers'
    })
  }
})

module.exports = router
