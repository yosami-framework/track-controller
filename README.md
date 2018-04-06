# TrackController
Controller for track.
This controller is based on the Component of Mithril.js.

[![Build Status](https://travis-ci.org/yosami-framework/track-controller.svg?branch=master)](https://travis-ci.org/yosami-framework/track-controller)

## Installation

### npm

```shell
npm install track-controller
```

## Usage

```javascript
const TrackController = require('track-controller');

class HogeController extends TrackController {
  static definer() {
    name('hoge'); // Define model name. **Required**
  }
}
```

TrackController is usable TrackComponent interfarce.

## Before/After action

```javascript
const TrackController = require('track-controller');

class HogeController extends TrackController {
  static definer() {
    name('hoge');
    before_action('loadHoge');
    after_action('validateHoge');
  }

  loadHoge() {
    // Call before loading prosess.
  }

  validateHoge() {
    // Call after  loading prosess.
  }
}
```

### cycile

```
[constructor]
     |
 [oninit]
     |
     | ----- [before_action] // if has cache, not call `before_actions`
     |              |
     | ----- [after_action]
     |
[oncreate]
```

## ExceptionHandling

### Raise error

```javascript
class HogeController extends TrackController {
  loadHoge() {
    this.raise(404, 'NotFound'); // Raise error.
  }
}
```

## Lifecycle methods

Must call super method When override lifecycle method.

### onparamschange

The `onparamschanged()` hooks is called after change controller params.

```javascript
// When change from `?hoge='aaa'` to `?hoge='bbb'`
onparamschanged(newly, older) {
  // call  
}
```
