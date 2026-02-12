const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required env var: JWT_SECRET');
  }
  return secret;
}

/**
 * PUBLIC_INTERFACE
 * Create a JWT for a user.
 * @param {{ userId: string, username: string }} payload
 * @returns {string} token
 */
function signUserToken(payload) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * PUBLIC_INTERFACE
 * Verify a JWT and return decoded payload.
 * @param {string} token
 * @returns {{ userId: string, username: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

module.exports = {
  signUserToken,
  verifyToken,
};
