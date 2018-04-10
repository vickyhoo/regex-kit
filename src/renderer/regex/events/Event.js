export default class Event {
  /**
   * Contains properties and methods shared by all events for use with
   *
   * Note that Event objects are often reused, so you should never
   * rely on an event object's state outside of the call stack it was received in.
   * @class Event
   * @param {String} type The event type.
   * @param {Boolean} bubbles Indicates whether the event will bubble through the display list.
   * @param {Boolean} cancelable Indicates whether the default behaviour of this event can be cancelled.
   * @constructor
   * */
  constructor(type, bubbles, cancelable) {
    this.initialize(type, bubbles, cancelable);
  }

  // events:

  // public properties:

  /**
   * The type of event.
   * @property type
   * @type String
   * */
  type = null;

  /**
   * The object that generated an event.
   * @property target
   * @type Object
   * @default null
   * @readonly
   */
  target = null;

  /**
   * The current target that a bubbling event is being dispatched from. For non-bubbling events, this will
   * always be the same as target. For example, if childObj.parent = parentObj, and a bubbling event
   * is generated from childObj, then a listener on parentObj would receive the event with
   * target=childObj (the original target) and currentTarget=parentObj (where the listener was added).
   * @property currentTarget
   * @type Object
   * @default null
   * @readonly
   */
  currentTarget = null;

  /**
   * For bubbling events, this indicates the current event phase:<OL>
   *    <LI> capture phase: starting from the top parent to the target</LI>
   *    <LI> at target phase: currently being dispatched from the target</LI>
   *    <LI> bubbling phase: from the target to the top parent</LI>
   * </OL>
   * @property eventPhase
   * @type Number
   * @default 0
   * @readonly
   */
  eventPhase = 0;

  /**
   * Indicates whether the event will bubble through the display list.
   * @property bubbles
   * @type Boolean
   * @default false
   * @readonly
   */
  bubbles = false;

  /**
   * Indicates whether the default behaviour of this event can be cancelled via
   * @property cancelable
   * @type Boolean
   * @default false
   * @readonly
   */
  cancelable = false;

  /**
   * The epoch time at which this event was created.
   * @property timeStamp
   * @type Number
   * @default 0
   * @readonly
   */
  timeStamp = 0;

  /**
   * @property defaultPrevented
   * @type Boolean
   * @default false
   * @readonly
   */
  defaultPrevented = false;

  /**
   * @property propagationStopped
   * @type Boolean
   * @default false
   * @readonly
   */
  propagationStopped = false;

  /**
   * @property immediatePropagationStopped
   * @type Boolean
   * @default false
   * @readonly
   */
  immediatePropagationStopped = false;

  /**
   * @property removed
   * @type Boolean
   * @default false
   * @readonly
   */
  removed = false;

  // constructor:
  /**
   * Initialization method.
   * @method initialize
   * @param {String} type The event type.
   * @param {Boolean} bubbles Indicates whether the event will bubble through the display list.
   * @param {Boolean} cancelable Indicates whether the default behaviour of this event can be cancelled.
   * @protected
   * */
  initialize(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.timeStamp = new Date().getTime();
  }

  // public methods:

  /**
   * Mirrors the DOM event standard.
   * @method preventDefault
   * */
  preventDefault() {
    this.defaultPrevented = true;
  }

  /**
   * Mirrors the DOM event standard.
   * @method stopPropagation
   * */
  stopPropagation() {
    this.propagationStopped = true;
  }

  /**
   * Mirrors the DOM event standard.
   * @method stopImmediatePropagation
   * */
  stopImmediatePropagation() {
    this.immediatePropagationStopped = this.propagationStopped = true;
  }

  /**
   * Causes the active listener to be removed via removeEventListener();
   *
   *  myBtn.addEventListener("click", function(evt) {
   *  // do stuff...
   *    evt.remove(); // removes this listener.
   *  });
   *
   * @method remove
   * */
  remove() {
    this.removed = true;
  }

  /**
   * Returns a clone of the Event instance.
   * @method clone
   * @return {Event} a clone of the Event instance.
   * */
  clone() {
    return new Event(this.type, this.bubbles, this.cancelable);
  }

  /**
   * Returns a string representation of this object.
   * @method toString
   * @return {String} a string representation of the instance.
   * */
  toString() {
    return `[Event (type=${this.type})]`;
  }
}
