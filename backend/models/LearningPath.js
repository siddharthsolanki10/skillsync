const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'article', 'interactive', 'project', 'quiz'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  isFree: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: String
  }]
})

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Learning path title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Learning path description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'web-development',
      'data-science',
      'mobile-development',
      'devops',
      'cybersecurity',
      'ui-ux-design',
      'digital-marketing',
      'business-analysis',
      'project-management',
      'other'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedDuration: {
    type: Number, // in weeks
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  courses: [courseSchema],
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  targetAudience: {
    type: String,
    required: true
  },
  relatedCareers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Index for search functionality
learningPathSchema.index({ title: 'text', description: 'text', category: 'text' })

module.exports = mongoose.model('LearningPath', learningPathSchema)
