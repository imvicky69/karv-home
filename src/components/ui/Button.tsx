import { type ReactNode } from 'react';
import { type IconType } from 'react-icons';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: IconType;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon: Icon,
  fullWidth = false,
  type = 'button',
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-md',
    secondary: 'bg-white text-text-primary border border-gray-300 hover:bg-gray-50',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-6 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center font-semibold rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {Icon && <Icon className="mr-2" size={20} />}
      {children}
    </button>
  );
};

export default Button;
