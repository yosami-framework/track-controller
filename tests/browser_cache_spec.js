require('./spec_helper');
const t            = require('track-spec');
const lscache      = require('lscache');
const BrowserCache = require('../lib/browser_cache');

t.describe('BrowserCache', () => {
  t.beforeEach(() => {
    process.browser = true;
  });

  t.afterEach(() => {
    process.browser = false;
  });

  t.describe('.instance', () => {
    const subject = (() => BrowserCache.instance);

    t.it('Return cache', () => {
      t.expect(subject() instanceof BrowserCache).equals(true);
    });
  });

  t.describe('#set', () => {
    const subject = (() => BrowserCache.instance.set('hoge', 'fuga', 123));

    t.beforeEach(() => {
      lscache.set = t.spy();
    });

    t.it('Call lscache.set', () => {
      subject();
      t.expect(lscache.set.callCount).equals(1);
      t.expect(lscache.set.args[0]).equals('hoge');
      t.expect(lscache.set.args[1]).equals('fuga');
      t.expect(lscache.set.args[2]).equals(123);
    });

    t.context('When is not browser', () => {
      t.beforeEach(() => {
        process.browser = false;
      });

      t.it('Not call lscache.set', () => {
        subject();
        t.expect(lscache.set.callCount).equals(0);
      });
    });
  });

  t.describe('#get', () => {
    const subject = (() => BrowserCache.instance.get('hoge'));

    t.beforeEach(() => {
      lscache.get = t.spy(() => 'mock');
    });

    t.it('Return value', () => {
      t.expect(subject()).equals('mock');
    });

    t.it('Call lscache.get', () => {
      subject();
      t.expect(lscache.get.callCount).equals(1);
      t.expect(lscache.get.args[0]).equals('hoge');
    });

    t.context('When is not browser', () => {
      t.beforeEach(() => {
        process.browser = false;
      });

      t.it('Not call lscache.set', () => {
        subject();
        t.expect(lscache.get.callCount).equals(0);
      });
    });
  });

  t.describe('#remove', () => {
    const subject = (() => BrowserCache.instance.remove('hoge'));

    t.beforeEach(() => {
      lscache.remove = t.spy(() => 'mock');
    });

    t.it('Call lscache.remove', () => {
      subject();
      t.expect(lscache.remove.callCount).equals(1);
      t.expect(lscache.remove.args[0]).equals('hoge');
    });

    t.context('When is not browser', () => {
      t.beforeEach(() => {
        process.browser = false;
      });

      t.it('Not call lscache.set', () => {
        subject();
        t.expect(lscache.remove.callCount).equals(0);
      });
    });
  });
});
