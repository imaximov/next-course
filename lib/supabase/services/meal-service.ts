import { Meal, MealFormData } from '@/types/meals';
import { SupabaseMealRepository } from './meal-repository';
import { StorageService } from '../storage-service';

/**
 * Type for validation errors
 */
export interface ValidationErrors {
  title?: string;
  summary?: string;
  instructions?: string;
  creator?: string;
  creator_email?: string;
  image?: string;
  general?: string;
}

/**
 * Service for meal-related business logic using Supabase
 */
export class SupabaseMealService {
  private repository: SupabaseMealRepository;
  
  constructor() {
    this.repository = new SupabaseMealRepository();
  }
  
  /**
   * Get all meals
   */
  async getAllMeals(): Promise<Meal[]> {
    try {
      // Get all meals that are not soft-deleted
      const meals = await this.repository.findAll();
      return meals.filter(meal => !meal.is_deleted);
    } catch (error) {
      console.error('Error getting all meals:', error);
      throw new Error('Failed to retrieve meals');
    }
  }
  
  /**
   * Get a meal by slug
   */
  async getMealBySlug(slug: string): Promise<Meal | undefined> {
    if (!slug) {
      throw new Error('Slug is required');
    }
    
    try {
      const meal = await this.repository.findBySlug(slug);
      
      // Return undefined if the meal is soft-deleted
      if (meal && meal.is_deleted) {
        return undefined;
      }
      
      return meal;
    } catch (error) {
      console.error(`Error getting meal by slug ${slug}:`, error);
      throw new Error(`Failed to retrieve meal with slug ${slug}`);
    }
  }
  
  /**
   * Create a new meal
   */
  async createMeal(mealData: MealFormData): Promise<Meal> {
    // Validate the meal data
    const errors = this.validateMealData(mealData);
    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }
    
    try {
      return await this.repository.saveMeal(mealData);
    } catch (error: any) {
      console.error('Error creating meal:', error);
      throw new Error(`Failed to create meal: ${error.message}`);
    }
  }
  
  /**
   * Validate meal data
   */
  private validateMealData(data: MealFormData): ValidationErrors {
    const errors: ValidationErrors = {};
    
    // Title validation
    if (!data.title || data.title.trim() === '') {
      errors.title = 'Title is required';
    } else if (data.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (data.title.length > 100) {
      errors.title = 'Title must be at most 100 characters long';
    }
    
    // Summary validation
    if (!data.summary || data.summary.trim() === '') {
      errors.summary = 'Summary is required';
    } else if (data.summary.length < 10) {
      errors.summary = 'Summary must be at least 10 characters long';
    } else if (data.summary.length > 500) {
      errors.summary = 'Summary must be at most 500 characters long';
    }
    
    // Instructions validation
    if (!data.instructions || data.instructions.trim() === '') {
      errors.instructions = 'Instructions are required';
    } else if (data.instructions.length < 10) {
      errors.instructions = 'Instructions must be at least 10 characters long';
    } else if (data.instructions.length > 5000) {
      errors.instructions = 'Instructions must be at most 5000 characters long';
    }
    
    // Creator validation
    if (!data.creator || data.creator.trim() === '') {
      errors.creator = 'Creator name is required';
    } else if (data.creator.length < 3) {
      errors.creator = 'Creator name must be at least 3 characters long';
    } else if (data.creator.length > 50) {
      errors.creator = 'Creator name must be at most 50 characters long';
    }
    
    // Creator email validation
    if (!data.creator_email || data.creator_email.trim() === '') {
      errors.creator_email = 'Creator email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.creator_email)) {
      errors.creator_email = 'Creator email must be a valid email address';
    }
    
    // Image validation
    if (!data.image) {
      errors.image = 'Image is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.image.type)) {
        errors.image = 'Image must be a JPEG, PNG, or WebP file';
      } else if (data.image.size > 5 * 1024 * 1024) {
        errors.image = 'Image must be smaller than 5MB';
      }
    }
    
    return errors;
  }

  /**
   * Delete a meal by ID (soft delete)
   * This marks the meal as deleted without actually removing it from the database
   */
  async deleteMeal(id: number): Promise<void> {
    if (!id) {
      throw new Error('Meal ID is required');
    }
    
    try {
      // First get the meal to check if it exists
      const meal = await this.repository.findById(id);
      
      if (!meal) {
        throw new Error(`Meal with ID ${id} not found`);
      }
      
      // Soft delete the meal by updating the is_deleted flag
      await this.repository.update(id, { is_deleted: true });
    } catch (error) {
      console.error(`Error deleting meal with ID ${id}:`, error);
      throw new Error(`Failed to delete meal: ${(error as Error).message}`);
    }
  }
} 