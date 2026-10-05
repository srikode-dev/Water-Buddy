import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [settings, setSettings] = useState({
    intervalMin: 45,
    sipMode: 'auto',
    manualSipMl: 250,
    launchOnStartup: true
  });
  const [activeTab, setActiveTab] = useState('schedule');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then(s => {
        if (s) setSettings(s);
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
          <span className="logo">💧</span>
          <h2>Water Buddy</h2>
        </div>
        <nav>
          <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>🕒 Schedule</button>
          <button className={activeTab === 'goal' ? 'active' : ''} onClick={() => setActiveTab('goal')}>🎯 Goal & Logs</button>
          <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>⚙️ General</button>
          <button className={activeTab === 'sync' ? 'active' : ''} onClick={() => setActiveTab('sync')}>☁️ Sync & Cloud</button>
        </nav>
      </aside>
      
      <main className="content">
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
                </select>
              </label>
              <p className="help-text">How often should Buddy remind you to drink water?</p>
            </div>
          </div>
        )}

        {activeTab === 'goal' && (
          <div className="tab-pane fade-in">
            <h3>Today's Progress</h3>
            <div className="progress-card">
              <div className="progress-circle">
                <h2>{totalDrankToday} <small>ml</small></h2>
              </div>
            </div>

            <h3>Recent Logs</h3>
            <div className="logs-list">
              {logs.slice().reverse().map((log, i) => (
                <div key={i} className={`log-item ${log.response}`}>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>{log.response === 'yes' ? `Drank ${log.amount} ml` : 'Ignored'}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="empty-state">No logs yet today.</p>}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <input id="syncEmail" type="email" placeholder="Email" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input id="syncPassword" type="password" placeholder="Password" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button 
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
                  style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
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
