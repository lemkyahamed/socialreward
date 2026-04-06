const { z } = require('zod');

const submitToCampaignSchema = z.object({
  body: z.object({
    submissionType: z.enum(['url', 'file', 'both']),
    contentUrl: z.string().url('Must be a valid URL').optional(),
    fileUrl: z.string().url('Must be a valid URL').optional(),
    notes: z.string().max(1000).optional()
  }).refine((data) => {
    if (data.submissionType === 'url' && !data.contentUrl) return false;
    if (data.submissionType === 'file' && !data.fileUrl) return false;
    if (data.submissionType === 'both' && (!data.contentUrl || !data.fileUrl)) return false;
    return true;
  }, {
    message: 'Must provide contentUrl and/or fileUrl based on submissionType'
  })
});

const onboardingSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    country: z.string().min(2, 'Country code required'),
    niche: z.string().min(2, 'Niche is required'),
    followerRange: z.string().min(2, 'Follower range is required'),
    primaryPlatform: z.string().min(2, 'Primary platform is required'),
    tiktok: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    youtube: z.string().optional().nullable(),
    payoutMethod: z.string().optional().nullable(),
    accountName: z.string().optional().nullable(),
    isPayoutConnected: z.boolean().optional()
  })
});

module.exports = {
  submitToCampaignSchema,
  onboardingSchema
};
