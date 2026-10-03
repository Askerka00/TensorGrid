import React from 'react';

interface TensorGridLogoProps {
  className?: string;
  size?: number;
  variant?: 'icon-gradient' | 'icon-only' | 'full';
  showText?: boolean;
}

export const TensorGridIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 148"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 13 Dispersion squares matching exact TensorGrid geometry */}
      {/* Row 1 */}
      <rect x="69" y="0" width="27" height="27" rx="2" />
      <rect x="124" y="0" width="28" height="27" rx="2" />
      {/* Row 2 */}
      <rect x="46" y="30" width="20" height="20" rx="1.5" />
      <rect x="97" y="28" width="27" height="27" rx="2" />
      {/* Row 3 */}
      <rect x="26" y="60" width="14" height="13" rx="1" />
      <rect x="73" y="56" width="21" height="20" rx="1.5" />
      <rect x="124" y="55" width="28" height="28" rx="2" />
      {/* Row 4 */}
      <rect x="5" y="85" width="11" height="10" rx="1" />
      <rect x="52" y="85" width="13" height="14" rx="1" />
      <rect x="101" y="84" width="19" height="20" rx="1.5" />
      {/* Row 5 */}
      <rect x="26" y="110" width="10" height="10" rx="1" />
      <rect x="76" y="108" width="14" height="14" rx="1" />
      {/* Row 6 */}
      <rect x="0" y="134" width="7" height="7" rx="0.8" />
    </svg>
  );
};

export const TensorGridLogo: React.FC<TensorGridLogoProps> = ({
  className = '',
  size = 36,
  variant = 'icon-gradient',
  showText = false,
}) => {
  if (variant === 'icon-gradient') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div
          className="relative flex items-center justify-center rounded-xl overflow-hidden shadow-sm flex-shrink-0"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #1d68f5 0%, #2f8af5 40%, #52b0f9 100%)',
          }}
        >
          {/* Subtle noise/glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/40 to-cyan-300/30" />
          <div className="relative text-white flex items-center justify-center p-1.5">
            <TensorGridIcon size={size * 0.58} />
          </div>
        </div>
        {showText && (
          <span className="font-bold tracking-tight text-gray-900 text-lg">
            TensorGrid
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TensorGridIcon size={size} className="text-blue-600" />
      {showText && (
        <span className="font-bold tracking-tight text-gray-900 text-lg">
          TensorGrid
        </span>
      )}
    </div>
  );
};
