import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

function App() {
  const [settings, setSettings] = useState({
    name: '',
    weight: 70,
    height: 170,
    dailyGoal: 2450,
    intervalMin: 45,
    manualSipMl: 150,
    soundOn: true,
    launchOnStartup: true,
    focusMode: false,
    streak: 0,
    badges: []
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [logs, setLogs] = useState([]);
  const [weatherBoost, setWeatherBoost] = useState(0);
  const [temp, setTemp] = useState(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const [testNotice, setTestNotice] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then(s => {
        if (s) {
          setSettings(prev => ({
            ...prev,
            ...s,
            soundOn: s.soundOn !== undefined ? s.soundOn : true,
            manualSipMl: s.manualSipMl || 150,
            intervalMin: s.intervalMin || 45
          }));
        }
      });
      window.electronAPI.getLogs().then(l => {
        if (l) setLogs(l);
      });
      window.electronAPI.onSyncLog((newLog) => {
        setLogs(prev => [...prev, newLog]);
      });
    }

    // Weather check for hot days
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(loc => {
        if (loc.latitude && loc.longitude) {
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`)
            .then(res => res.json())
            .then(data => {
              if (data.current_weather) {
                setTemp(Math.round(data.current_weather.temperature));
                if (data.current_weather.temperature > 28) {
                  setWeatherBoost(500);
                }
              }
            });
        }
      }).catch(e => console.log('Weather fetch failed', e));
  }, []);

  const handleSave = async (updated) => {
    // 35 ml per kg of weight
    if (updated.weight) {
      updated.dailyGoal = Math.round(updated.weight * 35);
    }
    setSettings(updated);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(updated);
    }
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  const handleLogQuickWater = (amount, beverageType = 'water') => {
    if (window.electronAPI && window.electronAPI.logWater) {
      window.electronAPI.logWater({
        response: 'yes',
        amount,
        beverageType,
        hydrationMultiplier: beverageType === 'coffee' ? 0.5 : beverageType === 'tea' ? 0.8 : 1
      });
    }
  };

  const handleTestReminder = () => {
    if (window.electronAPI && window.electronAPI.triggerTestReminder) {
      window.electronAPI.triggerTestReminder();
      setTestNotice(true);
      setTimeout(() => setTestNotice(false), 3000);
    }
  };

  const todayStr = new Date().toDateString();
  const todayLogs = logs.filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === todayStr);
  const totalDrankToday = todayLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  const effectiveGoal = (settings.dailyGoal || 2450) + weatherBoost;
  const progressPercent = Math.min(Math.round((totalDrankToday / effectiveGoal) * 100), 100);

  // Past 7 Days data for chart
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(dateObj => {
    const dateStr = dateObj.toDateString();
    const dayTotal = logs
      .filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === dateStr)
      .reduce((sum, log) => sum + (log.amount || 0), 0);
    return {
      name: dayNames[dateObj.getDay()],
      ml: dayTotal
    };
  });

  return (
    <div className="settings-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="brand-meta">
            <h2>Water Buddy</h2>
            <span className="brand-badge">Desktop Companion</span>
          </div>
        </div>

        <nav>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} 
            onClick={() => setActiveTab('schedule')}
          >
            <span className="nav-icon">⏰</span>
            <span>Reminders</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">💧</span>
            <span>Drink Tracker</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`} 
            onClick={() => setActiveTab('achievements')}
          >
            <span className="nav-icon">🏆</span>
            <span>Badges</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} 
            onClick={() => setActiveTab('general')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'sync' ? 'active' : ''}`} 
            onClick={() => setActiveTab('sync')}
          >
            <span className="nav-icon">☁️</span>
            <span>Backup & Sync</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill">
            <span className="status-dot"></span>
            <span>Running quietly</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        {saveNotice && (
          <div className="toast-notice">
            ✓ Settings saved automatically
          </div>
        )}

        {/* 1. MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>My Profile</h3>
              <p>Enter your details so Water Buddy can calculate how much water your body needs each day.</p>
            </div>

            <div className="card">
              <div className="form-group">
                <label htmlFor="userName">Your Name</label>
                <input 
                  id="userName"
                  type="text" 
                  value={settings.name || ''} 
                  placeholder="Enter your name"
                  onChange={(e) => handleSave({ ...settings, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="userWeight">Body Weight (kg)</label>
                  <input 
                    id="userWeight"
                    type="number" 
                    min="30"
                    max="200"
                    value={settings.weight || 70} 
                    onChange={(e) => handleSave({ ...settings, weight: parseInt(e.target.value) || 0 })}
                  />
                  <small className="field-hint">We recommend 35 ml of water for each 1 kg of body weight.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="userHeight">Height (cm) <span className="optional-tag">Optional</span></label>
                  <input 
                    id="userHeight"
                    type="number" 
                    min="100"
                    max="250"
                    value={settings.height || 170} 
                    onChange={(e) => handleSave({ ...settings, height: parseInt(e.target.value) || 0 })}
                  />
                  <small className="field-hint">Used for basic health tracking.</small>
                </div>
              </div>
            </div>

            <div className="card highlight-card">
              <div className="highlight-content">
                <span className="highlight-label">Your Daily Water Goal</span>
                <div className="highlight-value">
                  <span className="mono-num">{effectiveGoal.toLocaleString()}</span>
                  <span className="unit">ml / day</span>
                </div>
                <p className="highlight-desc">
                  Based on your weight of {settings.weight || 70} kg
                  {weatherBoost > 0 && ` + ${weatherBoost}ml added for warm weather (${temp}°C)`}.
                </p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-icon">🔥</span>
                <span className="stat-number mono-num">{settings.streak || 0}</span>
                <span className="stat-label">Days in a Row</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🏆</span>
                <span className="stat-number mono-num">{settings.badges?.length || (totalDrankToday > 0 ? 1 : 0)} / 4</span>
                <span className="stat-label">Badges Unlocked</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. REMINDER SETTINGS (NOTIFICATIONS) */}
        {activeTab === 'schedule' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Water Reminders</h3>
              <p>Configure how often and how much water Water Buddy reminds you to drink.</p>
            </div>

            <div className="card">
              <h4 className="card-title">1. How often to remind you</h4>
              <p className="card-subtext">Choose how many minutes between each water reminder popup.</p>
              
              <div className="interval-grid">
                {[
                  { value: 1, label: '1 min', sub: 'Quick test' },
                  { value: 20, label: '20 min', sub: 'Frequent' },
                  { value: 30, label: '30 min', sub: 'Active' },
                  { value: 45, label: '45 min', sub: 'Recommended' },
                  { value: 60, label: '60 min', sub: 'Hourly' },
                  { value: 90, label: '90 min', sub: 'Relaxed' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`choice-card ${settings.intervalMin === opt.value ? 'selected' : ''}`}
                    onClick={() => handleSave({ ...settings, intervalMin: opt.value })}
                  >
                    <span className="choice-val mono-num">{opt.label}</span>
                    <span className="choice-sub">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 className="card-title">2. How much to drink each time</h4>
              <p className="card-subtext">The default amount added when you click "Drink Water" on the reminder popup.</p>

              <div className="interval-grid cup-grid">
                {[
                  { value: 100, label: '100 ml', icon: '🥛', desc: 'Small Cup' },
                  { value: 150, label: '150 ml', icon: '☕', desc: 'Regular Cup' },
                  { value: 250, label: '250 ml', icon: '🧊', desc: 'Glass of Water' },
                  { value: 500, label: '500 ml', icon: '🍶', desc: 'Water Bottle' }
                ].map(cup => (
                  <button
                    key={cup.value}
                    type="button"
                    className={`choice-card ${settings.manualSipMl === cup.value ? 'selected' : ''}`}
                    onClick={() => handleSave({ ...settings, manualSipMl: cup.value })}
                  >
                    <span className="cup-icon">{cup.icon}</span>
                    <span className="choice-val mono-num">{cup.label}</span>
                    <span className="choice-sub">{cup.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 className="card-title">3. Notification Sound</h4>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.soundOn !== false} 
                  onChange={(e) => handleSave({ ...settings, soundOn: e.target.checked })}
                />
                <div className="checkbox-text">
                  <strong>Play chime sound when reminder appears</strong>
                  <p>Plays a gentle, soft water chime so you don't miss your reminder.</p>
                </div>
              </label>
            </div>

            <div className="card test-card">
              <div className="test-left">
                <h4 className="card-title">Test Reminder Popup</h4>
                <p className="card-subtext">Click to see what the reminder popup looks and sounds like on your screen right now.</p>
                {testNotice && <span className="test-success">✓ Notification triggered on your desktop!</span>}
              </div>
              <button 
                type="button" 
                className="btn-accent"
                onClick={handleTestReminder}
              >
                🔔 Test Reminder Now
              </button>
            </div>
          </div>
        )}

        {/* 3. DRINK TRACKER & HISTORY */}
        {activeTab === 'history' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Today's Water Tracker</h3>
              <p>Keep track of how much water you have drank today.</p>
            </div>

            {weatherBoost > 0 && (
              <div className="weather-banner">
                ☀️ <strong>Hot Weather ({temp}°C):</strong> We added 500 ml to your goal so you stay properly hydrated today.
              </div>
            )}

            <div className="card progress-hero-card">
              <div className="progress-info">
                <span className="progress-label">Today's Progress</span>
                <div className="progress-amount">
                  <span className="drank-val mono-num">{totalDrankToday.toLocaleString()}</span>
                  <span className="goal-divider">/</span>
                  <span className="goal-val mono-num">{effectiveGoal.toLocaleString()} ml</span>
                </div>
                <p className="progress-remaining">
                  {totalDrankToday >= effectiveGoal 
                    ? '🎉 Goal reached! You are fully hydrated today.' 
                    : `${(effectiveGoal - totalDrankToday).toLocaleString()} ml remaining today`}
                </p>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="percent-text mono-num">{progressPercent}% Completed</span>
              </div>
            </div>

            <div className="card">
              <h4 className="card-title">Quick Add Water</h4>
              <p className="card-subtext">Click any button below to instantly log water without waiting for a reminder.</p>
              <div className="quick-log-row">
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => handleLogQuickWater(150, 'water')}
                >
                  +150 ml (Cup)
                </button>
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => handleLogQuickWater(250, 'water')}
                >
                  +250 ml (Glass)
                </button>
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => handleLogQuickWater(500, 'water')}
                >
                  +500 ml (Bottle)
                </button>
                <button 
                  type="button" 
                  className="quick-pill beverage-pill" 
                  onClick={() => handleLogQuickWater(150, 'coffee')}
                >
                  +☕ Coffee
                </button>
                <button 
                  type="button" 
                  className="quick-pill beverage-pill" 
                  onClick={() => handleLogQuickWater(150, 'tea')}
                >
                  +🍵 Tea
                </button>
              </div>
            </div>

            <div className="card chart-card">
              <h4 className="card-title">Past 7 Days</h4>
              <p className="card-subtext">Water intake over the last week in milliliters.</p>
              <div style={{ width: '100%', height: 180, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(56, 189, 248, 0.06)' }} 
                      contentStyle={{ 
                        background: '#0C141F', 
                        borderColor: '#1E293B', 
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontFamily: 'JetBrains Mono' 
                      }} 
                    />
                    <Bar dataKey="ml" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h4 className="card-title">Recent Drinks Today</h4>
              <div className="logs-list">
                {todayLogs.length === 0 ? (
                  <p className="empty-logs">No drinks logged yet today. Take a sip and click +150ml above!</p>
                ) : (
                  todayLogs.slice().reverse().map((log, i) => (
                    <div key={i} className="log-row">
                      <div className="log-left">
                        <span className="log-icon">
                          {log.beverageType === 'coffee' ? '☕' : log.beverageType === 'tea' ? '🍵' : '💧'}
                        </span>
                        <div>
                          <strong>{log.beverageType === 'coffee' ? 'Coffee' : log.beverageType === 'tea' ? 'Tea' : 'Water'}</strong>
                          <span className="log-time">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className="log-amount mono-num">+{log.amount} ml</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. BADGES */}
        {activeTab === 'achievements' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Badges & Rewards</h3>
              <p>Simple milestones you unlock as you build a daily habit of drinking water.</p>
            </div>

            <div className="badges-grid">
              <div className={`badge-card ${totalDrankToday > 0 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🌟</div>
                <h4>First Drink</h4>
                <p>Drank water today.</p>
                <span className="badge-tag">{totalDrankToday > 0 ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card ${settings.streak >= 3 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🐪</div>
                <h4>3 Days in a Row</h4>
                <p>Hit your water goal 3 days in a row.</p>
                <span className="badge-tag">{settings.streak >= 3 ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card ${logs.some(l => l.beverageType === 'coffee') ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">☕</div>
                <h4>Coffee Break</h4>
                <p>Logged a cup of coffee.</p>
                <span className="badge-tag">{logs.some(l => l.beverageType === 'coffee') ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card ${logs.some(l => {
                const h = new Date(l.timestamp).getHours();
                return h >= 0 && h < 5;
              }) ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🦉</div>
                <h4>Night Drink</h4>
                <p>Drank water after midnight.</p>
                <span className="badge-tag">{logs.some(l => {
                  const h = new Date(l.timestamp).getHours();
                  return h >= 0 && h < 5;
                }) ? '✓ Unlocked' : 'Locked'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. GENERAL APP SETTINGS */}
        {activeTab === 'general' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>App Settings</h3>
              <p>Control how Water Buddy starts and behaves on your computer.</p>
            </div>

            <div className="card">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.launchOnStartup !== false} 
                  onChange={(e) => handleSave({ ...settings, launchOnStartup: e.target.checked })}
                />
                <div className="checkbox-text">
                  <strong>Open automatically when Windows starts</strong>
                  <p>Water Buddy will quietly sit in your system tray every time your computer turns on.</p>
                </div>
              </label>
            </div>

            <div className="card">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.focusMode || false} 
                  onChange={(e) => handleSave({ ...settings, focusMode: e.target.checked })}
                />
                <div className="checkbox-text">
                  <strong>Do Not Disturb (Game & Full Screen)</strong>
                  <p>Automatically pause reminder popups while playing games or watching full-screen videos.</p>
                </div>
              </label>
            </div>

            <div className="card about-card">
              <div className="about-left">
                <strong>Water Buddy for Windows</strong>
                <p>Version 2.4 · Oceanic Abyssal Edition</p>
              </div>
              <span className="about-pill">Windows 11 Certified</span>
            </div>
          </div>
        )}

        {/* 6. CLOUD BACKUP & SYNC */}
        {activeTab === 'sync' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Backup & Cloud Sync</h3>
              <p>Save your water logs to your account so you can see your history on any device.</p>
            </div>

            <div className="card">
              <div className="form-group">
                <label htmlFor="syncEmail">Email Address</label>
                <input id="syncEmail" type="email" placeholder="name@example.com" />
              </div>

              <div className="form-group">
                <label htmlFor="syncPassword">Password</label>
                <input id="syncPassword" type="password" placeholder="••••••••" />
              </div>

              <button 
                type="button"
                className="btn-primary"
                onClick={async () => {
                  const email = document.getElementById('syncEmail')?.value;
                  const password = document.getElementById('syncPassword')?.value;
                  if (!email || !password) {
                    alert('Please enter your email and password');
                    return;
                  }
                  try {
                    const res = await fetch('https://water-buddy-r8ur.onrender.com/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (data.token && window.electronAPI) {
                      await window.electronAPI.setAuthToken(data.token);
                      alert('✓ Logged in! Your water logs will now sync automatically in the background.');
                    } else {
                      alert(data.error || 'Login failed. Please check your details.');
                    }
                  } catch (err) {
                    alert('Could not connect to the server. Please check your internet connection.');
                  }
                }}
              >
                Log In & Sync Data
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
