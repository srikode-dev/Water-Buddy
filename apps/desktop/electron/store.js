import Store from 'electron-store';

export const store = new Store({
  defaults: {
    settings: {
      intervalMin: 45,
      sipMode: 'auto',
      manualSipMl: 250,
      soundOn: false,
      walkSpeed: 'normal',
      launchOnStartup: true
    },
    logs: []
  }
});
