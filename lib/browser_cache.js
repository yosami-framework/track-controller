const lscache = require('lscache');

/**
 * Cache of browser.
 * @note This class is singleton.
 * @note This cache is enabled on browser.
 */
class BrowserCache {
  /**
   * Initialize class.
   * @note Must not call.
   */
  constructor() {
    if (process.browser) {
      lscache.flushExpired();
    }
  }

  /**
   * Set cache.
   * @param {string}  key       Key
   * @param {string}  value     Value
   * @param {integer} expiresIn Cache expiration (minutes)
   */
  set(key, value, expiresIn = 15) {
    if (process.browser) {
      lscache.set(key, value, expiresIn);
    }
  }

  /**
   * Get cache.
   * @param {string} key Key.
   * @return {object} Cached value. (or null)
   */
  get(key) {
    if (process.browser) {
      return lscache.get(key) || null;
    } else {
      return null;
    }
  }

  /**
   * Remove cache.
   * @param {string} key Key.
   */
  remove(key) {
    if (process.browser) {
      lscache.remove(key);
    }
  }

  /**
   * Return instance.
   */
  static get instance() {
    if (!this._instance) {
      this._instance = new BrowserCache();
    }
    return this._instance;
  }
};

module.exports = BrowserCache;
