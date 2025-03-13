# Database Service Layer

This directory contains the database service layer for the Foodies application. It provides a clean separation of concerns between the application logic and the database operations.

## Structure

- `connection.ts`: Manages the database connection with connection pooling and error handling.
- `base-repository.ts`: Provides a base repository class with common database operations.
- `services/`: Contains service classes for different entities.
  - `meal-repository.ts`: Repository for meal-related database operations.
  - `meal-service.ts`: Service for meal-related business logic.
  - `index.ts`: Exports all services and repositories.

## Usage

### Connection Management

The database connection is managed as a singleton to ensure efficient connection pooling:

```typescript
import { getDbConnection, closeDbConnection } from './connection';

// Get the database connection
const db = getDbConnection();

// Close the connection when the application is shutting down
closeDbConnection();
```

### Transactions

Transactions are supported through the `executeTransaction` function:

```typescript
import { executeTransaction } from './connection';

const result = executeTransaction((db) => {
  // Perform database operations within a transaction
  // All operations will be rolled back if an error occurs
  return db.prepare('INSERT INTO ...').run();
});
```

### Using Services

Services provide a high-level API for business operations:

```typescript
import { mealService } from './services';

// Get all meals
const meals = await mealService.getAllMeals();

// Get a meal by slug
const meal = await mealService.getMealBySlug('some-slug');

// Create a new meal
await mealService.createMeal(mealData);
```

## Error Handling

The service layer includes comprehensive error handling:

1. Database connection errors are caught and logged.
2. Transaction errors trigger automatic rollback.
3. Repository operations include try/catch blocks with detailed error messages.
4. Services validate input data before performing operations.

## Benefits

- **Separation of Concerns**: Database logic is separated from application logic.
- **Code Reusability**: Common database operations are implemented once in the base repository.
- **Error Handling**: Consistent error handling across all database operations.
- **Connection Pooling**: Efficient database connection management.
- **Transactions**: Support for atomic operations.
- **Testability**: Services and repositories can be easily mocked for testing. 