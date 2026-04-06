const { z } = require('zod');

const onboardingSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, 'Company name is required'),
    brandName: z.string().optional(),
    website: z.string().url('Must be a valid URL').optional(),
    industry: z.string().optional(),
    contactName: z.string().min(2, 'Contact name is required'),
    contactEmail: z.string().email('Must be a valid email'),
    logoUrl: z.string().optional(),
    description: z.string().optional()
  })
});

const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    shortDescription: z.string().min(10).max(300),
    fullDescription: z.string().min(20),
    platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter', 'other']),
    category: z.string().min(2),
    rewardType: z.enum(['fixed', 'per_post', 'per_1000_views', 'per_engagement', 'per_submission']).optional(),
    rewardAmount: z.number().positive(),
    budgetTotal: z.number().positive(),
    maxCreators: z.number().int().positive(),
    requirements: z.array(z.string()).optional(),
    eligibility: z.array(z.string()).optional(),
    trustRequirement: z.number().min(0).max(100).optional(),
    instructions: z.string().min(10),
    bannerUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime()
  }).refine((data) => new Date(data.startAt) < new Date(data.endAt), {
    message: 'End date must be after start date',
    path: ['endAt']
  })
});

const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    shortDescription: z.string().min(10).max(300).optional(),
    fullDescription: z.string().min(20).optional(),
    platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter', 'other']).optional(),
    category: z.string().min(2).optional(),
    rewardType: z.enum(['fixed', 'per_post', 'per_1000_views', 'per_engagement', 'per_submission']).optional(),
    rewardAmount: z.number().positive().optional(),
    budgetTotal: z.number().positive().optional(),
    maxCreators: z.number().int().positive().optional(),
    requirements: z.array(z.string()).optional(),
    eligibility: z.array(z.string()).optional(),
    trustRequirement: z.number().min(0).max(100).optional(),
    instructions: z.string().min(10).optional(),
    bannerUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional()
  })
});

const updateCampaignStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'live', 'paused', 'closed', 'archived'])
  })
});

const reviewSubmissionSchema = z.object({
  body: z.object({
    rejectionReason: z.string().max(500).optional()
  }).refine((data, ctx) => {
    // We will validate in controller that if action is reject, reason is required
    return true; 
  })
});

module.exports = {
  onboardingSchema,
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignStatusSchema,
  reviewSubmissionSchema
};
