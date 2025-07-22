import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1]; // ✅ FIXED: Read token from header

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // ✅ Check if token is legit
    req.user_id = decoded.user_id; // ✅ Attach user_id to request
    next(); // ✅ Allow request to continue
  } catch {
    res.status(403).json({ error: 'Invalid token' }); // ❌ Bad or expired token
  }
};
