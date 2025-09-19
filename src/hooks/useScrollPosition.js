import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @param {number} threshold - Threshold for showing scroll to top button
 * @returns {Object} Scroll position data
 */
export const useScrollPosition = (threshold = 300) => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrollY(currentScrollY);
      setShowScrollToTop(currentScrollY > threshold);
      setIsAtTop(currentScrollY < 10);
      setIsAtBottom(currentScrollY + windowHeight >= documentHeight - 10);

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      lastScrollY = currentScrollY;
    };

    // Throttle scroll events
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollPosition(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return {
    scrollY,
    showScrollToTop,
    scrollDirection,
    isAtTop,
    isAtBottom,
    scrollToTop,
    scrollToBottom,
    scrollToElement,
  };
};

export default useScrollPosition;
