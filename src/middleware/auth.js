import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

export function protect(req, res, next) {
  let token = null;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    req.currentUser = user;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
}
