'use client';

import React, { useRef, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import classes from './image-picker.module.css';

interface ImagePickerProps {
  label: string;
  name: string;
  defaultImage?: string;
}

interface PickedImage {
  url: string;
  name: string;
}

const ImagePicker = ({ label, name, defaultImage }: ImagePickerProps) => {
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePickClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setPickedImage(null);
      return;
    }

    // Hide warning when an image is selected
    setShowWarning(false);
    
    const fileReader = new FileReader();
    
    fileReader.onload = () => {
      setPickedImage({
        url: fileReader.result as string,
        name: file.name
      });
    };
    
    fileReader.readAsDataURL(file);
  };

  return (
    <div className={classes.controls} id="image-picker-section">
      <div className={`${classes.preview} ${showWarning ? classes.warning : ''}`}>
        {!pickedImage && (
          <p className={showWarning ? classes.warningText : ''}>
            {showWarning ? 'Please select an image!' : 'No image picked yet.'}
          </p>
        )}
        {pickedImage && (
          <Image 
            src={pickedImage.url} 
            alt={pickedImage.name}
            fill
          />
        )}
      </div>
      <div className={classes.picker}>
        <label htmlFor={name}>{label}</label>
        <input 
          className={classes.input}
          type="file" 
          id={name} 
          name={name}
          accept="image/png, image/jpeg, image/webp"
          ref={imageInputRef}
          onChange={handleImageChange}
          onInvalid={() => setShowWarning(true)}
          required
        />
        <button 
          className={`${classes.button} ${showWarning ? classes.warningButton : ''}`} 
          type="button" 
          onClick={() => {
            handlePickClick();
            if (!pickedImage) {
              setShowWarning(true);
            }
          }}
        >
          {showWarning ? 'Please Pick an Image!' : 'Pick an Image'}
        </button>
        {showWarning && (
          <p className={classes.warningMessage}>
            An image is required for your meal!
          </p>
        )}
      </div>
    </div>
  );
};

export default ImagePicker; 