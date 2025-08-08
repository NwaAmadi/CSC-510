import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface Admin {
  id: number;
  adminId: string;
  password: string;
}

interface Cashier {
  id: number;
  cashierId: string;
  password: string;
  name: string;
}

interface AuthenticatedUser {
  id: number;
  adminId?: string;
  cashierId?: string;
  role: 'admin' | 'cashier';
}

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// === Admin Login ===
router.post('/admin/login', async (req: Request, res: Response) => {
  const { adminId, password } = req.body;

  if (!adminId || !password) {
    return res.status(400).json({ error: 'Admin ID and password are required' });
  }

  try {
    const stmt = db.prepare<Admin>('SELECT * FROM admins WHERE adminId = ?');
    const admin = stmt.get(adminId) as Admin;


    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, adminId: admin.adminId, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        adminId: admin.adminId,
        role: 'admin',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Cashier Login ===
router.post('/cashier/login', async (req: Request, res: Response) => {
  const { cashierId, password } = req.body;

  if (!cashierId || !password) {
    return res.status(400).json({ error: 'Cashier ID and password are required' });
  }

  try {
    const stmt = db.prepare<Cashier>('SELECT * FROM cashiers WHERE cashierId = ?');
    const cashier = stmt.get(cashierId) as Cashier;

    if (!cashier) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, cashier.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: cashier.id, cashierId: cashier.cashierId, role: 'cashier' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: cashier.id,
        cashierId: cashier.cashierId,
        name: cashier.name,
        role: 'cashier',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Middleware: Token Auth ===
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || typeof user !== 'object' || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user as AuthenticatedUser;
    next();
  });
};

// === Middleware: Admin Role Check ===
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export default router;
