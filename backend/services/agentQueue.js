const { Queue, Worker } = require('bullmq');
const Candidate = require('../models/Candidate');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const IORedis = require('ioredis');

dotenv.config();

const redisOptions = {
  maxRetriesPerRequest: null,
};

// If using a secure rediss:// connection, ensure TLS options are configured.
// Managed Redis providers (like Render or Upstash) often require TLS/SSL.
if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false
  };
}

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, redisOptions)
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      ...redisOptions
    });

// Optional: Handle Redis connection errors gracefully instead of crashing
connection.on('error', (err) => {
  console.warn('Redis connection failed, queue processing will be disabled:', err.message);
});

const candidateQueue = new Queue('candidateAnalysis', { connection });

candidateQueue.on('error', (err) => {
  console.warn('Queue Redis connection error:', err.message);
});

async function addCandidateJob(data) {
  try {
    await candidateQueue.add('analyzeResume', data);
    console.log(`Added job to queue for candidate ${data.candidateId}`);
  } catch (error) {
    console.error('Failed to add job to queue:', error.message);
    // Even if it fails, we don't want to crash the request
  }
}

// In a real application, you might want to run this worker in a separate process
// For demonstration, we run it here
let worker;
try {
  worker = new Worker('candidateAnalysis', async job => {
    const { candidateId } = job.data;
    console.log(`Processing job for candidate ${candidateId}`);
    
    // Simulate agent processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update candidate status
    try {
      const candidate = await Candidate.findById(candidateId);
      if (candidate) {
        const { runDetectorAgent } = require('./agents/detectorAgent');
        const { runOsintAgent } = require('./agents/osintAgent');
        const User = require('../models/User');

        const user = await User.findById(candidate.uploadedBy).select(
          '+settings.apiKeys.gemini +settings.apiKeys.groq +settings.apiKeys.tavily'
        );
        const userApiKeys = user?.settings?.apiKeys || {};

        // Run agents in parallel with BYOK support
        const [detectorResult, osintResult] = await Promise.all([
          runDetectorAgent(candidate, userApiKeys),
          runOsintAgent(candidate, userApiKeys)
        ]);

        const auditTrail = [...detectorResult.auditLogs, ...osintResult.auditLogs];
        const syntheticScore = (detectorResult.score + osintResult.score) / 2;
        
        const isHighNoise = detectorResult.score > 0.7 || osintResult.score > 0.7;

        candidate.pipeline_status = isHighNoise ? 'high_noise' : (syntheticScore < 0.2 ? 'high_signal' : 'audit_required');
        candidate.synthetic_probability = Math.min(syntheticScore, 0.99);
        candidate.agent_audit_trail.push(...auditTrail);

        // Send assessment link to high probability candidates (not high noise)
        if (candidate.pipeline_status === 'high_signal' || candidate.pipeline_status === 'audit_required') {
          const config = require('../config/env');
          const { sendAssessmentEmail } = require('./emailService');
          const assessmentLink = `${config.FRONTEND_URL || 'http://localhost:5173'}/?assess=${candidate._id}`;
          
          sendAssessmentEmail(candidate, assessmentLink);
          
          candidate.agent_audit_trail.push({
            agent_name: 'System Outbox',
            action: `Assessment link generated and emailed to: ${candidate.email}`,
            timestamp: new Date()
          });
        }

        await candidate.save();
        console.log(`Finished processing candidate ${candidateId}`);
        
        if (global.io) {
          global.io.emit('candidate_updated', { candidateId });
        }
      }
    } catch (dbError) {
      console.error(`DB Error while processing candidate ${candidateId}:`, dbError);
    }
  }, { connection });

  worker.on('error', (err) => {
    console.warn('Worker Redis connection error:', err.message);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
  });
} catch (error) {
  console.warn('Failed to initialize BullMQ worker:', error.message);
}

module.exports = {
  addCandidateJob
};
