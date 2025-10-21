import { Challenge } from '../models/challenge.model.js';
import { User } from '../models/user.model.js';
import { Friend } from '../models/friend.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new challenge
const createChallenge = asyncHandler(async (req, res) => {
  const { opponentId, type, problemCount, duration, difficulty, topic, message } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!opponentId || !type || !problemCount || !duration) {
    throw new ApiError(400, "Missing required fields");
  }

  // Check if opponent exists and belongs to user's friends
  const friend = await Friend.findOne({
    _id: opponentId,
    owner: userId,
    isActive: true
  });

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  // Create challenge
  const challenge = await Challenge.create({
    creator: userId,
    opponent: opponentId,
    type,
    config: {
      problemCount,
      duration,
      difficulty: difficulty || 'mixed',
      topic: topic || null
    },
    message: message || ''
  });

  const populatedChallenge = await Challenge.findById(challenge._id)
    .populate('creator', 'fullName username avatar')
    .populate('opponent', 'name leetcodeId avatar');

  return res.status(201).json(
    new ApiResponse(201, populatedChallenge, "Challenge created successfully")
  );
});

// Get all challenges for a user
const getUserChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  let query = {
    $or: [
      { creator: userId },
      { opponent: userId }
    ]
  };

  if (status) {
    query.status = status;
  }

  const challenges = await Challenge.find(query)
    .populate('creator', 'fullName username avatar')
    .populate('opponent', 'name leetcodeId avatar')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, challenges, "Challenges retrieved successfully")
  );
});

// Get active challenges
const getActiveChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const challenges = await Challenge.getUserActiveChallenges(userId);

  return res.status(200).json(
    new ApiResponse(200, challenges, "Active challenges retrieved successfully")
  );
});

// Get pending challenges (received)
const getPendingChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const challenges = await Challenge.getUserPendingChallenges(userId);

  return res.status(200).json(
    new ApiResponse(200, challenges, "Pending challenges retrieved successfully")
  );
});

// Get challenge history
const getChallengeHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 10 } = req.query;

  const challenges = await Challenge.getUserHistory(userId, parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, challenges, "Challenge history retrieved successfully")
  );
});

// Get challenge details
const getChallengeDetails = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({
    _id: challengeId,
    $or: [
      { creator: userId },
      { opponent: userId }
    ]
  })
  .populate('creator', 'fullName username avatar')
  .populate('opponent', 'name leetcodeId avatar');

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  return res.status(200).json(
    new ApiResponse(200, challenge, "Challenge details retrieved successfully")
  );
});

// Accept challenge
const acceptChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({
    _id: challengeId,
    opponent: userId,
    status: 'pending'
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found or already processed");
  }

  await challenge.accept();

  const updatedChallenge = await Challenge.findById(challengeId)
    .populate('creator', 'fullName username avatar')
    .populate('opponent', 'name leetcodeId avatar');

  return res.status(200).json(
    new ApiResponse(200, updatedChallenge, "Challenge accepted successfully")
  );
});

// Decline challenge
const declineChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({
    _id: challengeId,
    opponent: userId,
    status: 'pending'
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found or already processed");
  }

  await challenge.decline();

  return res.status(200).json(
    new ApiResponse(200, { challengeId }, "Challenge declined successfully")
  );
});

// Cancel challenge
const cancelChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const challenge = await Challenge.findOne({
    _id: challengeId,
    creator: userId,
    status: { $in: ['pending', 'active'] }
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found or cannot be cancelled");
  }

  await challenge.cancel();

  return res.status(200).json(
    new ApiResponse(200, { challengeId }, "Challenge cancelled successfully")
  );
});

// Update challenge progress
const updateChallengeProgress = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const { solved } = req.body;
  const userId = req.user._id;

  if (solved === undefined || solved < 0) {
    throw new ApiError(400, "Invalid solved count");
  }

  const challenge = await Challenge.findOne({
    _id: challengeId,
    $or: [
      { creator: userId },
      { opponent: userId }
    ],
    status: 'active'
  });

  if (!challenge) {
    throw new ApiError(404, "Active challenge not found");
  }

  const isCreator = challenge.creator.toString() === userId.toString();
  await challenge.updateProgress(isCreator, solved);

  // Check if challenge should be completed
  if (challenge.isExpired || 
      challenge.progress.creator.solved >= challenge.config.problemCount || 
      challenge.progress.opponent.solved >= challenge.config.problemCount) {
    await challenge.complete();
  }

  const updatedChallenge = await Challenge.findById(challengeId)
    .populate('creator', 'fullName username avatar')
    .populate('opponent', 'name leetcodeId avatar');

  return res.status(200).json(
    new ApiResponse(200, updatedChallenge, "Progress updated successfully")
  );
});

// Get challenge statistics
const getChallengeStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalChallenges, wonChallenges, activeChallenges] = await Promise.all([
    Challenge.countDocuments({
      $or: [{ creator: userId }, { opponent: userId }],
      status: 'completed'
    }),
    Challenge.countDocuments({
      $or: [
        { creator: userId, winner: 'creator' },
        { opponent: userId, winner: 'opponent' }
      ],
      status: 'completed'
    }),
    Challenge.countDocuments({
      $or: [{ creator: userId }, { opponent: userId }],
      status: 'active'
    })
  ]);

  const stats = {
    total: totalChallenges,
    won: wonChallenges,
    lost: totalChallenges - wonChallenges,
    active: activeChallenges,
    winRate: totalChallenges > 0 ? ((wonChallenges / totalChallenges) * 100).toFixed(1) : 0
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Challenge statistics retrieved successfully")
  );
});

export {
  createChallenge,
  getUserChallenges,
  getActiveChallenges,
  getPendingChallenges,
  getChallengeHistory,
  getChallengeDetails,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  updateChallengeProgress,
  getChallengeStats
};
