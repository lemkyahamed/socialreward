const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['creator', 'brand'], {
      errorMap: () => ({ message: 'Role must be either creator or brand' })
    }),
    profile: z.object({
      displayName: z.string().min(2, 'Display name is too short').optional(), // For creator
      companyName: z.string().min(2, 'Company name is too short').optional(), // For brand
    }).refine((data) => data.displayName || data.companyName, {
      message: 'Either displayName or companyName must be provided depending on the role'
    })
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
