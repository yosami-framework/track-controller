# TrackController
Controller for track.
This controller is based on the Component of Mithril.js.

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
    name('hoge');                            // Define model name. **Required**
    views(require('./views/hoge'));          // Append view.
    viewmodel(require('./viewmodels/hoge')); // Set viewmodel.
  }

  oninit() {
    super.oninit(); // Must call when Override lifecycle methods.
  }
}
```

## Lifecycle methods

Must call super method When override lifecycle method.

### onparamschange

The `onparamschanged()` hooks is called after change controller params.

```javascript
// When change `?hoge='aaa'` `?hoge='bbb'`
onparamschanged(newly, older) {
  // call  
}
```
