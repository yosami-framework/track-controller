const deepMerge      = (require('deepmerge').default || require('deepmerge')); // @note for webpack issue#6584, hmm...
const fastDeepEqual  = require('fast-deep-equal');
const md5            = require('md5');
const TrackComponent = require('track-component');
const TrackConfig    = require('track-config');
const TrackEventor   = require('track-eventor');
const ScrollHelper   = require('track-helpers/lib/scroll_helper');
const BrowserCache   = require('./browser_cache');
const Config         = require('./config');
const Cache          = require('./cache');
const State          = require('./state');

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
      return TrackConfig.m.route.param();
    } else {
      return this.vnode.attrs['X-SERVER-PARAMS'];
    }
  }

  /**
   * Get state of controller.
   * @return {State} state.
   */
  get state() {
    return this.vnode.state.controllerState;
  }

  /**
   * Get key of controller cache.
   * @return {string} Key.
   */
  get _cacheKey() {
    let params = '';
    if (global.location && !!global.location.search) {
      params = md5(global.location.search);
    }
    return `${this._name}::Cache::${params}`;
  }

  /**
   * @override oninit
   */
  oninit(...args) {
    super.oninit(...args);

    this.vnode.state.controllerState = new State({
      params: deepMerge({}, this.params),
    });

    this._assignGlobalEvent(TrackEventor.ON_PUSH_HISTORY, 'onPushHistory');
    this._assignGlobalEvent(TrackEventor.ON_POP_HISTORY, 'onPopHistory');
    this._assignGlobalEvent(TrackEventor.ON_CHANGE_HISTORY, '_cache');

    return this._load();
  }

  /**
   * Called when load controller.
   * @note Write load prosess on this hook.
   * @note This hook is not called when load from cache.
   *
   * @return {Promise} load promise.
   */
  onload() {
    return Promise.resolve();
  }

  /**
   * Called after load.
   * @note Write process after load.
   * @note This hook is every call on init.
   */
  onloaded() {
    // Override
  }

  /**
   * @override onupdate
   */
  onupdate(...args) {
    super.onupdate(...args);

    if (!fastDeepEqual(this.state.params, this.params)) {
      this.onparamschanged(this.params, this.state.params);
      this.state.params = deepMerge({}, this.params);
    }
  }

  /**
   * Called after change params.
   * @param {object} newly Newly params.
   * @param {object} older Older params.
   */
  onparamschanged(newly, older) {
    this._load();
  }

  /**
   * Called before pop history.
   */
  onPopHistory() {
    Config.useCache = true;
  }

  /**
   * Called before push history.
   */
  onPushHistory() {
    Config.useCache = false;
  }

  /**
   * Load controller data.
   * @return {Promise} load promise.
   */
  _load() {
    let promise = null;

    if (Config.useCache) {
      const rawCache = BrowserCache.instance.get(this._cacheKey);
      if (rawCache) {
        promise = new Promise((resolve) => {
          const cache = new Cache(rawCache);
          this.viewmodel.setAttributes(cache.viewmodel);
          global.requestAnimationFrame(function() {
            ScrollHelper.scroll(cache.position).then(resolve);
          });
        });
      }
    }

    if (!promise) {
      ScrollHelper.scroll({x: 0, y: 0});
      promise = this.onload();
    }

    return promise.then(this.onloaded.bind(this));
  }

  /**
   * Cache controller data.
   */
  _cache() {
    const vm = this.vnode.state._vm;
    if (vm) {
      BrowserCache.instance.set(this._cacheKey, (new Cache({
        viewmodel: vm.toObject(),
        position:  ScrollHelper.getPos(),
      })).toObject());
    }
  }
}

module.exports = TrackController;
