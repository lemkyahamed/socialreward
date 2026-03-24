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

module.exports = {
  submitToCampaignSchema
};
