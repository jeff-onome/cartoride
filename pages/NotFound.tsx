import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background text-center px-4">
      <div>
        <h1 className="text-6xl font-extrabold text-accent">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-foreground">Page Not Found</h2>
        <p className="mt-2 text-lg text-muted-foreground">Sorry, we couldn't find the page you're looking for.</p>
        <Link to="/" className="mt-8 inline-block bg-accent text-accent-foreground font-bold py-3 px-6 rounded-md hover:bg-accent/90 transition-colors duration-300">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;