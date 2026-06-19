const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const config = require('./config/env');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const { requireAuth } = require('./middleware/auth');
const authRoutes      = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const projectRoutes   = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth',       authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/projects',   requireAuth, projectRoutes);
app.use('/api/analytics',  requireAuth, analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Picket API is running');
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack
  });
});

const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI || 'mongodb://127.0.0.1:27017/picket';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

global.io = io;
app.set('io', io);
