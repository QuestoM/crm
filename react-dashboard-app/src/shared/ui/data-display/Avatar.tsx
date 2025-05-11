import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  square?: boolean;
  className?: string;
  fallbackColor?: string;
}

/**
 * Avatar component for user profile pictures or initials
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  square = false,
  className = '',
  fallbackColor = 'bg-gray-400',
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  // Status classes
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  // Shape classes
  const shapeClass = square ? 'rounded-md' : 'rounded-full';

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Status indicator position based on size
  const getStatusSize = (): string => {
    switch (size) {
      case 'xs':
        return 'h-1.5 w-1.5 -right-0.5 -bottom-0.5';
      case 'sm':
        return 'h-2 w-2 -right-0.5 -bottom-0.5';
      case 'md':
        return 'h-2.5 w-2.5 -right-0.5 -bottom-0.5';
      case 'lg':
        return 'h-3 w-3 -right-0.5 -bottom-0.5';
      case 'xl':
        return 'h-3.5 w-3.5 -right-0.5 -bottom-0.5';
      default:
        return 'h-2.5 w-2.5 -right-0.5 -bottom-0.5';
    }
  };

  return (
    <div className="relative inline-block">
      {src ? (
        // Image avatar
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} ${shapeClass} object-cover ${className}`}
        />
      ) : (
        // Initials avatar
        <div
          className={`
            ${sizeClasses[size]} 
            ${shapeClass} 
            ${fallbackColor} 
            text-white 
            flex items-center justify-center 
            ${className}
          `}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute ${getStatusSize()} 
            ${statusClasses[status]} 
            border-2 border-white 
            rounded-full
          `}
        />
      )}
    </div>
  );
}; 