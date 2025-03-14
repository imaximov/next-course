'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import classes from './page.module.css';
import ImagePicker from '@/app/meals/image-picker';
import { shareMeal } from './actions';

interface FormState {
  success: boolean;
  errors: {
    title?: string;
    summary?: string;
    instructions?: string;
    creator?: string;
    creator_email?: string;
    image?: string;
    general?: string;
  };
  redirect?: boolean;
  values?: {
    title: string;
    summary: string;
    instructions: string;
    creator: string;
    creator_email: string;
    imageUrl?: string;
  };
}

export default function ShareMealPage() {
  const router = useRouter();
  const [formState, formAction] = useActionState<FormState, FormData>(
    shareMeal, 
    { success: false, errors: {} }
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Custom form submission handler
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check if we have an image file
    const form = event.currentTarget;
    const imageInput = form.querySelector('input[name="image"]') as HTMLInputElement;
    
    if (!imageInput.files || imageInput.files.length === 0) {
      // If no file is selected, show an error
      setImageError('Please select an image for your meal. Your meal looks best with a nice picture!');
      // Scroll to the image picker section
      const imagePicker = document.getElementById('image-picker-section');
      if (imagePicker) {
        imagePicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Clear any previous image error
    setImageError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(form);
      
      // Submit the form with the form data
      await formAction(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle redirect and errors
  useEffect(() => {
    if (formState.redirect) {
      router.push('/meals/share/success');
    }
    
    if (formState.errors?.general) {
      setError(formState.errors.general);
    } else {
      setError(null);
    }
    
    if (formState.errors?.image) {
      setImageError(formState.errors.image);
      // Scroll to the image picker section when there's an image error
      const imagePicker = document.getElementById('image-picker-section');
      if (imagePicker) {
        imagePicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [formState, router]);

  return (
    <>
      <header className={classes.header}>
        <h1>
          Share your <span className={classes.highlight}>favorite meal</span>
        </h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        {error && (
          <div className={classes.errorBox}>
            <p>{error}</p>
          </div>
        )}
        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.row}>
            <p>
              <label htmlFor="name">Your name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                defaultValue={formState.values?.creator || ''}
              />
              {formState.errors?.creator && (
                <span className={classes.error}>{formState.errors.creator}</span>
              )}
            </p>
            <p>
              <label htmlFor="email">Your email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                defaultValue={formState.values?.creator_email || ''}
              />
              {formState.errors?.creator_email && (
                <span className={classes.error}>{formState.errors.creator_email}</span>
              )}
            </p>
          </div>
          <p>
            <label htmlFor="title">Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              defaultValue={formState.values?.title || ''}
            />
            {formState.errors?.title && (
              <span className={classes.error}>{formState.errors.title}</span>
            )}
          </p>
          <p>
            <label htmlFor="summary">Short Summary</label>
            <input 
              type="text" 
              id="summary" 
              name="summary" 
              required 
              defaultValue={formState.values?.summary || ''}
            />
            {formState.errors?.summary && (
              <span className={classes.error}>{formState.errors.summary}</span>
            )}
          </p>
          <p>
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              rows={10}
              required
              defaultValue={formState.values?.instructions || ''}
            ></textarea>
            {formState.errors?.instructions && (
              <span className={classes.error}>{formState.errors.instructions}</span>
            )}
          </p>
          <ImagePicker 
            label="Your meal image" 
            name="image" 
            defaultImage={formState.values?.imageUrl}
          />
          {imageError && (
            <div className={classes.errorBox} style={{ marginTop: '0.5rem' }}>
              <p>{imageError}</p>
            </div>
          )}
          <p className={classes.actions}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Share Meal'}
            </button>
          </p>
        </form>
      </main>
    </>
  );
} 