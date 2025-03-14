'use client';

import React, { useState, useRef, useEffect } from 'react';
import classes from './delete-confirmation-modal.module.css';

interface DeleteConfirmationModalProps {
  title: string;
  onConfirm: (passKey: string) => void;
  onCancel: () => void;
  isDeleting: boolean;
  error: string | null;
}

export default function DeleteConfirmationModal({
  title,
  onConfirm,
  onCancel,
  isDeleting,
  error
}: DeleteConfirmationModalProps) {
  const [passKey, setPassKey] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Add event listener for escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    // Add event listener for clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onCancel]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onConfirm(passKey);
  };

  return (
    <div className={classes.overlay}>
      <div className={classes.modal} ref={modalRef}>
        <h2 className={classes.title}>Delete Meal</h2>
        <p className={classes.message}>
          Are you sure you want to delete <strong>{title}</strong>?
        </p>
        <p className={classes.info}>
          This meal will be hidden from the public view but can be restored by an administrator.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={classes.formGroup}>
            <label htmlFor="passKey" className={classes.label}>
              Enter pass key to confirm:
            </label>
            <input
              ref={inputRef}
              type="password"
              id="passKey"
              value={passKey}
              onChange={(e) => setPassKey(e.target.value)}
              className={classes.input}
              disabled={isDeleting}
              placeholder="Enter pass key"
              required
            />
          </div>

          {error && <p className={classes.error}>{error}</p>}

          <div className={classes.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={classes.cancelButton}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={classes.deleteButton}
              disabled={isDeleting || !passKey.trim()}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 