const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'document'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
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
  mimeType: {
    type: String,
  },
  metadata: {
    duration: Number, // for videos, in seconds
    pageCount: Number, // for PDFs
    resolution: String, // for videos
    thumbnailUrl: String, // for videos
  },
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isRequired: {
    type: Boolean,
    default: false,
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'complete', 'failed'],
    default: 'pending',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
contentSchema.index({ moduleId: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ createdBy: 1 });
contentSchema.index({ tags: 1 });

module.exports = mongoose.model('Content', contentSchema);