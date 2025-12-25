const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class UserService {
  async createUser(username, email, password) {
    try {
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUsers.length > 0) {
        throw new AppError('User with this email or username already exists', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      logger.info({ userId: result.insertId, username, email }, 'New user created');

      return {
        id: result.insertId,
        username,
        email
      };
    } catch (error) {
      logger.error({ error, username, email }, 'Error creating user');
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const [users] = await db.query(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new AppError('Invalid email or password', 401);
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      logger.info({ userId: user.id, email }, 'User authenticated successfully');

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      };
    } catch (error) {
      logger.error({ error, email }, 'Error authenticating user');
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const [users] = await db.query(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new AppError('User not found', 404);
      }

      return users[0];
    } catch (error) {
      logger.error({ error, userId }, 'Error fetching user');
      throw error;
    }
  }
}

module.exports = new UserService();