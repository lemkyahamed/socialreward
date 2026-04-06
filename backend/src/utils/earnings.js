/**
 * Core mathematical engine to dynamically verify campaign yields based on physical metrics.
 * Safe extraction ensuring minimum thresholds aren't violated and zeroed logic applies correctly.
 * 
 * @param {Object} campaign - The Mongoose Campaign instance detailing rewardAmt and type 
 * @param {Object} metrics - Extrapolated SubmissionMetrics schema { views, likes, comments, shares }
 * @returns {Number} Evaluated clean USD balance yield.
 */
function calculateEarnings(campaign, metrics) {
  if (!campaign || !campaign.rewardAmount) return 0;
  
  const rate = campaign.rewardAmount;
  const { views = 0, likes = 0, comments = 0, shares = 0 } = metrics || {};
  
  let earnings = 0;
  
  switch (campaign.rewardType) {
    case 'fixed':
    case 'per_post':
      earnings = rate;
      break;
      
    case 'per_1000_views':
      earnings = (Math.max(0, views) / 1000) * rate;
      break;
      
    case 'per_engagement':
      const totalEngagements = Math.max(0, likes) + Math.max(0, comments) + Math.max(0, shares);
      earnings = totalEngagements * rate;
      break;
      
    default:
      earnings = 0;
  }

  return Number(earnings.toFixed(2));
}

module.exports = {
  calculateEarnings
};
