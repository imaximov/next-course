'use client';

import React, { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
}

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Share Meal'}
    </button>
  );
}

export default function ShareMealPage() {
  const router = useRouter();
  const [formState, formAction] = useActionState<FormState, FormData>(
    shareMeal, 
    { success: true, errors: {} }
  );
  const [error, setError] = useState<string | null>(null);

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
        <form className={classes.form} action={formAction}>
          <div className={classes.row}>
            <p>
              <label htmlFor="name">Your name</label>
              <input type="text" id="name" name="name" required />
              {formState.errors?.creator && (
                <span className={classes.error}>{formState.errors.creator}</span>
              )}
            </p>
            <p>
              <label htmlFor="email">Your email</label>
              <input type="email" id="email" name="email" required />
              {formState.errors?.creator_email && (
                <span className={classes.error}>{formState.errors.creator_email}</span>
              )}
            </p>
          </div>
          <p>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" required />
            {formState.errors?.title && (
              <span className={classes.error}>{formState.errors.title}</span>
            )}
          </p>
          <p>
            <label htmlFor="summary">Short Summary</label>
            <input type="text" id="summary" name="summary" required />
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
            ></textarea>
            {formState.errors?.instructions && (
              <span className={classes.error}>{formState.errors.instructions}</span>
            )}
          </p>
          <ImagePicker label="Your meal image" name="image" />
          {formState.errors?.image && (
            <span className={classes.error}>{formState.errors.image}</span>
          )}
          <p className={classes.actions}>
            <SubmitButton />
          </p>
        </form>
      </main>
    </>
  );
} 