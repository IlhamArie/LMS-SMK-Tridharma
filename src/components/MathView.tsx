import React, { useEffect, useRef } from 'react';

interface MathViewProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements?: HTMLElement[]) => void;
    };
  }
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      try {
        window.MathJax.typesetClear?.([containerRef.current]);
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
          console.warn('MathJax rendering warning:', err);
        });
      } catch (err) {
        console.warn('MathJax trigger error:', err);
      }
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`leading-relaxed whitespace-pre-wrap break-words ${className}`}
    >
      {content}
    </div>
  );
};
