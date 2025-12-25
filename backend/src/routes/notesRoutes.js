const express = require('express');
const { body } = require('express-validator');
const notesController = require('../controllers/notesController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').optional()
  ],
  notesController.createNote
);

router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNote);

router.put(
  '/:id',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').optional()
  ],
  notesController.updateNote
);

router.delete('/:id', notesController.deleteNote);

module.exports = router;