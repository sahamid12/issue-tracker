import pool from '../db.js';

export const getCommentsForIssue = async (req, res) => {
  const { issue_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, u.username AS commenter_username
       FROM issue_comments c
       LEFT JOIN users u ON c.commenter_id = u.id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [issue_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addCommentToIssue = async (req, res) => {
  const { issue_id } = req.params;
  const { comment, mentioned_user_id = null } = req.body;
  const commenter_id = req.user_id; // From auth middleware

  if (!comment) {
    return res.status(400).json({ error: 'Comment text required' });
  }

  try {
    // Insert the new comment and get its ID
    const insertResult = await pool.query(
      `INSERT INTO issue_comments (issue_id, commenter_id, comment, mentioned_user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [issue_id, commenter_id, comment, mentioned_user_id]
    );
    const newCommentId = insertResult.rows[0].id;

    // Fetch the new comment with username
    const commentWithUser = await pool.query(
      `SELECT c.*, u.username AS commenter_username
       FROM issue_comments c
       LEFT JOIN users u ON c.commenter_id = u.id
       WHERE c.id = $1`,
      [newCommentId]
    );

    res.status(201).json(commentWithUser.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
