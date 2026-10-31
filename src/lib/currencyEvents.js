// client/src/lib/currencyEvents.js
// Same-tab + cross-tab settings sync.

const EVENT_NAME = 'storeSettingsUpdated';

/**
 * Call AFTER saving settings to localStorage.
 * Fires a CustomEvent so same-tab components re-render.
 */
export const emitSettingsUpdated = (settings) => {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }));
};

/**
 * Subscribe to settings updates (same tab + cross tab).
 * @returns unsubscribe function
 */
export const onSettingsUpdated = (callback) => {
  const customHandler = (e) => callback(e.detail);

  const storageHandler = (e) => {
    if (e.key === 'storeSettings' && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (_) {}
    }
  };

  window.addEventListener(EVENT_NAME, customHandler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(EVENT_NAME, customHandler);
    window.removeEventListener('storage', storageHandler);
  };
};