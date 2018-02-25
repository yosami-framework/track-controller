const TrackConfig = require('track-config');

global.window = require('mithril/test-utils/browserMock')();
global.document = window.document;

TrackConfig.configure((c) => {
  c.m = require('mithril');
});
