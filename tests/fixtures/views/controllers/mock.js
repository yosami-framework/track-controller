const TrackView = require('track-view');

/**
 * Mock
 */
class MockView extends TrackView {
  /**
   * Render
   * @return {string} html.
   */
  render() {
    return 'mock';
  }
}

module.exports = MockView;
