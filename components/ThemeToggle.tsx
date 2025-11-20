import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './IconComponents';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
