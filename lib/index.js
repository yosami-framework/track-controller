const deepMerge      = (require('deepmerge').default || require('deepmerge')); // @note for webpack issue#6584, hmm...
const fastDeepEqual  = require('fast-deep-equal');
const m              = require('mithril');
const TrackComponent = require('track-component');
const TrackEventor   = require('track-eventor');
const HashHelper     = require('track-helpers/lib/hash_helper');
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
 *      name('hoge');   // Define model name. **Required**
 *      views('hoge'); // Append views.
 *    }
 *  }
 *
 */
class TrackController extends TrackComponent {
  /**
   * Resolve controller.
   * @note mithril.js API.
   * @return {TrackController} controller
   */
  static onmatch() {
    return this;
  }

  /**
   * Wrap vnode.
   * @note mithril.js API.
   * @param {vnode} vnode vnode.
   * @return {vnode} vnode.
   */
  static render(vnode) {
    return vnode;
  }

  /**
   * Get type.
   * @return {string} Get type.
   */
  get type() {
    return 'controller';
  }

  /**
   * Get all param.
   * @return {object} params.
   */
  get params() {
    if (process.browser) {
      return m.route.param();
    } else {
      return this.attrs['X-SERVER-PARAMS'];
    }
  }

  /**
   * Get state of controller.
   * @return {State} state.
   */
  get state() {
    return this.vnode.state.controller;
  }

  /**
   * Get views.
   * @override
   * @return {array<Function>} views.
   */
  get views() {
    if (this._viewNames.length < 1) {
      this._viewNames = ['layouts/default', this.name];
    }
    this._viewNames.unshift('application');
    return super.views;
  }

  /**
   * Get key of controller cache.
   * @return {string} Key.
   */
  get _cacheKey() {
    return `TrackController::${HashHelper.fast((global.location || {}).href)}`;
  }

  /**
   * @note mithril.js API.
   * @override oninit
   */
  oninit(...args) {
    super.oninit(...args);

    this.vnode.state.controller = new State({
      params: deepMerge({}, this.params),
    });

    this._bindGlobalEvent(TrackEventor.ON_PUSH_HISTORY, 'onPushHistory');
    this._bindGlobalEvent(TrackEventor.ON_POP_HISTORY, 'onPopHistory');
    this._bindGlobalEvent(TrackEventor.ON_CHANGE_HISTORY, '_cache');

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
   * @note mithril.js API.
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
          this.vm.setAttributes(cache.vm);
          global.requestAnimationFrame(function() {
            ScrollHelper.scroll(cache.position).then(resolve);
          });
        });
      }
    } else {
      ScrollHelper.scroll({x: 0, y: 0});
    }

    if (!promise) {
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
        vm:       vm.toObject(),
        position: ScrollHelper.getPos(),
      })).toObject());
    }
  }
}

module.exports = TrackController;
