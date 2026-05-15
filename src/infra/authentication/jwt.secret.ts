export const jwtSecret = {
  secret: process.env.JWT_SECRET ?? 'mabruk-dev-secret',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
};
