import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-9 w-auto', variant = 'dark' }) => {
  const leftArchColor = '#123B30'; // Forest
  const rightArchColor = '#E6A93B'; // Amber
  const textColor = variant === 'light' ? '#F4EFE6' : '#15201B';

  return (
    <svg
      role="img"
      aria-label="MWB Market Without Borders"
      viewBox="0 0 168 52"
      className={className}
      style={{ overflow: 'visible' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Arch (Forest Dark Green) */}
      <path
        d="M6 46V22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22V46"
        stroke={leftArchColor}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Right Arch (Amber) */}
      <path
        d="M38 46V22C38 13.1634 45.1634 6 54 6C62.8366 6 70 13.1634 70 22V46"
        stroke={rightArchColor}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Wordmark: MWB */}
      <text
        x="88"
        y="38"
        fill={textColor}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '30px',
          letterSpacing: '2px',
        }}
      >
        MWB
      </text>
    </svg>
  );
};

