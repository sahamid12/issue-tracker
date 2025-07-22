import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = 'your-secret-key';



// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
      const result = await pool.query('SELECT username FROM users');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  