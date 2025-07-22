import express from 'express';
import {
  getIssueById,
  getAllIssues,
  createIssueWithCloudinary,
  pickIssue ,
  assignIssue,
} from '../controllers/issuesController.js';

import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
const router = express.Router();

// ✅ Require auth to view all issues
router.get('/', authenticate, getAllIssues);

// ✅ Require auth to view one issue
router.get('/:id', authenticate, getIssueById);

// ✅ Require auth to create an issue (with image upload)
router.post('/create', authenticate, upload.single('screenshot'), createIssueWithCloudinary);

router.patch('/:id/assign', authenticate, assignIssue);
router.post('/:id/pick', authenticate, pickIssue);


// ❌ Optional: leave open if uploads needed for testing
router.post('/upload', upload.single('screenshot'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'issues',
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
