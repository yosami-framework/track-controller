const TrackModel = require('track-model');

/**
 * Controller cache model.
 */
class Cache extends TrackModel {
  /**
   * Define model.
   */
  static definer() {
    name('TrackControllers::Cache');

    accessor('vm');
    accessor('position');
  }
}

module.exports = Cache;
