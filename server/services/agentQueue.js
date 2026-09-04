const { Queue, Worker } = require('bullmq');
const Candidate = require('../models/Candidate');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const IORedis = require('ioredis');

dotenv.config();

const redisOptions = {
  maxRetriesPerRequest: null,
};

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

if (process.env.REDIS_URL) {
  try {
    const parsed = new URL(process.env.REDIS_URL);
    const maskedUrl = `${parsed.protocol}//${parsed.username ? parsed.username + ':***@' : ''}${parsed.host}`;
    console.log(`[Redis] Connecting to database at: ${maskedUrl}`);
  } catch (err) {
    console.log('[Redis] Connecting using REDIS_URL (failed to parse URL for logging)');
  }
} else {
  console.log(`[Redis] Connecting to local Redis at ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`);
}

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

  }
}

let worker;
try {
  worker = new Worker('candidateAnalysis', async job => {
    const { candidateId } = job.data;
    console.log(`Processing job for candidate ${candidateId}`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const candidate = await Candidate.findById(candidateId);
      if (candidate) {
        const { runDetectorAgent } = require('./agents/detectorAgent');
        const { runOsintAgent } = require('./agents/osintAgent');


        const [detectorResult, osintResult] = await Promise.all([
          runDetectorAgent(candidate),
          runOsintAgent(candidate)
        ]);

        const auditTrail = [...detectorResult.auditLogs, ...osintResult.auditLogs];
        const syntheticScore = (detectorResult.score + osintResult.score) / 2;

        const isHighNoise = detectorResult.score > 0.7 || osintResult.score > 0.7;

        candidate.pipeline_status = isHighNoise ? 'high_noise' : (syntheticScore < 0.2 ? 'high_signal' : 'audit_required');
        candidate.synthetic_probability = Math.min(syntheticScore, 0.99);
        candidate.agent_audit_trail.push(...auditTrail);

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
