const { verifyToken } = require('../utils/jwt');

/**
 * PUBLIC_INTERFACE
 * Express middleware that validates Authorization: Bearer <token>.
 * Adds req.user = { userId, username } on success.
 */
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ status: 'error', message: 'Missing or invalid Authorization header' });
    }

    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, username: decoded.username };
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

module.exports = {
  requireAuth,
};
