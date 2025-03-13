import { MealService, ValidationErrors } from './meal-service';
import { MealRepository } from './meal-repository';

// Export all services and repositories
export {
  MealService,
  MealRepository
};

// Export types
export type { ValidationErrors };

// Create singleton instances for services
const mealService = new MealService();

// Export singleton instances
export {
  mealService
}; 