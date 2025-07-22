import express from 'express';
import { getCommentsForIssue, addCommentToIssue } from '../controllers/issueCommentsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// GET all comments for a specific issue
router.get('/issues/:issue_id/comments', authenticate, getCommentsForIssue);

// POST new comment for a specific issue
router.post('/issues/:issue_id/comments', authenticate, addCommentToIssue);

export default router;
