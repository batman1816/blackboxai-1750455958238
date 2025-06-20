const Paper = require('../models/paper.model');

const papersController = {
  // Create new paper
  create: async (req, res) => {
    try {
      const paperData = {
        ...req.body,
        addedBy: req.admin.id
      };

      const paper = new Paper(paperData);
      await paper.save();

      res.status(201).json({
        message: 'Paper added successfully',
        paper
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error adding paper',
        error: error.message
      });
    }
  },

  // Get all papers with filtering
  getAll: async (req, res) => {
    try {
      const {
        type,
        subject,
        year,
        season,
        paperType,
        page = 1,
        limit = 10,
        sortBy = 'year',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      if (type) filter.type = type.toUpperCase();
      if (subject) filter.subject = subject;
      if (year) filter.year = parseInt(year);
      if (season) filter.season = season;
      if (paperType) filter.paperType = paperType;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const papers = await Paper.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('addedBy', 'username');

      const total = await Paper.countDocuments(filter);

      res.json({
        papers,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching papers',
        error: error.message
      });
    }
  },

  // Get paper by ID
  getById: async (req, res) => {
    try {
      const paper = await Paper.findById(req.params.id)
        .populate('addedBy', 'username');

      if (!paper) {
        return res.status(404).json({
          message: 'Paper not found'
        });
      }

      res.json(paper);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching paper',
        error: error.message
      });
    }
  },

  // Update paper
  update: async (req, res) => {
    try {
      const paper = await Paper.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!paper) {
        return res.status(404).json({
          message: 'Paper not found'
        });
      }

      res.json({
        message: 'Paper updated successfully',
        paper
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error updating paper',
        error: error.message
      });
    }
  },

  // Delete paper
  delete: async (req, res) => {
    try {
      const paper = await Paper.findByIdAndDelete(req.params.id);

      if (!paper) {
        return res.status(404).json({
          message: 'Paper not found'
        });
      }

      res.json({
        message: 'Paper deleted successfully',
        paper
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting paper',
        error: error.message
      });
    }
  },

  // Get papers statistics
  getStats: async (req, res) => {
    try {
      const stats = await Promise.all([
        // Total papers count
        Paper.countDocuments(),
        // Papers by type
        Paper.aggregate([
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]),
        // Papers by year
        Paper.aggregate([
          {
            $group: {
              _id: '$year',
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 5 }
        ]),
        // Papers by subject
        Paper.aggregate([
          {
            $group: {
              _id: '$subject',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      res.json({
        totalPapers: stats[0],
        papersByType: stats[1],
        papersByYear: stats[2],
        papersBySubject: stats[3]
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
};

module.exports = papersController;
