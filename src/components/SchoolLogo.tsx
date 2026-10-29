import React, { useState, useEffect } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  src?: string;
  alt?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = 'w-10 h-10',
  size,
  src,
  alt = 'Logo SMK Laboratorium Tridharma Universitas Negeri Gorontalo',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const finalSizeClass = size ? sizeMap[size] : className;

  // Resolve logo source with localStorage fallback and error handling
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (src) return src;
    try {
      const savedCustom = localStorage.getItem('smk_lms_custom_logo');
      if (savedCustom) return savedCustom;
    } catch {
      // ignore
    }
    return '/school-logo.svg';
  });

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
    } else {
      try {
        const savedCustom = localStorage.getItem('smk_lms_custom_logo');
        setCurrentSrc(savedCustom || '/school-logo.svg');
      } catch {
        setCurrentSrc('/school-logo.svg');
      }
    }
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${finalSizeClass}`}>
      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => {
          if (currentSrc !== '/school-logo.svg') {
            setCurrentSrc('/school-logo.svg');
          }
        }}
        className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
      />
    </div>
  );
};

