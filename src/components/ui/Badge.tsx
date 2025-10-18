interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  const variantClasses = {
    success: 'bg-success/10 text-success',
    warning: 'bg-yellow-500/10 text-yellow-600',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-primary/10 text-primary',
    default: 'bg-gray-500/10 text-text-secondary',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

export default Badge;
