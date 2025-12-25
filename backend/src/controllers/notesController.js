const { validationResult } = require('express-validator');
const notesService = require('../services/notesService');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class NotesController {
  async createNote(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const { title, content } = req.body;
      const userId = req.user.id;

      const note = await notesService.createNote(userId, title, content);

      logger.info({ userId, noteId: note.id }, 'Note created via controller');

      res.status(201).json({
        status: 'success',
        message: 'Note created successfully',
        data: { note }
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotes(req, res, next) {
    try {
      const userId = req.user.id;
      const notes = await notesService.getNotesByUserId(userId);

      res.status(200).json({
        status: 'success',
        results: notes.length,
        data: { notes }
      });
    } catch (error) {
      next(error);
    }
  }

  async getNote(req, res, next) {
    try {
      const noteId = req.params.id;
      const userId = req.user.id;

      const note = await notesService.getNoteById(noteId, userId);

      res.status(200).json({
        status: 'success',
        data: { note }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const noteId = req.params.id;
      const userId = req.user.id;
      const { title, content } = req.body;

      const note = await notesService.updateNote(noteId, userId, title, content);

      logger.info({ userId, noteId }, 'Note updated via controller');

      res.status(200).json({
        status: 'success',
        message: 'Note updated successfully',
        data: { note }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const noteId = req.params.id;
      const userId = req.user.id;

      await notesService.deleteNote(noteId, userId);

      logger.info({ userId, noteId }, 'Note deleted via controller');

      res.status(200).json({
        status: 'success',
        message: 'Note deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotesController();