'use client';

import * as React from 'react';

/**
 * Client component that handles scroll events and adds/removes 'scrolled' class on body
 * This component doesn't render anything, it just handles side effects
 */
export function HeaderScrollHandler() {
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      if (typeof document === 'undefined') {
        return;
      }

      const isScrolled = window.scrollY > 0;
      if (isScrolled) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return null;
}
