const mongoose = require("mongoose");

// Schema for roadmap resources
const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["video", "article", "course", "book", "documentation", "tutorial"],
    },
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
    duration: {
      type: String,
    },
    free: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Schema for roadmap projects
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    estimatedHours: {
      type: Number,
      required: true,
    },
    technologies: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

// Schema for roadmap milestones
const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    verification: {
      type: String,
    },
  },
  { _id: false }
);

// Schema for roadmap steps
const stepSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["course", "project", "certification", "practice", "reading"],
    },
    duration: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    skills: [
      {
        type: String,
      },
    ],
    prerequisites: [
      {
        type: String,
      },
    ],
    resources: [resourceSchema],
    projects: [projectSchema],
    milestones: [milestoneSchema],
  },
  { _id: false }
);

// Schema for roadmap phases
const phaseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, "Please provide a valid hex color"],
    },
    steps: [stepSchema],
  },
  { _id: false }
);

// Schema for roadmap connections
const connectionSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["prerequisite", "recommended", "parallel", "optional"],
    },
    label: {
      type: String,
    },
  },
  { _id: false }
);

// Schema for salary range
const salaryRangeSchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  { _id: false }
);

// Schema for roadmap metadata
const metadataSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    aiModel: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: "1.0",
    },
    tags: [
      {
        type: String,
      },
    ],
    industry: {
      type: String,
    },
    salaryRange: salaryRangeSchema,
  },
  { _id: false }
);

// Schema for roadmap overview
const overviewSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    outcomes: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

// Main roadmap schema
const roadmapSchema = new mongoose.Schema({
  // User and identification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roadmapId: {
    type: String,
    required: true,
    unique: true,
  },

  // Basic roadmap info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  field: {
    type: String,
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "Machine Learning",
      "DevOps",
      "Cybersecurity",
      "UI/UX Design",
      "Product Management",
      "Digital Marketing",
      "Cloud Computing",
    ],
  },
  level: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },

  // Roadmap content
  overview: {
    type: overviewSchema,
    required: true,
  },
  phases: [phaseSchema],
  connections: [connectionSchema],
  metadata: {
    type: metadataSchema,
    required: true,
  },

  // Documentation
  documentation: {
    type: String, // Markdown content
    required: true,
  },

  // Status and tracking
  status: {
    type: String,
    enum: ["generating", "completed", "failed"],
    default: "generating",
  },
  isPublic: {
    type: Boolean,
    default: false,
  },

  // Ratings and feedback
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },

  // n8n workflow tracking
  workflowId: {
    type: String, // n8n workflow execution ID
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
roadmapSchema.index({ userId: 1, field: 1 });
roadmapSchema.index({ field: 1, level: 1 });
roadmapSchema.index({ "metadata.tags": 1 });
roadmapSchema.index({ status: 1 });
roadmapSchema.index({ isPublic: 1, "rating.average": -1 });

// Virtual for computing roadmap URL
roadmapSchema.virtual("url").get(function () {
  return `/roadmaps/${this.roadmapId}`;
});

// Pre-save middleware to update timestamps
roadmapSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add rating
roadmapSchema.methods.addRating = function (rating) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + rating) / this.rating.count;

  return this.save();
};

// Method to get completion percentage for a user
roadmapSchema.methods.getCompletionPercentage = function (userProgress) {
  if (!userProgress || !userProgress.phases) return 0;

  const totalSteps = this.phases.reduce(
    (total, phase) => total + phase.steps.length,
    0
  );
  if (totalSteps === 0) return 0;

  const completedSteps = userProgress.phases.reduce((total, phase) => {
    return total + phase.steps.filter((step) => step.completed).length;
  }, 0);

  return Math.round((completedSteps / totalSteps) * 100);
};

// Static method to find roadmaps by field
roadmapSchema.statics.findByField = function (field, level = null) {
  const query = { field, status: "completed" };
  if (level) query.level = level;
  return this.find(query).sort({ "rating.average": -1, createdAt: -1 });
};

// Static method to get popular roadmaps
roadmapSchema.statics.getPopular = function (limit = 10) {
  return this.find({
    status: "completed",
    isPublic: true,
    "rating.count": { $gte: 5 },
  })
    .sort({ "rating.average": -1, "rating.count": -1 })
    .limit(limit)
    .populate("userId", "name");
};

// Transform JSON output to match API schema
roadmapSchema.methods.toJSON = function () {
  const obj = this.toObject();

  // Transform to match the expected API response format
  const roadmapJson = {
    id: obj.roadmapId,
    title: obj.title,
    field: obj.field,
    level: obj.level,
    overview: obj.overview,
    phases: obj.phases,
    connections: obj.connections,
    metadata: obj.metadata,
  };

  return {
    _id: obj._id,
    userId: obj.userId,
    roadmap_json: roadmapJson,
    roadmap_doc: obj.documentation,
    status: obj.status,
    isPublic: obj.isPublic,
    rating: obj.rating,
    workflowId: obj.workflowId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    url: this.url,
  };
};

module.exports = mongoose.model("Roadmap", roadmapSchema);
