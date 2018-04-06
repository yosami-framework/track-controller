/**
 * A base class.
 */
class Builder {
  /**
   * Initialize
   * @private This method is only used internally by Builder.
   * @param {TrackController} instance Controller instance.
   */
  constructor(instance) {
    this._instance = instance;
    instance._afterActions = [];
    instance._beforeActions = [];
  }

  /**
   * Return DSL
   * @private
   * @return {object} DSL.
   */
  get _dsl() {
    return {
      after_action:  {func: this._appendAfterAction, binding: this},
      before_action: {func: this._appendBeforeAction, binding: this},
    };
  }

  /**
   * Append TrackView.
   * @private
   * @param {TrackView} name name of TrackView class.
   */
  _appendAfterAction(name) {
    this._instance._afterActions.push(
      this._instance[name].bind(this._instance)
    );
  }

  /**
   * Append TrackView.
   * @private
   * @param {TrackView} name name of TrackView class.
   */
  _appendBeforeAction(name) {
    this._instance._beforeActions.push(
      this._instance[name].bind(this._instance)
    );
  }

  /**
   * Build model from DSL.
   * @param {TrackController} controller Controller instance.
   * @return {object} DSL.
   */
  static dsl(controller) {
    return (new Builder(controller))._dsl;
  }
}

module.exports = Builder;
