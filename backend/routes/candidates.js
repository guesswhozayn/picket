const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Candidate = require('../models/Candidate');

async function parsePdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    await parser.destroy();
    return typeof result === 'string' ? result : (result?.text || '');
  } catch (err) {
    try {
      await parser.destroy();
    } catch (_) {}
    throw err;
  }
}
const { requireAuth } = require('../middleware/auth');
const { addCandidateJob } = require('../services/agentQueue');

const upload = multer({ storage: multer.memoryStorage() });

function guessName(filename) {
  return filename
    .replace(/\.(pdf|docx?|txt)$/i, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Unknown Applicant';
}

router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    const { name, email, projectId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    let raw_resume_text = 'No resume provided';
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          raw_resume_text = await parsePdfBuffer(req.file.buffer) || 'Empty PDF content';
        } catch (pdfError) {
          console.error('PDF Parse Error:', pdfError.message);
          raw_resume_text = 'Error parsing PDF content';
        }
      } else {
        raw_resume_text = req.file.buffer.toString('utf8');
      }
    }

    const { generatePoWChallenge } = require('../services/agents/powAgent');
    const Project = require('../models/Project');
    const User = require('../models/User');

    const dbUser = await User.findById(req.user._id).select('+settings.apiKeys.gemini +settings.apiKeys.groq +settings.apiKeys.tavily');
    const userApiKeys = dbUser?.settings?.apiKeys || {};

    let pow_challenge = { type: 'logic_arithmetic', question: 'In a sequence of numbers, if the first is 3, the second is 6, and the third is 9… What is the fifth?', answer: '15' };
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        pow_challenge = await generatePoWChallenge(project, userApiKeys);
      }
    }

    const candidate = new Candidate({
      name,
      email,
      raw_resume_text,
      pipeline_status: 'processing',
      pow_data: {
        challenge_type: pow_challenge.type,
        question: pow_challenge.question,
        expected_answer: pow_challenge.answer
      },
      ...(projectId ? { projectId } : {}),
      uploadedBy: req.user._id,
    });

    await candidate.save();
    await addCandidateJob({ candidateId: candidate._id });

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk-upload', requireAuth, upload.array('resumes', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { projectId } = req.body;

    const rawNames  = req.body.names  || [];
    const rawEmails = req.body.emails || [];
    const names  = Array.isArray(rawNames)  ? rawNames  : rawNames.split('|||');
    const emails = Array.isArray(rawEmails) ? rawEmails : rawEmails.split('|||');

    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file  = req.files[i];
      const name  = (names[i] || '').trim()  || guessName(file.originalname);
      const email = (emails[i] || '').trim() || `applicant-${Date.now()}-${i}@review.picket`;

      let raw_resume_text = 'No resume provided';
      if (file.mimetype === 'application/pdf') {
        try {
          raw_resume_text = await parsePdfBuffer(file.buffer) || 'Empty PDF';
        } catch {
          raw_resume_text = 'Error parsing PDF';
        }
      } else {
        raw_resume_text = file.buffer.toString('utf8');
      }

      try {
        const candidate = new Candidate({
          name,
          email,
          raw_resume_text,
          pipeline_status: 'processing',
          ...(projectId ? { projectId } : {}),
          uploadedBy: req.user._id,
        });

        await candidate.save();
        await addCandidateJob({ candidateId: candidate._id });

        results.push({ _id: candidate._id, name, email, status: 'queued', filename: file.originalname });
      } catch (err) {
        results.push({ name, email, status: 'error', error: err.message, filename: file.originalname });
      }
    }

    const succeeded = results.filter(r => r.status === 'queued').length;
    res.status(201).json({ total: req.files.length, succeeded, results });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const Project = require('../models/Project');

    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const filter = {
      $or: [
        { projectId: { $in: projectIds } },
        { uploadedBy: req.user._id }
      ]
    };

    if (req.query.projectId) {

      if (!projectIds.some(id => id.toString() === req.query.projectId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      filter.projectId = req.query.projectId;
      delete filter.$or;
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/pow', async (req, res) => {
  try {
    const { answer, interaction_logs, time_taken } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const expected = (candidate.pow_data?.expected_answer || '').trim().toLowerCase();
    const submitted = (answer || '').trim().toLowerCase();
    const isCorrect = expected && submitted === expected;
    const score = isCorrect ? 100 : 0;

    candidate.pow_data.score = score;
    candidate.pow_data.interaction_logs = interaction_logs;
    candidate.pow_data.time_taken = time_taken;
    candidate.pow_data.completed = true;

    const pasteDetected = (interaction_logs || []).some(log => log.event === 'paste_detected');

    if (!isCorrect || pasteDetected) {
      candidate.pipeline_status = 'high_noise';
      candidate.agent_audit_trail.push({
        agent_name: 'PoW Verifier',
        action: `FAILED CHALLENGE: Score is ${score}%. ${pasteDetected ? 'Telemetry flagged: Paste event detected.' : 'Incorrect response.'} Moved to Poor Match.`,
        timestamp: new Date()
      });
    } else {
      if (candidate.pipeline_status === 'processing' || candidate.pipeline_status === 'audit_required') {
        candidate.pipeline_status = 'high_signal';
      }
      candidate.agent_audit_trail.push({
        agent_name: 'PoW Verifier',
        action: `PASSED CHALLENGE: Score is 100% with normal typing telemetry. Verified as Human match.`,
        timestamp: new Date()
      });
    }

    await candidate.save();

    if (global.io) {
      global.io.emit('candidate_updated', { candidateId: candidate._id });
    }

    res.json(candidate);
  } catch (error) {
    console.error('PoW submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/public-assessment/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select('name pow_data.question pow_data.challenge_type pow_data.completed');
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({
      _id: candidate._id,
      name: candidate.name,
      pow_data: {
        question: candidate.pow_data?.question,
        challenge_type: candidate.pow_data?.challenge_type,
        completed: candidate.pow_data?.completed
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/screen', requireAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        pipeline_status:   'processing',
        synthetic_probability: 0,
        agent_audit_trail: [],
      },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    await addCandidateJob({ candidateId: candidate._id });

    if (global.io) global.io.emit('candidate_updated', { candidateId: candidate._id });

    res.json({ message: 'Screening re-queued', candidate });
  } catch (error) {
    console.error('Re-screen error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/orphans', requireAuth, async (req, res) => {
  try {
    const { deletedCount } = await Candidate.deleteMany({
      $or: [{ projectId: null }, { projectId: { $exists: false } }],
    });
    res.json({ message: `Removed ${deletedCount} orphaned candidate(s)`, deletedCount });
  } catch (error) {
    console.error('Orphan cleanup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
