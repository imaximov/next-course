import { StaticImageData } from 'next/image';

export interface Meal {
  id?: number;
  title: string;
  slug: string;
  image: string | StaticImageData;
  summary: string;
  instructions: string;
  creator: string;
  creator_email: string;
}

export interface MealFormData {
  title: string;
  image: File;
  summary: string;
  instructions: string;
  creator: string;
  creator_email: string;
} 