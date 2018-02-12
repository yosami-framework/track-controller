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
    super.oninit(); // Must call when Override lifecycle methods of Mithril.
  }
}
```
