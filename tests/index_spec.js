require('./spec_helper');
const m               = require('mithril');
const t               = require('track-spec');
const ObjectHelper    = require('track-helpers/lib/object_helper');
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
      }
    });
    mockController = new MockControllerClass(mockVnode);
  });

  t.afterEach(() => {
    process.browser = false;
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
  });

  t.describe('#onload', () => {
    const subject = (() => mockController.onload());

    t.it('Return promise', () => {
      t.expect(subject() instanceof Promise).equals(true);
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
