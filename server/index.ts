import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth.js';
import cashierRoutes from './routes/cashiers';
import transactionRoutes from './routes/transactions';

const PORT = process.env.PORT || 3001;

(async () => {
  await initializeDatabase();

  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/cashiers', cashierRoutes);
  app.use('/api/transactions', transactionRoutes);

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
