const TrackModel = require('track-model');

/**
 * Controller config.
 */
class Config extends TrackModel {
  /**
   * Define model.
   */
  static definer() {
    name('TrackControllers::Config');

    /**
     * Use cache for controller data.
     * @param {boolean} value true when use cache.
     */
    accessor('useCache');
  }
}

module.exports = Config;
