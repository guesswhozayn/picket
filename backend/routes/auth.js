const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from environment variables');
  }
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log('[Auth] Registration request:', { name, email, password: password ? '***' : 'missing' });

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'recruiter';

    const user = new User({
      name,
      email,
      passwordHash: password,
      role
    });

    console.log('[Auth] Saving user to database...');
    await user.save();
    console.log('[Auth] User saved successfully');
    const accessToken = generateToken(user._id);

    res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+settings.apiKeys.gemini +settings.apiKeys.groq +settings.apiKeys.tavily');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken(user._id);
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/settings', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+settings.apiKeys.gemini +settings.apiKeys.groq +settings.apiKeys.tavily');
    const apiKeys = user.settings?.apiKeys || {};

    const maskKey = (key) => key ? `${key.slice(0, 4)}...${key.slice(-4)}` : '';

    res.json({
      settings: {
        apiKeys: {
          gemini: maskKey(apiKeys.gemini),
          groq: maskKey(apiKeys.groq),
          tavily: maskKey(apiKeys.tavily)
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', requireAuth, async (req, res, next) => {
  try {
    const { apiKeys } = req.body;
    const user = await User.findById(req.user._id).select('+settings.apiKeys.gemini +settings.apiKeys.groq +settings.apiKeys.tavily');

    if (!user.settings) user.settings = {};
    if (!user.settings.apiKeys) user.settings.apiKeys = {};

    const fields = ['gemini', 'groq', 'tavily'];
    fields.forEach(field => {
      if (apiKeys && apiKeys[field] !== undefined) {
        if (!apiKeys[field].includes('...')) {
          user.settings.apiKeys[field] = apiKeys[field];
        }
      }
    });

    await user.save();
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
