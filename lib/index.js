const m              = require('mithril');
const TrackComponent = require('track-component');

/**
 * A base component.
 * @example
 *  class HogeController extends TrackController {
 *    static definer() {
 *      name('hoge'); // Define model name. **Required**
 *      views(require('./views/hoge')); // Append views.
 *      viewmodel(require('./viewmodels/hoge')); // Set viewmodel.
 *    }
 *  }
 *
 */
class TrackController extends TrackComponent {
  /**
   * Get all param.
   * @return {object} params.
   */
  get params() {
    if (process.browser) {
      return m.route.param();
    } else {
      return this.vnode.attrs['X-SERVER-PARAMS'];
    }
  }
}

module.exports = TrackController;
