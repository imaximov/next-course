import { supabase, supabaseAdmin } from './client';

/**
 * Service for handling file storage operations with Supabase Storage
 */
export class StorageService {
  private bucketName: string;
  
  constructor(bucketName: string = 'meal-images') {
    this.bucketName = bucketName;
  }
  
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Upload to Supabase Storage using admin client to bypass RLS
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(path, arrayBuffer, {
          contentType: file.type,
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([path]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Check if a file exists in Supabase Storage
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      // List files with the given path as a prefix
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });
      
      if (error) throw error;
      
      // If the file exists, the data array will contain at least one item
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking if file exists in Supabase Storage:', error);
      throw new Error(`Failed to check if file exists: ${(error as Error).message}`);
    }
  }
} 