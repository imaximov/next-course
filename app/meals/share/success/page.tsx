import React from 'react';
import Link from 'next/link';
import classes from './page.module.css';

export default function SuccessPage() {
  return (
    <div className={classes.success}>
      <h1>Meal Shared Successfully!</h1>
      <p>Your meal has been shared with the community.</p>
      <p>
        <Link href="/meals">Back to Meals</Link>
      </p>
    </div>
  );
} 