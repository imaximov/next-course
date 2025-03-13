'use client';

import React, { useRef, useState, ChangeEvent, useEffect } from 'react';
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
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Set default image if provided
  useEffect(() => {
    if (defaultImage) {
      setPickedImage({
        url: defaultImage,
        name: 'Previously uploaded image'
      });
    }
  }, [defaultImage]);

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
    <div className={classes.controls}>
      <div className={classes.preview}>
        {!pickedImage && <p>No image picked yet.</p>}
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
          accept="image/png, image/jpeg"
          ref={imageInputRef}
          onChange={handleImageChange}
          required
        />
        <button 
          className={classes.button} 
          type="button" 
          onClick={handlePickClick}
        >
          Pick an Image
        </button>
      </div>
    </div>
  );
};

export default ImagePicker; 