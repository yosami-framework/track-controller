const TrackConfig = require('track-config');

global.window = require('mithril/test-utils/browserMock')();
global.document = window.document;

global.requestAnimationFrame = function(func) {
  setTimeout(func, 1);
};

TrackConfig.configure((c) => {
  c.loader = ((module) => require(`./fixtures/${module}`));
  c.localeSelector = ((url) => 'en');
});
