require('./spec_helper');
const m               = require('mithril');
const t               = require('track-spec');
const ScrollHelper    = require('track-helpers/lib/scroll_helper');
const TrackController = require('../lib/index');
const BrowserCache    = require('../lib/browser_cache');

t.describe('TrackController', () => {
  let MockControllerClass = null;
  let mockController      = null;
  let mockVnode           = null;

  t.beforeEach(() => {
    mockVnode = {
      state: {},
      attrs: {
        'X-SERVER-PARAMS': {
          hoge: {
            fuga: {
              piyo: 'PIYO',
            },
          },
        },
      },
    };

    MockControllerClass = (class extends TrackController {
      /**
       * Definitions of model.
       */
      static definer() {
        name('mock');
        before_action('setHoge');
        before_action('setPiyo');
        after_action('setBar');
      }

      /**
       * Mock for before_action.
       * @return {Promise} promise.
       */
      setHoge() {
        this.hoge = true;
        return Promise.resolve();
      }

      /**
       * Mock for before_action.
       */
      setPiyo() {
        this.piyo = true;
      }

      /**
       * Mock for after_action.
       * @return {Promise} promise.
       */
      setBar() {
        return new Promise((r) => {
          setTimeout(() => {
            this.bar = true;
            r();
          }, 100);
        });
      }
    });
    mockController = new MockControllerClass(mockVnode);
  });

  t.afterEach(() => {
    process.browser = false;
  });

  t.describe('.initialize', () => {
    const subject = (() => TrackController.initialize({innerHTML: '<span>FUGA</span>'}));

    t.it('Set TrackController._initialView', () => {
      subject();
      t.expect(TrackController._initialView).equals('<span>FUGA</span>');
    });
  });

  t.describe('.onmatch', () => {
    const subject = (() => MockControllerClass.onmatch());

    t.it('Return controller', () => {
      t.expect(subject()).equals(MockControllerClass);
    });
  });

  t.describe('.render', () => {
    const subject = (() => MockControllerClass.render(mockVnode));
    let mockVnode = null;

    t.beforeEach(() => {
      mockVnode = {};
    });

    t.it('Return vnode', () => {
      t.expect(subject()).equals(mockVnode);
    });
  });

  t.describe('#error', () => {
    const subject = (() => mockController.error);

    t.beforeEach(() => {
      mockController._error = {code: 500, message: 'Internal sever error'};
    });

    t.it('Return error', () => {
      t.expect(subject()).equals(mockController._error);
    });
  });

  t.describe('#type', () => {
    const subject = (() => mockController.type);

    t.it('Return type', () => {
      t.expect(subject()).equals('controller');
    });
  });

  t.describe('#params', () => {
    const subject = (() => mockController.params);
    let mockParams = null;

    t.beforeEach(() => {
      mockParams = {};
      m.route.param = t.spy(() => mockParams);
    });

    t.context('When use browser', () => {
      t.beforeEach(() => {
        process.browser = true;
      });

      t.it('Return param', () => {
        t.expect(subject()).equals(mockParams);
      });
    });

    t.context('When not use browser', () => {
      t.beforeEach(() => {
        process.browser = false;
      });

      t.it('Return param', () => {
        t.expect(subject()).equals(mockVnode.attrs['X-SERVER-PARAMS']);
      });
    });
  });

  t.describe('#views', () => {
    const subject = (() => mockController.views);

    t.it('Return views', () => {
      t.expect(subject().length).equals(3);
    });

    t.context('When definer includes `views`', () => {
      t.beforeEach(() => {
        MockControllerClass = (class extends TrackController {
          /**
           * Definitions of model.
           */
          static definer() {
            name('mock');
            views('mock');
          }
        });
        mockController = new MockControllerClass(mockVnode);
      });

      t.it('Return views', () => {
        t.expect(subject().length).equals(2);
      });
    });
  });

  t.describe('#_cacheKey', () => {
    const subject = (() => mockController._cacheKey);

    t.beforeEach(() => {
      global.location = {href: 'http://localhost/'};
    });

    t.afterEach(() => {
      global.location = undefined;
    });

    t.it('Return key', () => {
      t.expect(subject()).equals('TrackController::294ff53a');
    });

    t.context('When location is undefined', () => {
      t.beforeEach(() => {
        global.location = undefined;
      });

      t.it('Return key', () => {
        t.expect(subject()).equals('TrackController::9711dca3');
      });
    });
  });

  t.describe('#oninit', () => {
    const subject = (() => mockController.oninit(mockVnode));

    t.beforeEach(() => {
      mockController._load = t.spy(() => Promise.resolve());
      mockController._watchParams = t.spy();
    });

    t.it('Call controller#_load', () => {
      subject();
      t.expect(mockController._load.callCount).equals(1);
    });

    t.it('Call controller#_watchParams', () => {
      subject();
      t.expect(mockController._watchParams.callCount).equals(1);
    });

    t.it('Return promise', () => {
      t.expect(subject() instanceof Promise).equals(true);
    });

    t.context('When loaded', () => {
      t.beforeEach(() => {
        TrackController._initialView = '<span>FUGA</span>';
        m.redraw = t.spy();
      });

      t.it('Clear TrackController._initialView', () => {
        return subject().then(() => {
          t.expect(TrackController._initialView).equals(null);
        });
      });

      t.it('Call m.redraw', () => {
        return subject().then(() => {
          t.expect(m.redraw.callCount).equals(1);
        });
      });
    });
  });

  t.describe('#onload', () => {
    const subject = (() => mockController.onload());

    t.it('Return promise', () => {
      t.expect(subject() instanceof Promise).equals(true);
    });

    t.it('Call before_actions', () => {
      t.expect(mockController.hoge).equals(undefined);
      t.expect(mockController.piyo).equals(undefined);

      return subject().then(() => {
        t.expect(mockController.hoge).equals(true);
        t.expect(mockController.piyo).equals(true);
      });
    });
  });

  t.describe('#onloaded', () => {
    const subject = (() => mockController.onloaded());

    t.it('Return promise', () => {
      t.expect(subject() instanceof Promise).equals(true);
    });

    t.it('Call before_actions', () => {
      t.expect(mockController.bar).equals(undefined);
      return subject().then(() => {
        t.expect(mockController.bar).equals(true);
      });
    });
  });

  t.describe('#onupdate', () => {
    const subject = (() => mockController.onupdate(mockVnode));

    t.beforeEach(() => {
      mockController.oninit(mockVnode);
      mockController._watchParams = t.spy();
    });

    t.it('Call controller#_watchParams', () => {
      subject();
      t.expect(mockController._watchParams.callCount).equals(1);
    });
  });

  t.describe('#onparamschanged', () => {
    const subject = (() => mockController.onparamschanged(newly, older));
    let newly = null;
    let older = null;

    t.beforeEach(() => {
      newly = {new: true};
      older = {};
      mockController._load = t.spy(() => Promise.resolve());
    });

    t.it('Call controller#_load', () => {
      subject();
      t.expect(mockController._load.callCount).equals(1);
    });

    t.context('When controller has error', () => {
      t.beforeEach(() => {
        mockController._error = {code: 500, message: 'MockError'};
        global.location = {reload: t.spy()};
      });

      t.afterEach(() => {
        global.location = undefined;
      });

      t.it('Call global.location.reload()', () => {
        subject();
        t.expect(global.location.reload.callCount).equals(1);
      });
    });

    t.context('When old params is undefined', () => {
      t.beforeEach(() => {
        older = undefined;
      });

      t.it('Not call controller#_load', () => {
        subject();
        t.expect(mockController._load.callCount).equals(0);
      });
    });
  });

  t.describe('#onPopHistory', () => {
    const subject = (() => mockController.onPopHistory());

    t.beforeEach(() => {
      TrackController._historyBack = false;
    });

    t.it('Set TrackController._historyBack', () => {
      subject();
      t.expect(TrackController._historyBack).equals(true);
    });
  });

  t.describe('#onPushHistory', () => {
    const subject = (() => mockController.onPushHistory());

    t.beforeEach(() => {
      TrackController._historyBack = true;
    });

    t.it('Set TrackController._historyBack', () => {
      subject();
      t.expect(TrackController._historyBack).equals(false);
    });
  });

  t.describe('#raise', () => {
    const subject = (() => mockController.raise(500, 'Internal Server Error'));

    t.beforeEach(() => {
      TrackController._historyBack = true;
    });

    t.afterEach(() => {
      process.browser = false;
    });

    t.context('When browser', () => {
      t.beforeEach(() => {
        process.browser = true;
        m.redraw = t.spy(m.redraw);
        mockController.vnode.state._views = [];
        mockController._viewNames = ['layouts/hoge', 'foos/bar'];
      });

      t.it('Set error', () => {
        subject();
        t.expect(mockController.error).deepEquals({
          code:    500,
          message: 'Internal Server Error',
        });
      });

      t.it('Clear view cache', () => {
        subject();
        t.expect(mockController.vnode.state._views).equals(null);
      });

      t.it('Set error view', () => {
        subject();
        t.expect(mockController._viewNames).deepEquals(['layouts/hoge', 'errors/error']);
      });

      t.it('Call redraw error view', () => {
        subject();
        t.expect(m.redraw.callCount).equals(1);
      });
    });

    t.context('When not browser', () => {
      t.beforeEach(() => {
        process.browser = false;
      });

      t.it('Throw error', () => {
        let error = null;

        try {
          subject();
        } catch (e) {
          error = e;
        }

        t.expect(error).notEquals(null);
        t.expect(error.code).equals(500);
        t.expect(error.message).equals('Internal Server Error');
      });
    });
  });

  t.describe('#view', () => {
    const subject = (() => mockController.view());

    t.beforeEach(() => {
      TrackController._initialView = undefined;
    });

    t.it('Return renderng result', () => {
      t.expect(subject()).equals('mock');
    });

    t.context('When exist TrackController._initialView', () => {
      t.beforeEach(() => {
        TrackController._initialView = '<span>hoge</span>';
      });

      t.it('Return initialView', () => {
        t.expect(subject().children).equals('<span>hoge</span>');
      });
    });
  });

  t.describe('#_load', () => {
    const subject = (() => mockController._load());

    t.beforeEach(() => {
      TrackController._historyBack = false;
      mockController.onload = t.spy(() => Promise.resolve());
      mockController.onloaded = t.spy(() => Promise.resolve());
    });

    t.it('Call controller#onload', () => {
      return subject().then(() => {
        t.expect(mockController.onload.callCount).equals(1);
      });
    });

    t.it('Call controller#onloaded', () => {
      return subject().then(() => {
        t.expect(mockController.onloaded.callCount).equals(1);
      });
    });

    t.it('Scroll to top', () => {
      ScrollHelper.scroll = t.spy(() => Promise.resolve());
      return subject().then(() => {
        t.expect(ScrollHelper.scroll.callCount).equals(1);
        t.expect(ScrollHelper.scroll.args[0]).deepEquals({x: 0, y: 0});
      });
    });

    t.context('When TrackController._historyBack is true', () => {
      t.beforeEach(() => {
        TrackController._historyBack = true;
      });

      t.context('When has cache', () => {
        t.beforeEach(() => {
          BrowserCache.instance.get = t.spy(() => {
            return {
              vm:       {hoge: 'fuga'},
              position: {x: 100, y: 200},
            };
          });
        });

        t.it('Load from cache', () => {
          return subject().then(() => {
            t.expect(mockController.vm.hoge).equals('fuga');
          });
        });

        t.it('Scroll from cache', () => {
          ScrollHelper.scroll = t.spy(() => Promise.resolve());
          return subject().then(() => {
            t.expect(ScrollHelper.scroll.callCount).equals(1);
            t.expect(ScrollHelper.scroll.args[0]).deepEquals({x: 100, y: 200});
          });
        });

        t.it('Not call controller#onload', () => {
          return subject().then(() => {
            t.expect(mockController.onload.callCount).equals(0);
          });
        });

        t.it('Call controller#onloaded', () => {
          return subject().then(() => {
            t.expect(mockController.onloaded.callCount).equals(1);
          });
        });
      });

      t.context('When does not have cache', () => {
        t.beforeEach(() => {
          BrowserCache.instance.get = t.spy(() => null);
        });

        t.it('Call controller#onload', () => {
          return subject().then(() => {
            t.expect(mockController.onload.callCount).equals(1);
          });
        });
      });
    });
  });

  t.describe('#_watchParams', () => {
    const subject = (() => mockController._watchParams());

    t.beforeEach(() => {
      mockController.oninit();
      mockController.onparamschanged = t.spy();
    });

    t.context('When change params', () => {
      t.beforeEach(() => {
        mockVnode.attrs['X-SERVER-PARAMS'] = {a: '1'};
        mockController.vnode.state.controller.params = {a: '0'};
      });

      t.it('Call controller#onparamschanged', () => {
        subject();
        t.expect(mockController.onparamschanged.callCount).equals(1);
        t.expect(mockController.onparamschanged.args[0]).deepEquals({'a': '1'});
        t.expect(mockController.onparamschanged.args[1]).deepEquals({a: '0'});
      });

      t.it('Store newly value', () => {
        subject();
        t.expect(mockController.vnode.state.controller.params).deepEquals({a: '1'});
      });
    });

    t.context('When not change params', () => {
      t.beforeEach(() => {
        mockVnode.attrs['X-SERVER-PARAMS'] = {a: '0'};
        mockController.vnode.state.controller.params = {a: '0'};
      });

      t.it('Call controller#onparamschanged', () => {
        subject();
        t.expect(mockController.onparamschanged.callCount).equals(0);
      });
    });
  });
});
