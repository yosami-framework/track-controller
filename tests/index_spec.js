require('./spec_helper');
const m                = require('mithril');
const deepMerge        = require('deepmerge');
const t                = require('track-spec');
const TrackModel       = require('track-model');
const TrackView        = require('track-view');
const TrackController  = require('../lib/index');
const ControllerState  = require('../lib/state');
const ControllerConfig = require('../lib/config');
const BrowserCache     = require('../lib/browser_cache');

t.describe('TrackController', () => {
  let mockController     = null;
  let mockVnode          = null;
  let mockViewClass      = null;
  let mockViewModelClass = null;

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
    mockViewClass = (class extends TrackView {
      /**
       * Render view.
       * @param {object} _yield object.
       * @return {array} mock
       */
      render(_yield) {
        return [_yield];
      }
    });

    mockViewModelClass = (class extends TrackModel {
      /**
       * Definitions of viewmodel.
       */
      static definer() {
        name('mock_viewmodel');
        accessor('hoge');
      }
    });

    mockController = new (class extends TrackController {
      /**
       * Definitions of model.
       */
      static definer() {
        name('mock_controller');
        views(this.mockViewClass);
        viewmodel(this.mockViewModelClass);
      }

      /**
       * Return mockViewlClass
       */
      get mockViewClass() {
        return mockViewClass;
      }

      /**
       * Return mock class.
       */
      get mockViewModelClass() {
        return mockViewModelClass;
      }
    })(mockVnode);
  });

  t.afterEach(() => {
    process.browser = false;
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

  t.describe('#_cacheKey', () => {
    const subject = (() => mockController._cacheKey);

    t.beforeEach(() => {
      global.location = {search: '?hoge'};
    });

    t.afterEach(() => {
      global.location = undefined;
    });

    t.it('Return key', () => {
      t.expect(subject()).equals('mock_controller::Cache::028edbcdb0fcb5cdaf8d99814ae5a17e');
    });

    t.context('When location.search is empty', () => {
      t.beforeEach(() => {
        global.location = {search: ''};
      });

      t.it('Return key', () => {
        t.expect(subject()).equals('mock_controller::Cache::');
      });
    });
  });

  t.describe('#oninit', () => {
    const subject = (() => mockController.oninit(mockVnode));

    t.beforeEach(() => {
      mockController._load = t.spy(() => Promise.resolve());
    });

    t.it('Set controller#state', () => {
      subject();
      t.expect(mockController.state instanceof ControllerState).equals(true);
    });

    t.it('Set controller#state.params', () => {
      subject();
      t.expect(mockController.state.params).deepEquals(mockVnode.attrs['X-SERVER-PARAMS']);
    });

    t.it('Call controller#_load', () => {
      subject();
      t.expect(mockController._load.callCount).equals(1);
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
    });

    t.context('When change params', () => {
      t.beforeEach(() => {
        mockController.onparamschanged = t.spy();
      });

      t.it('Call controller#onparamschanged', () => {
        const olderParam = deepMerge({}, mockVnode.attrs['X-SERVER-PARAMS']);
        mockVnode.attrs['X-SERVER-PARAMS'].hoge.fuga.piyo = 'NEW_PIYO';
        const newlyParam = deepMerge({}, mockVnode.attrs['X-SERVER-PARAMS']);

        subject();

        t.expect(mockController.onparamschanged.callCount).equals(1);
        t.expect(mockController.onparamschanged.args[0]).deepEquals(newlyParam);
        t.expect(mockController.onparamschanged.args[1]).deepEquals(olderParam);
      });
    });
  });

  t.describe('#onparamschanged', () => {
    const subject = (() => mockController.onparamschanged({new: true}, {}));

    t.beforeEach(() => {
      mockController._load = t.spy(() => Promise.resolve());
    });

    t.it('Call controller#_load', () => {
      subject();
      t.expect(mockController._load.callCount).equals(1);
    });
  });

  t.describe('#onPopHistory', () => {
    const subject = (() => mockController.onPopHistory());

    t.beforeEach(() => {
      ControllerConfig.useCache = false;
    });

    t.it('Set ControllerConfig.useCache', () => {
      subject();
      t.expect(ControllerConfig.useCache).equals(true);
    });
  });

  t.describe('#onPushHistory', () => {
    const subject = (() => mockController.onPushHistory());

    t.beforeEach(() => {
      ControllerConfig.useCache = true;
    });

    t.it('Set ControllerConfig.useCache', () => {
      subject();
      t.expect(ControllerConfig.useCache).equals(false);
    });
  });

  t.describe('#_load', () => {
    const subject = (() => mockController._load());

    t.beforeEach(() => {
      ControllerConfig.useCache = false;
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

    t.context('When useCache is true', () => {
      t.beforeEach(() => {
        ControllerConfig.useCache = true;
      });

      t.context('When has cache', () => {
        t.beforeEach(() => {
          BrowserCache.instance.get = t.spy(() => {
            return {hoge: 'fuga'};
          });
        });

        t.it('Load from cache', () => {
          return subject().then(() => {
            t.expect(mockController.viewmodel.hoge).equals('fuga');
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
});
