require('./spec_helper');
const t      = require('track-spec');
const Config = require('../lib/config');

t.describe('Config', () => {
  t.describe('.useCache', () => {
    t.it('Get/Set value', () => {
      Config.useCache = false;
      t.expect(Config.useCache).equals(false);

      Config.useCache = true;
      t.expect(Config.useCache).equals(true);
    });
  });
});
