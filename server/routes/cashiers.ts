import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database';
import { authenticateToken, requireAdmin } from './auth';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'admin' | 'cashier';
    adminId?: string;
    cashierId?: string;
  };
}

interface CashierInput {
  cashierId: string;
  name: string;
  mobile: string;
  address: string;
  email: string;
  password?: string;
}

router.get('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT id, cashierId, name, mobile, address, email, createdAt, updatedAt 
      FROM cashiers 
      ORDER BY createdAt DESC
    `);
    const cashiers = stmt.all();
    res.json(cashiers);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});


router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { cashierId, name, mobile, address, email, password }: CashierInput = req.body;

  if (!cashierId || !name || !mobile || !address || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO cashiers (cashierId, name, mobile, address, email, password) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(cashierId, name, mobile, address, email, hashedPassword);

    res.status(201).json({
      message: 'Cashier added successfully',
      cashier: {
        id: result.lastInsertRowid,
        cashierId,
        name,
        mobile,
        address,
        email,
      },
    });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Cashier ID or email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});


router.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, mobile, address, email }: CashierInput = req.body;

  if (!name || !mobile || !address || !email) {
    return res.status(400).json({ error: 'All fields except password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE cashiers 
      SET name = ?, mobile = ?, address = ?, email = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const result = stmt.run(name, mobile, address, email, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cashier not found' });
    }

    res.json({ message: 'Cashier updated successfully' });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});


router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM cashiers WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cashier not found' });
    }

    res.json({ message: 'Cashier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
