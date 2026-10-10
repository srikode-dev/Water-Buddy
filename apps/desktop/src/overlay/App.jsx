import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [fillLevel, setFillLevel] = useState(0);
  const [currentConsumed, setCurrentConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [sipAmount, setSipAmount] = useState(150);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const autoHideTimerRef = useRef(null);

  // Play gentle water chime using Web Audio API
  const playSound = (freq1 = 520, freq2 = 780) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // AudioContext policy safe fallback
    }
  };

  const loadStats = async () => {
    if (window.electronAPI) {
      const settings = (await window.electronAPI.getSettings()) || {};
      const logs = (await window.electronAPI.getLogs()) || [];
      const goal = settings.dailyGoal || 2450;
      const cup = settings.manualSipMl || 150;
      const sound = settings.soundOn !== false;
      
      setDailyGoal(goal);
      setSipAmount(cup);
      setSoundEnabled(sound);

      const todayStr = new Date().toDateString();
      const todayLogs = logs.filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === todayStr);
      const consumed = todayLogs.reduce((sum, l) => sum + (l.amount || 0), 0);
      
      setCurrentConsumed(consumed);
      setFillLevel(Math.min(Math.round((consumed / goal) * 100), 100));
    }
  };

  const hideWidget = () => {
    setIsVisible(false);
    if (window.electronAPI && window.electronAPI.hideOverlay) {
      window.electronAPI.hideOverlay();
    }
  };

  useEffect(() => {
    loadStats();

    if (window.electronAPI && window.electronAPI.onTriggerWalk) {
      window.electronAPI.onTriggerWalk(() => {
        loadStats();
        setHasAnswered(false);
        setFeedbackText('');
        setIsVisible(true);
        // Play gentle chime when popup appears
        playSound(440, 660);
      });
    }
  }, []);

  // Auto-hide popup if ignored for 25 seconds
  useEffect(() => {
    if (isVisible && !hasAnswered) {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = setTimeout(() => {
        hideWidget();
      }, 25000);
      return () => clearTimeout(autoHideTimerRef.current);
    }
  }, [isVisible, hasAnswered]);

  const handleResponse = (drank, beverageType = 'water', multiplier = 1) => {
    setHasAnswered(true);
    if (drank) {
      playSound(580, 880);
      const amount = Math.round(sipAmount * multiplier);
      const newConsumed = currentConsumed + amount;
      setCurrentConsumed(newConsumed);
      setFillLevel(Math.min(Math.round((newConsumed / dailyGoal) * 100), 100));
      
      setFeedbackText(`✓ Logged +${amount} ml`);

      if (window.electronAPI && window.electronAPI.logWater) {
        window.electronAPI.logWater({ 
          response: 'yes', 
          amount, 
          beverageType, 
          hydrationMultiplier: multiplier 
        });
      }

      // Hide after showing confirmation
      setTimeout(() => {
        hideWidget();
      }, 1400);
    } else {
      if (window.electronAPI && window.electronAPI.logWater) {
        window.electronAPI.logWater({ response: 'no' });
      }
      hideWidget();
    }
  };

  // SVG Progress Ring calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fillLevel / 100) * circumference;

  return (
    <div className="overlay-container">
      <div className={`minimal-widget ${isVisible ? 'visible' : 'hidden'}`}>
        {/* Progress Ring */}
        <div className="widget-progress">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <defs>
              <linearGradient id="oceanicGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
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
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <div className="progress-center-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="widget-text">
          <h4>{hasAnswered ? 'Great Job!' : 'Drink Water'}</h4>
          <p>
            {hasAnswered 
              ? feedbackText 
              : `Take a sip (${sipAmount} ml)`}
          </p>
        </div>

        {/* Action Buttons */}
        {!hasAnswered && (
          <div className="widget-actions">
            <button 
              type="button"
              className="action-btn btn-water" 
              onClick={() => handleResponse(true, 'water', 1)} 
              title={`Drink ${sipAmount} ml water`}
            >
              <span className="btn-icon">💧</span>
              <span className="btn-text">+{sipAmount}ml</span>
            </button>

            <button 
              type="button"
              className="action-btn btn-alt" 
              onClick={() => handleResponse(true, 'coffee', 0.5)} 
              title="Log Coffee"
            >
              ☕
            </button>

            <button 
              type="button"
              className="action-btn btn-alt" 
              onClick={() => handleResponse(true, 'tea', 0.8)} 
              title="Log Tea"
            >
              🍵
            </button>

            <button 
              type="button"
              className="action-btn btn-skip" 
              onClick={() => handleResponse(false)} 
              title="Skip"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
