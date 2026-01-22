const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  version: {
    type: Number,
    required: true,
    min: 1,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
    min: 0,
  },
  changeDescription: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metadata: {
    duration: Number,
    pageCount: Number,
    resolution: String,
    thumbnailUrl: String,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique version per content
contentVersionSchema.index({ contentId: 1, version: 1 }, { unique: true });
contentVersionSchema.index({ contentId: 1 });

module.exports = mongoose.model('ContentVersion', contentVersionSchema);