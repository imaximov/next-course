import { supabase } from './client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Base repository class for Supabase operations
 */
export abstract class SupabaseBaseRepository<T> {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Find all records in the table
   */
  async findAll(): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*');
      
      if (error) throw error;
      return data as T[];
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
      return data as T | undefined;
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq(field, value);
      
      if (error) throw error;
      return data as T[];
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq(field, value)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
      return data as T | undefined;
    } catch (error) {
      console.error(`Error finding one record by field in ${this.tableName}:`, error);
      throw new Error(`Failed to retrieve record with ${field} = ${value} from ${this.tableName}`);
    }
  }
  
  /**
   * Insert a record into the table
   */
  async create(data: Partial<T>): Promise<number> {
    try {
      // Use object destructuring to separate id from the rest of the data
      const { id, ...dataWithoutId } = data as any;
      
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(dataWithoutId)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error creating record in ${this.tableName}:`, error);
        throw error;
      }
      
      return result.id as number;
    } catch (error) {
      console.error(`Error creating record in ${this.tableName}:`, error);
      const errorMessage = (error as PostgrestError).message || 'Unknown error';
      throw new Error(`Failed to create record in ${this.tableName}: ${errorMessage}`);
    }
  }
  
  /**
   * Update a record in the table
   */
  async update(id: number, data: Partial<T>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating record in ${this.tableName}:`, error);
      const errorMessage = (error as PostgrestError).message || 'Unknown error';
      throw new Error(`Failed to update record with ID ${id} in ${this.tableName}: ${errorMessage}`);
    }
  }
  
  /**
   * Delete a record from the table
   */
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting record from ${this.tableName}:`, error);
      const errorMessage = (error as PostgrestError).message || 'Unknown error';
      throw new Error(`Failed to delete record with ID ${id} from ${this.tableName}: ${errorMessage}`);
    }
  }
  
  /**
   * Check if a record exists by a field value
   */
  async existsByField(field: string, value: any): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq(field, value);
      
      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error(`Error checking existence by field in ${this.tableName}:`, error);
      throw new Error(`Failed to check if record exists with ${field} = ${value} in ${this.tableName}`);
    }
  }
} 