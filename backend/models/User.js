const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'recruiter'], default: 'recruiter' },
  avatarSeed:   { type: String, default: () => Math.random().toString(36).slice(2) },
  settings: {
    apiKeys: {
      gemini:    { type: String, select: false },
      groq:      { type: String, select: false },
      tavily:    { type: String, select: false }
    }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) {
    console.log('[User] passwordHash not modified, skipping hash');
    return;
  }
  try {
    console.log('[User] Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    console.log('[User] Hashing complete');
  } catch (err) {
    console.error('[User] Hashing error:', err);
    throw err;
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compareSync(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.passwordHash;
    if (obj.settings) {
      const apiKeys = obj.settings.apiKeys || {};
      obj.settings.apiKeysStatus = {
        gemini: !!apiKeys.gemini,
        groq: !!apiKeys.groq,
        tavily: !!apiKeys.tavily
      };
      delete obj.settings.apiKeys;
    } else {
      obj.settings = {
        apiKeysStatus: {
          gemini: false,
          groq: false,
          tavily: false
        }
      };
    }
    return obj;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
