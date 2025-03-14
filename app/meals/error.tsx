'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
}

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="error">
      <h1>An error occurred!</h1>
      <p>Failed to fetch meals data. Please try again later.</p>
      {process.env.NODE_ENV !== 'production' && (
        <p><strong>Error details:</strong> {error.message}</p>
      )}
    </div>
  );
} 