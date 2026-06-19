const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;

    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    let matchFilter = {
      $or: [
        { projectId: { $in: projectIds } },
        { uploadedBy: req.user._id }
      ]
    };

    if (projectId) {

      if (!projectIds.some(id => id.toString() === projectId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      matchFilter = { projectId: new mongoose.Types.ObjectId(projectId) };
    }

    const since = new Date(Date.now() - Number(days) * 86_400_000);

    const statusGroups = await Candidate.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$pipeline_status', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    statusGroups.forEach(({ _id, count }) => { statusMap[_id] = count; });

    const summary = {
      total:           Object.values(statusMap).reduce((a, b) => a + b, 0),
      under_review:    statusMap.processing     ?? 0,
      strong_match:    statusMap.high_signal    ?? 0,
      needs_attention: statusMap.audit_required ?? 0,
      poor_match:      statusMap.high_noise     ?? 0,
      declined:        statusMap.rejected       ?? 0,
    };

    const confGroups = await Candidate.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          high:     { $sum: { $cond: [{ $lt: ['$synthetic_probability', 0.30] }, 1, 0] } },
          moderate: { $sum: { $cond: [{ $and: [{ $gte: ['$synthetic_probability', 0.30] }, { $lt: ['$synthetic_probability', 0.70] }] }, 1, 0] } },
          low:      { $sum: { $cond: [{ $gte: ['$synthetic_probability', 0.70] }, 1, 0] } },
        },
      },
    ]);

    const confidence = confGroups[0]
      ? { high: confGroups[0].high, moderate: confGroups[0].moderate, low: confGroups[0].low }
      : { high: 0, moderate: 0, low: 0 };

    const screenTimeGroups = await Candidate.aggregate([
      {
        $match: {
          ...matchFilter,
          'agent_audit_trail.0': { $exists: true },
        },
      },
      {
        $project: {
          screenTime: {
            $subtract: [
              { $arrayElemAt: ['$agent_audit_trail.timestamp', 0] },
              '$createdAt',
            ],
          },
        },
      },
      { $group: { _id: null, avg: { $avg: '$screenTime' } } },
    ]);

    const avg_time_to_screen_ms = screenTimeGroups[0]?.avg ?? null;

    const volumeGroups = await Candidate.aggregate([
      { $match: { ...matchFilter, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const volume_by_day = volumeGroups.map(({ _id, count }) => ({ date: _id, count }));

    let projects = [];
    if (!projectId) {
      projects = await Project.aggregate([
        { $match: { createdBy: req.user._id } },
        {
          $lookup: {
            from: 'candidates',
            localField: '_id',
            foreignField: 'projectId',
            as: 'candidates',
          },
        },
        {
          $project: {
            title: 1,
            department: 1,
            headcount: 1,
            status: 1,
            total: { $size: '$candidates' },
            strong_match: {
              $size: {
                $filter: {
                  input: '$candidates',
                  cond: { $eq: ['$$this.pipeline_status', 'high_signal'] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            match_rate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $divide: ['$strong_match', '$total'] },
                0,
              ],
            },
          },
        },
        { $sort: { total: -1 } },
      ]);
    }

    res.json({ summary, confidence, avg_time_to_screen_ms, volume_by_day, projects });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

module.exports = router;
