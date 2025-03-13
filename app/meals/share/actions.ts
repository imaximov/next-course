'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import xss from 'xss';
import { MealFormData } from '@/types/meals';
import { supabaseMealService } from '@/lib/supabase/services';
import type { ValidationErrors } from '@/lib/supabase/services';

interface FormState {
  success: boolean;
  errors: ValidationErrors;
  redirect?: boolean;
}

export async function shareMeal(prevState: FormState, formData: FormData): Promise<FormState> {
  // Extract form data and sanitize text inputs
  const meal = {
    title: xss(formData.get('title') as string),
    summary: xss(formData.get('summary') as string),
    instructions: xss(formData.get('instructions') as string),
    image: formData.get('image') as File,
    creator: xss(formData.get('name') as string),
    creator_email: xss(formData.get('email') as string),
  };

  try {
    // Save the meal using the Supabase service
    await supabaseMealService.createMeal(meal);

    // Revalidate the meals page to show the new meal
    revalidatePath('/meals');

    // On success, return a success state with a redirect flag
    return {
      success: true,
      errors: {},
      redirect: true
    };
  } catch (error: any) {
    // Handle errors from the service
    console.error('Error saving meal:', error);

    // Try to parse error message if it's a JSON string (validation errors)
    let errors: ValidationErrors = {};
    try {
      errors = JSON.parse(error.message);
    } catch {
      // If not a JSON string, check for specific error messages
      if (error.message.includes('A meal with this title already exists')) {
        errors = {
          title: 'A meal with this title already exists. Please choose a different title.',
          general: 'Failed to save meal due to duplicate title.'
        };
      } else {
        errors = {
          general: `Failed to save meal: ${error.message}`
        };
      }
    }

    return {
      success: false,
      errors
    };
  }
} 