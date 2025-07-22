import express from 'express';
import { getAllUsers} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();


router.get('/', authenticate, getAllUsers); // or use a usersRouter

export default router;
