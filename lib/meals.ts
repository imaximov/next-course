import { Meal, MealFormData } from '../types/meals';
import { mealService } from './db/services';

// Set this to true to test the error page
const shouldThrowError = false;

/**
 * Get all meals
 * This is a wrapper around the service layer to maintain backward compatibility
 */
export async function getMeals(): Promise<Meal[]> {
  // Artificial delay for demonstration
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (shouldThrowError) {
    throw new Error('Failed to fetch meals. This is a test error.');
  }

  return mealService.getAllMeals();
}

/**
 * Get a meal by slug
 * This is a wrapper around the service layer to maintain backward compatibility
 */
export async function getMeal(slug: string): Promise<Meal | undefined> {
  // Artificial delay for demonstration
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (shouldThrowError) {
    throw new Error('Failed to fetch meal. This is a test error.');
  }

  return mealService.getMealBySlug(slug);
}

/**
 * Save a meal
 * This is a wrapper around the service layer to maintain backward compatibility
 */
export async function saveMeal(meal: MealFormData): Promise<void> {
  await mealService.createMeal(meal);
} 