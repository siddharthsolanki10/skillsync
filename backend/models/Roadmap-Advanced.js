const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  careerField: {
    type: String,
    required: true,
    index: true,
    example: 'Web Development'
  },

  title: {
    type: String,
    required: true,
    example: 'Full Stack Web Development Roadmap'
  },

  description: {
    type: String,
    required: true,
    example: 'Complete guide to becoming a Full Stack Web Developer'
  },

  // Roadmap structure with phases and skills
  stages: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    skills: [{
      id: String,
      name: {
        type: String,
        required: true
      },
      description: String,
      time_required: String,
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
      },
      prerequisites: [String],
      keyTopics: [String],
      summary: String,
      resources: {
        free: [{
          title: String,
          link: String,
          why: String
        }],
        paid: [{
          title: String,
          platform: String,
          price: String,
          why: String
        }]
      },
      practicalTasks: [String],
      commonMistakes: [String]
    }]
  }],

  // Learning resources
  resources: {
    free: [{
      title: String,
      link: String,
      why: String
    }],
    paid: [{
      title: String,
      platform: String,
      price: String,
      instructor: String,
      why: String
    }]
  },

  // 30-day checklist
  dailyChecklist: {
    title: String,
    phases: [{
      week: String,
      days: [{
        day: String,
        tasks: [String]
      }]
    }]
  },

  // Notes for learners
  notesForLearners: {
    title: String,
    sections: [{
      category: String,
      points: [String]
    }]
  },

  // Summary and capstone
  summary: String,

  capstoneProject: {
    title: String,
    description: String,
    features: [String],
    timeline: String,
    technologies: [String]
  },

  // Metadata
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  duration: String,
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },

  // Generation metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  aiModel: {
    type: String,
    default: 'gpt-4',
    example: 'gpt-4'
  },
  aiPrompt: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },

  // Version control
  version: {
    type: Number,
    default: 1
  }
});

// Index for common queries
RoadmapSchema.index({ userId: 1, createdAt: -1 });
RoadmapSchema.index({ careerField: 1, status: 1 });
RoadmapSchema.index({ views: -1 });

// Virtual for roadmap URL
RoadmapSchema.virtual('url').get(function() {
  return `/roadmaps/${this._id}`;
});

// Pre-save hook to update timestamp
RoadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to convert to JSON
RoadmapSchema.methods.toJSON = function() {
  const roadmap = this.toObject();
  delete roadmap.__v;
  return roadmap;
};

// Static method to get popular roadmaps
RoadmapSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(limit);
};

// Static method to search
RoadmapSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { careerField: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'published'
  });
};

// Static method to get by career field
RoadmapSchema.statics.getByField = function(field) {
  return this.find({
    careerField: new RegExp(field, 'i'),
    status: 'published'
  }).sort({ helpful: -1 });
};

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);

module.exports = Roadmap;
