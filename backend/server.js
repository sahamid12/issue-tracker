import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issueRoutes from './routes/issues.js';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import issueCommentsRouter from './routes/issueComments.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', issueCommentsRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Connection failed:', err);
    } else {
      console.log('Connected to DB at:', res.rows[0].now);
    }
  })
