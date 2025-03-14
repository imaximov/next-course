import Link from 'next/link';
import Image from 'next/image';
import classes from './meal-item.module.css';
import { Meal } from '@/types/meals';
import DeleteMealButton from '../delete-meal-button/delete-meal-button';

type MealItemProps = Pick<Meal, 'id' | 'title' | 'slug' | 'image' | 'summary' | 'creator'>;

export default function MealItem({ id, title, slug, image, summary, creator }: MealItemProps) {
  return (
    <article className={classes.meal}>
      <header>
        <div className={classes.image}>
          <Image 
            src={image} 
            alt={title} 
            fill 
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            quality={85}
            priority={false}
          />
          {id && <DeleteMealButton id={id} title={title} />}
        </div>
        <div className={classes.headerText}>
          <h2>{title}</h2>
          <p>by {creator}</p>
        </div>
      </header>
      <div className={classes.content}>
        <p className={classes.summary}>{summary}</p>
        <div className={classes.actions}>
          <Link href={`/meals/${slug}`}>View Details</Link>
        </div>
      </div>
    </article>
  );
} 