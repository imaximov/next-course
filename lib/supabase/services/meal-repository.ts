import { SupabaseBaseRepository } from '../base-repository';
import { Meal, MealFormData } from '@/types/meals';
import { StorageService } from '../storage-service';
import slugify from 'slugify';
import xss from 'xss';

/**
 * Repository for meal-related operations using Supabase
 */
export class SupabaseMealRepository extends SupabaseBaseRepository<Meal> {
  private storageService: StorageService;
  
  constructor() {
    super('meals');
    this.storageService = new StorageService('meal-images');
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
    try {
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
      const imagePath = `meals/${fileName}`;
      
      // Upload the image to Supabase Storage
      const imageUrl = await this.storageService.uploadFile(mealData.image, imagePath);
      
      // Prepare meal data
      const meal: Omit<Meal, 'id'> = {
        title: xss(mealData.title),
        slug,
        image: imageUrl,
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
        await this.storageService.deleteFile(imagePath);
        
        // Check if it's a unique constraint error
        if (dbError.message.includes('duplicate key value violates unique constraint')) {
          throw new Error('A meal with this title already exists. Please choose a different title.');
        }
        
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (error: any) {
      // Re-throw the error to be handled by the caller
      throw new Error(`Failed to save meal: ${error.message}`);
    }
  }
} 