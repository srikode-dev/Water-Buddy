import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { playChimeByName, playBasaltDrop, playIcelandicChime, playOceanRipple, playSingingBowl } from '../utils/audio.js';
import { API_BASE_URL, WEB_PORTAL_URL } from '../utils/api.js';
import './index.css';

// Deduplicate helper: cleans identical logs created in the same time window or with matching ID
function deduplicateLogs(rawLogs) {
  if (!Array.isArray(rawLogs)) return [];
  const deduped = [];
  for (const log of rawLogs) {
    if (!log) continue;
    const logTime = new Date(log.timestamp).getTime();
    const exists = deduped.some(existing => {
      if (existing.id && log.id && existing.id === log.id) return true;
      const existingTime = new Date(existing.timestamp).getTime();
      return Math.abs(existingTime - logTime) < 2500 &&
             existing.amount === log.amount &&
             (existing.beverageType || 'water') === (log.beverageType || 'water');
    });
    if (!exists) {
      deduped.push(log);
    }
  }
  return deduped;
}

function formatRelativeTime(isoString) {
  if (!isoString) return 'Not synced yet';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Recently';
  }
}

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
    chimeTone: 'icelandic',
    chimeVolume: 0.75,
    activeHoursStart: '08:00',
    activeHoursEnd: '22:00',
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
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [customMlInput, setCustomMlInput] = useState('');

  // First-launch login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic feature entitlements from server
  const [entitlements, setEntitlements] = useState({
    isPro: false,
    plan: 'Free',
    allowedFeatureIds: [
      'tray_companion',
      'biometrics_goal',
      'offline_sqlite_vault',
      'standard_reminder_cycles',
      'adaptive_sip_pacing',
      'custom_icelandic_chimes',
      'quiet_hours_dnd',
      'cloud_multi_device_sync',
      'perpetual_analytics_history',
      'data_export_csv'
    ]
  });

  // Desktop Release & Auto-Updater state
  const [updateState, setUpdateState] = useState({
    status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
    currentVersion: '1.0.0',
    availableVersion: null,
    releaseNotes: null,
    progress: 0,
    error: null
  });

  const handleCheckUpdates = async () => {
    if (window.electronAPI?.checkForUpdates) {
      setUpdateState(prev => ({ ...prev, status: 'checking', error: null }));
      await window.electronAPI.checkForUpdates();
    }
  };

  const handleRestartAndInstall = () => {
    if (window.electronAPI?.restartAndInstallUpdate) {
      window.electronAPI.restartAndInstallUpdate();
    } else {
      setSyncNotice('🚀 Update applied! In packaged build, this restarts Water Buddy.');
      setTimeout(() => setSyncNotice(''), 4000);
    }
  };

  const handleSimulateUpdate = () => {
    setUpdateState(prev => ({
      ...prev,
      status: 'checking',
      error: null
    }));
    playIcelandicChime();
    setTimeout(() => {
      setUpdateState(prev => ({
        ...prev,
        status: 'available',
        availableVersion: '1.0.1',
        releaseNotes: 'Telemetry synchronization fix, new chimes, and speed optimizations.'
      }));
      let prog = 15;
      const interval = setInterval(() => {
        prog += 25;
        if (prog >= 100) {
          clearInterval(interval);
          setUpdateState(prev => ({
            ...prev,
            status: 'downloaded',
            availableVersion: '1.0.1',
            progress: 100
          }));
          playIcelandicChime();
        } else {
          setUpdateState(prev => ({
            ...prev,
            status: 'downloading',
            progress: prog
          }));
        }
      }, 400);
    }, 1000);
  };

  const fetchEntitlements = async (token) => {
    try {
      const headers = {};
      const authToken = token || settings.userToken;
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/entitlements`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEntitlements(data);
      }
    } catch (e) {
      console.log('Entitlements fetch failed', e);
    }
  };

  const isFeatureAllowed = (featureId) => {
    if (entitlements.isPro) return true;
    if (Array.isArray(entitlements.allowedFeatureIds) && entitlements.allowedFeatureIds.includes(featureId)) {
      return true;
    }
    return false;
  };

  // Onboarding wizard step
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    fetchEntitlements(settings.userToken);

    if (window.electronAPI) {
      window.electronAPI.getSettings().then(s => {
        if (s) {
          setSettings(prev => ({
            ...prev,
            ...s,
            soundOn: s.soundOn !== undefined ? s.soundOn : true,
            chimeTone: s.chimeTone || 'icelandic',
            chimeVolume: s.chimeVolume !== undefined ? s.chimeVolume : 0.75,
            manualSipMl: s.manualSipMl || 150,
            intervalMin: s.intervalMin || 45,
            activeHoursStart: s.activeHoursStart || '08:00',
            activeHoursEnd: s.activeHoursEnd || '22:00',
            notificationTheme: s.notificationTheme || 'oceanic',
            notificationPosition: s.notificationPosition || 'bottom-right'
          }));
          if (s.userToken) {
            fetchEntitlements(s.userToken);
          }
          if (s.manualSipMl) {
            setCustomMlInput(s.manualSipMl.toString());
          }
        }
      });

      window.electronAPI.getLogs().then(l => {
        if (l) setLogs(deduplicateLogs(l));
      });

      if (window.electronAPI.getLastSync) {
        window.electronAPI.getLastSync().then(t => {
          if (t) setLastSyncTime(t);
        });
      }

      window.electronAPI.onSyncLog((newLog) => {
        setLogs(prev => deduplicateLogs([...prev, newLog]));
      });

      if (window.electronAPI.getAppVersion) {
        window.electronAPI.getAppVersion().then(v => {
          if (v) setUpdateState(prev => ({ ...prev, currentVersion: v }));
        });
      }

      if (window.electronAPI.getUpdateStatus) {
        window.electronAPI.getUpdateStatus().then(st => {
          if (st) setUpdateState(prev => ({ ...prev, ...st }));
        });
      }

      if (window.electronAPI.onUpdateStatus) {
        window.electronAPI.onUpdateStatus((st) => {
          setUpdateState(prev => ({ ...prev, ...st }));
        });
      }
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
      if (settings.authMode === 'guest' && window.electronAPI && window.electronAPI.saveGuestLogs) {
        await window.electronAPI.saveGuestLogs(logs);
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        const user = data.user || {};

        let userLogs = [];
        try {
          const logsRes = await fetch(`${API_BASE_URL}/api/sync/logs`, {
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

        const dedupedUserLogs = deduplicateLogs(userLogs);
        setLogs(dedupedUserLogs);
        if (window.electronAPI && window.electronAPI.saveLogs) {
          await window.electronAPI.saveLogs(dedupedUserLogs);
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
        fetchEntitlements(data.token);
      } else {
        setLoginError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Desktop login error:', err);
      setLoginError(`Could not connect to authentication server (${API_BASE_URL}). Please check your connection.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    let guestLogs = [];
    if (window.electronAPI && window.electronAPI.getGuestLogs) {
      guestLogs = await window.electronAPI.getGuestLogs();
    }
    const dedupedGuestLogs = deduplicateLogs(guestLogs || []);
    setLogs(dedupedGuestLogs);
    if (window.electronAPI && window.electronAPI.saveLogs) {
      await window.electronAPI.saveLogs(dedupedGuestLogs);
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

    const deduped = deduplicateLogs(guestLogs || []);
    setLogs(deduped);
    setSettings(newSettings);

    if (window.electronAPI) {
      await window.electronAPI.clearAuth();
      await window.electronAPI.saveSettings(newSettings);
      if (window.electronAPI.saveLogs) {
        await window.electronAPI.saveLogs(deduped);
      }
    }
    fetchEntitlements(null);
  };

  const handleFinishOnboarding = async () => {
    const newSettings = {
      ...settings,
      onboardingComplete: true
    };
    await handleSave(newSettings);
  };

  const handleLogQuickWater = (amount, beverageType = 'water') => {
    const parsedAmount = parseInt(amount, 10) || 150;
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      response: 'yes',
      amount: parsedAmount,
      beverageType,
      hydrationMultiplier: beverageType === 'coffee' ? 0.5 : beverageType === 'tea' ? 0.8 : 1,
      synced: false
    };

    // Play subtle splash feedback
    if (settings.soundOn) {
      playBasaltDrop(settings.chimeVolume * 0.7);
    }

    // Update state once with deduplication protection
    setLogs(prev => deduplicateLogs([...prev, newLog]));

    if (window.electronAPI && window.electronAPI.logWater) {
      window.electronAPI.logWater(newLog);
    }
  };

  const handleDeleteLog = async (logId) => {
    const updated = logs.filter(l => l.id !== logId);
    setLogs(updated);
    if (window.electronAPI && window.electronAPI.saveLogs) {
      await window.electronAPI.saveLogs(updated);
    }
  };

  const handleCleanDuplicates = async () => {
    const deduped = deduplicateLogs(logs);
    setLogs(deduped);
    if (window.electronAPI && window.electronAPI.saveLogs) {
      await window.electronAPI.saveLogs(deduped);
    }
    setSyncNotice('✓ Cleaned up duplicate log entries!');
    setTimeout(() => setSyncNotice(''), 3000);
  };

  const handleSyncNow = async () => {
    if (!window.electronAPI || !window.electronAPI.syncNow) return;

    if (!isFeatureAllowed('cloud_multi_device_sync')) {
      setSyncNotice('🔒 Cloud Sync is restricted on the Community Free tier by the owner. Your data remains safe in your Local SQLite Vault.');
      setTimeout(() => setSyncNotice(''), 4500);
      return;
    }

    setIsSyncing(true);
    setSyncNotice('Connecting to Water Buddy Cloud...');

    try {
      const res = await window.electronAPI.syncNow();
      if (res && res.success) {
        const newTime = res.lastSync || new Date().toISOString();
        setLastSyncTime(newTime);
        if (res.logs) {
          setLogs(deduplicateLogs(res.logs));
        }
        setSyncNotice(`✓ Cloud sync complete (${res.syncedCount || 0} entries updated)`);
      } else {
        if (res?.reason === 'unauthenticated' || res?.status === 401 || res?.status === 403) {
          setSyncNotice('⚠️ Session expired: Click "Sign Out / Switch" below, then sign back in.');
        } else if (res?.code === 'FEATURE_LOCKED' || res?.error?.includes('restricted')) {
          setSyncNotice('🔒 Cloud Sync is restricted on the Free plan by the owner.');
        } else {
          setSyncNotice(`⚠️ Sync failed: ${res?.error || 'Backend unreachable'}`);
        }
      }
    } catch (err) {
      setSyncNotice('⚠️ Sync error: ' + err.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(''), 4000);
    }
  };

  const handleTestReminder = () => {
    if (window.electronAPI && window.electronAPI.triggerTestReminder) {
      window.electronAPI.triggerTestReminder();
      setTestNotice(true);
      setTimeout(() => setTestNotice(false), 3000);
    }
  };

  const handlePreviewChime = (tone) => {
    playChimeByName(tone, settings.chimeVolume);
  };

  const handleSelectChime = (chimeId) => {
    if (chimeId !== 'basalt' && !isFeatureAllowed('custom_icelandic_chimes')) {
      handlePreviewChime(chimeId);
      setSyncNotice('🔒 Icelandic Sound Library is a Pro perk. Upgrade to unlock all acoustic chimes!');
      setTimeout(() => setSyncNotice(''), 4000);
      return;
    }
    handleSave({ ...settings, chimeTone: chimeId });
    handlePreviewChime(chimeId);
  };

  const handleExportCsv = () => {
    if (!isFeatureAllowed('data_export_csv')) {
      setSyncNotice('🔒 Telemetry CSV Export is a Pro perk. Upgrade to unlock data export!');
      setTimeout(() => setSyncNotice(''), 4000);
      return;
    }

    const csvHeader = 'Timestamp,AmountMl,Response,Beverage\n';
    const rows = logs
      .map(l => `"${l.timestamp}","${l.amount || 0}","${l.response || 'yes'}","${l.beverageType || 'water'}"`)
      .join('\n');
    const blob = new Blob([csvHeader + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-buddy-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a);
    setSyncNotice('✓ Telemetry records exported to CSV!');
    setTimeout(() => setSyncNotice(''), 3000);
  };

  const openWebPortal = () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(WEB_PORTAL_URL);
    } else {
      window.open(WEB_PORTAL_URL, '_blank');
    }
  };

  const openWebPricing = () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(WEB_PORTAL_URL);
    } else {
      window.open(WEB_PORTAL_URL, '_blank');
    }
  };

  const todayStr = new Date().toDateString();
  const todayLogs = deduplicateLogs(logs).filter(l => l.response === 'yes' && new Date(l.timestamp).toDateString() === todayStr);
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

  // Custom Frameless Window Titlebar
  const renderTitlebar = () => (
    <header className="custom-titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-brand">
          <div className="titlebar-droplet">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <span className="titlebar-title">Water Buddy</span>
          <span className="titlebar-badge">Abyssal Edition</span>
          {updateState.status === 'downloaded' && (
            <button
              type="button"
              onClick={handleRestartAndInstall}
              className="px-2.5 py-0.5 ml-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
              title="Click to restart and apply update"
            >
              🚀 Update Ready (Restart)
            </button>
          )}
          {updateState.status === 'downloading' && (
            <span className="px-2 py-0.5 ml-2 rounded-full bg-sky-500/20 text-[#38BDF8] border border-sky-500/30 text-[10px] font-mono">
              ⬇️ Downloading update ({updateState.progress}%)
            </span>
          )}
        </div>
      </div>

      <div className="titlebar-actions">
        <button
          type="button"
          className="titlebar-btn btn-win-min"
          onClick={() => window.electronAPI?.minimizeWindow?.()}
          title="Minimize"
        >
          <svg width="10" height="2" viewBox="0 0 10 2">
            <rect width="10" height="2" fill="currentColor" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn btn-win-max"
          onClick={() => window.electronAPI?.maximizeWindow?.()}
          title="Maximize / Restore"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1" width="8" height="8" rx="1.5" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn btn-win-close"
          onClick={() => window.electronAPI?.closeWindow?.()}
          title="Close to System Tray"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" />
            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
          </svg>
        </button>
      </div>
    </header>
  );

  // -------------------------------------------------------------
  // SCREEN 1: FIRST-LAUNCH AUTH SCREEN
  // -------------------------------------------------------------
  if (!settings.authMode) {
    return (
      <div className="app-window">
        {renderTitlebar()}
        <div className="onboarding-container fade-in">
          <div className="onboarding-box glass-card">
          <div className="brand-center">
            <div className="brand-icon-large pulse-glow">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h2>Welcome to Water Buddy</h2>
            <p>Your ambient desktop hydration companion. Built for deep focus and mindful hydration.</p>
          </div>

          <div className="auth-choice-grid">
            {/* Option A: Login */}
            <div className="auth-card glass-surface">
              <div className="auth-card-header">
                <span className="auth-badge">CLOUD SYNC</span>
                <h3>Sign In with Account</h3>
                <p>Sync your water logs across your Windows PC and web portal.</p>
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
                  {isSubmitting ? 'Signing in...' : 'Sign In & Connect ➔'}
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
            <div className="auth-card guest-card glass-surface">
              <div className="auth-card-header">
                <span className="auth-badge guest-badge">OFFLINE FIRST</span>
                <h3>Continue as Guest Mode</h3>
                <p>Start tracking immediately on this PC without an account. All data stays 100% private and offline.</p>
              </div>

              <div className="guest-perks">
                <p>✓ Instant setup — zero sign up needed</p>
                <p>✓ Full tray companion &amp; customizable chimes</p>
                <p>✓ Register anytime on our web portal to sync</p>
              </div>

              <button 
                type="button" 
                onClick={handleContinueAsGuest} 
                className="btn-secondary"
              >
                Continue as Guest ➔
              </button>
            </div>
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
      <div className="app-window">
        {renderTitlebar()}
        <div className="onboarding-container fade-in">
          <div className="onboarding-box wizard-box glass-card">
          <div className="wizard-progress">
            <span className={`step-dot ${onboardingStep >= 1 ? 'active' : ''}`}>1. Health Info</span>
            <span className="step-line"></span>
            <span className={`step-dot ${onboardingStep >= 2 ? 'active' : ''}`}>2. Reminders &amp; Chimes</span>
            <span className="step-line"></span>
            <span className={`step-dot ${onboardingStep >= 3 ? 'active' : ''}`}>3. Theme &amp; Position</span>
          </div>

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
                    min="100"
                    max="250"
                    value={settings.height || 170}
                    onChange={(e) => handleSave({ ...settings, height: parseInt(e.target.value) || 170 })}
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

              <div className="card highlight-card">
                <span className="highlight-label">Computed Daily Goal</span>
                <div className="highlight-value">
                  <span className="mono-num">{computedGoal.toLocaleString()}</span>
                  <span className="unit">ml / day</span>
                </div>
              </div>

              <button type="button" onClick={() => setOnboardingStep(2)} className="btn-primary mt-4">
                Next: Reminders &amp; Chimes ➔
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="wizard-step fade-in">
              <h2>Step 2: Reminders &amp; Acoustic Chimes</h2>
              <p className="wizard-subtitle">Pick reminder frequency, intake volume, and acoustic chime notification.</p>

              <div className="card">
                <h4 className="card-title">Reminder Frequency</h4>
                <div className="interval-grid">
                  {[
                    { value: 1, label: '1 min', sub: 'Quick test' },
                    { value: 20, label: '20 min', sub: 'Frequent' },
                    { value: 30, label: '30 min', sub: 'Active' },
                    { value: 45, label: '45 min', sub: 'Recommended' },
                    { value: 60, label: '60 min', sub: 'Hourly' }
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
                <h4 className="card-title">Default Cup Volume</h4>
                <div className="interval-grid cup-grid">
                  {[
                    { value: 100, label: '100 ml', icon: '🥛', desc: 'Small' },
                    { value: 150, label: '150 ml', icon: '☕', desc: 'Regular' },
                    { value: 250, label: '250 ml', icon: '🧊', desc: 'Glass' },
                    { value: 500, label: '500 ml', icon: '🍶', desc: 'Bottle' }
                  ].map(cup => (
                    <button
                      key={cup.value}
                      type="button"
                      className={`choice-card ${settings.manualSipMl === cup.value ? 'selected' : ''}`}
                      onClick={() => {
                        handleSave({ ...settings, manualSipMl: cup.value });
                        setCustomMlInput(cup.value.toString());
                      }}
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
                  Next: Theme &amp; Position ➔
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="wizard-step fade-in">
              <h2>Step 3: Theme &amp; Popup Position</h2>
              <p className="wizard-subtitle">Choose the visual styling and screen position for your floating HUD companion.</p>

              <div className="card">
                <h4 className="card-title">Choose Theme</h4>
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

              <div className="flex-buttons">
                <button type="button" onClick={() => setOnboardingStep(2)} className="btn-secondary">
                  ⬅ Back
                </button>
                <button type="button" onClick={handleFinishOnboarding} className="btn-primary flex-1">
                  ✓ Finish Setup &amp; Launch Water Buddy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: MAIN APPLICATION DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="app-window">
      {renderTitlebar()}
      <div className="settings-layout">
        {/* Frosted Sidebar */}
      <aside className="sidebar frosted-sidebar">
        <div className="brand">
          <div className="brand-icon pulse-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="brand-meta">
            <h2>Water Buddy</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span 
                className={`brand-badge cursor-pointer ${entitlements.isPro ? 'pro-badge' : ''}`}
                onClick={openWebPricing}
                title="Click to view pricing perks"
              >
                {entitlements.isPro ? '⭐ Pro Lifetime' : '💧 Community Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Mode Callout Banner */}
        {settings.authMode === 'guest' && (
          <div className="guest-sidebar-pill" onClick={openWebPortal}>
            <span className="guest-dot">🟡</span>
            <div className="guest-text">
              <strong>Guest Mode (Offline)</strong>
              <small>Click to Register &amp; Sync ↗</small>
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
          {/* Live Sync Status Pill */}
          <div className="sidebar-sync-hud" onClick={handleSyncNow} title="Click to synchronize now with cloud database">
            <div className="sync-hud-top">
              <span className={`sync-status-dot ${isSyncing ? 'spinning-dot' : settings.authMode === 'logged_in' ? 'connected' : 'offline'}`}></span>
              <span className="sync-status-label">
                {isSyncing ? 'Syncing...' : settings.authMode === 'logged_in' ? 'Cloud Synced' : 'Offline Mode'}
              </span>
              <button 
                type="button" 
                className={`btn-sync-mini ${isSyncing ? 'spin-anim' : ''}`}
                disabled={isSyncing}
                title="Sync Now"
              >
                🔄
              </button>
            </div>
            <span className="sync-hud-sub mono-num">
              Last: {formatRelativeTime(lastSyncTime)}
            </span>
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
          <div className="toast-notice fade-in">
            ✓ Settings saved
          </div>
        )}
        {syncNotice && (
          <div className="toast-notice sync-toast fade-in">
            {syncNotice}
          </div>
        )}

        {/* 1. MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>My Profile &amp; Biometrics</h3>
              <p>Your physical details and health condition used to calculate your customized daily hydration goal.</p>
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Form Controls */}
              <div className="grid-col">
                <div className="card glass-card">
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
              </div>

              {/* Right Column: Goal Breakdown & Stats */}
              <div className="grid-col">
                <div className="card highlight-card glass-card">
                  <div className="highlight-content">
                    <span className="highlight-label">YOUR COMPUTED DAILY TARGET</span>
                    <div className="highlight-value">
                      <span className="mono-num">{effectiveGoal.toLocaleString()}</span>
                      <span className="unit">ml / day</span>
                    </div>
                    <p className="highlight-desc">
                      Computed from {settings.weight || 70}kg body mass &amp; {settings.medicalInfo || 'Normal Healthy'} lifestyle
                      {weatherBoost > 0 && ` + ${weatherBoost}ml adaptive boost for warm weather (${temp}°C)`}.
                    </p>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-number mono-num">{settings.streak || 0}</span>
                    <span className="stat-label">Days Streak</span>
                  </div>
                  <div className="stat-card glass-card">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-number mono-num">{settings.badges?.length || (totalDrankToday > 0 ? 1 : 0)} / 4</span>
                    <span className="stat-label">Badges Unlocked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. REMINDER SETTINGS & CHIMES */}
        {activeTab === 'schedule' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Reminders, Chimes &amp; Themes</h3>
              <p>Configure reminder pacing, custom intake milliliters, studio sound chimes, and screen positions.</p>
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Timing & Milliliters */}
              <div className="grid-col">
                {/* 1. Interval */}
                <div className="card glass-card">
                  <h4 className="card-title">1. Reminder Interval</h4>
                  <p className="card-subtext">Minutes between each ambient hydration prompt.</p>
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

                {/* 2. Cup Volume & Custom Miltime */}
                <div className="card glass-card">
                  <h4 className="card-title">2. Default Sip Volume</h4>
                  <p className="card-subtext">Default intake added when tapping "Drink" on the reminder.</p>
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
                        onClick={() => {
                          handleSave({ ...settings, manualSipMl: cup.value });
                          setCustomMlInput(cup.value.toString());
                        }}
                      >
                        <span className="cup-icon">{cup.icon}</span>
                        <span className="choice-val mono-num">{cup.label}</span>
                        <span className="choice-sub">{cup.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Milliliters Input */}
                  <div className="custom-ml-box mt-3">
                    <label className="text-xs text-slate-400 font-medium">Or Set Custom Volume (ml):</label>
                    <div className="custom-ml-input-row">
                      <input 
                        type="number"
                        min="50"
                        max="1500"
                        step="25"
                        placeholder="e.g. 200, 330, 750"
                        value={customMlInput}
                        onChange={(e) => setCustomMlInput(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(customMlInput, 10);
                          if (val && val >= 50 && val <= 2000) {
                            handleSave({ ...settings, manualSipMl: val });
                          }
                        }}
                        className="custom-ml-input mono-num"
                      />
                      <button 
                        type="button" 
                        className="btn-apply-ml"
                        onClick={() => {
                          const val = parseInt(customMlInput, 10);
                          if (val && val >= 50 && val <= 2000) {
                            handleSave({ ...settings, manualSipMl: val });
                          }
                        }}
                      >
                        Set Volume
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Daily Active Miltime Window */}
                <div className="card glass-card">
                  <h4 className="card-title">3. Active Notification Hours</h4>
                  <p className="card-subtext">Quiet hours: Reminders will only sound during your active waking period.</p>
                  <div className="time-window-row">
                    <div className="time-col">
                      <label>Wake Start Time</label>
                      <input 
                        type="time" 
                        value={settings.activeHoursStart || '08:00'} 
                        onChange={(e) => handleSave({ ...settings, activeHoursStart: e.target.value })}
                        className="time-picker mono-num"
                      />
                    </div>
                    <span className="time-divider">➔</span>
                    <div className="time-col">
                      <label>Wind-down End Time</label>
                      <input 
                        type="time" 
                        value={settings.activeHoursEnd || '22:00'} 
                        onChange={(e) => handleSave({ ...settings, activeHoursEnd: e.target.value })}
                        className="time-picker mono-num"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Audio Chimes & Visual Styling */}
              <div className="grid-col">
                {/* 4. Acoustic Chimes Synthesizer */}
                <div className="card glass-card">
                  <div className="card-header-row">
                    <div>
                      <h4 className="card-title">4. Notification Acoustic Chimes</h4>
                      <p className="card-subtext">Lossless synthesized chimes matching the web audio suite.</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={settings.soundOn !== false} 
                        onChange={(e) => handleSave({ ...settings, soundOn: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {settings.soundOn !== false && (
                    <div className="chime-suite-container fade-in">
                      <div className="chime-tones-grid">
                        {[
                          { id: 'basalt', name: 'Basalt Drop', desc: 'Resonant water drop plunge (Standard)', icon: '💧', pro: false },
                          { id: 'icelandic', name: 'Icelandic Rain', desc: '432Hz Mineral sine shimmer', icon: '🌊', pro: true },
                          { id: 'ripple', name: 'Ocean Ripple', desc: 'Aqua bubbling chord arpeggio', icon: '🫧', pro: true },
                          { id: 'bowl', name: 'Zen Singing Bowl', desc: '528Hz Meditative sustain', icon: '🎐', pro: true }
                        ].map(chime => {
                          const isLocked = chime.pro && !isFeatureAllowed('custom_icelandic_chimes');
                          return (
                            <div 
                              key={chime.id}
                              className={`chime-card ${settings.chimeTone === chime.id ? 'active' : ''} ${isLocked ? 'locked-chime opacity-80' : ''}`}
                              onClick={() => handleSelectChime(chime.id)}
                            >
                              <div className="chime-card-left">
                                <span className="chime-icon">{chime.icon}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="chime-name">{chime.name}</span>
                                    {isLocked && (
                                      <span 
                                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20 font-bold uppercase cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); openWebPricing(); }}
                                        title="Click to view license perks"
                                      >
                                        🔒 Pro Perk
                                      </span>
                                    )}
                                  </div>
                                  <span className="chime-desc">{chime.desc}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-chime-play"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewChime(chime.id);
                                }}
                                title="Play preview sound"
                              >
                                ▶ Play
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Volume Slider */}
                      <div className="volume-slider-row mt-3">
                        <span className="volume-icon">🔊</span>
                        <input 
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={settings.chimeVolume !== undefined ? settings.chimeVolume : 0.75}
                          onChange={(e) => handleSave({ ...settings, chimeVolume: parseFloat(e.target.value) })}
                          className="volume-slider"
                        />
                        <span className="volume-label mono-num">
                          {Math.round((settings.chimeVolume !== undefined ? settings.chimeVolume : 0.75) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Notification Visual Theme */}
                <div className="card glass-card">
                  <h4 className="card-title">5. Notification Visual Theme</h4>
                  <p className="card-subtext">Choose color ambiance for the floating reminder popup.</p>
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

                {/* 6. Screen Position & Test */}
                <div className="card glass-card">
                  <h4 className="card-title">6. Popup Screen Position</h4>
                  <div className="interval-grid positions-grid">
                    {[
                      { id: 'bottom-right', label: 'Bottom Right ↘', desc: 'Above clock' },
                      { id: 'bottom-left', label: 'Bottom Left ↙', desc: 'Opposite corner' },
                      { id: 'top-right', label: 'Top Right ↗', desc: 'Banner' },
                      { id: 'bottom-center', label: 'Bottom Center ⬇', desc: 'Centered pill' }
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

                  <div className="test-action-bar mt-4">
                    <button 
                      type="button" 
                      className="btn-accent"
                      onClick={handleTestReminder}
                    >
                      🔔 Test Reminder Notification
                    </button>
                    {testNotice && <span className="test-success">✓ Notification triggered on screen!</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DRINK TRACKER & HISTORY */}
        {activeTab === 'history' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Today's Water Tracker</h3>
              <p>Keep track of how much water and hydration you have logged today.</p>
            </div>

            {weatherBoost > 0 && (
              <div className="weather-banner glass-card">
                ☀️ <strong>Hot Weather ({temp}°C):</strong> We added 500 ml to your target so you stay hydrated.
              </div>
            )}

            <div className="dashboard-grid">
              {/* Left Column: Progress Hero & Quick Add */}
              <div className="grid-col">
                <div className="card progress-hero-card glass-card">
                  <div className="progress-info">
                    <span className="progress-label">TODAY'S HYDRATION METRICS</span>
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

                <div className="card glass-card">
                  <h4 className="card-title">Quick Log Water</h4>
                  <p className="card-subtext">Click any preset or beverage to immediately log intake.</p>
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

                  {/* Configured sip quick log button */}
                  <div className="custom-quick-pill-row mt-3">
                    <button
                      type="button"
                      className="quick-pill highlight-pill"
                      onClick={() => handleLogQuickWater(settings.manualSipMl || 150, 'water')}
                    >
                      💧 Log Default Sip (+{settings.manualSipMl || 150} ml)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 7 Days Chart & Deduplicated Drink Logs */}
              <div className="grid-col">
                <div className="card chart-card glass-card">
                  <h4 className="card-title">Past 7 Days Intake</h4>
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

                <div className="card glass-card">
                  <div className="card-header-row">
                    <div>
                      <h4 className="card-title">Recent Drinks Today</h4>
                      <p className="card-subtext">{todayLogs.length} total entries recorded today</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`btn-clean-duplicates ${!isFeatureAllowed('data_export_csv') ? 'opacity-80' : ''}`}
                        onClick={handleExportCsv}
                        title={isFeatureAllowed('data_export_csv') ? 'Export telemetry to CSV' : '🔒 Pro Perk: CSV Export'}
                      >
                        {isFeatureAllowed('data_export_csv') ? '📥 Export CSV' : '🔒 CSV (Pro)'}
                      </button>
                      {todayLogs.length > 1 && (
                        <button
                          type="button"
                          className="btn-clean-duplicates"
                          onClick={handleCleanDuplicates}
                          title="Remove any identical rapid entries"
                        >
                          🧹 Clean Duplicates
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="logs-list">
                    {todayLogs.length === 0 ? (
                      <p className="empty-logs">No drinks logged yet today. Click +150ml or have a glass of water!</p>
                    ) : (
                      todayLogs.slice().reverse().map((log, i) => (
                        <div key={log.id || i} className="log-row">
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
                          <div className="log-right">
                            <span className="log-amount mono-num">+{log.amount} ml</span>
                            <button
                              type="button"
                              className="btn-delete-log"
                              onClick={() => handleDeleteLog(log.id)}
                              title="Delete this entry"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. BADGES */}
        {activeTab === 'achievements' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Badges &amp; Rewards</h3>
              <p>Simple milestones you unlock as you build a mindful daily habit of drinking water.</p>
            </div>

            <div className="badges-grid">
              <div className={`badge-card glass-card ${totalDrankToday > 0 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🌟</div>
                <h4>First Drink</h4>
                <p>Logged your first glass of water today.</p>
                <span className="badge-tag">{totalDrankToday > 0 ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card glass-card ${settings.streak >= 3 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">🐪</div>
                <h4>3 Days in a Row</h4>
                <p>Hit your water goal 3 days in a row.</p>
                <span className="badge-tag">{settings.streak >= 3 ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card glass-card ${logs.some(l => l.beverageType === 'coffee') ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon">☕</div>
                <h4>Coffee Break</h4>
                <p>Logged a cup of coffee and balanced hydration.</p>
                <span className="badge-tag">{logs.some(l => l.beverageType === 'coffee') ? '✓ Unlocked' : 'Locked'}</span>
              </div>

              <div className={`badge-card glass-card ${logs.some(l => {
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
              <h3>App Settings &amp; Windows Integration</h3>
              <p>Control startup behavior, full-screen suppression, and desktop ergonomics.</p>
            </div>

            <div className="general-settings-stack">
              <div className="card glass-card">
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

              <div className="card glass-card">
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

              <div className="card about-card glass-card">
                <div className="about-left">
                  <strong>Water Buddy for Windows</strong>
                  <p>Version 2.4 · Oceanic Abyssal Edition</p>
                </div>
                <span className="about-pill">Windows 11 Certified</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. BACKUP & CLOUD ACCOUNT */}
        {activeTab === 'sync' && (
          <div className="tab-pane fade-in">
            <div className="pane-header">
              <h3>Backup &amp; Cloud Sync</h3>
              <p>Synchronize your hydration history and biometrics with the Water Buddy cloud.</p>
            </div>

            {!isFeatureAllowed('cloud_multi_device_sync') && (
              <div className="weather-banner glass-card mb-4" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                🔒 <strong>Cloud Sync Restricted on Community Free:</strong> Cross-device cloud synchronization is configured as a Pro perk by the administrator. Your records are safely saved locally on this PC in your Offline SQLite Vault.{' '}
                <button
                  type="button"
                  onClick={openWebPricing}
                  className="underline text-[#38BDF8] ml-1 font-semibold cursor-pointer"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  View Lifetime License Perks ↗
                </button>
              </div>
            )}

            <div className="dashboard-grid">
              {/* Left Column: Cloud Sync HUD & Controls */}
              <div className="grid-col">
                <div className="card glass-card sync-hud-card">
                  <div className="sync-hud-header">
                    <span className="sync-badge">CLOUD ENGINE</span>
                    <h4 className="sync-hud-title">Sync Health &amp; Telemetry</h4>
                  </div>

                  <div className="sync-stats-grid">
                    <div className="sync-stat-item">
                      <span className="sync-stat-label">Cloud Status</span>
                      <span className="sync-stat-val text-emerald">
                        {settings.authMode === 'logged_in' ? '🟢 Connected' : '🟡 Offline Guest'}
                      </span>
                    </div>

                    <div className="sync-stat-item">
                      <span className="sync-stat-label">Last Synchronized</span>
                      <span className="sync-stat-val mono-num">
                        {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </span>
                    </div>

                    <div className="sync-stat-item">
                      <span className="sync-stat-label">Auto-Sync Schedule</span>
                      <span className="sync-stat-val">Every 5 minutes</span>
                    </div>

                    <div className="sync-stat-item">
                      <span className="sync-stat-label">Tracked Logs</span>
                      <span className="sync-stat-val mono-num">{logs.length} entries</span>
                    </div>
                  </div>

                  <div className="sync-action-bar mt-4">
                    <button
                      type="button"
                      className={`btn-primary btn-sync-now ${isSyncing ? 'loading' : ''}`}
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                    >
                      <span className={`sync-icon ${isSyncing ? 'spin-anim' : ''}`}>🔄</span>
                      <span>{isSyncing ? 'Synchronizing with Cloud...' : 'Sync Now with Cloud'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Account Details or Guest Mode Callout */}
              <div className="grid-col">
                {settings.authMode === 'guest' ? (
                  <div className="card guest-warning-card glass-card">
                    <div className="guest-banner-icon">🟡</div>
                    <div>
                      <h4 className="font-bold text-white text-base">Guest Mode (Local Offline PC)</h4>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Your hydration logs are stored safely in your local Windows app storage. To unlock multi-device synchronization and web dashboard analytics, register an account on our web portal.
                      </p>
                      <div className="guest-actions mt-4">
                        <button 
                          type="button" 
                          onClick={openWebPortal}
                          className="btn-accent inline-flex items-center gap-2"
                        >
                          <span>Open Web Registration ↗</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, authMode: null }))}
                          className="btn-secondary"
                        >
                          Switch to Sign In
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card glass-card account-card">
                    <div className="account-card-header">
                      <span className="account-tag">CONNECTED IDENTITY</span>
                      <h4 className="account-email text-lg font-bold text-white">
                        {settings.userProfile?.email || 'Logged In Account'}
                      </h4>
                      <span className="account-role-pill">
                        {settings.userProfile?.role === 'owner' ? '👑 Owner Account' : '💧 Hydration Member'}
                      </span>
                    </div>

                    <div className="account-details-list mt-3">
                      <div className="account-detail-row">
                        <span className="detail-label">Sync Server:</span>
                        <span className="detail-val mono-num">{API_BASE_URL}/api</span>
                      </div>
                      <div className="account-detail-row">
                        <span className="detail-label">Web Portal:</span>
                        <span className="detail-val">{WEB_PORTAL_URL.replace('https://', '')}</span>
                      </div>
                    </div>

                    <div className="account-actions-row mt-4">
                      <button
                        type="button"
                        onClick={openWebPortal}
                        className="btn-secondary text-xs"
                      >
                        Open Web Portal ↗
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-danger-pill text-xs"
                      >
                        🚪 Sign Out of Device
                      </button>
                    </div>
                  </div>
                )}

                {/* Desktop Release & Auto-Update Card */}
                <div className="card glass-card update-card mt-4 p-5 rounded-2xl bg-[#0c141f] border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                        DESKTOP RELEASE & AUTO-UPDATE
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        Water Buddy v{updateState.currentVersion}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Target Channel: GitHub Releases (srikode-dev/Water-Buddy)
                      </p>
                    </div>
                    <div>
                      {updateState.status === 'downloaded' ? (
                        <button
                          type="button"
                          onClick={handleRestartAndInstall}
                          className="px-4 py-2 rounded-xl bg-emerald-400 text-[#070f19] font-bold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20 cursor-pointer"
                        >
                          🚀 Restart & Apply v{updateState.availableVersion}
                        </button>
                      ) : updateState.status === 'downloading' ? (
                        <div className="text-right">
                          <span className="text-xs font-mono text-[#38BDF8]">
                            Downloading {updateState.progress}%
                          </span>
                          <div className="w-28 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-[#38BDF8] transition-all"
                              style={{ width: `${updateState.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSimulateUpdate}
                            disabled={updateState.status === 'checking'}
                            className="px-3 py-2 rounded-xl bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] font-mono text-[11px] uppercase tracking-wider transition-all border border-[#38BDF8]/20 cursor-pointer disabled:opacity-50"
                            title="Simulate the download & ready state to test the auto-update user experience"
                          >
                            🧪 Test Update Flow
                          </button>
                          <button
                            type="button"
                            onClick={handleCheckUpdates}
                            disabled={updateState.status === 'checking'}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer disabled:opacity-50"
                          >
                            {updateState.status === 'checking' ? 'Checking Channel...' : 'Check for Updates ↻'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status feedback pill */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Status:</span>
                    {updateState.status === 'checking' && (
                      <span className="text-amber-400">Querying GitHub release channel...</span>
                    )}
                    {updateState.status === 'available' && (
                      <span className="text-[#38BDF8]">v{updateState.availableVersion} detected! Downloading installer in background...</span>
                    )}
                    {updateState.status === 'downloading' && (
                      <span className="text-sky-300">Fetching update payload ({updateState.progress}%)...</span>
                    )}
                    {updateState.status === 'downloaded' && (
                      <span className="text-emerald-400 font-bold">✓ v{updateState.availableVersion} ready! Click Restart to apply.</span>
                    )}
                    {updateState.status === 'not-available' && (
                      <span className="text-emerald-400">✓ Running the latest production version (v{updateState.currentVersion})</span>
                    )}
                    {updateState.status === 'error' && (
                      <span className="text-rose-400">
                        {updateState.error?.includes('dev-app-update') || updateState.error?.includes('404')
                          ? 'Auto-update channel ready (active in signed packaged releases)'
                          : `Status note: ${updateState.error?.slice(0, 45)}...`}
                      </span>
                    )}
                    {updateState.status === 'idle' && (
                      <span className="text-slate-400">Automatic background update check active</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
}

export default App;
