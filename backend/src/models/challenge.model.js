import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friend',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['speed', 'difficulty', 'streak', 'topic', 'mixed'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'declined'],
    default: 'pending',
    index: true
  },
  config: {
    problemCount: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    duration: {
      type: Number, // in days
      required: true,
      min: 1,
      max: 90
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    topic: {
      type: String,
      default: null
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  progress: {
    creator: {
      solved: {
        type: Number,
        default: 0
      },
      lastUpdate: {
        type: Date,
        default: null
      }
    },
    opponent: {
      solved: {
        type: Number,
        default: 0
      },
      lastUpdate: {
        type: Date,
        default: null
      }
    }
  },
  winner: {
    type: String,
    enum: ['creator', 'opponent', 'tie', null],
    default: null
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
challengeSchema.index({ creator: 1, status: 1 });
challengeSchema.index({ opponent: 1, status: 1 });
challengeSchema.index({ status: 1, 'config.endDate': 1 });

// Virtual for checking if challenge is expired
challengeSchema.virtual('isExpired').get(function() {
  if (!this.config.endDate) return false;
  return new Date() > this.config.endDate;
});

// Virtual for days remaining
challengeSchema.virtual('daysRemaining').get(function() {
  if (!this.config.endDate) return null;
  const diff = this.config.endDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to accept challenge
challengeSchema.methods.accept = function() {
  this.status = 'active';
  this.config.startDate = new Date();
  this.config.endDate = new Date(Date.now() + this.config.duration * 24 * 60 * 60 * 1000);
  return this.save();
};

// Method to decline challenge
challengeSchema.methods.decline = function() {
  this.status = 'declined';
  return this.save();
};

// Method to cancel challenge
challengeSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Method to update progress
challengeSchema.methods.updateProgress = function(isCreator, solved) {
  if (isCreator) {
    this.progress.creator.solved = solved;
    this.progress.creator.lastUpdate = new Date();
  } else {
    this.progress.opponent.solved = solved;
    this.progress.opponent.lastUpdate = new Date();
  }
  return this.save();
};

// Method to complete challenge and determine winner
challengeSchema.methods.complete = function() {
  this.status = 'completed';
  
  const creatorSolved = this.progress.creator.solved;
  const opponentSolved = this.progress.opponent.solved;
  
  if (creatorSolved > opponentSolved) {
    this.winner = 'creator';
  } else if (opponentSolved > creatorSolved) {
    this.winner = 'opponent';
  } else {
    this.winner = 'tie';
  }
  
  return this.save();
};

// Static method to get user's active challenges
challengeSchema.statics.getUserActiveChallenges = function(userId) {
  return this.find({
    $or: [
      { creator: userId },
      { opponent: userId }
    ],
    status: 'active'
  })
  .populate('creator', 'fullName username avatar')
  .populate('opponent', 'name leetcodeId avatar')
  .sort({ 'config.endDate': 1 });
};

// Static method to get user's pending challenges
challengeSchema.statics.getUserPendingChallenges = function(userId) {
  return this.find({
    opponent: userId,
    status: 'pending'
  })
  .populate('creator', 'fullName username avatar')
  .populate('opponent', 'name leetcodeId avatar')
  .sort({ createdAt: -1 });
};

// Static method to get challenge history
challengeSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({
    $or: [
      { creator: userId },
      { opponent: userId }
    ],
    status: { $in: ['completed', 'cancelled', 'declined'] }
  })
  .populate('creator', 'fullName username avatar')
  .populate('opponent', 'name leetcodeId avatar')
  .sort({ updatedAt: -1 })
  .limit(limit);
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export { Challenge };
