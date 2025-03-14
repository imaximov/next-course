import { Meal, MealFormData } from '../types/meals';
import { supabaseMealService } from './supabase/services';
import { unstable_cache } from 'next/cache';

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

  // Use unstable_cache with a short revalidation time to ensure fresh data
  const getCachedMeals = unstable_cache(
    async () => supabaseMealService.getAllMeals(),
    ['meals-data'],
    { revalidate: 10 } // Revalidate every 10 seconds
  );

  return getCachedMeals();
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

  // Use unstable_cache with a short revalidation time to ensure fresh data
  const getCachedMeal = unstable_cache(
    async () => supabaseMealService.getMealBySlug(slug),
    [`meal-data-${slug}`, 'meals-data'],
    { revalidate: 10 } // Revalidate every 10 seconds
  );

  return getCachedMeal();
}

/**
 * Save a meal
 * This is a wrapper around the service layer to maintain backward compatibility
 */
export async function saveMeal(meal: MealFormData): Promise<void> {
  await supabaseMealService.createMeal(meal);
}

/**
 * Delete a meal by ID
 * This is a wrapper around the service layer to maintain backward compatibility
 */
export async function deleteMeal(id: number): Promise<void> {
  await supabaseMealService.deleteMeal(id);
} 