import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required().description('PostgreSQL Connection String (Pooled)'),
  DIRECT_URL: Joi.string().optional().description('PostgreSQL Connection String (Direct - for migrations)'),
  REDIS_URL: Joi.string().required().description('Redis Connection String'),
  
  // Auth Configuration
  JWT_SECRET: Joi.string().required().min(32).description('Secret for signing JWTs'),
  JWT_EXPIRATION: Joi.string().default('7d').description('Access token expiration time'),
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional().default('http://localhost:3000/auth/google/callback'),

  // AI Configuration
  API_KEY: Joi.string().required().description('API Key for Gemini/AI Provider'),

  // Billing Configuration
  STRIPE_SECRET_KEY: Joi.string().required().description('Stripe Secret Key'),
  STRIPE_WEBHOOK_SECRET: Joi.string().required().description('Stripe Webhook Secret'),
  STRIPE_PRICE_ID_PRO: Joi.string().required().description('Stripe Price ID for Pro Plan'),
  STRIPE_PRICE_ID_TEAM: Joi.string().required().description('Stripe Price ID for Team Plan'),
});