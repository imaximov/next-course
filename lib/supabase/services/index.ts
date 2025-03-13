import { SupabaseMealService, ValidationErrors } from './meal-service';
import { SupabaseMealRepository } from './meal-repository';
import { StorageService } from '../storage-service';

// Create singleton instances
const supabaseMealService = new SupabaseMealService();
const storageService = new StorageService();

// Export all services and repositories
export {
  SupabaseMealService,
  SupabaseMealRepository,
  StorageService,
  supabaseMealService,
  storageService
};

// Export types
export type { ValidationErrors }; 