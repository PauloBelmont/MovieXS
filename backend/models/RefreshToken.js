const { Schema, model } = require('mongoose');

const refreshTokenSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  // Token que substituiu este (preenchido na rotação), usado para rastrear a cadeia
  replacedByToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL Index: deletar automaticamente após expiração
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model('RefreshToken', refreshTokenSchema);