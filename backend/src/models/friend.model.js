import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  leetcodeId: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  leetcodeData: {
    totalSolved: {
      type: Number,
      default: 0
    },
    easySolved: {
      type: Number,
      default: 0
    },
    mediumSolved: {
      type: Number,
      default: 0
    },
    hardSolved: {
      type: Number,
      default: 0
    },
    ranking: {
      type: Number,
      default: 0
    },
    contestRating: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      icon: String,
      displayName: String
    }],
    recentSubmissions: [{
      title: String,
      titleSlug: String,
      timestamp: Date,
      statusDisplay: String,
      lang: String
    }],
    skillStats: {
      advanced: [{
        tagName: String,
        tagSlug: String,
        problemsSolved: Number
      }],
      intermediate: [{
        tagName: String,
        tagSlug: String,
        problemsSolved: Number
      }],
      fundamental: [{
        tagName: String,
        tagSlug: String,
        problemsSolved: Number
      }]
    }
  },
  scrapingStatus: {
    type: String,
    enum: ['pending', 'scraping', 'success', 'failed'],
    default: 'pending'
  },
  lastScrapedAt: {
    type: Date,
    default: null
  },
  scrapingErrors: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastScrapingError: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  privacy: {
    showProfile: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
friendSchema.index({ owner: 1, leetcodeId: 1 }, { unique: true });
friendSchema.index({ owner: 1, isActive: 1 });
friendSchema.index({ lastScrapedAt: 1 });

// Virtual for friend's full LeetCode profile URL
friendSchema.virtual('leetcodeProfileUrl').get(function() {
  return `https://leetcode.com/u/${this.leetcodeId}/`;
});

// Virtual to check if scraping is needed (older than 1 hour)
friendSchema.virtual('needsScraping').get(function() {
  if (!this.lastScrapedAt) return true;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.lastScrapedAt < oneHourAgo;
});

// Instance method to update LeetCode data
friendSchema.methods.updateLeetCodeData = function(scrapedData) {
  this.leetcodeData = {
    ...this.leetcodeData,
    ...scrapedData
  };
  this.scrapingStatus = 'success';
  this.lastScrapedAt = new Date();
  this.lastScrapingError = null;
  return this.save();
};

// Instance method to handle scraping failure
friendSchema.methods.markScrapingFailed = function(error) {
  this.scrapingStatus = 'failed';
  this.lastScrapingError = error;
  this.scrapingErrors.push({
    message: error,
    timestamp: new Date()
  });
  
  // Keep only last 5 errors
  if (this.scrapingErrors.length > 5) {
    this.scrapingErrors = this.scrapingErrors.slice(-5);
  }
  
  return this.save();
};

// Instance method to mark scraping as started
friendSchema.methods.markScrapingStarted = function() {
  this.scrapingStatus = 'scraping';
  return this.save();
};

// Static method to find friends needing scraping
friendSchema.statics.findNeedingScraping = function(limit = 10) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.find({
    isActive: true,
    $or: [
      { lastScrapedAt: null },
      { lastScrapedAt: { $lt: oneHourAgo } },
      { scrapingStatus: 'failed' }
    ]
  })
  .limit(limit)
  .sort({ lastScrapedAt: 1 });
};

// Static method to get friends by owner with stats
friendSchema.statics.findByOwnerWithStats = function(ownerId) {
  return this.find({ owner: ownerId, isActive: true })
    .select('-scrapingErrors -lastScrapingError')
    .sort({ 'leetcodeData.totalSolved': -1 });
};

const Friend = mongoose.model('Friend', friendSchema);

export { Friend };