import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().default(3001),

  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRATION: Joi.string().default('7d'),

  API_KEY: Joi.string().required(),

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_PRICE_ID_PRO: Joi.string().required(),
  STRIPE_PRICE_ID_TEAM: Joi.string().required(),
});
