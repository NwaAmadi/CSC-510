import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./server/database.sqlite');

export const initializeDatabase = async (): Promise<void> => {

  db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adminId TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS cashiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cashierId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionId TEXT UNIQUE NOT NULL,
      cashierId TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cashierId) REFERENCES cashiers (cashierId)
    )
  `).run();

  
  const defaultPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);


  db.prepare(`
    INSERT OR IGNORE INTO admins (adminId, password) VALUES (?, ?)
  `).run('admin', defaultPassword);

  
  const insertCashier = db.prepare(`
    INSERT OR IGNORE INTO cashiers 
      (cashierId, name, mobile, address, email, password) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCashier.run('CASH001', 'John Doe', '+1234567890', '123 Main St, City', 'john@example.com', cashierPassword);
  insertCashier.run('CASH002', 'Jane Smith', '+1987654321', '456 Oak Ave, City', 'jane@example.com', cashierPassword);

 
  const insertTxn = db.prepare(`
    INSERT OR IGNORE INTO transactions 
      (transactionId, cashierId, amount, type, description) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertTxns = db.transaction(() => {
    insertTxn.run('TXN001', 'CASH001', 150.50, 'sale', 'Customer purchase - groceries');
    insertTxn.run('TXN002', 'CASH001', 89.99, 'sale', 'Customer purchase - electronics');
    insertTxn.run('TXN003', 'CASH002', 234.75, 'sale', 'Customer purchase - clothing');
    insertTxn.run('TXN004', 'CASH002', 45.20, 'refund', 'Product return - damaged item');
    insertTxn.run('TXN005', 'CASH001', 312.80, 'sale', 'Customer purchase - home goods');
  });

  insertTxns(); 
};

export default db;
