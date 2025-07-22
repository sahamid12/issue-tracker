import pool from '../db.js';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: 'dguwxrhz2',
    api_key: '519474269664854',
    api_secret: 'n4USebzMTS59KPniSn_IjEqXx6g'
  });

  
export const getAllIssues = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM issues');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching issues:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };


  export const getIssueById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching issue by ID:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  export const createIssueWithCloudinary = async (req, res) => {
    const {
      title,
      location,
      description,
      severity,
      status = 'open',
      created_by,
      assigned_to = null,
      reported_by = null,
    } = req.body;
  
    // Basic required fields check
    if (!title || !location || !description || !severity || !created_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      let imageUrl = null;
  
      // Upload image to Cloudinary if screenshot provided
      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
  
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'issues',
        });
  
        imageUrl = uploadResult.secure_url;
      }
  
      // Save issue to database
      const result = await pool.query(
        `INSERT INTO issues 
          (title, location, description, severity, status, created_by, assigned_to, reported_by, screenshot) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          title,
          location,
          description,
          severity,
          status,
          created_by,
          assigned_to,
          reported_by,
          imageUrl,
        ]
      );
  
      res.status(201).json({ issue: result.rows[0] });
    } catch (err) {
      console.error('Error creating issue:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  


// POST /api/issues/:id/pick
export const pickIssue = async (req, res) => {
  const { id } = req.params;         // Issue ID from the route
  const userId = req.user_id;        // User ID from JWT auth middleware

  try {
    // 1. Get the user's username (to assign)
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const username = userResult.rows[0].username;

    // 2. Check if issue exists and is unassigned
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    const issue = issueResult.rows[0];

    if (issue.assigned_to) {
      return res.status(400).json({ error: 'Issue already picked' });
    }

    // 3. Update the issue's assigned_to field
    const updateResult = await pool.query(
      'UPDATE issues SET assigned_to = $1 WHERE id = $2 RETURNING *',
      [username, id]
    );

    // 4. Return the updated issue
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error picking issue:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// PATCH /api/issues/:id/assign
export const assignIssue = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body; // username or user_id, depending on your data model

  try {
    // 1. Confirm assigned_to is provided
    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to field required' });
    }

    // 2. Confirm the user exists (optional, but recommended!)
    const userResult = await pool.query('SELECT username FROM users WHERE username = $1', [assigned_to]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User to assign not found' });
    }

    // 3. Update issue
    const updateResult = await pool.query(
      'UPDATE issues SET assigned_to = $1 WHERE id = $2 RETURNING *',
      [assigned_to, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error assigning issue:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
