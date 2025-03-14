'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateMealsCache() {
  // Revalidate the meals page to ensure fresh data
  revalidatePath('/meals');
  return { success: true };
} 