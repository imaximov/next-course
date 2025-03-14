import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMeal } from '@/lib/meals';
import classes from './page.module.css';

interface MealDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MealDetailsPage({ params }: MealDetailsPageProps) {
  const resolvedParams = await params;
  const meal = await getMeal(resolvedParams.slug);

  if (!meal) {
    notFound();
  }

  // Convert newlines to <br> tags - this is safe because the content is already sanitized
  meal.instructions = meal.instructions.replace(/\n/g, '<br />');

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image 
            src={meal.image} 
            alt={meal.title} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
            priority={true}
          />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
          </p>
          <p className={classes.summary}>{meal.summary}</p>
        </div>
      </header>
      <main>
        <div 
          className={classes.instructions}
          dangerouslySetInnerHTML={{
            __html: meal.instructions
          }}
        />
      </main>
    </>
  );
} 