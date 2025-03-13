import { Meal, MealFormData } from '@/types/meals';
import { MealRepository } from './meal-repository';

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
 * Service for meal-related operations
 * This layer handles business logic and uses the repository for data access
 */
export class MealService {
  private repository: MealRepository;
  
  constructor() {
    this.repository = new MealRepository();
  }
  
  /**
   * Get all meals
   */
  async getAllMeals(): Promise<Meal[]> {
    try {
      // In a real application, you might want to add caching here
      return await this.repository.findAll();
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
      return await this.repository.findBySlug(slug);
    } catch (error) {
      console.error(`Error getting meal by slug ${slug}:`, error);
      throw new Error(`Failed to retrieve meal with slug ${slug}`);
    }
  }
  
  /**
   * Create a new meal
   */
  async createMeal(mealData: MealFormData): Promise<Meal> {
    // Validate meal data
    const errors = this.validateMealData(mealData);
    
    // If there are validation errors, throw an error
    if (Object.keys(errors).length > 0) {
      throw new Error(
        'Invalid meal data: ' + 
        Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
      );
    }
    
    try {
      return await this.repository.saveMeal(mealData);
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error; // Repository already adds context to the error
    }
  }
  
  /**
   * Validate meal data and return validation errors
   * This can be used by both the service and the server action
   */
  validateMealData(meal: MealFormData): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!meal.title || meal.title.trim().length === 0) {
      errors.title = 'Please provide a title.';
    }
    
    if (!meal.summary || meal.summary.trim().length === 0) {
      errors.summary = 'Please provide a summary.';
    }
    
    if (!meal.instructions || meal.instructions.trim().length === 0) {
      errors.instructions = 'Please provide instructions.';
    }
    
    if (!meal.creator || meal.creator.trim().length === 0) {
      errors.creator = 'Please provide your name.';
    }
    
    if (!meal.creator_email || meal.creator_email.trim().length === 0) {
      errors.creator_email = 'Please provide your email.';
    }
    
    if (!meal.creator_email || !meal.creator_email.includes('@')) {
      errors.creator_email = 'Please provide a valid email address.';
    }
    
    if (!meal.image || !(meal.image instanceof File)) {
      errors.image = 'Please provide an image.';
    } else if (meal.image.size === 0) {
      errors.image = 'Please provide a valid image.';
    }
    
    return errors;
  }
} 