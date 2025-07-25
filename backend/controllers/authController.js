import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashed]
    );

    const token = jwt.sign({ user_id: result.rows[0].id }, JWT_SECRET);
    res.status(201).json({ token, user_id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, result.rows[0].password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ user_id: result.rows[0].id }, JWT_SECRET);
    res.json({ token, user_id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};



export const logout = async (req, res) => {
  // In stateless JWT, we can’t "destroy" a token without blacklisting
  // But for frontend-controlled logout, just return 200
  return res.status(200).json({ message: 'Logged out successfully' });
};

