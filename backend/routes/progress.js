const express = require("express");
const { body, validationResult, param, query } = require("express-validator");
const UserProgress = require("../models/UserProgress");
const Roadmap = require("../models/Roadmap");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @desc    Get user's overall progress dashboard
// @route   GET /api/progress/dashboard
// @access  Private
router.get("/dashboard", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user progress
    const progressRecords = await UserProgress.getUserProgress(userId);

    // Calculate dashboard statistics
    const stats = {
      totalRoadmaps: progressRecords.length,
      completedRoadmaps: progressRecords.filter((p) => p.completedAt).length,
      inProgressRoadmaps: progressRecords.filter(
        (p) => !p.completedAt && p.overallProgress > 0
      ).length,
      notStartedRoadmaps: progressRecords.filter((p) => p.overallProgress === 0)
        .length,
      totalTimeSpent: progressRecords.reduce(
        (total, p) => total + p.stats.totalTimeSpent,
        0
      ),
      averageProgress:
        progressRecords.length > 0
          ? Math.round(
              progressRecords.reduce(
                (total, p) => total + p.overallProgress,
                0
              ) / progressRecords.length
            )
          : 0,
      currentStreak: Math.max(
        ...progressRecords.map((p) => p.stats.streakDays),
        0
      ),
      longestStreak: Math.max(
        ...progressRecords.map((p) => p.stats.longestStreak),
        0
      ),
      totalAchievements: progressRecords.reduce(
        (total, p) => total + p.achievements.length,
        0
      ),
    };

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = progressRecords
      .flatMap((progress) =>
        progress.phases.flatMap((phase) =>
          phase.steps
            .filter(
              (step) => step.completedAt && step.completedAt >= sevenDaysAgo
            )
            .map((step) => ({
              type: "step_completed",
              roadmapTitle: progress.roadmapObjectId?.title,
              stepTitle: step.stepId, // You might want to populate this with actual step data
              completedAt: step.completedAt,
              timeSpent: step.timeSpent,
            }))
        )
      )
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10);

    // Get upcoming milestones
    const upcomingMilestones = progressRecords
      .filter((p) => !p.completedAt)
      .map((progress) => {
        const nextPhase = progress.phases.find((phase) => !phase.completedAt);
        const nextStep = nextPhase?.steps.find((step) => !step.completed);

        return nextStep
          ? {
              roadmapId: progress.roadmapId,
              roadmapTitle: progress.roadmapObjectId?.title,
              phaseTitle: nextPhase.phaseId,
              stepTitle: nextStep.stepId,
              estimatedCompletion: progress.estimatedCompletion,
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        stats,
        roadmaps: progressRecords,
        recentActivity,
        upcomingMilestones,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get detailed progress for a specific roadmap
// @route   GET /api/progress/:roadmapId
// @access  Private
router.get(
  "/:roadmapId",
  [
    protect,
    param("roadmapId")
      .isLength({ min: 1 })
      .withMessage("Roadmap ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const roadmapId = req.params.roadmapId;
      const userId = req.user.id;

      // Get progress with roadmap details
      const progress = await UserProgress.findOne({
        userId,
        roadmapId,
      }).populate(
        "roadmapObjectId",
        "title field level overview phases connections"
      );

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // Calculate detailed statistics
      const roadmapData = progress.roadmapObjectId;
      const detailedStats = {
        overallProgress: progress.overallProgress,
        totalPhases: progress.phases.length,
        completedPhases: progress.phases.filter((p) => p.completedAt).length,
        totalSteps: progress.phases.reduce(
          (total, phase) => total + phase.steps.length,
          0
        ),
        completedSteps: progress.phases.reduce(
          (total, phase) =>
            total + phase.steps.filter((step) => step.completed).length,
          0
        ),
        timeSpent: progress.stats.totalTimeSpent,
        estimatedTimeRemaining: calculateEstimatedTimeRemaining(
          progress,
          roadmapData
        ),
        averageStepRating: calculateAverageStepRating(progress),
        studyStreakDays: progress.stats.streakDays,
        achievements: progress.achievements,
      };

      // Get phase-wise breakdown
      const phaseBreakdown = progress.phases.map((phase) => {
        const completedSteps = phase.steps.filter(
          (step) => step.completed
        ).length;
        const totalSteps = phase.steps.length;

        return {
          phaseId: phase.phaseId,
          progress:
            totalSteps > 0
              ? Math.round((completedSteps / totalSteps) * 100)
              : 0,
          completedSteps,
          totalSteps,
          timeSpent: phase.steps.reduce(
            (total, step) => total + step.timeSpent,
            0
          ),
          startedAt: phase.startedAt,
          completedAt: phase.completedAt,
          steps: phase.steps.map((step) => ({
            stepId: step.stepId,
            completed: step.completed,
            completedAt: step.completedAt,
            timeSpent: step.timeSpent,
            rating: step.rating,
            notes: step.notes,
          })),
        };
      });

      res.json({
        success: true,
        data: {
          progress,
          roadmap: roadmapData,
          stats: detailedStats,
          phaseBreakdown,
        },
      });
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching progress data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Update study preferences
// @route   PUT /api/progress/:roadmapId/preferences
// @access  Private
router.put(
  "/:roadmapId/preferences",
  [
    protect,
    param("roadmapId")
      .isLength({ min: 1 })
      .withMessage("Roadmap ID is required"),
    body("studyHoursPerWeek")
      .optional()
      .isInt({ min: 1, max: 168 })
      .withMessage("Study hours per week must be between 1 and 168"),
    body("targetCompletionDate")
      .optional()
      .isISO8601()
      .withMessage("Target completion date must be a valid date"),
    body("preferredStudyTimes")
      .optional()
      .isArray()
      .withMessage("Preferred study times must be an array"),
    body("learningPreferences.difficultyPreference")
      .optional()
      .isIn(["easy", "moderate", "challenging"])
      .withMessage(
        "Difficulty preference must be easy, moderate, or challenging"
      ),
    body("learningPreferences.pacePreference")
      .optional()
      .isIn(["slow", "moderate", "fast"])
      .withMessage("Pace preference must be slow, moderate, or fast"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const roadmapId = req.params.roadmapId;
      const userId = req.user.id;
      const updates = req.body;

      // Find and update progress
      const progress = await UserProgress.findOne({ userId, roadmapId });

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // Update fields
      if (updates.studyHoursPerWeek) {
        progress.studyHoursPerWeek = updates.studyHoursPerWeek;
      }

      if (updates.targetCompletionDate) {
        progress.targetCompletionDate = new Date(updates.targetCompletionDate);
      }

      if (updates.preferredStudyTimes) {
        progress.preferredStudyTimes = updates.preferredStudyTimes;
      }

      if (updates.learningPreferences) {
        progress.learningPreferences = {
          ...progress.learningPreferences,
          ...updates.learningPreferences,
        };
      }

      if (updates.customNotes) {
        progress.customNotes = updates.customNotes;
      }

      await progress.save();

      res.json({
        success: true,
        message: "Preferences updated successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating preferences",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Log study session
// @route   POST /api/progress/:roadmapId/session
// @access  Private
router.post(
  "/:roadmapId/session",
  [
    protect,
    param("roadmapId")
      .isLength({ min: 1 })
      .withMessage("Roadmap ID is required"),
    body("duration")
      .isFloat({ min: 0.1, max: 24 })
      .withMessage("Duration must be between 0.1 and 24 hours"),
    body("stepsWorkedOn")
      .optional()
      .isArray()
      .withMessage("Steps worked on must be an array"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const roadmapId = req.params.roadmapId;
      const userId = req.user.id;
      const { duration, stepsWorkedOn = [], notes } = req.body;

      // Find progress record
      const progress = await UserProgress.findOne({ userId, roadmapId });

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // Add study time
      progress.addStudyTime(duration);

      // Update time for specific steps if provided
      if (stepsWorkedOn.length > 0) {
        stepsWorkedOn.forEach(({ phaseId, stepId, timeSpent }) => {
          const phase = progress.phases.find((p) => p.phaseId === phaseId);
          if (phase) {
            const step = phase.steps.find((s) => s.stepId === stepId);
            if (step && timeSpent) {
              step.timeSpent += timeSpent;
            }
          }
        });
      }

      await progress.save();

      res.json({
        success: true,
        message: "Study session logged successfully",
        data: {
          totalTimeSpent: progress.stats.totalTimeSpent,
          sessionCount: progress.stats.studySessions,
          streakDays: progress.stats.streakDays,
        },
      });
    } catch (error) {
      console.error("Log session error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging study session",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Get leaderboard
// @route   GET /api/progress/leaderboard
// @access  Private
router.get(
  "/meta/leaderboard",
  [
    protect,
    query("roadmapId")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Invalid roadmap ID"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { roadmapId, limit = 10 } = req.query;

      const leaderboard = await UserProgress.getLeaderboard(
        roadmapId,
        parseInt(limit)
      );

      // Format leaderboard data
      const formattedLeaderboard = leaderboard.map((progress, index) => ({
        rank: index + 1,
        user: {
          name: progress.userId.name,
          id: progress.userId._id,
        },
        roadmap: progress.roadmapObjectId
          ? {
              title: progress.roadmapObjectId.title,
              field: progress.roadmapObjectId.field,
            }
          : null,
        progress: progress.overallProgress,
        timeSpent: progress.stats.totalTimeSpent,
        completedAt: progress.completedAt,
        achievements: progress.achievements.length,
        streakDays: progress.stats.streakDays,
      }));

      res.json({
        success: true,
        data: formattedLeaderboard,
      });
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching leaderboard",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Get achievements
// @route   GET /api/progress/:roadmapId/achievements
// @access  Private
router.get(
  "/:roadmapId/achievements",
  [
    protect,
    param("roadmapId")
      .isLength({ min: 1 })
      .withMessage("Roadmap ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const roadmapId = req.params.roadmapId;
      const userId = req.user.id;

      const progress = await UserProgress.findOne({ userId, roadmapId });

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // Get all possible achievements
      const allAchievements = [
        {
          type: "first_step",
          title: "First Step Complete!",
          description: "Complete your first learning step",
        },
        {
          type: "first_phase",
          title: "Phase Master!",
          description: "Complete your first learning phase",
        },
        {
          type: "first_project",
          title: "Project Builder!",
          description: "Complete your first project",
        },
        {
          type: "streak_7_days",
          title: "Week Warrior!",
          description: "Study for 7 consecutive days",
        },
        {
          type: "streak_30_days",
          title: "Monthly Master!",
          description: "Study for 30 consecutive days",
        },
        {
          type: "fast_learner",
          title: "Fast Learner!",
          description: "Complete steps faster than average",
        },
        {
          type: "consistent_learner",
          title: "Consistent Learner!",
          description: "Maintain regular study schedule",
        },
        {
          type: "roadmap_completed",
          title: "Roadmap Conqueror!",
          description: "Complete the entire roadmap",
        },
      ];

      // Mark achieved ones
      const achievementsWithStatus = allAchievements.map((achievement) => {
        const earned = progress.achievements.find(
          (a) => a.type === achievement.type
        );
        return {
          ...achievement,
          earned: !!earned,
          earnedAt: earned?.achievedAt || null,
        };
      });

      res.json({
        success: true,
        data: {
          achievements: achievementsWithStatus,
          totalEarned: progress.achievements.length,
          totalPossible: allAchievements.length,
        },
      });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching achievements",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Helper functions
function calculateEstimatedTimeRemaining(progress, roadmapData) {
  if (!roadmapData || progress.completedAt) return 0;

  const completedSteps = progress.phases.reduce(
    (total, phase) =>
      total + phase.steps.filter((step) => step.completed).length,
    0
  );

  const totalSteps = roadmapData.phases.reduce(
    (total, phase) => total + phase.steps.length,
    0
  );

  const remainingSteps = totalSteps - completedSteps;
  const averageTimePerStep =
    progress.stats.totalTimeSpent / Math.max(completedSteps, 1);

  return Math.round(remainingSteps * averageTimePerStep);
}

function calculateAverageStepRating(progress) {
  const allRatings = progress.phases.flatMap((phase) =>
    phase.steps.filter((step) => step.rating).map((step) => step.rating)
  );

  if (allRatings.length === 0) return 0;

  return (
    Math.round(
      (allRatings.reduce((sum, rating) => sum + rating, 0) /
        allRatings.length) *
        10
    ) / 10
  );
}

module.exports = router;
