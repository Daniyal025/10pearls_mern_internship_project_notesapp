const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const { username, email, password } = req.body;
      const user = await userService.createUser(username, email, password);

      logger.info({ userId: user.id }, 'User signup successful');

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const { email, password } = req.body;
      const result = await userService.authenticateUser(email, password);

      logger.info({ userId: result.user.id }, 'User login successful');

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();