require('./spec_helper');
const m               = require('mithril');
const t               = require('track-spec');
const TrackView       = require('track-view');
const TrackViewModel  = require('track-view-model');
const TrackController = require('../lib/index.js');

t.describe('TrackController', () => {
  let mockController     = null;
  let mockVnode          = null;
  let mockViewClass      = null;
  let mockViewModelClass = null;

  t.beforeEach(() => {
    mockVnode = {
      state: {},
      attrs: {
        'X-SERVER-PARAMS': {},
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

    mockViewModelClass = (class extends TrackViewModel {
      /**
       * Definitions of viewmodel.
       */
      static definer() {
        name('mock_viewmodel');
      }
    });

    mockController = new (class extends TrackController {
      /**
       * Definitions of model.
       */
      static definer() {
        name('mock_component');
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
});
