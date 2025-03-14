'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import classes from './page.module.css';
import { revalidateMealsCache } from './actions';

interface RevalidateLinkProps {
  children: ReactNode;
}

export default function RevalidateLink({ children }: RevalidateLinkProps) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      // Trigger the server action to revalidate the cache
      await revalidateMealsCache();
      
      // Navigate to the meals page
      router.push('/meals');
    } catch (error) {
      console.error('Failed to revalidate cache:', error);
      // If revalidation fails, still navigate to the meals page
      router.push('/meals');
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={classes.link}
      aria-label="Back to Meals"
    >
      {children}
    </button>
  );
} 