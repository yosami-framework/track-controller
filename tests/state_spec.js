require('./spec_helper');
const t     = require('track-spec');
const State = require('../lib/state');

t.describe('State', () => {
  let mockState = null;

  t.beforeEach(() => {
    mockState = new State({
      params: {
        hoge: 'fuga',
      },
    });
  });

  t.describe('#params', () => {
    const subject = (() => mockState.params);

    t.it('Return params', () => {
      t.expect(subject()).deepEquals({hoge: 'fuga'});
    });
  });
});
