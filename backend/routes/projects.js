const express = require('express');
const router  = express.Router();
const Project   = require('../models/Project');
const Candidate = require('../models/Candidate');

const STATUSES = ['processing', 'high_signal', 'high_noise', 'audit_required', 'rejected'];

async function withStats(project) {
  const rows = await Candidate.aggregate([
    { $match: { projectId: project._id } },
    { $group: { _id: '$pipeline_status', count: { $sum: 1 } } },
  ]);

  const stats = { total: 0 };
  STATUSES.forEach(s => { stats[s] = 0; });
  rows.forEach(r => {
    stats[r._id] = r.count;
    stats.total += r.count;
  });

  return { ...project.toObject(), stats };
}

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    const enriched = await Promise.all(projects.map(withStats));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(await withStats(project));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, department, location, description, headcount } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const project = await Project.create({
      title, department, location, description, headcount,
      createdBy: req.user._id
    });
    res.status(201).json(await withStats(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'department', 'location', 'description', 'headcount', 'status'];
    const update  = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(await withStats(project));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const { requireRole } = require('../middleware/auth');
router.delete('/:id', requireRole('admin', 'recruiter'), async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { deletedCount } = await Candidate.deleteMany({ projectId: req.params.id });

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Project and all associated data permanently deleted',
      projectId: req.params.id,
      candidatesDeleted: deletedCount,
    });
  } catch (err) {
    console.error('Project delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
