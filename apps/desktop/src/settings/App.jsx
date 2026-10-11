import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

function App() {
  const [settings, setSettings] = useState({
    authMode: null, // null | 'guest' | 'logged_in'
    userToken: null,
    userProfile: null,
    onboardingComplete: false,
    name: '',
    weight: 70,
    height: 170,
    medicalInfo: 'Normal Healthy',
    dailyGoal: 2450,
    intervalMin: 45,
    manualSipMl: 150,
    soundOn: true,
    launchOnStartup: true,
    focusMode: false,
    notificationTheme: 'oceanic',
    notificationPosition: 'bottom-right',
    streak: 0,
    badges: []
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [logs, setLogs] = useState([]);
  const [weatherBoost, setWeatherBoost] = useState(0);
  const [temp, setTemp] = useState(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const [testNotice, setTestNotice] = useState(false);

  // First-launch login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding wizard step
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then(s => {
        if (s) {
          setSettings(prev => ({
            ...prev,
            ...s,
            soundOn: s.soundOn !== undefined ? s.soundOn : true,
            manualSipMl: s.manualSipMl || 150,
            intervalMin: s.intervalMin || 45,
            notificationTheme: s.notificationTheme || 'oceanic',
            notificationPosition: s.notificationPosition || 'bottom-right'
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

    // Weather check for warm days
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

  // Calculate daily intake target based on weight and medical info
  const computeIntake = (weightVal, medicalVal) => {
    let base = Math.round((weightVal || 70) * 35);
    if (medicalVal === 'Athletic / Daily Workout') base += 600;
    if (medicalVal === 'Warm / Tropical Climate') base += 500;
    if (medicalVal === 'Pregnant / Nursing') base += 700;
    if (medicalVal === 'Fluid Restricted (Medical)') base = Math.max(1500, base - 500);
    return base;
  };

  const handleSave = async (updated) => {
    const computedGoal = computeIntake(updated.weight, updated.medicalInfo);
    updated.dailyGoal = computedGoal;

    setSettings(updated);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(updated);
    }
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter your email and password');
      return;
    }
    setLoginError('');
    setIsSubmitting(true);

    try {
      // 1. If currently in guest mode, save guest logs to guest_logs store
      if (settings.authMode === 'guest' && window.electronAPI && window.electronAPI.saveGuestLogs) {
        await window.electronAPI.saveGuestLogs(logs);
      }

      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        const user = data.user || {};

        // 2. Fetch logged-in user's real logs from MongoDB database
        let userLogs = [];
        try {
          const logsRes = await fetch('http://localhost:5000/api/sync/logs', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          if (logsRes.ok) {
            const logsData = await logsRes.json();
            if (logsData.logs && Array.isArray(logsData.logs)) {
              userLogs = logsData.logs.map(l => ({
                id: l.logId || l._id,
                timestamp: l.timestamp,
                amount: l.amountMl,
                response: l.response,
                beverageType: l.beverageType || 'water',
                synced: true
              }));
            }
          }
        } catch (lErr) {
          console.warn('Could not fetch user logs from database', lErr);
        }

        // 3. Set logs state to user's database logs
        setLogs(userLogs);
        if (window.electronAPI && window.electronAPI.saveLogs) {
          await window.electronAPI.saveLogs(userLogs);
        }

        const newSettings = {
          ...settings,
          authMode: 'logged_in',
          userToken: data.token,
          userProfile: user,
          name: user.name || settings.name,
          weight: user.onboarding?.weight || settings.weight,
          height: user.onboarding?.height || settings.height,
          medicalInfo: user.onboarding?.medicalInfo || settings.medicalInfo,
          dailyGoal: user.onboarding?.dailyGoal || settings.dailyGoal,
          notificationTheme: user.onboarding?.notificationTheme || settings.notificationTheme,
          notificationPosition: user.onboarding?.notificationPosition || settings.notificationPosition,
          onboardingComplete: true
        };
        await handleSave(newSettings);
        if (window.electronAPI) {
          await window.electronAPI.setAuthToken(data.token);
        }
      } else {
        setLoginError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Desktop login error:', err);
      setLoginError('Could not connect to authentication server (http://localhost:5000). Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    // Load existing guest logs if available
    let guestLogs = [];
    if (window.electronAPI && window.electronAPI.getGuestLogs) {
      guestLogs = await window.electronAPI.getGuestLogs();
    }
    setLogs(guestLogs || []);
    if (window.electronAPI && window.electronAPI.saveLogs) {
      await window.electronAPI.saveLogs(guestLogs || []);
    }

    const newSettings = {
      ...settings,
      authMode: 'guest',
      userToken: null,
      userProfile: null,
      name: 'Guest Hydrator'
    };
    await handleSave(newSettings);
  };

  const handleLogout = async () => {
    // Retrieve guest logs for the guest session
    let guestLogs = [];
    if (window.electronAPI && window.electronAPI.getGuestLogs) {
      guestLogs = await window.electronAPI.getGuestLogs();
    }

    const newSettings = {
      ...settings,
      authMode: null,
      userToken: null,
      userProfile: null,
      name: '',
      onboardingComplete: false
    };

    setLogs(guestLogs || []);
    setSettings(newSettings);

    if (window.electronAPI) {
      await window.electronAPI.clearAuth();
      await window.electronAPI.saveSettings(newSettings);
      if (window.electronAPI.saveLogs) {
        await window.electronAPI.saveLogs(guestLogs || []);
      }
    }
  };

  const handleFinishOnboarding = async () => {
    const newSettings = {
      ...settings,
      onboardingComplete: true
    };
    await handleSave(newSettings);
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

  const openWebPortal = () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal('http://localhost:3000');
    } else {
      window.open('http://localhost:3000', '_blank');
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

  // -------------------------------------------------------------
  // SCREEN 1: FIRST-LAUNCH AUTH SCREEN (LOGIN OR GUEST MODE)
  // -------------------------------------------------------------
  if (!settings.authMode) {
    return (
      <div className="onboarding-container fade-in">
        <div className="onboarding-box">
          <div className="brand-center">
            <div className="brand-icon-large">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h2>Welcome to Water Buddy</h2>
            <p>Your ambient desktop hydration companion. Choose how you want to start.</p>
          </div>

          <div className="auth-choice-grid">
            {/* Option A: Login */}
            <div className="auth-card">
              <div className="auth-card-header">
                <span className="auth-badge">CLOUD SYNC</span>
                <h3>Sign In with Account</h3>
                <p>Sync your water logs across your Windows PC and mobile devices.</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-field"
                />

                {loginError && <p className="error-text">{loginError}</p>}

                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Signing in...' : 'Sign In & Connect'}
                </button>

                <div className="quick-test-creds">
                  <span className="quick-creds-label">Test Accounts:</span>
                  <div className="quick-creds-btns">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('srikant.owner@gmail.com');
                        setLoginPassword('qwertywsx');
                      }}
                      className="btn-quick-cred"
                    >
                      👑 Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('srikant.user@gmail.com');
                        setLoginPassword('qwertywsx');
                      }}
                      className="btn-quick-cred"
                    >
                      💧 User
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Option B: Guest Mode */}
            <div className="auth-card guest-card">
              <div className="auth-card-header">
                <span className="auth-badge guest-badge">OFFLINE FIRST</span>
                <h3>Continue as Guest Mode</h3>
                <p>Start tracking immediately on this PC without an account. All data stays 100% private and offline.</p>
              </div>

              <div className="guest-perks">
                <p>✓ Instant setup — no password needed</p>
                <p>✓ Full tray companion &amp; customizable reminders</p>
                <p>✓ Register anytime on our web portal to sync</p>
              </div>

              <button 
                type="button" 
                onClick={handleContinueAsGuest} 
                className="btn-accent"
              >
                Continue as Guest ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: INTERACTIVE ONBOARDING WIZARD
  // -------------------------------------------------------------
  if (!settings.onboardingComplete) {
    const computedGoal = computeIntake(settings.weight, settings.medicalInfo);

    return (
      <div className="onboarding-container fade-in">
        <div className="onboarding-box wizard-box">
          {/* Wizard Progress Steps */}
          <div className="wizard-progress">
            <span className={`step-dot ${onboardingStep >= 1 ? 'active' : ''}`}>1. Health Info</span>
            <span className="step-line"></span>
            <span className={`step-dot ${onboardingStep >= 2 ? 'active' : ''}`}>2. Reminders</span>
            <span className="step-line"></span>
            <span className={`step-dot ${onboardingStep >= 3 ? 'active' : ''}`}>3. Theme &amp; Position</span>
          </div>

          {/* Step 1: Health & Biometrics */}
          {onboardingStep === 1 && (
            <div className="wizard-step fade-in">
              <h2>Step 1: Your Health &amp; Biometrics</h2>
              <p className="wizard-subtitle">We use your body weight and health condition to auto-calculate your daily water goal.</p>

              <div className="form-group">
                <label>What should we call you? (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={settings.name || ''}
                  onChange={(e) => handleSave({ ...settings, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Body Weight (kg)</label>
                  <input
                    type="number"
                    min="35"
                    max="180"
                    value={settings.weight || 70}
                    onChange={(e) => handleSave({ ...settings, weight: parseInt(e.target.value) || 70 })}
                  />
                  <small className="field-hint">35 ml recommended per 1 kg</small>
                </div>

                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    min="110"
                    max="220"
                    value={settings.height || 170}
                    onChange={(e) => handleSave({ ...settings, height: parseInt(e.target.value) || 170 })}
                  />
                  <small className="field-hint">Basic body metric</small>
                </div>
              </div>

              <div className="form-group">
                <label>Medical &amp; Physical Activity Condition</label>
                <select
                  value={settings.medicalInfo || 'Normal Healthy'}
                  onChange={(e) => handleSave({ ...settings, medicalInfo: e.target.value })}
                >
                  <option value="Normal Healthy">Normal Healthy (Standard routine)</option>
                  <option value="Athletic / Daily Workout">Athletic / Daily Workout (+600 ml)</option>
                  <option value="Warm / Tropical Climate">Warm / Tropical Climate (+500 ml)</option>
                  <option value="Pregnant / Nursing">Pregnant / Nursing (+700 ml)</option>
                  <option value="Fluid Restricted (Medical)">Fluid Restricted by Doctor (-500 ml)</option>
                </select>
              </div>

              {/* Real-time Computed Goal Banner */}
              <div className="computed-banner">
                <div>
                  <span className="computed-label">Auto-Calculated Daily Water Goal</span>
                  <span className="computed-sub">Calculated for your body and routine</span>
                </div>
                <div className="computed-val mono-num">
                  {computedGoal.toLocaleString()} <small>ml / day</small>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setOnboardingStep(2)} 
                className="btn-primary mt-4"
              >
                Next: Configure Reminders ➔
              </button>
            </div>
          )}

          {/* Step 2: Reminders & Sip Volume */}
          {onboardingStep === 2 && (
            <div className="wizard-step fade-in">
              <h2>Step 2: Set Your Reminders</h2>
              <p className="wizard-subtitle">Choose how often Water Buddy reminds you and your preferred cup size.</p>

              <div className="card">
                <h4 className="card-title">How often to remind you</h4>
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
                <h4 className="card-title">Your usual cup or glass size</h4>
                <div className="interval-grid cup-grid">
                  {[
                    { value: 100, label: '100 ml', icon: '🥛', desc: 'Small Cup' },
                    { value: 150, label: '150 ml', icon: '☕', desc: 'Regular Cup' },
                    { value: 250, label: '250 ml', icon: '🧊', desc: 'Large Glass' },
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

              <div className="flex-buttons">
                <button type="button" onClick={() => setOnboardingStep(1)} className="btn-secondary">
                  ⬅ Back
                </button>
                <button type="button" onClick={() => setOnboardingStep(3)} className="btn-primary flex-1">
                  Next: Notification Theme &amp; Position ➔
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Notification Themes & Screen Positions */}
          {onboardingStep === 3 && (
            <div className="wizard-step fade-in">
              <h2>Step 3: Notification Style &amp; Position</h2>
              <p className="wizard-subtitle">Choose the visual theme and where the popup should appear on your screen.</p>

              {/* Notification Themes */}
              <div className="card">
                <h4 className="card-title">Choose Notification Theme</h4>
                <div className="interval-grid themes-grid">
                  {[
                    { id: 'oceanic', label: 'Oceanic Aqua', desc: 'Crystal Aqua glow', color: '#38BDF8' },
                    { id: 'emerald', label: 'Cyber Emerald', desc: 'Vibrant Green glow', color: '#34D399' },
                    { id: 'obsidian', label: 'Midnight Obsidian', desc: 'Deep Monochrome', color: '#FFFFFF' },
                    { id: 'neon', label: 'Neon Twilight', desc: 'Violet & Cyan', color: '#C084FC' }
                  ].map(th => (
                    <button
                      key={th.id}
                      type="button"
                      className={`choice-card theme-choice ${settings.notificationTheme === th.id ? 'selected' : ''}`}
                      onClick={() => handleSave({ ...settings, notificationTheme: th.id })}
                    >
                      <span className="theme-color-dot" style={{ backgroundColor: th.color, boxShadow: `0 0 10px ${th.color}` }}></span>
                      <span className="choice-val">{th.label}</span>
                      <span className="choice-sub">{th.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Positions */}
              <div className="card">
                <h4 className="card-title">Popup Screen Position</h4>
                <div className="interval-grid positions-grid">
                  {[
                    { id: 'bottom-right', label: 'Bottom Right ↘', desc: 'Above clock (Recommended)' },
                    { id: 'bottom-left', label: 'Bottom Left ↙', desc: 'Opposite corner' },
                    { id: 'top-right', label: 'Top Right ↗', desc: 'Top notification banner' },
                    { id: 'bottom-center', label: 'Bottom Center ⬇', desc: 'Centered floating pill' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      className={`choice-card ${settings.notificationPosition === pos.id ? 'selected' : ''}`}
                      onClick={() => handleSave({ ...settings, notificationPosition: pos.id })}
                    >
                      <span className="choice-val text-sm">{pos.label}</span>
                      <span className="choice-sub">{pos.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Button */}
              <div className="card test-card">
                <div className="test-left">
                  <h4 className="card-title">Test Your Notification</h4>
                  <p className="card-subtext">See the popup in your chosen theme and screen position right now.</p>
                  {testNotice && <span className="test-success">✓ Notification triggered on your screen!</span>}
                </div>
                <button type="button" onClick={handleTestReminder} className="btn-accent">
                  🔔 Preview Notification
                </button>
              </div>

              <div className="flex-buttons">
                <button type="button" onClick={() => setOnboardingStep(2)} className="btn-secondary">
                  ⬅ Back
                </button>
                <button type="button" onClick={handleFinishOnboarding} className="btn-primary flex-1">
                  ✓ Finish Setup &amp; Start Water Buddy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: MAIN APPLICATION DASHBOARD (NORMAL APP USAGE)
  // -------------------------------------------------------------
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

        {/* Guest Mode Callout Banner */}
        {settings.authMode === 'guest' && (
          <div className="guest-sidebar-pill" onClick={openWebPortal}>
            <span className="guest-dot">🟡</span>
            <div className="guest-text">
              <strong>Guest Mode</strong>
              <small>Register on Web to Sync ↗</small>
            </div>
          </div>
        )}

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
            <span>Reminders &amp; Themes</span>
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
            <span>Backup &amp; Account</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill">
            <span className="status-dot"></span>
            <span>Running quietly</span>
          </div>

          {settings.authMode === 'logged_in' ? (
            <div className="sidebar-account-section">
              <div className="user-mini-badge">
                <span className="user-dot">🟢</span>
                <span className="user-email-text">{settings.userProfile?.email || 'Logged In'}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-sidebar-logout"
                title="Sign out of this PC and return to guest / login screen"
              >
                Sign Out / Switch
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, authMode: null }))}
              className="btn-sidebar-login"
            >
              Sign In to Sync
            </button>
          )}
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
              <p>Your details and health condition used to compute your daily hydration target.</p>
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
                  <small className="field-hint">35 ml recommended per 1 kg</small>
                </div>

                <div className="form-group">
                  <label htmlFor="userHeight">Height (cm)</label>
                  <input 
                    id="userHeight"
                    type="number" 
                    min="100"
                    max="250"
                    value={settings.height || 170} 
                    onChange={(e) => handleSave({ ...settings, height: parseInt(e.target.value) || 0 })}
                  />
                  <small className="field-hint">Basic body metric</small>
                </div>
              </div>

              <div className="form-group">
                <label>Health &amp; Physical Activity Tier</label>
                <select
                  value={settings.medicalInfo || 'Normal Healthy'}
                  onChange={(e) => handleSave({ ...settings, medicalInfo: e.target.value })}
                >
                  <option value="Normal Healthy">Normal Healthy (Standard routine)</option>
                  <option value="Athletic / Daily Workout">Athletic / Daily Workout (+600 ml)</option>
                  <option value="Warm / Tropical Climate">Warm / Tropical Climate (+500 ml)</option>
                  <option value="Pregnant / Nursing">Pregnant / Nursing (+700 ml)</option>
                  <option value="Fluid Restricted (Medical)">Fluid Restricted by Doctor (-500 ml)</option>
                </select>
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
                  Calculated based on {settings.weight || 70}kg weight and {settings.medicalInfo || 'Normal Healthy'} condition
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

        {/* 2. REMINDER SETTINGS & THEMES */}
        {activeTab === 'schedule' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Reminders, Themes &amp; Position</h3>
              <p>Configure reminder frequency, cup volumes, visual notification themes, and screen positioning.</p>
            </div>

            {/* Reminder Interval */}
            <div className="card">
              <h4 className="card-title">1. How often to remind you</h4>
              <p className="card-subtext">Minutes between each water reminder popup.</p>
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

            {/* Cup Size */}
            <div className="card">
              <h4 className="card-title">2. How much to drink each time</h4>
              <p className="card-subtext">Default amount added when clicking "Drink" on the reminder.</p>
              <div className="interval-grid cup-grid">
                {[
                  { value: 100, label: '100 ml', icon: '🥛', desc: 'Small Cup' },
                  { value: 150, label: '150 ml', icon: '☕', desc: 'Regular Cup' },
                  { value: 250, label: '250 ml', icon: '🧊', desc: 'Large Glass' },
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

            {/* Notification Theme Selector */}
            <div className="card">
              <h4 className="card-title">3. Notification Visual Theme</h4>
              <p className="card-subtext">Choose the color styling for the floating reminder popup.</p>
              <div className="interval-grid themes-grid">
                {[
                  { id: 'oceanic', label: 'Oceanic Aqua', desc: 'Crystal Aqua glow', color: '#38BDF8' },
                  { id: 'emerald', label: 'Cyber Emerald', desc: 'Vibrant Green glow', color: '#34D399' },
                  { id: 'obsidian', label: 'Midnight Obsidian', desc: 'Deep Monochrome', color: '#FFFFFF' },
                  { id: 'neon', label: 'Neon Twilight', desc: 'Violet & Cyan glow', color: '#C084FC' }
                ].map(th => (
                  <button
                    key={th.id}
                    type="button"
                    className={`choice-card theme-choice ${settings.notificationTheme === th.id ? 'selected' : ''}`}
                    onClick={() => handleSave({ ...settings, notificationTheme: th.id })}
                  >
                    <span className="theme-color-dot" style={{ backgroundColor: th.color, boxShadow: `0 0 10px ${th.color}` }}></span>
                    <span className="choice-val">{th.label}</span>
                    <span className="choice-sub">{th.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Position Selector */}
            <div className="card">
              <h4 className="card-title">4. Screen Popup Position</h4>
              <p className="card-subtext">Select where on your screen the notification pill appears.</p>
              <div className="interval-grid positions-grid">
                {[
                  { id: 'bottom-right', label: 'Bottom Right ↘', desc: 'Above clock (Recommended)' },
                  { id: 'bottom-left', label: 'Bottom Left ↙', desc: 'Opposite corner' },
                  { id: 'top-right', label: 'Top Right ↗', desc: 'Top notification banner' },
                  { id: 'bottom-center', label: 'Bottom Center ⬇', desc: 'Centered floating pill' }
                ].map(pos => (
                  <button
                    key={pos.id}
                    type="button"
                    className={`choice-card ${settings.notificationPosition === pos.id ? 'selected' : ''}`}
                    onClick={() => handleSave({ ...settings, notificationPosition: pos.id })}
                  >
                    <span className="choice-val text-sm">{pos.label}</span>
                    <span className="choice-sub">{pos.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="card">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={settings.soundOn !== false} 
                  onChange={(e) => handleSave({ ...settings, soundOn: e.target.checked })}
                />
                <div className="checkbox-text">
                  <strong>Play chime sound when reminder appears</strong>
                  <p>Plays a soft water droplet chime so you don't miss your reminder.</p>
                </div>
              </label>
            </div>

            {/* Test Reminder Button */}
            <div className="card test-card">
              <div className="test-left">
                <h4 className="card-title">Test Reminder Notification</h4>
                <p className="card-subtext">Click to preview the popup in your selected theme and screen position.</p>
                {testNotice && <span className="test-success">✓ Notification triggered on your screen!</span>}
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
              <p className="card-subtext">Click any button below to instantly log water.</p>
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
              <h3>Badges &amp; Rewards</h3>
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
                  <strong>Do Not Disturb (Game &amp; Full Screen)</strong>
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

        {/* 6. BACKUP & CLOUD ACCOUNT */}
        {activeTab === 'sync' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Backup &amp; Cloud Sync</h3>
              <p>Synchronize your water history and biometrics with the Water Buddy web portal.</p>
            </div>

            {settings.authMode === 'guest' ? (
              <div className="card guest-warning-card">
                <div className="guest-banner-icon">🟡</div>
                <div>
                  <h4 className="font-bold text-white text-base">You are currently in Guest Mode (Offline)</h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Your hydration data is saved locally on this PC. To sync your progress across devices and unlock Pro features, please register an account through our web portal.
                  </p>
                  <button 
                    type="button" 
                    onClick={openWebPortal}
                    className="btn-accent mt-4 inline-flex items-center gap-2"
                  >
                    <span>Register on Web Portal ↗</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="account-info-row">
                  <div>
                    <span className="text-xs text-[#38BDF8] font-mono uppercase">Connected Account</span>
                    <h4 className="text-lg font-bold text-white">{settings.userProfile?.email || 'Logged In'}</h4>
                    <span className="text-xs text-emerald-400 font-mono">✓ Cloud Sync Active (Auto 5min)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-sidebar-logout text-xs"
                  >
                    🚪 Sign Out of this Device
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
