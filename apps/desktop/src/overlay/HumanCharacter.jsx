import React from 'react';
import './HumanCharacter.css';

export default function HumanCharacter({ state, direction }) {
  const isRunning = state === 'happy-run' || state === 'angry-run';
  const isWalking = state === 'walking-in' || isRunning;
  const isAngry = state === 'angry-run';
  const isHappy = state === 'happy-run';

  const animationClass = isRunning ? 'run' : isWalking ? 'walk' : 'idle';

  return (
    <div className={`human-wrapper ${animationClass}`}>
      <svg width="100" height="150" viewBox="0 0 100 150">
        {/* Left Arm (Back) */}
        <g className="arm-left">
          <line x1="50" y1="50" x2="40" y2="80" stroke="#fca5a5" strokeWidth="8" strokeLinecap="round" />
        </g>

        {/* Left Leg (Back) */}
        <g className="leg-left">
          <line x1="50" y1="85" x2="40" y2="135" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          {/* Shoe */}
          <rect x="35" y="135" width="15" height="8" rx="4" fill="#0f172a" />
        </g>

        {/* Right Leg (Front) */}
        <g className="leg-right">
          <line x1="50" y1="85" x2="60" y2="135" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
          {/* Shoe */}
          <rect x="55" y="135" width="15" height="8" rx="4" fill="#0f172a" />
        </g>

        {/* Body (Torso) */}
        <line x1="50" y1="45" x2="50" y2="90" stroke="#3b82f6" strokeWidth="20" strokeLinecap="round" />

        {/* Head */}
        <circle cx="50" cy="28" r="16" fill="#fca5a5" />
        {/* Hair */}
        <path d="M34 28 C 34 10, 66 10, 66 28 C 66 20, 34 20, 34 28" fill="#5c3a21" />
        
        {/* Eyes */}
        <circle cx="55" cy="25" r="2" fill="#000" />
        {/* Mouth */}
        {isAngry ? (
          <path d="M53 34 Q 56 31 59 34" stroke="#000" strokeWidth="2" fill="none" />
        ) : isHappy ? (
          <path d="M53 32 Q 56 36 59 32" stroke="#000" strokeWidth="2" fill="none" />
        ) : (
          <line x1="54" y1="33" x2="58" y2="33" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Right Arm (Front) holding water bottle */}
        <g className="arm-right">
          {/* Upper Arm */}
          <line x1="50" y1="50" x2="65" y2="75" stroke="#fca5a5" strokeWidth="8" strokeLinecap="round" />
          {/* Lower Arm bent */}
          <line x1="65" y1="75" x2="80" y2="65" stroke="#fca5a5" strokeWidth="8" strokeLinecap="round" />
          {/* Water Bottle */}
          <g transform="translate(73, 45) rotate(15)">
            <rect x="0" y="5" width="14" height="25" rx="3" fill="#38bdf8" opacity="0.9" />
            <rect x="3" y="0" width="8" height="6" rx="1" fill="#94a3b8" />
            <path d="M0 15 L14 15" stroke="#0ea5e9" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
