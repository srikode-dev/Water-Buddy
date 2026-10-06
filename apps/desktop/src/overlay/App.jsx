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

  const playBloop = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { /* ignore */ }
  };

  const handleResponse = (drank, beverageType = 'water', multiplier = 1) => {
    setHasAnswered(true);
    if (drank) {
      playBloop();
      const amount = Math.round(sipAmount * multiplier);
      const newConsumed = currentConsumed + amount;
      setCurrentConsumed(newConsumed);
      setFillLevel(Math.min((newConsumed / dailyGoal) * 100, 100));
      
      if (window.electronAPI && window.electronAPI.logWater) {
        window.electronAPI.logWater({ response: 'yes', amount, beverageType, hydrationMultiplier: multiplier });
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
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
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
          <div className="progress-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {fillLevel < 33 ? (
                <>
                  <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.3)" stroke="transparent" />
                  <path d="M8 9h.01M16 9h.01" strokeWidth="3" />
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                </>
              ) : fillLevel < 70 ? (
                <>
                  <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.1)" stroke="transparent" />
                  <path d="M8 9h.01M16 9h.01" strokeWidth="3" />
                  <path d="M8 15h8" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" fill="rgba(56, 189, 248, 0.3)" stroke="transparent" />
                  <path d="M8 9h.01M16 9h.01" strokeWidth="3" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="widget-text">
          <h4>Time to Hydrate</h4>
          <p>{!hasAnswered ? `Drink ${sipAmount}ml of water` : 'Great job! Stay hydrated.'}</p>
        </div>

        {/* Actions */}
        {!hasAnswered && (
          <div className="widget-actions">
            <button className="action-btn btn-yes" onClick={() => handleResponse(true, 'water', 1)} title="Water (100%)">
              💧
            </button>
            <button className="action-btn btn-beverage" onClick={() => handleResponse(true, 'coffee', 0.5)} title="Coffee (50%)">
              ☕
            </button>
            <button className="action-btn btn-beverage" onClick={() => handleResponse(true, 'tea', 0.8)} title="Tea (80%)">
              🍵
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
