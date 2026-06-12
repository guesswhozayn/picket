const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Project   = require('./models/Project');
const User      = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/picket';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Candidate.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create a default admin user
    const user = await User.create({
      name: 'Admin Recruiter',
      email: 'admin@picket.ai',
      passwordHash: 'password', // will be hashed by user pre-save hook
      role: 'admin',
      settings: {
        apiKeys: {
          gemini: process.env.GEMINI_API_KEY || '',
          groq: process.env.GROQ_API_KEY || '',
          tavily: process.env.TAVILY_API_KEY || ''
        }
      }
    });
    console.log('Created default user:', user.email);

    // Create a default project
    const project = await Project.create({
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      headcount: 3,
      description: 'Looking for an experienced React engineer to lead frontend architecture.',
      status: 'active',
      createdBy: user._id,
    });
    console.log('Created default project:', project.title);

    const mockCandidates = [
      {
        projectId: project._id,
        uploadedBy: user._id,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        raw_resume_text: 'Experienced React developer with 5 years of experience at TechCorp.',
        pipeline_status: 'high_signal',
        synthetic_probability: 0.12,
        agent_audit_trail: [
          {
            agent_name: 'OSINT Fact-Checker',
            action: 'Verified employment at TechCorp via LinkedIn public profile.',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            agent_name: 'GitHub Analyzer',
            action: 'Found active contributions to React open source ecosystem.',
            timestamp: new Date(Date.now() - 3500000)
          }
        ]
      },
      {
        projectId: project._id,
        uploadedBy: user._id,
        name: 'Bob Smith',
        email: 'bob.synthetic@example.com',
        raw_resume_text: 'As an AI language model, I have extensively developed scalable microservices in Rust...',
        pipeline_status: 'high_noise',
        synthetic_probability: 0.98,
        agent_audit_trail: [
          {
            agent_name: 'LLM Detector',
            action: 'Detected "As an AI language model" phrase in summary section.',
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            agent_name: 'OSINT Fact-Checker',
            action: 'Could not find any footprint of "Bob Smith" at claimed company "OpenWeb Innovations LLC".',
            timestamp: new Date(Date.now() - 7100000)
          }
        ]
      },
      {
        projectId: project._id,
        uploadedBy: user._id,
        name: 'Charlie Davis',
        email: 'charlie.d@example.com',
        raw_resume_text: 'Full stack developer. Claimed 10 years experience in Next.js (framework released 2016).',
        pipeline_status: 'audit_required',
        synthetic_probability: 0.65,
        agent_audit_trail: [
          {
            agent_name: 'Temporal Anomaly Engine',
            action: 'Flagged temporal anomaly: Claimed 10 years of Next.js experience, but framework is only 8 years old.',
            timestamp: new Date(Date.now() - 1800000)
          }
        ]
      },
      {
        projectId: project._id,
        uploadedBy: user._id,
        name: 'Diana Prince',
        email: 'diana@example.com',
        raw_resume_text: 'Junior developer looking for first role.',
        pipeline_status: 'processing',
        synthetic_probability: 0,
        agent_audit_trail: []
      }
    ];

    await Candidate.insertMany(mockCandidates);
    console.log(`Inserted ${mockCandidates.length} mock candidates`);

    mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

