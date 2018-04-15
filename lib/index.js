const m              = require('mithril');
const TrackComponent = require('track-component');
const TrackConfig    = require('track-config');
const TrackEventor   = require('track-eventor');
const TrackI18n      = require('track-i18n');
const HashHelper     = require('track-helpers/lib/hash_helper');
const ObjectHelper   = require('track-helpers/lib/object_helper');
const ScrollHelper   = require('track-helpers/lib/scroll_helper');
const BrowserCache   = require('./browser_cache');
const Builder        = require('./builder');
const Cache          = require('./cache');

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
   * Initialize
   */
  constructor(...args) {
    super(...args);
    this.pipe.i18n = new TrackI18n(TrackConfig.localeSelector(this.url));
  }

  /**
   * Initialize TrackController Class.
   * @note Must call before mount application.
   * @param {Element} element Mounting element.
   */
  static initialize(element) {
    TrackController._initialView = element.innerHTML;
  }

  /**
   * Get DSL.
   * @return {object} dsl.
   */
  static dsl() {
    return Builder.dsl(this);
  }

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
   * Get error.
   * @return {object} error.
   */
  get error() {
    return this._error;
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
   * Get type.
   * @return {string} Get type.
   */
  get type() {
    return 'controller';
  }

  /**
   * Get url.
   */
  get url() {
    if (process.browser) {
      return global.location.href;
    } else {
      return this.attrs['X-SERVER-URL'];
    }
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
    if (this._viewNames[0] != 'application') {
      this._viewNames.unshift('application');
    }
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

    this.vnode.state.controller = {};

    this._bindGlobalEvent(TrackEventor.ON_PUSH_HISTORY, 'onPushHistory');
    this._bindGlobalEvent(TrackEventor.ON_POP_HISTORY, 'onPopHistory');
    this._bindGlobalEvent(TrackEventor.ON_CHANGE_HISTORY, '_cache');

    this._watchParams();

    return this._load().then(function() {
      TrackController._initialView = null;
      m.redraw();
    });
  }

  /**
   * Called when load controller.
   * @note Write load prosess on this hook.
   * @note This hook is not called when load from cache.
   * @return {Promise} load promise.
   */
  onload() {
    let promise = Promise.resolve();

    this._beforeActions.forEach((action) => {
      promise = promise.then(action);
    });

    return promise;
  }

  /**
   * Called after load.
   * @note Write process after load.
   * @note This hook is every call on init.
   * @return {Promise} loaded promise.
   */
  onloaded() {
    let promise = Promise.resolve();

    this._afterActions.forEach((action) => {
      promise = promise.then(action);
    });

    return promise;
  }

  /**
   * @note mithril.js API.
   * @override onupdate
   */
  onupdate(...args) {
    super.onupdate(...args);
    this._watchParams();
  }

  /**
   * Called after change params.
   * @param {object} newly Newly params.
   * @param {object} older Older params.
   */
  onparamschanged(newly, older) {
    if (!!older) {
      if (this.error) {
        global.location.reload();
      } else {
        this._load();
      }
    }
  }

  /**
   * Called before pop history.
   */
  onPopHistory() {
    TrackController._historyBack = true;
  }

  /**
   * Called before push history.
   */
  onPushHistory() {
    TrackController._historyBack = false;
  }

  /**
   * Raise error.
   * @param {integer} code    HTTP status code.
   * @param {string}  message Error message.
   */
  raise(code, message) {
    if (process.browser) {
      this._error = {code: code, message: message};
      this.vnode.state._views = null;

      if (this._viewNames.length < 1) {
        this._viewNames = ['layouts/default'];
      } else {
        this._viewNames = this._viewNames.filter((v) => /^layouts\//.test(v));
      }
      this._viewNames.push('errors/error');

      m.redraw();
    } else {
      const error = new Error(message);
      error.code = code;
      throw error;
    }
  }

  /**
   * Return rendered view.
   * @override
   * @note Mithril.js lifecycle.
   * @return {vnode|string} view.
   */
  view() {
    return (TrackController._initialView ? (
      m.trust(TrackController._initialView)
    ) : (
      super.view()
    ));
  }

  /**
   * Load controller data.
   * @return {Promise} load promise.
   */
  _load() {
    let promise = null;

    if (TrackController._historyBack) {
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

  /**
   * Watch changing parameter values.
   */
  _watchParams() {
    const current  = this.params;
    const previous = this.vnode.state.controller.params;

    if (!ObjectHelper.deepEqual(current, previous)) {
      this.onparamschanged(current, previous);
      this.vnode.state.controller.params = ObjectHelper.deepMerge({}, current);
    }
  }
}

module.exports = TrackController;
