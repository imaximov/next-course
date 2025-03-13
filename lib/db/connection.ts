import Database from 'better-sqlite3';
import path from 'path';

// Database configuration
const DB_PATH = path.join(process.cwd(), 'meals.db');

// Connection options
const CONNECTION_OPTIONS = {
  fileMustExist: true,
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
};

// Singleton instance
let dbInstance: Database.Database | null = null;

/**
 * Get a database connection
 * This implements a singleton pattern to reuse the connection
 */
export function getDbConnection(): Database.Database {
  if (!dbInstance) {
    try {
      dbInstance = new Database(DB_PATH, CONNECTION_OPTIONS);
      
      // Enable foreign keys
      dbInstance.pragma('foreign_keys = ON');
      
      // Configure for better performance
      dbInstance.pragma('journal_mode = WAL');
      
      // Set busy timeout to avoid SQLITE_BUSY errors
      dbInstance.pragma('busy_timeout = 5000');
      
      console.log('Database connection established');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }
  
  return dbInstance;
}

/**
 * Close the database connection
 * This should be called when the application is shutting down
 */
export function closeDbConnection(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
      dbInstance = null;
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

/**
 * Execute a database transaction
 * @param callback Function to execute within the transaction
 * @returns The result of the callback function
 */
export function executeTransaction<T>(callback: (db: Database.Database) => T): T {
  const db = getDbConnection();
  
  try {
    db.prepare('BEGIN').run();
    const result = callback(db);
    db.prepare('COMMIT').run();
    return result;
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('Transaction failed:', error);
    throw error;
  }
} 