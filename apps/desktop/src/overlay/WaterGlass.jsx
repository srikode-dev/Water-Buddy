import React from 'react';
import './WaterGlass.css';

export default function WaterGlass({ fillLevel }) {
  return (
    <div className="glass-container">
      <div className="glass">
        <div className="water-wrapper" style={{ height: `${fillLevel}%` }}>
          <div className="water-wave"></div>
          <div className="water-body"></div>
        </div>
        {/* Highlights for 3D glass effect */}
        <div className="glass-highlight"></div>
      </div>
    </div>
  );
}
