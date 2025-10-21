import { Router } from 'express';
import {
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
} from '../controllers/challenges.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Challenge CRUD operations
router.route('/')
  .post(createChallenge)
  .get(getUserChallenges);

router.get('/active', getActiveChallenges);
router.get('/pending', getPendingChallenges);
router.get('/history', getChallengeHistory);
router.get('/stats', getChallengeStats);

router.route('/:challengeId')
  .get(getChallengeDetails);

// Challenge actions
router.patch('/:challengeId/accept', acceptChallenge);
router.patch('/:challengeId/decline', declineChallenge);
router.patch('/:challengeId/cancel', cancelChallenge);
router.patch('/:challengeId/progress', updateChallengeProgress);

export default router;
