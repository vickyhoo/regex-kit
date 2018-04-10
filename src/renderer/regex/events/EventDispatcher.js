import Event from './Event';
/**
 * EventDispatcher provides methods for managing queues of event listeners and dispatching events.
 *
 * @class EventDispatcher
 * @constructor
 * */
export default class EventDispatcher {
  /**
   * Static initializer to mix EventDispatcher methods into a target object or prototype.
   *
   *        EventDispatcher.initialize(MyClass.prototype); // add to the prototype of the class
   *        EventDispatcher.initialize(myObject); // add to a specific instance
   *
   * @method initialize
   * @static
   * @param {Object} target The target object to inject EventDispatcher methods into. This can be an instance or a
   * prototype.
   * */
  static initialize(target) {
    target.addEventListener = this.addEventListener;
    target.on = this.on;
    target.removeEventListener = target.off = this.removeEventListener;
    target.removeAllEventListeners = this.removeAllEventListeners;
    target.hasEventListener = this.hasEventListener;
    target.dispatchEvent = this.dispatchEvent;
    target._dispatchEvent = this._dispatchEvent;
    target.willTrigger = this.willTrigger;
  }

  // constructor:

  // private properties:
  /**
   * @protected
   * @property _listeners
   * @type Object
   * */
  _listeners = null;

  /**
   * @protected
   * @property _captureListeners
   * @type Object
   * */
  _captureListeners = null;


  // public methods:
  /**
   * Adds the specified event listener. Note that adding multiple listeners to the same function will result in
   * multiple callbacks getting fired.
   *
   * <h4>Example</h4>
   *
   *      displayObject.addEventListener("click", handleClick);
   *      function handleClick(event) {
   *         // Click happened.
   *      }
   *
   * @method addEventListener
   * @param {String} type The string type of the event.
   * @param {Function | Object} listener An object with a handleEvent method, or a function that will be called when
   * the event is dispatched.
   * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
   * @return {Function | Object} Returns the listener for chaining or assignment.
   * */
  addEventListener(type, listener, useCapture) {
    let listeners;
    if (useCapture) {
      listeners = this._captureListeners = this._captureListeners || {};
    } else {
      listeners = this._listeners = this._listeners || {};
    }
    let arr = listeners[type];
    if (arr) {
      this.removeEventListener(type, listener, useCapture);
    }
    arr = listeners[type]; // remove may have deleted the array
    if (!arr) {
      listeners[type] = [listener];
    } else {
      arr.push(listener);
    }
    return listener;
  }

  /**
   * A shortcut method for using addEventListener that makes it easier to specify an execution scope, have a listener
   * only run once, associate arbitrary data with the listener, and remove the listener.
   *
   * This method works by creating an anonymous wrapper function and subscribing it with addEventListener.
   * The created anonymous function is returned for use with .removeEventListener (or .off).
   *
   * <h4>Example</h4>
   *
   *        var listener = myBtn.on("click", handleClick, null, false, {count:3});
   *        function handleClick(evt, data) {
   *          data.count -= 1;
   *          console.log(this == myBtn); // true - scope defaults to the dispatcher
   *          if (data.count == 0) {
   *            alert("clicked 3 times!");
   *            myBtn.off("click", listener);
   *            // alternately: evt.remove();
   *          }
   *        }
   *
   * @method on
   * @param {String} type The string type of the event.
   * @param {Function | Object} listener An object with a handleEvent method, or a function that will be called when
   * the event is dispatched.
   * @param {Object} [scope] The scope to execute the listener in. Defaults to the dispatcher/currentTarget for function listeners, and to the listener itself for object listeners (ie. using handleEvent).
   * @param {Boolean} [once=false] If true, the listener will remove itself after the first time it is triggered.
   * @param {*} [data] Arbitrary data that will be included as the second parameter when the listener is called.
   * @param {Boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
   * @return {Function} Returns the anonymous function that was created and assigned as the listener. This is needed to remove the listener later using .removeEventListener.
   * */
  on(type, listener, scope, once, data, useCapture) {
    if (listener.handleEvent) {
      scope = scope || listener;
      listener = listener.handleEvent;
    }
    scope = scope || this;
    return this.addEventListener(
      type,
      (evt) => {
        listener.call(scope, evt, data);
        if (once) {
          evt.remove();
        }
      },
      useCapture
    );
  }

  /**
   * Removes the specified event listener.
   *
   * <b>Important Note:</b> that you must pass the exact function reference used when the event was added. If a proxy
   * function, or function closure is used as the callback, the proxy/closure reference must be used - a new proxy or
   * closure will not work.
   *
   * <h4>Example</h4>
   *
   *      displayObject.removeEventListener("click", handleClick);
   *
   * @method removeEventListener
   * @param {String} type The string type of the event.
   * @param {Function | Object} listener The listener function or object.
   * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
   * */
  removeEventListener(type, listener, useCapture) {
    const listeners = useCapture ? this._captureListeners : this._listeners;
    if (!listeners) {
      return;
    }
    const arr = listeners[type];
    if (!arr) {
      return;
    }
    for (let i = 0, l = arr.length; i < l; i++) {
      if (arr[i] == listener) {
        if (l == 1) {
          delete listeners[type];
        } else {
          // allows for faster checks.
          arr.splice(i, 1);
        }
        break;
      }
    }
  }

