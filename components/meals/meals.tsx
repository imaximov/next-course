import { getMeals } from '@/lib/meals';
import MealsGrid from './meal-grid/meals-grid';

export default async function Meals() {
  const meals = await getMeals();
  
  return <MealsGrid meals={meals} />;
} 