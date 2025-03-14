import classes from './page.module.css';
import RevalidateLink from './revalidate-link';

export default function SuccessPage() {
  return (
    <div className={classes.success}>
      <h1>Meal Shared Successfully!</h1>
      <p>Your meal has been shared with the community.</p>
      <p>
        <RevalidateLink>Back to Meals</RevalidateLink>
      </p>
    </div>
  );
} 