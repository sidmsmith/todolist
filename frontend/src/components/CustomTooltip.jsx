import React, { useState, useRef, useEffect } from 'react';
import './CustomTooltip.css';

export const CustomTooltip = ({ content, children, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return (
    <div className="custom-tooltip-wrapper">
      <span
        ref={triggerRef}
        className="custom-tooltip-trigger"
        onClick={handleToggle}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`custom-tooltip custom-tooltip-${position}`}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {content}
        </div>
      )}
    </div>
  );
};

