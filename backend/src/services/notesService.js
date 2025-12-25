const db = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class NotesService {
  async createNote(userId, title, content) {
    try {
      const [result] = await db.query(
        'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );

      logger.info({ userId, noteId: result.insertId }, 'Note created');

      return {
        id: result.insertId,
        user_id: userId,
        title,
        content,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      logger.error({ error, userId, title }, 'Error creating note');
      throw error;
    }
  }

  async getNotesByUserId(userId) {
    try {
      const [notes] = await db.query(
        'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );

      logger.info({ userId, notesCount: notes.length }, 'Notes retrieved');

      return notes;
    } catch (error) {
      logger.error({ error, userId }, 'Error retrieving notes');
      throw error;
    }
  }

  async getNoteById(noteId, userId) {
    try {
      const [notes] = await db.query(
        'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?',
        [noteId, userId]
      );

      if (notes.length === 0) {
        throw new AppError('Note not found', 404);
      }

      return notes[0];
    } catch (error) {
      logger.error({ error, noteId, userId }, 'Error retrieving note');
      throw error;
    }
  }

  async updateNote(noteId, userId, title, content) {
    try {
      await this.getNoteById(noteId, userId);

      const [result] = await db.query(
        'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
        [title, content, noteId, userId]
      );

      if (result.affectedRows === 0) {
        throw new AppError('Note not found or unauthorized', 404);
      }

      logger.info({ userId, noteId }, 'Note updated');

      return await this.getNoteById(noteId, userId);
    } catch (error) {
      logger.error({ error, noteId, userId }, 'Error updating note');
      throw error;
    }
  }

  async deleteNote(noteId, userId) {
    try {
      await this.getNoteById(noteId, userId);

      const [result] = await db.query(
        'DELETE FROM notes WHERE id = ? AND user_id = ?',
        [noteId, userId]
      );

      if (result.affectedRows === 0) {
        throw new AppError('Note not found or unauthorized', 404);
      }

      logger.info({ userId, noteId }, 'Note deleted');

      return { message: 'Note deleted successfully' };
    } catch (error) {
      logger.error({ error, noteId, userId }, 'Error deleting note');
      throw error;
    }
  }
}

module.exports = new NotesService();