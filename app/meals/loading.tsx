import React from 'react';
import classes from './page.module.css';

export default function MealsLoadingPage() {
  return (
    <div className={classes.loading}>
      <p>Fetching meals...</p>
    </div>
  );
} 