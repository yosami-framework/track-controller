require('./spec_helper');
const t     = require('track-spec');
const Cache = require('../lib/cache');

t.describe('Cache', () => {
  let mockState = null;

  t.beforeEach(() => {
    mockState = new Cache({
      viewmodel: {
        hoge: 'fuga',
      },
      position: {
        x: 100,
        y: 200,
      },
    });
  });

  t.describe('#viewmodel', () => {
    const subject = (() => mockState.viewmodel);

    t.it('Return params', () => {
      t.expect(subject()).deepEquals({hoge: 'fuga'});
    });
  });

  t.describe('#position', () => {
    const subject = (() => mockState.position);

    t.it('Return params', () => {
      t.expect(subject()).deepEquals({x: 100, y: 200});
    });
  });
});
