const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['IGCSE', 'IAL'],
    uppercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  season: {
    type: String,
    required: true,
    enum: ['Winter', 'Summer', 'Spring', 'Fall'],
  },
  paperType: {
    type: String,
    required: true,
    enum: ['Question Paper', 'Mark Scheme']
  },
  driveLink: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic validation for drive links (Google Drive, Dropbox, Proton Drive)
        return /^https?:\/\/(drive\.google\.com|www\.dropbox\.com|drive\.proton\.me)/.test(v);
      },
      message: 'Please provide a valid drive link (Google Drive, Dropbox, or Proton Drive)'
    }
  },
  description: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
paperSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
paperSchema.index({ type: 1, year: 1, subject: 1 });
paperSchema.index({ subject: 1, year: 1 });
paperSchema.index({ type: 1, subject: 1 });

const Paper = mongoose.model('Paper', paperSchema);

module.exports = Paper;
