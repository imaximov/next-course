import { NextRequest, NextResponse } from 'next/server';
import { supabaseMealService } from '@/lib/supabase/services';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { id, passKey } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Meal ID is required' },
        { status: 400 }
      );
    }

    if (!passKey) {
      return NextResponse.json(
        { error: 'Pass key is required' },
        { status: 400 }
      );
    }

    // Validate the pass key
    const correctPassKey = process.env.DELETE_MEAL_PASS_KEY;
    if (!correctPassKey) {
      console.error('DELETE_MEAL_PASS_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (passKey !== correctPassKey) {
      return NextResponse.json(
        { error: 'Invalid pass key' },
        { status: 403 }
      );
    }

    // Delete the meal (soft delete)
    await supabaseMealService.deleteMeal(id);
    
    // Revalidate the meals page to reflect the changes
    revalidatePath('/meals');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting meal:', error);
    return NextResponse.json(
      { error: `Failed to delete meal: ${error.message}` },
      { status: 500 }
    );
  }
} 