import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not OAuth user
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  leetcodeId: {
    type: String,
    required: false, // Optional since OAuth users might not have one initially
    trim: true,
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
    recentSubmissions: [{
      title: String,
      titleSlug: String,
      timestamp: String,
      statusDisplay: String,
      lang: String
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  friends: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  refreshToken: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Virtual for friend count
userSchema.virtual('friendCount').get(function() {
  return this.friends ? this.friends.length : 0;
});

// Index for efficient queries
userSchema.index({ lastLogin: -1 });

// Instance methods
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

// Method to update LeetCode data
userSchema.methods.updateLeetCodeData = function(leetcodeData) {
  this.leetcodeData = {
    ...this.leetcodeData,
    ...leetcodeData,
    lastUpdated: new Date()
  };
  return this.save();
};

// Instance method to add friend
userSchema.methods.addFriend = async function(leetcodeId) {
  const normalizedId = leetcodeId.toLowerCase().trim();
  if (!this.friends.includes(normalizedId)) {
    this.friends.push(normalizedId);
    await this.save();
  }
  return this;
};

// Instance method to remove friend
userSchema.methods.removeFriend = async function(leetcodeId) {
  const normalizedId = leetcodeId.toLowerCase().trim();
  this.friends = this.friends.filter(id => id !== normalizedId);
  await this.save();
  return this;
};

const User = mongoose.model('User', userSchema);

export {User};
