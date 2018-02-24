const TrackModel = require('track-model');

/**
 * Controller state model.
 */
class State extends TrackModel {
  /**
   * Define model.
   */
  static definer() {
    name('TrackControllers::State');

    accessor('params');
  }
}

module.exports = State;
