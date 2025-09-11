import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string; // Allows us to add extra custom styles if needed
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    // We combine our base card styles with any extra classes passed in.
    // - bg-surface: Uses our custom card background color.
    // - rounded-xl: This gives us that nice, subtle roundness you wanted. (xl is a bit larger than lg)
    // - shadow-lg: Adds a soft, modern shadow for depth.
    // - p-6: Provides consistent internal padding.
    <div className={`bg-surface rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;