const express = require("express");
const { body, validationResult, param, query } = require("express-validator");
const axios = require("axios");
const Roadmap = require("../models/Roadmap");
const UserProgress = require("../models/UserProgress");
const Documentation = require("../models/Documentation");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @desc    Generate new AI roadmap
// @route   POST /api/roadmaps/generate
// @access  Private
router.post(
  "/generate",
  [
    protect,
    body("field")
      .isIn([
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
      ])
      .withMessage("Please select a valid career field"),
    body("level")
      .isIn(["Beginner", "Intermediate", "Advanced", "Expert"])
      .withMessage("Please select a valid skill level"),
    body("customRequirements")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Custom requirements cannot exceed 500 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { field, level, customRequirements } = req.body;
      const userId = req.user.id;

      // Check if user already has a roadmap for this field/level combination
      const existingRoadmap = await Roadmap.findOne({
        userId,
        field,
        level,
        status: { $in: ["generating", "completed"] },
      });

      if (existingRoadmap) {
        return res.status(409).json({
          success: false,
          message: "You already have a roadmap for this field and level",
          roadmap: existingRoadmap,
        });
      }

      // Generate unique roadmap ID
      const roadmapId = `${field
        .toLowerCase()
        .replace(/\s+/g, "-")}-${level.toLowerCase()}-${Date.now()}`;

      // Create initial roadmap record
      const roadmap = new Roadmap({
        userId,
        roadmapId,
        title: `${field} Career Path - ${level} Level`,
        field,
        level,
        overview: {
          description: "AI-generated roadmap is being created...",
          duration: "TBD",
          difficulty: 3,
          outcomes: [],
        },
        phases: [],
        connections: [],
        metadata: {
          aiModel: "GPT-4",
          tags: [field.toLowerCase().replace(/\s+/g, "-"), level.toLowerCase()],
        },
        documentation: "Generating documentation...",
        status: "generating",
      });

      await roadmap.save();

      // Trigger n8n workflow
      try {
        const n8nWebhookUrl = process.env.N8N_ROADMAP_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
          throw new Error("n8n webhook URL not configured");
        }

        const n8nPayload = {
          field,
          level,
          userId,
          roadmapId,
          customRequirements,
          callbackUrl: `${process.env.BACKEND_URL}/api/roadmaps/webhook/n8n-callback`,
        };

        const n8nResponse = await axios.post(n8nWebhookUrl, n8nPayload, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
          },
        });

        // Update roadmap with workflow ID
        roadmap.workflowId =
          n8nResponse.data.workflowId || `workflow-${Date.now()}`;
        await roadmap.save();
      } catch (n8nError) {
        console.error("n8n trigger failed:", n8nError.message);

        // Update roadmap status to failed
        roadmap.status = "failed";
        await roadmap.save();

        return res.status(500).json({
          success: false,
          message: "Failed to trigger AI roadmap generation",
          error: n8nError.message,
        });
      }

      // Initialize user progress tracking
      const userProgress = new UserProgress({
        userId,
        roadmapId,
        roadmapObjectId: roadmap._id,
        phases: [],
        overallProgress: 0,
      });
      await userProgress.save();

      res.status(202).json({
        success: true,
        message: "Roadmap generation started",
        roadmap: roadmap.toJSON(),
        progress: userProgress,
        estimatedTime: "2-3 minutes",
      });
    } catch (error) {
      console.error("Generate roadmap error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during roadmap generation",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Get all user roadmaps
// @route   GET /api/roadmaps
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, field } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (field) query.field = field;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get roadmaps with progress
    const roadmaps = await Roadmap.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const roadmapIds = roadmaps.map((r) => r.roadmapId);
    const progressData = await UserProgress.find({
      userId,
      roadmapId: { $in: roadmapIds },
    });

    // Combine roadmap data with progress
    const roadmapsWithProgress = roadmaps.map((roadmap) => {
      const progress = progressData.find(
        (p) => p.roadmapId === roadmap.roadmapId
      );
      return {
        ...roadmap.toJSON(),
        progress: progress || null,
      };
    });

    // Get total count for pagination
    const total = await Roadmap.countDocuments(query);

    res.json({
      success: true,
      data: roadmapsWithProgress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get roadmaps error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching roadmaps",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get roadmap by ID
// @route   GET /api/roadmaps/:id
// @access  Private
router.get(
  "/:id",
  [
    protect,
    param("id").isLength({ min: 1 }).withMessage("Roadmap ID is required"),
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

      const roadmapId = req.params.id;
      const userId = req.user.id;

      // Get roadmap
      const roadmap = await Roadmap.findOne({ roadmapId });

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: "Roadmap not found",
        });
      }

      // Check if user has access (own roadmap or public roadmap)
      if (roadmap.userId.toString() !== userId && !roadmap.isPublic) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Get user progress if it's their roadmap
      let progress = null;
      if (roadmap.userId.toString() === userId) {
        progress = await UserProgress.findOne({ userId, roadmapId });
      }

      // Get documentation
      const documentation = await Documentation.findOne({ roadmapId });

      res.json({
        success: true,
        data: {
          roadmap: roadmap.toJSON(),
          progress,
          documentation,
        },
      });
    } catch (error) {
      console.error("Get roadmap error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching roadmap",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Update roadmap progress
// @route   PUT /api/roadmaps/:id/progress
// @access  Private
router.put(
  "/:id/progress",
  [
    protect,
    param("id").isLength({ min: 1 }).withMessage("Roadmap ID is required"),
    body("action")
      .isIn(["complete_step", "uncomplete_step", "add_note", "rate_step"])
      .withMessage("Invalid action"),
    body("phaseId").isLength({ min: 1 }).withMessage("Phase ID is required"),
    body("stepId").isLength({ min: 1 }).withMessage("Step ID is required"),
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

      const roadmapId = req.params.id;
      const userId = req.user.id;
      const { action, phaseId, stepId, timeSpent, rating, notes } = req.body;

      // Get user progress
      const progress = await UserProgress.findOne({ userId, roadmapId });

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Progress record not found",
        });
      }

      // Perform action
      switch (action) {
        case "complete_step":
          await progress.completeStep(
            phaseId,
            stepId,
            timeSpent || 0,
            rating,
            notes || ""
          );
          break;

        case "uncomplete_step":
          const phase = progress.phases.find((p) => p.phaseId === phaseId);
          if (phase) {
            const step = phase.steps.find((s) => s.stepId === stepId);
            if (step) {
              step.completed = false;
              step.completedAt = null;
              progress.calculateOverallProgress();
              await progress.save();
            }
          }
          break;

        case "add_note":
          const notePhase = progress.phases.find((p) => p.phaseId === phaseId);
          if (notePhase) {
            const noteStep = notePhase.steps.find((s) => s.stepId === stepId);
            if (noteStep) {
              noteStep.notes = notes || "";
              await progress.save();
            }
          }
          break;

        case "rate_step":
          if (rating < 1 || rating > 5) {
            return res.status(400).json({
              success: false,
              message: "Rating must be between 1 and 5",
            });
          }
          const ratePhase = progress.phases.find((p) => p.phaseId === phaseId);
          if (ratePhase) {
            const rateStep = ratePhase.steps.find((s) => s.stepId === stepId);
            if (rateStep) {
              rateStep.rating = rating;
              await progress.save();
            }
          }
          break;
      }

      res.json({
        success: true,
        message: "Progress updated successfully",
        data: progress,
      });
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating progress",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Rate roadmap
// @route   POST /api/roadmaps/:id/rate
// @access  Private
router.post(
  "/:id/rate",
  [
    protect,
    param("id").isLength({ min: 1 }).withMessage("Roadmap ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("feedback")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Feedback cannot exceed 1000 characters"),
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

      const roadmapId = req.params.id;
      const userId = req.user.id;
      const { rating, feedback } = req.body;

      // Get roadmap
      const roadmap = await Roadmap.findOne({ roadmapId });

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: "Roadmap not found",
        });
      }

      // Add rating to roadmap
      await roadmap.addRating(rating);

      // Update user progress with rating
      const progress = await UserProgress.findOne({ userId, roadmapId });
      if (progress) {
        await progress.rateRoadmap(rating, feedback);
      }

      res.json({
        success: true,
        message: "Rating added successfully",
        data: {
          roadmap: roadmap.toJSON(),
          userRating: { rating, feedback },
        },
      });
    } catch (error) {
      console.error("Rate roadmap error:", error);
      res.status(500).json({
        success: false,
        message: "Error rating roadmap",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Delete roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private
router.delete(
  "/:id",
  [
    protect,
    param("id").isLength({ min: 1 }).withMessage("Roadmap ID is required"),
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

      const roadmapId = req.params.id;
      const userId = req.user.id;

      // Get and delete roadmap
      const roadmap = await Roadmap.findOne({ roadmapId, userId });

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: "Roadmap not found",
        });
      }

      // Delete related data
      await Promise.all([
        Roadmap.deleteOne({ _id: roadmap._id }),
        UserProgress.deleteOne({ userId, roadmapId }),
        Documentation.deleteOne({ roadmapId }),
      ]);

      res.json({
        success: true,
        message: "Roadmap deleted successfully",
      });
    } catch (error) {
      console.error("Delete roadmap error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting roadmap",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Get available career fields
// @route   GET /api/roadmaps/fields
// @access  Public
router.get("/meta/fields", async (req, res) => {
  try {
    const fields = [
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
    ];

    // Get statistics for each field
    const fieldStats = await Promise.all(
      fields.map(async (field) => {
        const count = await Roadmap.countDocuments({
          field,
          status: "completed",
        });
        const avgRating = await Roadmap.aggregate([
          {
            $match: { field, status: "completed", "rating.count": { $gt: 0 } },
          },
          { $group: { _id: null, avgRating: { $avg: "$rating.average" } } },
        ]);

        return {
          name: field,
          slug: field.toLowerCase().replace(/\s+/g, "-"),
          roadmapCount: count,
          averageRating:
            avgRating.length > 0
              ? Math.round(avgRating[0].avgRating * 10) / 10
              : 0,
        };
      })
    );

    res.json({
      success: true,
      data: fieldStats,
    });
  } catch (error) {
    console.error("Get fields error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching career fields",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get popular roadmaps
// @route   GET /api/roadmaps/popular
// @access  Public
router.get(
  "/meta/popular",
  [
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

      const limit = parseInt(req.query.limit) || 10;

      const popularRoadmaps = await Roadmap.getPopular(limit);

      res.json({
        success: true,
        data: popularRoadmaps,
      });
    } catch (error) {
      console.error("Get popular roadmaps error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching popular roadmaps",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    n8n webhook callback for roadmap completion
// @route   POST /api/roadmaps/webhook/n8n-callback
// @access  Private (webhook)
router.post("/webhook/n8n-callback", async (req, res) => {
  try {
    const { roadmapId, status, data, error, workflowId } = req.body;

    // Verify webhook secret
    const webhookSecret = req.headers["authorization"]?.replace("Bearer ", "");
    if (webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized webhook request",
      });
    }

    // Find roadmap
    const roadmap = await Roadmap.findOne({ roadmapId });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    if (status === "completed" && data) {
      // Update roadmap with AI-generated content
      const { roadmap_json, roadmap_doc } = data;

      roadmap.overview = roadmap_json.overview;
      roadmap.phases = roadmap_json.phases;
      roadmap.connections = roadmap_json.connections;
      roadmap.metadata = { ...roadmap.metadata, ...roadmap_json.metadata };
      roadmap.documentation = roadmap_doc;
      roadmap.status = "completed";

      await roadmap.save();

      // Initialize user progress with generated phases
      const progress = await UserProgress.findOne({ roadmapId });
      if (progress) {
        progress.phases = roadmap_json.phases.map((phase) => ({
          phaseId: phase.id,
          steps: phase.steps.map((step) => ({
            stepId: step.id,
            completed: false,
            timeSpent: 0,
          })),
          overallProgress: 0,
        }));
        await progress.save();
      }

      // Create documentation entry
      const documentation = new Documentation({
        roadmapId,
        roadmapObjectId: roadmap._id,
        title: roadmap_json.title,
        markdownContent: roadmap_doc,
        aiGeneration: {
          model: roadmap_json.metadata.aiModel,
          generatedAt: new Date(),
          tokens: data.tokens || {},
        },
      });
      await documentation.save();
    } else if (status === "failed") {
      roadmap.status = "failed";
      await roadmap.save();
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("n8n webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
