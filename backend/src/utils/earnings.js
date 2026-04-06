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
  
  switch (campaign.rewardType) {
    case 'fixed':
    case 'per_post':
      return rate;
      
    case 'per_1000_views':
      // Using floating decimals natively matching requested yield mapping
      return (Math.max(0, views) / 1000) * rate;
      
    case 'per_engagement':
      // Agnostic total engagement aggregation
      const totalEngagements = Math.max(0, likes) + Math.max(0, comments) + Math.max(0, shares);
      return totalEngagements * rate;
      
    default:
      return 0; // Invalid formula type defaults strictly to 0
  }
}

module.exports = {
  calculateEarnings
};
