/**
 * Theme Manager
 * Handles light/dark theme switching with persistence
 */

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme();
    this.init();
  }

  /**
   * Get stored theme from localStorage or system preference
   */
  getStoredTheme() {
    // Check localStorage first
    const stored = localStorage.getItem('console-theme');
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Initialize theme system
   */
  init() {
    this.applyTheme(this.theme);
    this.setupEventListeners();
  }

  /**
   * Setup theme toggle button and system preference listener
   */
  setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
    }

    // Listen to system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('console-theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
    localStorage.setItem('console-theme', this.theme);
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeButton(theme);
  }

  /**
   * Update theme toggle button icon
   */
  updateThemeButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.theme;
  }

  /**
   * Set theme explicitly
   */
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.theme = theme;
      this.applyTheme(theme);
      localStorage.setItem('console-theme', theme);
    }
  }
}

// Create global instance
const themeManager = new ThemeManager();
