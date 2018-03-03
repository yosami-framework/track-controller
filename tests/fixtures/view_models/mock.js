const TrackModel = require('track-model');

/**
 * Mock
 */
class MockViewModel extends TrackModel {
  /**
   * Definitions of viewmodel.
   */
  static definer() {
    name('mock_viewmodel');
    accessor('hoge');
  }
}

module.exports = MockViewModel;
