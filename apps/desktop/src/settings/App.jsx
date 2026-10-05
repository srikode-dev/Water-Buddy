import React, { useState, useEffect } from 'react';
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
    launchOnStartup: true
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [logs, setLogs] = useState([]);

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
  }, []);

  const handleSave = async (newSettings) => {
    // Auto calculate daily goal based on weight (weight in kg * 35ml)
    if (newSettings.weight) {
      newSettings.dailyGoal = Math.round(newSettings.weight * 35);
    }
    setSettings(newSettings);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(newSettings);
    }
  };

  const totalDrankToday = logs
    .filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + (log.amount || 0), 0);

  return (
    <div className="settings-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="../public/icon.png" alt="Logo" className="logo-img" style={{width: 32, height: 32, borderRadius: 8}} />
          <h2>Water Buddy</h2>
        </div>
        <nav>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
          <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>🕒 Schedule</button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>📊 History</button>
          <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>⚙️ General</button>
          <button className={activeTab === 'sync' ? 'active' : ''} onClick={() => setActiveTab('sync')}>☁️ Sync</button>
        </nav>
      </aside>
      
      <main className="content">
        {activeTab === 'profile' && (
          <div className="tab-pane fade-in">
            <h3>My Profile</h3>
            <p className="help-text">We use this to calculate your optimal hydration goals.</p>
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
              <div className="goal-highlight">
                <h4>Your Daily Goal: <span>{settings.dailyGoal} ml</span></h4>
                <p>Based on your weight, you should drink {settings.dailyGoal}ml of water daily.</p>
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
            <div className="progress-card">
              <div className="progress-circle" style={{ borderColor: '#f97316', color: '#f97316' }}>
                <h2>{totalDrankToday} <small>ml</small></h2>
              </div>
              <p>{totalDrankToday >= settings.dailyGoal ? 'Goal Reached! 🎉' : `${settings.dailyGoal - totalDrankToday} ml left to reach goal`}</p>
            </div>

            <h3>Past Records</h3>
            <div className="logs-list">
              {logs.slice().reverse().map((log, i) => (
                <div key={i} className={`log-item ${log.response}`}>
                  <div className="log-date">
                    <strong>{new Date(log.timestamp).toLocaleDateString()}</strong>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <span className="log-action">
                    {log.response === 'yes' ? <span style={{color: '#f97316'}}>+{log.amount} ml</span> : <span style={{color: '#94a3b8'}}>Skipped</span>}
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
