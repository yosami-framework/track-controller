require('./spec_helper');
const t               = require('track-spec');
const TrackController = require('../lib/index.js');

t.describe('Builder', () => {
  let mock = null;

  t.beforeEach(() => {
    mock = new (class extends TrackController {
      /**
       * Definitions of component.
       */
      static definer() {
        name('mock');
        after_action('hoge');
        after_action('hoge');
        after_action('hoge');
        before_action('hoge');
        before_action('hoge');
      }

      /**
       * Mock.
       */
      hoge() { }
    })({attrs: {}});
  });

  t.describe('#after_action', () => {
    t.it('Set #_afterActions', () => {
      t.expect(mock._afterActions.length).equals(3);
      t.expect(mock._afterActions[0] instanceof Function).equals(true);
      t.expect(mock._afterActions[1] instanceof Function).equals(true);
      t.expect(mock._afterActions[2] instanceof Function).equals(true);
    });
  });

  t.describe('#before_action', () => {
    t.it('Set #_beforeActions', () => {
      t.expect(mock._beforeActions.length).equals(2);
      t.expect(mock._beforeActions[0] instanceof Function).equals(true);
      t.expect(mock._beforeActions[1] instanceof Function).equals(true);
    });
  });
});
