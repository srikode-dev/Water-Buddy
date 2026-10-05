import React from 'react';
import './RobotCharacter.css';

export default function RobotCharacter({ state }) {
  const isWalking = state === 'walking-in' || state === 'angry-run';
  const animationClass = isWalking ? 'robot-walk' : 'robot-idle';

  return (
    <div className={`robot-wrapper ${animationClass}`}>
      {/* SVG Filter to remove pure white background */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="remove-white" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            -1 -1 -1 0 3" />
        </filter>
      </svg>

      <img 
        src="/robot.jpg" 
        alt="Tactical Robot" 
        className="robot-image" 
        style={{ 
          filter: 'url(#remove-white) drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
          width: '180px',
          height: 'auto'
        }} 
      />
    </div>
  );
}
