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
    sipMode: 'auto',
    manualSipMl: 150,
    launchOnStartup: true,
    streak: 0,
    badges: []
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [logs, setLogs] = useState([]);
  const [weatherBoost, setWeatherBoost] = useState(0);
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then(s => {
        if (s) setSettings(prev => ({ ...prev, ...s }));
      });
      window.electronAPI.getLogs().then(l => {
        if (l) setLogs(l);
      });
      window.electronAPI.onSyncLog((newLog) => {
        setLogs(prev => [...prev, newLog]);
      });
    }

    // Smart Weather Fetch
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(loc => {
        if (loc.latitude && loc.longitude) {
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`)
            .then(res => res.json())
            .then(data => {
              if (data.current_weather) {
                setTemp(data.current_weather.temperature);
                if (data.current_weather.temperature > 28) {
                  setWeatherBoost(500);
                }
              }
            });
        }
      }).catch(e => console.log('Weather fetch failed', e));
  }, []);

  const handleSave = async (newSettings) => {
    if (newSettings.weight) {
      newSettings.dailyGoal = Math.round(newSettings.weight * 35);
    }
    setSettings(newSettings);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(newSettings);
    }
  };

  const todayStr = new Date().toDateString();
  const todayLogs = logs.filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === todayStr);
  const totalDrankToday = todayLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  const effectiveGoal = settings.dailyGoal + weatherBoost;

  // Chart Data Preparation
  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  
  const chartData = last7Days.map(dateStr => {
    const dayTotal = logs
      .filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === dateStr)
      .reduce((sum, log) => sum + (log.amount || 0), 0);
    return { name: dateStr.substring(0,3), ml: dayTotal };
  });

  return (
    <div className="settings-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="../public/icon.png" alt="Logo" className="logo-img" style={{width: 32, height: 32, borderRadius: 8}} />
          <h2>Water Buddy</h2>
        </div>
        <nav>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
          <button className={activeTab === 'achievements' ? 'active' : ''} onClick={() => setActiveTab('achievements')}>🎖️ Achievements</button>
          <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>🕒 Schedule</button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>📊 Analytics</button>
          <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>⚙️ General</button>
          <button className={activeTab === 'sync' ? 'active' : ''} onClick={() => setActiveTab('sync')}>☁️ Sync</button>
        </nav>
      </aside>
      
      <main className="content">
        {activeTab === 'profile' && (
          <div className="tab-pane fade-in">
            <h3>My Profile</h3>
            <div className="card profile-form">
              <label>
                <span>Name</span>
                <input 
                  type="text" 
                  value={settings.name || ''} 
                  placeholder="What should we call you?"
                  onChange={(e) => handleSave({ ...settings, name: e.target.value })}
                />
              </label>
              <div className="form-row">
                <label>
                  <span>Weight (kg)</span>
                  <input 
                    type="number" 
                    value={settings.weight || 70} 
                    onChange={(e) => handleSave({ ...settings, weight: parseInt(e.target.value) || 0 })}
                  />
                </label>
                <label>
                  <span>Height (cm)</span>
                  <input 
                    type="number" 
                    value={settings.height || 170} 
                    onChange={(e) => handleSave({ ...settings, height: parseInt(e.target.value) || 0 })}
                  />
                </label>
              </div>
            </div>

            <h3>Gamification Overview</h3>
            <div className="card form-row">
               <div style={{ flex: 1, textAlign: 'center', background: 'rgba(249, 115, 22, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                 <h2 style={{margin: '0 0 10px 0', fontSize: '2.5rem', color: '#f97316'}}>🔥 {settings.streak || 0}</h2>
                 <p style={{margin: 0, fontWeight: 600, color: '#fdba74'}}>Day Streak</p>
               </div>
               <div style={{ flex: 1, textAlign: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                 <h2 style={{margin: '0 0 10px 0', fontSize: '2.5rem', color: '#38bdf8'}}>{settings.badges?.length || 0}</h2>
                 <p style={{margin: 0, fontWeight: 600, color: '#7dd3fc'}}>Badges Earned</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="tab-pane fade-in">
            <h3>My Badges</h3>
            <p style={{color: '#94a3b8', marginBottom: 24}}>Unlock badges by building healthy hydration habits.</p>
            <div className="badges-grid">
              <div className={`badge-card ${settings.streak >= 3 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🐪</div>
                <h4>The Camel</h4>
                <p>Hit your daily goal 3 days in a row.</p>
                <span className="status">{settings.streak >= 3 ? 'Unlocked' : 'Locked'}</span>
              </div>
              <div className={`badge-card ${logs.some(l => l.beverageType === 'coffee') ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">☕</div>
                <h4>Caffeinated</h4>
                <p>Log a coffee.</p>
                <span className="status">{logs.some(l => l.beverageType === 'coffee') ? 'Unlocked' : 'Locked'}</span>
              </div>
              <div className={`badge-card ${logs.some(l => {
                const h = new Date(l.timestamp).getHours();
                return h >= 0 && h < 5;
              }) ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🦉</div>
                <h4>Night Owl</h4>
                <p>Log water after midnight.</p>
                <span className="status">{logs.some(l => {
                const h = new Date(l.timestamp).getHours();
                return h >= 0 && h < 5;
              }) ? 'Unlocked' : 'Locked'}</span>
              </div>
              <div className={`badge-card ${totalDrankToday > 0 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🌟</div>
                <h4>First Sip</h4>
                <p>Drink water today.</p>
                <span className="status">{totalDrankToday > 0 ? 'Unlocked' : 'Locked'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="tab-pane fade-in">
            <h3>Reminder Schedule</h3>
            <div className="card">
              <label>
                <span>Reminder Interval (minutes)</span>
                <select 
                  value={settings.intervalMin} 
                  onChange={(e) => handleSave({ ...settings, intervalMin: parseInt(e.target.value) })}
                >
                  <option value={1}>1 min (Demo)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </label>
              <p className="help-text">How often should Buddy remind you to drink water?</p>
            </div>
            <div className="card">
              <label>
                <span>Amount per sip (ml)</span>
                <select 
                  value={settings.manualSipMl || 150} 
                  onChange={(e) => handleSave({ ...settings, manualSipMl: parseInt(e.target.value) })}
                >
                  <option value={100}>100 ml (Small Cup)</option>
                  <option value={150}>150 ml (Regular Cup)</option>
                  <option value={250}>250 ml (Large Glass)</option>
                  <option value={500}>500 ml (Bottle)</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-pane fade-in">
            <h3>Today's Progress</h3>
            {weatherBoost > 0 && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                ☀️ <strong>Hot Day Alert!</strong> It's {temp}°C outside. We added {weatherBoost}ml to your goal.
              </div>
            )}
            <div className="progress-card">
              <div className="progress-circle" style={{ borderColor: '#2563eb', color: '#2563eb', borderTopColor: '#fff' }}>
                <h2>{totalDrankToday} <small>ml</small></h2>
              </div>
              <p>{totalDrankToday >= effectiveGoal ? 'Goal Reached! 🎉' : `${effectiveGoal - totalDrankToday} ml left to reach ${effectiveGoal}ml goal`}</p>
            </div>

            <h3>Weekly Analytics</h3>
            <div className="card" style={{ height: 250, padding: '20px 20px 20px 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="ml" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3>Recent Logs</h3>
            <div className="logs-list">
              {logs.slice().reverse().slice(0, 15).map((log, i) => (
                <div key={i} className={`log-item ${log.response}`}>
                  <div className="log-date">
                    <strong>{new Date(log.timestamp).toLocaleDateString()}</strong>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <span className="log-action">
                    {log.response === 'yes' ? <span style={{color: '#2563eb'}}>+{log.amount} ml {log.beverageType === 'coffee' ? '☕' : log.beverageType === 'tea' ? '🍵' : '💧'}</span> : <span style={{color: '#94a3b8'}}>Skipped</span>}
                  </span>
                </div>
              ))}
              {logs.length === 0 && <p className="empty-state">No records yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="tab-pane fade-in">
            <h3>General Settings</h3>
            <div className="card">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.launchOnStartup} 
                  onChange={(e) => handleSave({ ...settings, launchOnStartup: e.target.checked })}
                />
                <span>Launch on system startup</span>
              </label>
            </div>
            <div className="card">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.focusMode || false} 
                  onChange={(e) => handleSave({ ...settings, focusMode: e.target.checked })}
                />
                <span><strong>Smart Focus Mode (Do Not Disturb)</strong><br/><small style={{color: '#94a3b8'}}>Automatically suppress widget popups when you are playing games or using full-screen apps.</small></span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="tab-pane fade-in">
            <h3>Cloud Sync</h3>
            <div className="card">
              <p>Sign in to sync your water logs and settings across multiple devices.</p>
              <div className="sync-form">
                <input id="syncEmail" type="email" placeholder="Email" />
                <input id="syncPassword" type="password" placeholder="Password" />
                <button 
                  className="btn-primary"
                  onClick={async () => {
                    const email = document.getElementById('syncEmail').value;
                    const password = document.getElementById('syncPassword').value;
                    try {
                      const res = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                      });
                      const data = await res.json();
                      if (data.token && window.electronAPI) {
                        await window.electronAPI.setAuthToken(data.token);
                        alert('Successfully logged in! Your logs will now sync in the background.');
                      } else {
                        alert(data.error || 'Login failed');
                      }
                    } catch(err) {
                      alert('Network error trying to login.');
                    }
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
