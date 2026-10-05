import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [fillLevel, setFillLevel] = useState(0);
  const [currentConsumed, setCurrentConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [hasAnswered, setHasAnswered] = useState(false);
  const sipAmount = 150;

  useEffect(() => {
    const loadStats = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings();
        const logs = await window.electronAPI.getLogs();
        const goal = settings.dailyGoal || 2500;
        
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = (logs || []).filter(l => l.timestamp && l.timestamp.startsWith(today) && l.response === 'yes');
        const consumed = todayLogs.reduce((sum, l) => sum + (l.amount || 0), 0);
        
        setDailyGoal(goal);
        setCurrentConsumed(consumed);
        setFillLevel(Math.min((consumed / goal) * 100, 100));
      }
    };

    if (window.electronAPI && window.electronAPI.onTriggerWalk) {
      window.electronAPI.onTriggerWalk(() => {
        loadStats();
        setHasAnswered(false);
        setIsVisible(true);
      });
    }
  }, []);

  // Auto-hide if ignored for 30s
  useEffect(() => {
    if (isVisible && !hasAnswered) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnswered]);

  const handleResponse = (drank) => {
    setHasAnswered(true);
    if (drank) {
      const newConsumed = currentConsumed + sipAmount;
      setCurrentConsumed(newConsumed);
      setFillLevel(Math.min((newConsumed / dailyGoal) * 100, 100));
      
      if (window.electronAPI && window.electronAPI.logWater) {
        window.electronAPI.logWater({ response: 'yes', amount: sipAmount });
      }
      // Hide after animation finishes
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } else {
      if (window.electronAPI && window.electronAPI.logWater) {
        window.electronAPI.logWater({ response: 'no' });
      }
      setIsVisible(false);
    }
  };

  // Calculate SVG circle dash offset
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (fillLevel / 100) * circumference;

  return (
    <div className="overlay-container">
      <div 
        className={`minimal-widget ${isVisible ? 'visible' : 'hidden'}`}
        onMouseEnter={() => {
          if (window.electronAPI && window.electronAPI.setIgnoreMouseEvents) {
            window.electronAPI.setIgnoreMouseEvents(false);
          }
        }}
        onMouseLeave={() => {
          if (window.electronAPI && window.electronAPI.setIgnoreMouseEvents) {
            window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          }
        }}
      >
        {/* Progress Ring */}
        <div className="widget-progress">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle 
              className="progress-bg" 
              cx="24" cy="24" r={radius} 
              fill="none" strokeWidth="4"
            />
            <circle 
              className="progress-fill" 
              cx="24" cy="24" r={radius} 
              fill="none" strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <div className="progress-icon">💧</div>
        </div>

        {/* Text Content */}
        <div className="widget-text">
          <h4>Time to Hydrate</h4>
          <p>{!hasAnswered ? `Drink ${sipAmount}ml of water` : 'Great job! Stay hydrated.'}</p>
        </div>

        {/* Actions */}
        {!hasAnswered && (
          <div className="widget-actions">
            <button className="action-btn btn-yes" onClick={() => handleResponse(true)} title="Drank it">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button className="action-btn btn-no" onClick={() => handleResponse(false)} title="Skip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
