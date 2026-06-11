const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    department:  { type: String, default: 'General', trim: true },
    location:    { type: String, default: 'Remote', trim: true },
    description: { type: String, default: '' },
    headcount:   { type: Number, default: 1 },
    status:      { type: String, enum: ['active', 'closed'], default: 'active' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
