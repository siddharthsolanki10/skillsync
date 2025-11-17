const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap-Advanced');
const { protect } = require('../middleware/auth');

/**
 * POST /api/roadmaps/generate
 * Webhook endpoint that receives requests from n8n
 * This triggers the workflow
 * NOTE: Must come BEFORE /:id routes to avoid route matching issues
 */
router.post('/generate', protect, async (req, res) => {
  try {
    const { careerField } = req.body;

    if (!careerField) {
      return res.status(400).json({
        success: false,
        error: 'careerField is required'
      });
    }

    // Call n8n webhook
    const n8nResponse = await fetch(process.env.N8N_ROADMAP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        careerField,
        userId: req.user.id,
        token: req.headers.authorization.replace('Bearer ', '')
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`N8N workflow failed: ${n8nResponse.statusText}`);
    }

    const result = await n8nResponse.json();

    res.json({
      success: true,
      message: 'Roadmap generation started',
      workflowStatus: result
    });

  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/roadmaps
 * Create a new roadmap in MongoDB
 * Called by n8n workflow after AI generation
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      careerField,
      title,
      description,
      stages,
      resources,
      dailyChecklist,
      generatedAt
    } = req.body;

    // Validate required fields
    if (!careerField || !title || !stages) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: careerField, title, stages'
      });
    }

    // Create roadmap document
    const roadmap = new Roadmap({
      userId: req.user.id,
      careerField,
      title,
      description,
      stages,
      resources,
      dailyChecklist,
      generatedAt: generatedAt || new Date(),
      views: 0,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    const savedRoadmap = await roadmap.save();

    res.status(201).json({
      success: true,
      roadmapId: savedRoadmap._id,
      title: savedRoadmap.title,
      stages: savedRoadmap.stages,
      message: 'Roadmap created successfully',
      data: savedRoadmap
    });

  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating roadmap'
    });
  }
});

/**
 * GET /api/roadmaps/:id
 * Retrieve a single roadmap by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap not found'
      });
    }

    // Increment view count
    roadmap.views += 1;
    await roadmap.save();

    res.json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/roadmaps?field=Web%20Development
 * Get roadmaps by career field
 */
router.get('/', async (req, res) => {
  try {
    const { field, page = 1, limit = 10 } = req.query;

    let query = {};
    if (field) {
      query.careerField = new RegExp(field, 'i');
    }

    const roadmaps = await Roadmap.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Roadmap.countDocuments(query);

    res.json({
      success: true,
      data: roadmaps,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/roadmaps/user/:userId
 * Get all roadmaps created by a specific user
 */
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Only allow users to see their own roadmaps unless they're admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these roadmaps'
      });
    }

    const roadmaps = await Roadmap.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: roadmaps
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/roadmaps/:id
 * Update a roadmap (for user modifications)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap not found'
      });
    }

    // Verify ownership
    if (roadmap.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this roadmap'
      });
    }

    // Update fields
    const allowedFields = ['title', 'description', 'stages', 'resources', 'dailyChecklist', 'tags'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        roadmap[field] = req.body[field];
      }
    });

    roadmap.updatedAt = new Date();
    const updatedRoadmap = await roadmap.save();

    res.json({
      success: true,
      message: 'Roadmap updated successfully',
      data: updatedRoadmap
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/roadmaps/:id
 * Delete a roadmap
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap not found'
      });
    }

    // Verify ownership
    if (roadmap.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this roadmap'
      });
    }

    await Roadmap.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Roadmap deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/roadmaps/:id/mark-helpful
 * Mark a roadmap as helpful
 */
router.post('/:id/mark-helpful', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap not found'
      });
    }

    roadmap.helpful += 1;
    await roadmap.save();

    res.json({
      success: true,
      helpful: roadmap.helpful,
      message: 'Thank you for the feedback!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
