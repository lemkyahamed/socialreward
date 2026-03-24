const { z } = require('zod');

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'suspended'])
  })
});

const updateCampaignStatusAdminSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'live', 'paused', 'closed', 'archived'])
  })
});

const updateSuspiciousFlagSchema = z.object({
  body: z.object({
    status: z.enum(['resolved', 'ignored'])
  })
});

module.exports = {
  updateUserStatusSchema,
  updateCampaignStatusAdminSchema,
  updateSuspiciousFlagSchema
};
