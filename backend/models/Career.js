const mongoose = require('mongoose')

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Career title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Career description is required']
  },
  category: {
    type: String,
    required: [true, 'Career category is required'],
    enum: [
      'technology',
      'business',
      'healthcare',
      'education',
      'engineering',
      'design',
      'marketing',
      'finance',
      'other'
    ]
  },
  requiredSkills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  }],
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobOutlook: {
    type: String,
    enum: ['excellent', 'good', 'average', 'declining'],
    required: true
  },
  educationLevel: {
    type: String,
    enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'certification'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: true
  },
  workEnvironment: {
    type: String,
    enum: ['remote', 'office', 'hybrid', 'field'],
    required: true
  },
  growthRate: {
    type: Number,
    min: -100,
    max: 100,
    required: true
  },
  relatedCareers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  }],
  learningPaths: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for search functionality
careerSchema.index({ title: 'text', description: 'text', category: 'text' })

module.exports = mongoose.model('Career', careerSchema)
