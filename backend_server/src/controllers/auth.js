const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signUserToken } = require('../utils/jwt');

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * Sign up a new user.
   */
  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body || {};

      if (!username || !email || !password) {
        return res.status(400).json({ status: 'error', message: 'username, email, and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ status: 'error', message: 'password must be at least 6 characters' });
      }

      const existing = await User.findOne({
        $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
      }).lean();

      if (existing) {
        return res.status(409).json({ status: 'error', message: 'username or email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
      });

      const token = signUserToken({ userId: String(user._id), username: user.username });
      return res.status(201).json({
        status: 'ok',
        token,
        user: { id: String(user._id), username: user.username, email: user.email },
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Login with username/email + password.
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier || !password) {
        return res.status(400).json({ status: 'error', message: 'identifier and password are required' });
      }

      const normalized = identifier.trim().toLowerCase();
      const user = await User.findOne({
        $or: [{ email: normalized }, { username: identifier.trim() }],
      });

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ status: 'error', message: 'invalid credentials' });
      }

      const token = signUserToken({ userId: String(user._id), username: user.username });
      return res.status(200).json({
        status: 'ok',
        token,
        user: { id: String(user._id), username: user.username, email: user.email },
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Return current authenticated user info.
   */
  async me(req, res) {
    return res.status(200).json({ status: 'ok', user: req.user });
  }
}

module.exports = new AuthController();
