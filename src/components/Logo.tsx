import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 0, className = '' }: LogoProps) => {
  return (
    <div className={className}>
      <Image
        src="/images/logo.svg"
        alt="Acoustic Drink Logo"
        width={size}
        height={size}
        style={{
          width: size === 0 ? 'auto' : `${size}px`,
          height: size === 0 ? 'auto' : `${size}px`,
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default Logo;