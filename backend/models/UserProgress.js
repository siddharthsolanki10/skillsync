const mongoose = require("mongoose");

// Schema for step progress tracking
const stepProgressSchema = new mongoose.Schema(
  {
    stepId: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number, // in hours
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
    resources: [
      {
        resourceUrl: String,
        completed: {
          type: Boolean,
          default: false,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        timeSpent: Number, // in hours
      },
    ],
    projects: [
      {
        projectTitle: String,
        completed: {
          type: Boolean,
          default: false,
        },
        githubUrl: String,
        liveUrl: String,
        completedAt: Date,
        timeSpent: Number, // in hours
        difficulty: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  { _id: false }
);

// Schema for phase progress tracking
const phaseProgressSchema = new mongoose.Schema(
  {
    phaseId: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    steps: [stepProgressSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    estimatedCompletionDate: {
      type: Date,
    },
  },
  { _id: false }
);

// Main user progress schema
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roadmapId: {
    type: String,
    required: true,
  },
  roadmapObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roadmap",
    required: true,
  },

  // Progress tracking
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },

  // Phase and step progress
  phases: [phaseProgressSchema],

  // Overall progress
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Custom user data
  customNotes: {
    type: String,
    maxlength: [2000, "Custom notes cannot be more than 2000 characters"],
  },
  targetCompletionDate: {
    type: Date,
  },

  // Study preferences
  studyHoursPerWeek: {
    type: Number,
    default: 10,
    min: 1,
    max: 168,
  },
  preferredStudyTimes: [
    {
      day: {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
      startTime: String, // HH:MM format
      endTime: String, // HH:MM format
    },
  ],

  // Statistics
  stats: {
    totalTimeSpent: {
      type: Number,
      default: 0, // in hours
    },
    averageSessionTime: {
      type: Number,
      default: 0, // in hours
    },
    studySessions: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
    },
  },

  // Milestones and achievements
  achievements: [
    {
      type: {
        type: String,
        enum: [
          "first_step",
          "first_phase",
          "first_project",
          "streak_7_days",
          "streak_30_days",
          "fast_learner",
          "consistent_learner",
          "roadmap_completed",
        ],
      },
      achievedAt: {
        type: Date,
        default: Date.now,
      },
      title: String,
      description: String,
    },
  ],

  // Rating of the roadmap
  roadmapRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot be more than 1000 characters"],
    },
    ratedAt: Date,
  },

  // Learning style preferences
  learningPreferences: {
    preferredResourceTypes: [
      {
        type: String,
        enum: [
          "video",
          "article",
          "course",
          "book",
          "documentation",
          "tutorial",
        ],
      },
    ],
    difficultyPreference: {
      type: String,
      enum: ["easy", "moderate", "challenging"],
      default: "moderate",
    },
    pacePreference: {
      type: String,
      enum: ["slow", "moderate", "fast"],
      default: "moderate",
    },
  },

  // Notifications and reminders
  notifications: {
    dailyReminder: {
      enabled: {
        type: Boolean,
        default: true,
      },
      time: {
        type: String,
        default: "09:00",
      },
    },
    weeklyGoal: {
      enabled: {
        type: Boolean,
        default: true,
      },
      hoursPerWeek: {
        type: Number,
        default: 10,
      },
    },
    milestoneReminder: {
      type: Boolean,
      default: true,
    },
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

// Compound index for unique user-roadmap combination
userProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

// Indexes for performance
userProgressSchema.index({ userId: 1, lastUpdated: -1 });
userProgressSchema.index({ roadmapObjectId: 1 });
userProgressSchema.index({ overallProgress: 1 });
userProgressSchema.index({ "stats.streakDays": -1 });

// Pre-save middleware to update timestamps and calculate progress
userProgressSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  this.calculateOverallProgress();
  this.updateStudyStreak();
  next();
});

// Method to calculate overall progress
userProgressSchema.methods.calculateOverallProgress = function () {
  if (!this.phases || this.phases.length === 0) {
    this.overallProgress = 0;
    return;
  }

  let totalSteps = 0;
  let completedSteps = 0;

  this.phases.forEach((phase) => {
    totalSteps += phase.steps.length;
    completedSteps += phase.steps.filter((step) => step.completed).length;

    // Update phase progress
    if (phase.steps.length > 0) {
      phase.overallProgress = Math.round(
        (phase.steps.filter((step) => step.completed).length /
          phase.steps.length) *
          100
      );
    }
  });

  this.overallProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
};

// Method to update study streak
userProgressSchema.methods.updateStudyStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastStudyDate = this.stats.lastStudyDate;

  if (!lastStudyDate) {
    // First study session
    this.stats.streakDays = 1;
    this.stats.lastStudyDate = today;
    this.checkAchievements();
    return;
  }

  const lastStudy = new Date(lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastStudy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    this.stats.streakDays += 1;
    this.stats.lastStudyDate = today;

    // Update longest streak
    if (this.stats.streakDays > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.streakDays;
    }
  } else if (diffDays > 1) {
    // Streak broken
    this.stats.streakDays = 1;
    this.stats.lastStudyDate = today;
  }
  // diffDays === 0 means studying on the same day, no change needed

  this.checkAchievements();
};

