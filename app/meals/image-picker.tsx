'use client';

import { useRef, useState, ChangeEvent, useEffect } from 'react';
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
  file?: File;
}

// Function to resize an image to reduce its file size
// This function uses browser APIs and should only run on the client
const resizeImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<File> => {
  // Only run this function in the browser
  if (typeof window === 'undefined') {
    return file; // Return the original file on the server
  }

  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      // Create canvas and resize image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          
          // Create new file from blob
          const resizedFile = new File(
            [blob],
            file.name,
            { type: 'image/jpeg', lastModified: Date.now() }
          );
          
          resolve(resizedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error loading image'));
    };
  });
};

const ImagePicker = ({ label, name, defaultImage }: ImagePickerProps) => {
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Initialize with defaultImage if provided
  useEffect(() => {
    if (defaultImage) {
      setPickedImage({
        url: defaultImage,
        name: 'Default Image'
      });
    }
  }, [defaultImage]);

  const handlePickClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // Only run in the browser
    if (!isBrowser) return;

    const file = event.target.files?.[0];
    
    if (!file) {
      setPickedImage(null);
      return;
    }

    // Hide warning when an image is selected
    setShowWarning(false);
    setConversionError(null);
    setIsConverting(true);
    
    try {
      // Check if the file is a HEIC/HEIF format (common for iPhone photos)
      const isHeic = file.type === 'image/heic' || 
                    file.type === 'image/heif' || 
                    file.name.toLowerCase().endsWith('.heic') || 
                    file.name.toLowerCase().endsWith('.heif');
      
      let processedFile: File;
      
      if (isHeic) {
        try {
          // Dynamically import heic2any only when needed
          const heic2any = (await import('heic2any')).default;
          
          // Convert HEIC/HEIF to JPEG using heic2any
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          }) as Blob;
          
          // Create a new File from the converted Blob
          const convertedFile = new File(
            [convertedBlob], 
            file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
            { type: 'image/jpeg' }
          );
          
          // Resize the converted image to reduce file size
          processedFile = await resizeImage(convertedFile, 1920, 1080, 0.8);
        } catch (error) {
          console.error('Error converting HEIC/HEIF image:', error);
          setConversionError('Failed to convert iPhone image format. Please try a different image or convert it to JPEG/PNG first.');
          setIsConverting(false);
          return;
        }
      } else {
        // For non-HEIC files, just resize them to ensure they're not too large
        try {
          processedFile = await resizeImage(file, 1920, 1080, 0.8);
        } catch (error) {
          console.error('Error resizing image:', error);
          // If resizing fails, use the original file
          processedFile = file;
        }
      }
      
      // Create a URL for the processed image
      const url = typeof URL !== 'undefined' ? URL.createObjectURL(processedFile) : '';
      
      setPickedImage({
        url,
        name: processedFile.name,
        file: processedFile
      });
      
      // Update the hidden file input with the processed file
      if (hiddenFileInputRef.current && typeof DataTransfer !== 'undefined') {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(processedFile);
        hiddenFileInputRef.current.files = dataTransfer.files;
      }
      
      console.log(`Processed image size: ${Math.round(processedFile.size / 1024)}KB`);
      
      setIsConverting(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setShowWarning(true);
      setIsConverting(false);
    }
  };

  return (
    <div className={classes.controls} id="image-picker-section">
      <div className={`${classes.preview} ${showWarning || conversionError ? classes.warning : ''}`}>
        {!pickedImage && !isConverting && !conversionError && (
          <p className={showWarning ? classes.warningText : ''}>
            {showWarning ? 'Please select an image!' : 'No image picked yet.'}
          </p>
        )}
        {isConverting && (
          <p>Processing image...</p>
        )}
        {conversionError && (
          <p className={classes.warningText}>{conversionError}</p>
        )}
        {pickedImage && pickedImage.url && (
          <Image 
            src={pickedImage.url} 
            alt={pickedImage.name}
            fill
            sizes="(max-width: 480px) 100vw, 10rem"
            quality={80}
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
          accept="image/png, image/jpeg, image/webp, image/heic, image/heif, .heic, .heif"
          ref={imageInputRef}
          onChange={handleImageChange}
          onInvalid={() => setShowWarning(true)}
          required
        />
        {/* Hidden input to store the converted file for form submission */}
        <input 
          type="file" 
          name={name} 
          ref={hiddenFileInputRef} 
          style={{ display: 'none' }} 
        />
        <button 
          className={`${classes.button} ${showWarning || conversionError ? classes.warningButton : ''}`} 
          type="button" 
          onClick={() => {
            handlePickClick();
            if (!pickedImage && !isConverting) {
              setShowWarning(true);
            }
          }}
          disabled={isConverting}
        >
          {isConverting ? 'Processing...' : 
           showWarning || conversionError ? 'Please Pick an Image!' : 'Pick an Image'}
        </button>
        {showWarning && (
          <p className={classes.warningMessage}>
            An image is required for your meal!
          </p>
        )}
        <p className={classes.supportedFormats}>
          Supported formats: JPEG, PNG, WebP, HEIC/HEIF (iPhone photos)
        </p>
        <p className={classes.note}>
          iPhone photos (HEIC/HEIF) will be automatically converted and optimized.
        </p>
      </div>
    </div>
  );
};

export default ImagePicker; 