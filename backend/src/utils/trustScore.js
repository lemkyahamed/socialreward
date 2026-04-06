const CreatorProfile = require('../models/CreatorProfile');
const User = require('../models/User');

/**
 * Mathematically re-evaluate a creator's structural integrity tier.
 * Called automatically whenever a Brand approves or rejects a submission.
 * 
 * @param {ObjectId} creatorId User ID
 * @param {String} action ['approve', 'reject', 'late']
 * @returns {Object} Updated profile state
 */
async function reevaluateTrustScore(creatorId, action) {
  const profile = await CreatorProfile.findOne({ userId: creatorId });
  if (!profile) throw new Error('Creator profile not found for trust re-evaluation');

  let currentScore = profile.trustScore || 50;

  // Mutate metrics based on explicit trigger actions
  if (action === 'approve') {
    profile.trustMetrics.approvals += 1;
    currentScore += 5;
  } else if (action === 'reject') {
    profile.trustMetrics.rejections += 1;
    currentScore -= 5;
  } else if (action === 'late') {
    profile.trustMetrics.lateSubmissions += 1;
    currentScore -= 5;
  }

  // Bound limits
  currentScore = Math.max(0, Math.min(100, currentScore));
  profile.trustScore = currentScore;

  // Compute tier mapping
  if (currentScore < 40) {
    profile.trustLabel = 'New'; // or At Risk
  } else if (currentScore < 70) {
    profile.trustLabel = 'Rising';
  } else if (currentScore < 90) {
    profile.trustLabel = 'Trusted';
  } else {
    profile.trustLabel = 'Verified';
  }

  await profile.save();

  // Automatic platform isolation safeguard mapping
  if (currentScore < 20) {
    await User.findByIdAndUpdate(creatorId, { status: 'suspended' });
    console.warn(`[SYSTEM] Creator ${creatorId} suspended automatically. Trust Score dropped to ${currentScore}.`);
  }

  return profile;
}

module.exports = {
  reevaluateTrustScore
};
