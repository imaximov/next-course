'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import classes from './delete-meal-button.module.css';
import DeleteConfirmationModal from '../delete-confirmation-modal/delete-confirmation-modal';

interface DeleteMealButtonProps {
  id: number;
  title: string;
}

export default function DeleteMealButton({ id, title }: DeleteMealButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteMeal = async (passKey: string) => {
    if (!passKey.trim()) {
      setError('Pass key is required');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/meals/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, passKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete meal');
      }

      // Close the modal and refresh the page
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        className={classes.deleteButton}
        onClick={handleOpenModal}
        aria-label={`Delete ${title}`}
        tabIndex={0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={classes.icon}>
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
        </svg>
      </button>

      {isModalOpen && (
        <DeleteConfirmationModal
          title={title}
          onConfirm={handleDeleteMeal}
          onCancel={handleCloseModal}
          isDeleting={isDeleting}
          error={error}
        />
      )}
    </>
  );
} 