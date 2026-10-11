import Store from 'electron-store';

export const store = new Store({
  defaults: {
    settings: {
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
      notificationTheme: 'oceanic', // 'oceanic' | 'emerald' | 'obsidian' | 'neon'
      notificationPosition: 'bottom-right' // 'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center'
    },
    logs: []
  }
});
