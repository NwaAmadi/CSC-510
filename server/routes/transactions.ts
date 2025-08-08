import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from './auth';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: 'admin' | 'cashier';
    adminId?: string;
    cashierId?: string;
  };
}

interface Transaction {
  transactionId: string;
  cashierId: string;
  amount: number;
  type: 'sale' | 'refund' | 'void';
  description?: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
  cashierId?: string;
  type?: string;
}


router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '10', cashierId, type } = req.query as QueryParams;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let baseQuery = `
    SELECT t.*, c.name as cashierName 
    FROM transactions t 
    LEFT JOIN cashiers c ON t.cashierId = c.cashierId
  `;

  let countQuery = 'SELECT COUNT(*) as total FROM transactions t';
  const whereConditions: string[] = [];
  const params: any[] = [];

  if (cashierId) {
    whereConditions.push('t.cashierId = ?');
    params.push(cashierId);
  }

  if (type) {
    whereConditions.push('t.type = ?');
    params.push(type);
  }

  if (whereConditions.length > 0) {
    const whereClause = ' WHERE ' + whereConditions.join(' AND ');
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  baseQuery += ' ORDER BY t.createdAt DESC LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  try {
    const transactions = db.prepare(baseQuery).all(...params);
    const totalRow = db.prepare(countQuery).get(...params.slice(0, -2)) as { total: number };
    const total = totalRow?.total ?? 0;


    res.json({
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTransactions: total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /transactions - add transaction
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const {
    transactionId,
    cashierId,
    amount,
    type,
    description,
  }: Transaction = req.body;

  if (!transactionId || !cashierId || !amount || !type) {
    return res.status(400).json({
      error: 'Transaction ID, cashier ID, amount, and type are required',
    });
  }

  if (!['sale', 'refund', 'void'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO transactions (transactionId, cashierId, amount, type, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(transactionId, cashierId, amount, type, description);

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: {
        id: result.lastInsertRowid,
        transactionId,
        cashierId,
        amount,
        type,
        description,
      },
    });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Transaction ID already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /transactions/stats - aggregate statistics
router.get('/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalTransactions,
        SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as totalSales,
        SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) as totalRefunds,
        COUNT(DISTINCT cashierId) as activeCashiers,
        AVG(amount) as avgTransactionAmount
      FROM transactions
    `).get();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
