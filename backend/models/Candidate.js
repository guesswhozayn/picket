const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  raw_resume_text: { type: String },
  agent_audit_trail: [{
    agent_name: String,
    action: String,
    result: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  synthetic_probability: { type: Number, default: 0 },
  verifiable_claims: [{
    claim: String,
    verified: Boolean,
    source: String
  }],
  pipeline_status: { 
    type: String, 
    enum: ['processing', 'high_signal', 'high_noise', 'audit_required', 'rejected'],
    default: 'processing'
  },
  pow_data: {
    challenge_type: String,
    question: String,
    expected_answer: String,
    score: Number,
    interaction_logs: [{
      event: String,
      timestamp: Number,
      data: mongoose.Schema.Types.Mixed
    }],
    time_taken: Number,
    completed: { type: Boolean, default: false }
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