// Method to add study time
userProgressSchema.methods.addStudyTime = function (hours) {
  this.stats.totalTimeSpent += hours;
  this.stats.studySessions += 1;
  this.stats.averageSessionTime =
    this.stats.totalTimeSpent / this.stats.studySessions;
  this.updateStudyStreak();
};

// Method to complete a step
userProgressSchema.methods.completeStep = function (
  phaseId,
  stepId,
  timeSpent = 0,
  rating = null,
  notes = ""
) {
  const phase = this.phases.find((p) => p.phaseId === phaseId);
  if (!phase) {
    throw new Error("Phase not found");
  }

  const step = phase.steps.find((s) => s.stepId === stepId);
  if (!step) {
    throw new Error("Step not found");
  }

  step.completed = true;
  step.completedAt = new Date();
  step.timeSpent += timeSpent;
  if (rating) step.rating = rating;
  if (notes) step.notes = notes;

  this.addStudyTime(timeSpent);
  this.calculateOverallProgress();

  // Check if phase is completed
  const allStepsCompleted = phase.steps.every((s) => s.completed);
  if (allStepsCompleted && !phase.completedAt) {
    phase.completedAt = new Date();
    this.checkAchievements();
  }

  // Check if entire roadmap is completed
  const allPhasesCompleted = this.phases.every((p) => p.completedAt);
  if (allPhasesCompleted && !this.completedAt) {
    this.completedAt = new Date();
    this.checkAchievements();
  }

  return this.save();
};

// Method to check and award achievements
userProgressSchema.methods.checkAchievements = function () {
  const existingAchievements = this.achievements.map((a) => a.type);

  // First step achievement
  if (!existingAchievements.includes("first_step")) {
    const hasCompletedStep = this.phases.some((phase) =>
      phase.steps.some((step) => step.completed)
    );
    if (hasCompletedStep) {
      this.achievements.push({
        type: "first_step",
        title: "First Step Complete!",
        description: "You completed your first learning step",
      });
    }
  }

  // First phase achievement
  if (!existingAchievements.includes("first_phase")) {
    const hasCompletedPhase = this.phases.some((phase) => phase.completedAt);
    if (hasCompletedPhase) {
      this.achievements.push({
        type: "first_phase",
        title: "Phase Master!",
        description: "You completed your first learning phase",
      });
    }
  }

  // Streak achievements
  if (
    !existingAchievements.includes("streak_7_days") &&
    this.stats.streakDays >= 7
  ) {
    this.achievements.push({
      type: "streak_7_days",
      title: "Week Warrior!",
      description: "You studied for 7 consecutive days",
    });
  }

  if (
    !existingAchievements.includes("streak_30_days") &&
    this.stats.streakDays >= 30
  ) {
    this.achievements.push({
      type: "streak_30_days",
      title: "Monthly Master!",
      description: "You studied for 30 consecutive days",
    });
  }

  // Roadmap completion achievement
  if (!existingAchievements.includes("roadmap_completed") && this.completedAt) {
    this.achievements.push({
      type: "roadmap_completed",
      title: "Roadmap Conqueror!",
      description: "You completed the entire roadmap",
    });
  }
};

// Method to rate the roadmap
userProgressSchema.methods.rateRoadmap = function (rating, feedback = "") {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  this.roadmapRating = {
    rating,
    feedback,
    ratedAt: new Date(),
  };

  return this.save();
};

// Static method to get user's all roadmap progress
userProgressSchema.statics.getUserProgress = function (userId) {
  return this.find({ userId })
    .populate("roadmapObjectId", "title field level overview.duration status")
    .sort({ lastUpdated: -1 });
};

// Static method to get leaderboard
userProgressSchema.statics.getLeaderboard = function (
  roadmapId = null,
  limit = 10
) {
  const query = roadmapId ? { roadmapId } : {};

  return this.find(query)
    .populate("userId", "name")
    .populate("roadmapObjectId", "title field")
    .sort({
      overallProgress: -1,
      "stats.totalTimeSpent": 1, // Less time spent = higher rank for same progress
      completedAt: 1, // Earlier completion = higher rank
    })
    .limit(limit);
};

// Virtual to get estimated completion date
userProgressSchema.virtual("estimatedCompletion").get(function () {
  if (this.completedAt) return this.completedAt;

  const hoursPerWeek = this.studyHoursPerWeek || 10;
  const averageTimePerStep = 2; // Assume 2 hours per step average

  let remainingSteps = 0;
  this.phases.forEach((phase) => {
    remainingSteps += phase.steps.filter((step) => !step.completed).length;
  });

  const remainingHours = remainingSteps * averageTimePerStep;
  const remainingWeeks = Math.ceil(remainingHours / hoursPerWeek);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + remainingWeeks * 7);

  return estimatedDate;
});

// Transform JSON output
userProgressSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.estimatedCompletion = this.estimatedCompletion;
  return obj;
};

module.exports = mongoose.model("UserProgress", userProgressSchema);
