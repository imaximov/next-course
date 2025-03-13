import Database from 'better-sqlite3';
import { getDbConnection, executeTransaction } from './connection';

/**
 * Base repository class that provides common database operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Get the database connection
   */
  protected getDb(): Database.Database {
    return getDbConnection();
  }
  
  /**
   * Find all records in the table
   */
  async findAll(): Promise<T[]> {
    try {
      const db = this.getDb();
      return db.prepare(`SELECT * FROM ${this.tableName}`).all() as T[];
    } catch (error) {
      console.error(`Error finding all records in ${this.tableName}:`, error);
      throw new Error(`Failed to retrieve records from ${this.tableName}`);
    }
  }
  
  /**
   * Find a record by ID
   */
  async findById(id: number): Promise<T | undefined> {
    try {
      const db = this.getDb();
      return db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) as T | undefined;
    } catch (error) {
      console.error(`Error finding record by ID in ${this.tableName}:`, error);
      throw new Error(`Failed to retrieve record with ID ${id} from ${this.tableName}`);
    }
  }
  
  /**
   * Find records by a field value
   */
  async findByField(field: string, value: any): Promise<T[]> {
    try {
      const db = this.getDb();
      return db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`).all(value) as T[];
    } catch (error) {
      console.error(`Error finding records by field in ${this.tableName}:`, error);
      throw new Error(`Failed to retrieve records with ${field} = ${value} from ${this.tableName}`);
    }
  }
  
  /**
   * Find a single record by a field value
   */
  async findOneByField(field: string, value: any): Promise<T | undefined> {
    try {
      const db = this.getDb();
      return db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`).get(value) as T | undefined;
    } catch (error) {
      console.error(`Error finding one record by field in ${this.tableName}:`, error);
      throw new Error(`Failed to retrieve record with ${field} = ${value} from ${this.tableName}`);
    }
  }
  
  /**
   * Insert a record into the table
   */
  async create(data: Partial<T>): Promise<number> {
    return executeTransaction((db) => {
      try {
        // Get the column names from the data object
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(col => (data as any)[col]);
        
        const result = db.prepare(
          `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`
        ).run(...values);
        
        return result.lastInsertRowid as number;
      } catch (error) {
        console.error(`Error creating record in ${this.tableName}:`, error);
        throw new Error(`Failed to create record in ${this.tableName}: ${(error as Error).message}`);
      }
    });
  }
  
  /**
   * Update a record in the table
   */
  async update(id: number, data: Partial<T>): Promise<void> {
    return executeTransaction((db) => {
      try {
        // Get the column names from the data object
        const columns = Object.keys(data);
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const values = [...columns.map(col => (data as any)[col]), id];
        
        db.prepare(
          `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`
        ).run(...values);
      } catch (error) {
        console.error(`Error updating record in ${this.tableName}:`, error);
        throw new Error(`Failed to update record with ID ${id} in ${this.tableName}: ${(error as Error).message}`);
      }
    });
  }
  
  /**
   * Delete a record from the table
   */
  async delete(id: number): Promise<void> {
    return executeTransaction((db) => {
      try {
        db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
      } catch (error) {
        console.error(`Error deleting record from ${this.tableName}:`, error);
        throw new Error(`Failed to delete record with ID ${id} from ${this.tableName}: ${(error as Error).message}`);
      }
    });
  }
  
  /**
   * Check if a record exists by a field value
   */
  async existsByField(field: string, value: any): Promise<boolean> {
    try {
      const db = this.getDb();
      const result = db.prepare(`SELECT 1 FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`).get(value);
      return !!result;
    } catch (error) {
      console.error(`Error checking existence by field in ${this.tableName}:`, error);
      throw new Error(`Failed to check if record exists with ${field} = ${value} in ${this.tableName}`);
    }
  }
} 