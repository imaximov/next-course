import { BaseRepository } from '../base-repository';
import { executeTransaction } from '../connection';
import { Meal, MealFormData } from '@/types/meals';
import fs from 'node:fs';
import path from 'path';
import slugify from 'slugify';
import xss from 'xss';

/**
 * Repository for meal-related database operations
 */
export class MealRepository extends BaseRepository<Meal> {
  constructor() {
    super('meals');
  }
  
  /**
   * Find a meal by its slug
   */
  async findBySlug(slug: string): Promise<Meal | undefined> {
    return this.findOneByField('slug', slug);
  }
  
  /**
   * Check if a slug already exists
   */
  async slugExists(slug: string): Promise<boolean> {
    return this.existsByField('slug', slug);
  }
  
  /**
   * Generate a unique slug based on a title
   */
  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title, { 
      lower: true,
      strict: true,
      trim: true
    });
    
    let counter = 1;
    let uniqueSlug = baseSlug;
    
    // If the slug exists, append a number to make it unique
    while (await this.slugExists(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }
  
  /**
   * Save a meal with its image
   */
  async saveMeal(mealData: MealFormData): Promise<Meal> {
    // Generate a unique slug from the title
    const slug = await this.generateUniqueSlug(mealData.title);
    
    // Sanitize instructions
    const sanitizedInstructions = xss(mealData.instructions, {
      whiteList: {
        br: [],         // Allow <br> tags
        p: [],          // Allow <p> tags
        ul: [],         // Allow <ul> tags
        li: [],         // Allow <li> tags
        ol: [],         // Allow <ol> tags
        em: [],         // Allow <em> tags
        strong: []      // Allow <strong> tags
      }
    });
    
    // Get the image file extension
    const extension = mealData.image.name.split('.').pop();
    const fileName = `${slug}.${extension}`;
    const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
    const publicImagePath = `/images/${fileName}`;
    
    // Save the image and meal in a transaction
    return executeTransaction(async (db) => {
      try {
        // Save the image
        const bufferedImage = await mealData.image.arrayBuffer();
        await this.saveImageFile(imagePath, Buffer.from(bufferedImage));
        
        // Prepare meal data
        const meal: Omit<Meal, 'id'> = {
          title: xss(mealData.title),
          slug,
          image: publicImagePath,
          summary: xss(mealData.summary),
          instructions: sanitizedInstructions,
          creator: xss(mealData.creator),
          creator_email: xss(mealData.creator_email)
        };
        
        // Insert the meal into the database
        try {
          const mealId = await this.create(meal);
          return { ...meal, id: mealId };
        } catch (dbError: any) {
          // If database operation fails, clean up the saved image
          this.deleteImageFile(imagePath);
          
          // Check if it's a UNIQUE constraint error on the slug
          if (dbError.message.includes('UNIQUE constraint failed: meals.slug')) {
            throw new Error('A meal with this title already exists. Please choose a different title.');
          }
          
          throw new Error(`Database error: ${dbError.message}`);
        }
      } catch (error: any) {
        // Clean up any partially written file if it exists
        this.deleteImageFile(imagePath);
        
        // Re-throw the error to be handled by the caller
        throw new Error(`Failed to save meal: ${error.message}`);
      }
    });
  }
  
  /**
   * Save an image file to the filesystem
   */
  private async saveImageFile(filePath: string, data: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a stream to save the image
      const stream = fs.createWriteStream(filePath);
      
      // Handle stream errors
      stream.on('error', (error) => {
        console.error('Error writing image file:', error);
        reject(new Error(`Failed to save image: ${error.message}`));
      });
      
      // Handle successful completion
      stream.on('finish', () => {
        resolve();
      });
      
      // Write the image to the file system
      stream.write(data, (error) => {
        if (error) {
          console.error('Error during write operation:', error);
          reject(new Error(`Failed to write image data: ${error.message}`));
        }
      });
      
      stream.end();
    });
  }
  
  /**
   * Delete an image file from the filesystem
   */
  private deleteImageFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }
  }
} 