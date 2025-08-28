const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          loading-spinner 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
      />
      {text && (
        <span className="ml-3 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