  /**
   * A shortcut to the removeEventListener method, with the same parameters and return value. This is a companion to the
   * .on method.
   *
   * @method off
   * @param {String} type The string type of the event.
   * @param {Function | Object} listener The listener function or object.
   * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
   * */
  off = this.removeEventListener;

  /**
   * Removes all listeners for the specified type, or all listeners of all types.
   *
   * <h4>Example</h4>
   *
   *      // Remove all listeners
   *      displayObject.removeAllEventListeners();
   *
   *      // Remove all click listeners
   *      displayObject.removeAllEventListeners("click");
   *
   * @method removeAllEventListeners
   * @param {String} [type] The string type of the event. If omitted, all listeners for all types will be removed.
   * */
  removeAllEventListeners(type) {
    if (!type) {
      this._listeners = this._captureListeners = null;
    } else {
      if (this._listeners) {
        delete this._listeners[type];
      }
      if (this._captureListeners) {
        delete this._captureListeners[type];
      }
    }
  }

  /**
   * Dispatches the specified event to all listeners.
   *
   * <h4>Example</h4>
   *
   *      // Use a string event
   *      this.dispatchEvent("complete");
   *
   *      // Use an Event instance
   *      var event = new Event("progress");
   *      this.dispatchEvent(event);
   *
   * @method dispatchEvent
   * @param {Object | String | Event} eventObj An object with a "type" property, or a string type.
   * While a generic object will work, it is recommended to use a Event instance. If a string is used,
   * dispatchEvent will construct an Event instance with the specified type.
   * @param {Object} [target] The object to use as the target property of the event object. This will default to the
   * dispatching object. <b>This parameter is deprecated and will be removed.</b>
   * @return {Boolean} Returns the value of eventObj.defaultPrevented.
   * */
  dispatchEvent(eventObj, target) {
    if (typeof eventObj == 'string') {
      // won't bubble, so skip everything if there's no listeners:
      const listeners = this._listeners;
      if (!listeners || !listeners[eventObj]) {
        return false;
      }
      eventObj = new Event(eventObj);
    }
    // TODO: deprecated. Target param is deprecated, only use case is MouseEvent/mousemove, remove.
    try {
      eventObj.target = target || this;
      // eslint-disable-next-line
    } catch (e) {} // allows redispatching of native events

    if (!eventObj.bubbles || !this.parent) {
      this._dispatchEvent(eventObj, 2);
    } else {
      let top = this;
      const list = [top];
      while (top.parent) {
        list.push((top = top.parent));
      }
      let i;
      const l = list.length;

      // capture & atTarget
      for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
        list[i]._dispatchEvent(eventObj, 1 + (i == 0));
      }
      // bubbling
      for (i = 1; i < l && !eventObj.propagationStopped; i++) {
        list[i]._dispatchEvent(eventObj, 3);
      }
    }
    return eventObj.defaultPrevented;
  }

  /**
   * Indicates whether there is at least one listener for the specified event type.
   * @method hasEventListener
   * @param {String} type The string type of the event.
   * @return {Boolean} Returns true if there is at least one listener for the specified event.
   * */
  hasEventListener(type) {
    const listeners = this._listeners;
    const captureListeners = this._captureListeners;
    return !!((listeners && listeners[type]) || (captureListeners && captureListeners[type]));
  }

  /**
   * Indicates whether there is at least one listener for the specified event type on this object or any of its
   * ancestors (parent, parent's parent, etc). A return value of true indicates that if a bubbling event of the
   * specified type is dispatched from this object, it will trigger at least one listener.
   *
   * This is similar to {{#crossLink "EventDispatcher/hasEventListener"}}{{/crossLink}}, but it searches the entire
   * event flow for a listener, not just this object.
   * @method willTrigger
   * @param {String} type The string type of the event.
   * @return {Boolean} Returns `true` if there is at least one listener for the specified event.
   * */
  willTrigger(type) {
    let o = this;
    while (o) {
      if (o.hasEventListener(type)) {
        return true;
      }
      o = o.parent;
    }
    return false;
  }

  /**
   * @method toString
   * @return {String} a string representation of the instance.
   * */
  toString = () => '[EventDispatcher]';

  // private methods:
  /**
   * @method _dispatchEvent
   * @param {Object | String | Event} eventObj
   * @param {Object} eventPhase
   * @protected
   * */
  _dispatchEvent(eventObj, eventPhase) {
    let l;
    const listeners = eventPhase == 1 ? this._captureListeners : this._listeners;
    if (eventObj && listeners) {
      let arr = listeners[eventObj.type];
      // eslint-disable-next-line
      if (!arr || !(l = arr.length)) {
        return;
      }
      try {
        eventObj.currentTarget = this;
        // eslint-disable-next-line
      } catch (e) {}
      try {
        eventObj.eventPhase = eventPhase;
        // eslint-disable-next-line
      } catch (e) {}
      eventObj.removed = false;
      arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
      for (let i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
        const o = arr[i];
        if (o.handleEvent) {
          o.handleEvent(eventObj);
        } else {
          o(eventObj);
        }
        if (eventObj.removed) {
          this.off(eventObj.type, o, eventPhase == 1);
          eventObj.removed = false;
        }
      }
    }
  }
}
