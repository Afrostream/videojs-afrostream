(function (global, factory) {

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = global.document ?
      factory(global, true) :
      function (w) {
        if (!w.document) {
          throw new Error('vjs requires a window with a document');
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) { /*jshint unused:false*/
  /*! videojs-afrostream - v0.17.5 - 2015-09-10
* Copyright (c) 2015 Brightcove; Licensed  */
// HTML5 Shiv. Must be in <head> to support older browsers.
document.createElement('video');
document.createElement('audio');
document.createElement('track');

/**
 * Doubles as the main function for users to create a player instance and also
 * the main library object.
 *
 * **ALIASES** videojs, _V_ (deprecated)
 *
 * The `vjs` function can be used to initialize or retrieve a player.
 *
 *     var myPlayer = vjs('my_video_id');
 *
 * @param  {String|Element} id      Video element or video element ID
 * @param  {Object=} options        Optional options object for config/settings
 * @param  {Function=} ready        Optional ready callback
 * @return {vjs.Player}             A player instance
 * @namespace
 */
var vjs = function(id, options, ready){
  var tag; // Element of ID

  // Allow for element or ID to be passed in
  // String ID
  if (typeof id === 'string') {

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    // If a player instance has already been created for this ID return it.
    if (vjs.players[id]) {

      // If options or ready funtion are passed, warn
      if (options) {
        vjs.log.warn ('Player "' + id + '" is already initialised. Options will not be applied.');
      }

      if (ready) {
        vjs.players[id].ready(ready);
      }

      return vjs.players[id];

    // Otherwise get element for ID
    } else {
      tag = vjs.el(id);
    }

  // ID is a media element
  } else {
    tag = id;
  }

  // Check for a useable element
  if (!tag || !tag.nodeName) { // re: nodeName, could be a box div also
    throw new TypeError('The element or ID supplied is not valid. (videojs)'); // Returns
  }

  // Element may have a player attr referring to an already created player instance.
  // If not, set up a new player and return the instance.
  return tag['player'] || new vjs.Player(tag, options, ready);
};

// Extended name, also available externally, window.videojs
var videojs = window['videojs'] = vjs;

// CDN Version. Used to target right flash swf.
vjs.CDN_VERSION = '4.12';
vjs.ACCESS_PROTOCOL = ('https:' == document.location.protocol ? 'https://' : 'http://');

/**
* Full player version
* @type {string}
*/
vjs['VERSION'] = '4.12.14';

/**
 * Global Player instance options, surfaced from vjs.Player.prototype.options_
 * vjs.options = vjs.Player.prototype.options_
 * All options should use string keys so they avoid
 * renaming by closure compiler
 * @type {Object}
 */
vjs.options = {
  // Default order of fallback technology
  'techOrder': ['html5','flash'],
  // techOrder: ['flash','html5'],

  'html5': {},
  'flash': {},

  // Default of web browser is 300x150. Should rely on source width/height.
  'width': 300,
  'height': 150,
  // defaultVolume: 0.85,
  'defaultVolume': 0.00, // The freakin seaguls are driving me crazy!

  // default playback rates
  'playbackRates': [],
  // Add playback rate selection by adding rates
  // 'playbackRates': [0.5, 1, 1.5, 2],

  // default inactivity timeout
  'inactivityTimeout': 2000,

  // Included control sets
  'children': {
    'mediaLoader': {},
    'posterImage': {},
    'loadingSpinner': {},
    'textTrackDisplay': {},
    'bigPlayButton': {},
    'controlBar': {},
    'errorDisplay': {},
    'textTrackSettings': {}
  },

  'language': document.getElementsByTagName('html')[0].getAttribute('lang') || navigator.languages && navigator.languages[0] || navigator.userLanguage || navigator.language || 'en',

  // locales and their language translations
  'languages': {},

  // Default message to show when a video cannot be played.
  'notSupportedMessage': 'No compatible source was found for this video.'
};

// Set CDN Version of swf
// The added (+) blocks the replace from changing this 4.12 string
if (vjs.CDN_VERSION !== 'GENERATED'+'_CDN_VSN') {
  videojs.options['flash']['swf'] = vjs.ACCESS_PROTOCOL + 'vjs.zencdn.net/'+vjs.CDN_VERSION+'/video-js.swf';
}

/**
 * Utility function for adding languages to the default options. Useful for
 * amending multiple language support at runtime.
 *
 * Example: vjs.addLanguage('es', {'Hello':'Hola'});
 *
 * @param  {String} code The language code or dictionary property
 * @param  {Object} data The data values to be translated
 * @return {Object} The resulting global languages dictionary object
 */
vjs.addLanguage = function(code, data){
  if(vjs.options['languages'][code] !== undefined) {
    vjs.options['languages'][code] = vjs.util.mergeOptions(vjs.options['languages'][code], data);
  } else {
    vjs.options['languages'][code] = data;
  }
  return vjs.options['languages'];
};

/**
 * Global player list
 * @type {Object}
 */
vjs.players = {};

/*!
 * Custom Universal Module Definition (UMD)
 *
 * Video.js will never be a non-browser lib so we can simplify UMD a bunch and
 * still support requirejs and browserify. This also needs to be closure
 * compiler compatible, so string keys are used.
 */
if (typeof define === 'function' && define['amd']) {
  define('videojs', [], function(){ return videojs; });

// checking that module is an object too because of umdjs/umd#35
} else if (typeof exports === 'object' && typeof module === 'object') {
  module['exports'] = videojs;
}
/**
 * Core Object/Class for objects that use inheritance + constructors
 *
 * To create a class that can be subclassed itself, extend the CoreObject class.
 *
 *     var Animal = CoreObject.extend();
 *     var Horse = Animal.extend();
 *
 * The constructor can be defined through the init property of an object argument.
 *
 *     var Animal = CoreObject.extend({
 *       init: function(name, sound){
 *         this.name = name;
 *       }
 *     });
 *
 * Other methods and properties can be added the same way, or directly to the
 * prototype.
 *
 *    var Animal = CoreObject.extend({
 *       init: function(name){
 *         this.name = name;
 *       },
 *       getName: function(){
 *         return this.name;
 *       },
 *       sound: '...'
 *    });
 *
 *    Animal.prototype.makeSound = function(){
 *      alert(this.sound);
 *    };
 *
 * To create an instance of a class, use the create method.
 *
 *    var fluffy = Animal.create('Fluffy');
 *    fluffy.getName(); // -> Fluffy
 *
 * Methods and properties can be overridden in subclasses.
 *
 *     var Horse = Animal.extend({
 *       sound: 'Neighhhhh!'
 *     });
 *
 *     var horsey = Horse.create('Horsey');
 *     horsey.getName(); // -> Horsey
 *     horsey.makeSound(); // -> Alert: Neighhhhh!
 *
 * @class
 * @constructor
 */
vjs.CoreObject = vjs['CoreObject'] = function(){};
// Manually exporting vjs['CoreObject'] here for Closure Compiler
// because of the use of the extend/create class methods
// If we didn't do this, those functions would get flattened to something like
// `a = ...` and `this.prototype` would refer to the global object instead of
// CoreObject

/**
 * Create a new object that inherits from this Object
 *
 *     var Animal = CoreObject.extend();
 *     var Horse = Animal.extend();
 *
 * @param {Object} props Functions and properties to be applied to the
 *                       new object's prototype
 * @return {vjs.CoreObject} An object that inherits from CoreObject
 * @this {*}
 */
vjs.CoreObject.extend = function(props){
  var init, subObj;

  props = props || {};
  // Set up the constructor using the supplied init method
  // or using the init of the parent object
  // Make sure to check the unobfuscated version for external libs
  init = props['init'] || props.init || this.prototype['init'] || this.prototype.init || function(){};
  // In Resig's simple class inheritance (previously used) the constructor
  //  is a function that calls `this.init.apply(arguments)`
  // However that would prevent us from using `ParentObject.call(this);`
  //  in a Child constructor because the `this` in `this.init`
  //  would still refer to the Child and cause an infinite loop.
  // We would instead have to do
  //    `ParentObject.prototype.init.apply(this, arguments);`
  //  Bleh. We're not creating a _super() function, so it's good to keep
  //  the parent constructor reference simple.
  subObj = function(){
    init.apply(this, arguments);
  };

  // Inherit from this object's prototype
  subObj.prototype = vjs.obj.create(this.prototype);
  // Reset the constructor property for subObj otherwise
  // instances of subObj would have the constructor of the parent Object
  subObj.prototype.constructor = subObj;

  // Make the class extendable
  subObj.extend = vjs.CoreObject.extend;
  // Make a function for creating instances
  subObj.create = vjs.CoreObject.create;

  // Extend subObj's prototype with functions and other properties from props
  for (var name in props) {
    if (props.hasOwnProperty(name)) {
      subObj.prototype[name] = props[name];
    }
  }

  return subObj;
};

/**
 * Create a new instance of this Object class
 *
 *     var myAnimal = Animal.create();
 *
 * @return {vjs.CoreObject} An instance of a CoreObject subclass
 * @this {*}
 */
vjs.CoreObject.create = function(){
  // Create a new object that inherits from this object's prototype
  var inst = vjs.obj.create(this.prototype);

  // Apply this constructor function to the new object
  this.apply(inst, arguments);

  // Return the new object
  return inst;
};
/**
 * @fileoverview Event System (John Resig - Secrets of a JS Ninja http://jsninja.com/)
 * (Original book version wasn't completely usable, so fixed some things and made Closure Compiler compatible)
 * This should work very similarly to jQuery's events, however it's based off the book version which isn't as
 * robust as jquery's, so there's probably some differences.
 */

/**
 * Add an event listener to element
 * It stores the handler function in a separate cache object
 * and adds a generic handler to the element's event,
 * along with a unique id (guid) to the element.
 * @param  {Element|Object}   elem Element or object to bind listeners to
 * @param  {String|Array}   type Type of event to bind to.
 * @param  {Function} fn   Event listener.
 * @private
 */
vjs.on = function(elem, type, fn){
  if (vjs.obj.isArray(type)) {
    return _handleMultipleEvents(vjs.on, elem, type, fn);
  }

  var data = vjs.getData(elem);

  // We need a place to store all our handler data
  if (!data.handlers) data.handlers = {};

  if (!data.handlers[type]) data.handlers[type] = [];

  if (!fn.guid) fn.guid = vjs.guid++;

  data.handlers[type].push(fn);

  if (!data.dispatcher) {
    data.disabled = false;

    data.dispatcher = function (event){

      if (data.disabled) return;
      event = vjs.fixEvent(event);

      var handlers = data.handlers[event.type];

      if (handlers) {
        // Copy handlers so if handlers are added/removed during the process it doesn't throw everything off.
        var handlersCopy = handlers.slice(0);

        for (var m = 0, n = handlersCopy.length; m < n; m++) {
          if (event.isImmediatePropagationStopped()) {
            break;
          } else {
            handlersCopy[m].call(elem, event);
          }
        }
      }
    };
  }

  if (data.handlers[type].length == 1) {
    if (elem.addEventListener) {
      elem.addEventListener(type, data.dispatcher, false);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + type, data.dispatcher);
    }
  }
};

/**
 * Removes event listeners from an element
 * @param  {Element|Object}   elem Object to remove listeners from
 * @param  {String|Array=}   type Type of listener to remove. Don't include to remove all events from element.
 * @param  {Function} fn   Specific listener to remove. Don't include to remove listeners for an event type.
 * @private
 */
vjs.off = function(elem, type, fn) {
  // Don't want to add a cache object through getData if not needed
  if (!vjs.hasData(elem)) return;

  var data = vjs.getData(elem);

  // If no events exist, nothing to unbind
  if (!data.handlers) { return; }

  if (vjs.obj.isArray(type)) {
    return _handleMultipleEvents(vjs.off, elem, type, fn);
  }

  // Utility function
  var removeType = function(t){
     data.handlers[t] = [];
     vjs.cleanUpEvents(elem,t);
  };

  // Are we removing all bound events?
  if (!type) {
    for (var t in data.handlers) removeType(t);
    return;
  }

  var handlers = data.handlers[type];

  // If no handlers exist, nothing to unbind
  if (!handlers) return;

  // If no listener was provided, remove all listeners for type
  if (!fn) {
    removeType(type);
    return;
  }

  // We're only removing a single handler
  if (fn.guid) {
    for (var n = 0; n < handlers.length; n++) {
      if (handlers[n].guid === fn.guid) {
        handlers.splice(n--, 1);
      }
    }
  }

  vjs.cleanUpEvents(elem, type);
};

/**
 * Clean up the listener cache and dispatchers
 * @param  {Element|Object} elem Element to clean up
 * @param  {String} type Type of event to clean up
 * @private
 */
vjs.cleanUpEvents = function(elem, type) {
  var data = vjs.getData(elem);

  // Remove the events of a particular type if there are none left
  if (data.handlers[type].length === 0) {
    delete data.handlers[type];
    // data.handlers[type] = null;
    // Setting to null was causing an error with data.handlers

    // Remove the meta-handler from the element
    if (elem.removeEventListener) {
      elem.removeEventListener(type, data.dispatcher, false);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + type, data.dispatcher);
    }
  }

  // Remove the events object if there are no types left
  if (vjs.isEmpty(data.handlers)) {
    delete data.handlers;
    delete data.dispatcher;
    delete data.disabled;

    // data.handlers = null;
    // data.dispatcher = null;
    // data.disabled = null;
  }

  // Finally remove the expando if there is no data left
  if (vjs.isEmpty(data)) {
    vjs.removeData(elem);
  }
};

/**
 * Fix a native event to have standard property values
 * @param  {Object} event Event object to fix
 * @return {Object}
 * @private
 */
vjs.fixEvent = function(event) {

  function returnTrue() { return true; }
  function returnFalse() { return false; }

  // Test if fixing up is needed
  // Used to check if !event.stopPropagation instead of isPropagationStopped
  // But native events return true for stopPropagation, but don't have
  // other expected methods like isPropagationStopped. Seems to be a problem
  // with the Javascript Ninja code. So we're just overriding all events now.
  if (!event || !event.isPropagationStopped) {
    var old = event || window.event;

    event = {};
    // Clone the old object so that we can modify the values event = {};
    // IE8 Doesn't like when you mess with native event properties
    // Firefox returns false for event.hasOwnProperty('type') and other props
    //  which makes copying more difficult.
    // TODO: Probably best to create a whitelist of event props
    for (var key in old) {
      // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
      // Chrome warns you if you try to copy deprecated keyboardEvent.keyLocation
      if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation') {
        // Chrome 32+ warns if you try to copy deprecated returnValue, but
        // we still want to if preventDefault isn't supported (IE8).
        if (!(key == 'returnValue' && old.preventDefault)) {
          event[key] = old[key];
        }
      }
    }

    // The event occurred on this element
    if (!event.target) {
      event.target = event.srcElement || document;
    }

    // Handle which other element the event is related to
    event.relatedTarget = event.fromElement === event.target ?
      event.toElement :
      event.fromElement;

    // Stop the default browser action
    event.preventDefault = function () {
      if (old.preventDefault) {
        old.preventDefault();
      }
      event.returnValue = false;
      event.isDefaultPrevented = returnTrue;
      event.defaultPrevented = true;
    };

    event.isDefaultPrevented = returnFalse;
    event.defaultPrevented = false;

    // Stop the event from bubbling
    event.stopPropagation = function () {
      if (old.stopPropagation) {
        old.stopPropagation();
      }
      event.cancelBubble = true;
      event.isPropagationStopped = returnTrue;
    };

    event.isPropagationStopped = returnFalse;

    // Stop the event from bubbling and executing other handlers
    event.stopImmediatePropagation = function () {
      if (old.stopImmediatePropagation) {
        old.stopImmediatePropagation();
      }
      event.isImmediatePropagationStopped = returnTrue;
      event.stopPropagation();
    };

    event.isImmediatePropagationStopped = returnFalse;

    // Handle mouse position
    if (event.clientX != null) {
      var doc = document.documentElement, body = document.body;

      event.pageX = event.clientX +
        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY +
        (doc && doc.scrollTop || body && body.scrollTop || 0) -
        (doc && doc.clientTop || body && body.clientTop || 0);
    }

    // Handle key presses
    event.which = event.charCode || event.keyCode;

    // Fix button for mouse clicks:
    // 0 == left; 1 == middle; 2 == right
    if (event.button != null) {
      event.button = (event.button & 1 ? 0 :
        (event.button & 4 ? 1 :
          (event.button & 2 ? 2 : 0)));
    }
  }

  // Returns fixed-up instance
  return event;
};

/**
 * Trigger an event for an element
 * @param  {Element|Object}      elem  Element to trigger an event on
 * @param  {Event|Object|String} event A string (the type) or an event object with a type attribute
 * @private
 */
vjs.trigger = function(elem, event) {
  // Fetches element data and a reference to the parent (for bubbling).
  // Don't want to add a data object to cache for every parent,
  // so checking hasData first.
  var elemData = (vjs.hasData(elem)) ? vjs.getData(elem) : {};
  var parent = elem.parentNode || elem.ownerDocument;
      // type = event.type || event,
      // handler;

  // If an event name was passed as a string, creates an event out of it
  if (typeof event === 'string') {
    event = { type:event, target:elem };
  }
  // Normalizes the event properties.
  event = vjs.fixEvent(event);

  // If the passed element has a dispatcher, executes the established handlers.
  if (elemData.dispatcher) {
    elemData.dispatcher.call(elem, event);
  }

  // Unless explicitly stopped or the event does not bubble (e.g. media events)
    // recursively calls this function to bubble the event up the DOM.
    if (parent && !event.isPropagationStopped() && event.bubbles !== false) {
    vjs.trigger(parent, event);

  // If at the top of the DOM, triggers the default action unless disabled.
  } else if (!parent && !event.defaultPrevented) {
    var targetData = vjs.getData(event.target);

    // Checks if the target has a default action for this event.
    if (event.target[event.type]) {
      // Temporarily disables event dispatching on the target as we have already executed the handler.
      targetData.disabled = true;
      // Executes the default action.
      if (typeof event.target[event.type] === 'function') {
        event.target[event.type]();
      }
      // Re-enables event dispatching.
      targetData.disabled = false;
    }
  }

  // Inform the triggerer if the default was prevented by returning false
  return !event.defaultPrevented;
  /* Original version of js ninja events wasn't complete.
   * We've since updated to the latest version, but keeping this around
   * for now just in case.
   */
  // // Added in addition to book. Book code was broke.
  // event = typeof event === 'object' ?
  //   event[vjs.expando] ?
  //     event :
  //     new vjs.Event(type, event) :
  //   new vjs.Event(type);

  // event.type = type;
  // if (handler) {
  //   handler.call(elem, event);
  // }

  // // Clean up the event in case it is being reused
  // event.result = undefined;
  // event.target = elem;
};

/**
 * Trigger a listener only once for an event
 * @param  {Element|Object}   elem Element or object to
 * @param  {String|Array}   type
 * @param  {Function} fn
 * @private
 */
vjs.one = function(elem, type, fn) {
  if (vjs.obj.isArray(type)) {
    return _handleMultipleEvents(vjs.one, elem, type, fn);
  }
  var func = function(){
    vjs.off(elem, type, func);
    fn.apply(this, arguments);
  };
  // copy the guid to the new function so it can removed using the original function's ID
  func.guid = fn.guid = fn.guid || vjs.guid++;
  vjs.on(elem, type, func);
};

/**
 * Loops through an array of event types and calls the requested method for each type.
 * @param  {Function} fn   The event method we want to use.
 * @param  {Element|Object} elem Element or object to bind listeners to
 * @param  {String}   type Type of event to bind to.
 * @param  {Function} callback   Event listener.
 * @private
 */
function _handleMultipleEvents(fn, elem, type, callback) {
  vjs.arr.forEach(type, function(type) {
    fn(elem, type, callback); //Call the event method for each one of the types
  });
}
var hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * Creates an element and applies properties.
 * @param  {String=} tagName    Name of tag to be created.
 * @param  {Object=} properties Element properties to be applied.
 * @return {Element}
 * @private
 */
vjs.createEl = function(tagName, properties){
  var el;

  tagName = tagName || 'div';
  properties = properties || {};

  el = document.createElement(tagName);

  vjs.obj.each(properties, function(propName, val){
    // Not remembering why we were checking for dash
    // but using setAttribute means you have to use getAttribute

    // The check for dash checks for the aria-* attributes, like aria-label, aria-valuemin.
    // The additional check for "role" is because the default method for adding attributes does not
    // add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
    // browsers handle the attribute just fine. The W3C allows for aria-* attributes to be used in pre-HTML5 docs.
    // http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.
    if (propName.indexOf('aria-') !== -1 || propName == 'role') {
     el.setAttribute(propName, val);
    } else {
     el[propName] = val;
    }
  });

  return el;
};

/**
 * Uppercase the first letter of a string
 * @param  {String} string String to be uppercased
 * @return {String}
 * @private
 */
vjs.capitalize = function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Object functions container
 * @type {Object}
 * @private
 */
vjs.obj = {};

/**
 * Object.create shim for prototypal inheritance
 *
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 *
 * @function
 * @param  {Object}   obj Object to use as prototype
 * @private
 */
vjs.obj.create = Object.create || function(obj){
  //Create a new function called 'F' which is just an empty object.
  function F() {}

  //the prototype of the 'F' function should point to the
  //parameter of the anonymous function.
  F.prototype = obj;

  //create a new constructor function based off of the 'F' function.
  return new F();
};

/**
 * Loop through each property in an object and call a function
 * whose arguments are (key,value)
 * @param  {Object}   obj Object of properties
 * @param  {Function} fn  Function to be called on each property.
 * @this {*}
 * @private
 */
vjs.obj.each = function(obj, fn, context){
  for (var key in obj) {
    if (hasOwnProp.call(obj, key)) {
      fn.call(context || this, key, obj[key]);
    }
  }
};

/**
 * Merge two objects together and return the original.
 * @param  {Object} obj1
 * @param  {Object} obj2
 * @return {Object}
 * @private
 */
vjs.obj.merge = function(obj1, obj2){
  if (!obj2) { return obj1; }
  for (var key in obj2){
    if (hasOwnProp.call(obj2, key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
};

/**
 * Merge two objects, and merge any properties that are objects
 * instead of just overwriting one. Uses to merge options hashes
 * where deeper default settings are important.
 * @param  {Object} obj1 Object to override
 * @param  {Object} obj2 Overriding object
 * @return {Object}      New object. Obj1 and Obj2 will be untouched.
 * @private
 */
vjs.obj.deepMerge = function(obj1, obj2){
  var key, val1, val2;

  // make a copy of obj1 so we're not overwriting original values.
  // like prototype.options_ and all sub options objects
  obj1 = vjs.obj.copy(obj1);

  for (key in obj2){
    if (hasOwnProp.call(obj2, key)) {
      val1 = obj1[key];
      val2 = obj2[key];

      // Check if both properties are pure objects and do a deep merge if so
      if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
        obj1[key] = vjs.obj.deepMerge(val1, val2);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
};

/**
 * Make a copy of the supplied object
 * @param  {Object} obj Object to copy
 * @return {Object}     Copy of object
 * @private
 */
vjs.obj.copy = function(obj){
  return vjs.obj.merge({}, obj);
};

/**
 * Check if an object is plain, and not a dom node or any object sub-instance
 * @param  {Object} obj Object to check
 * @return {Boolean}     True if plain, false otherwise
 * @private
 */
vjs.obj.isPlain = function(obj){
  return !!obj
    && typeof obj === 'object'
    && obj.toString() === '[object Object]'
    && obj.constructor === Object;
};

/**
 * Check if an object is Array
*  Since instanceof Array will not work on arrays created in another frame we need to use Array.isArray, but since IE8 does not support Array.isArray we need this shim
 * @param  {Object} obj Object to check
 * @return {Boolean}     True if plain, false otherwise
 * @private
 */
vjs.obj.isArray = Array.isArray || function(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

/**
 * Check to see whether the input is NaN or not.
 * NaN is the only JavaScript construct that isn't equal to itself
 * @param {Number} num Number to check
 * @return {Boolean} True if NaN, false otherwise
 * @private
 */
vjs.isNaN = function(num) {
  return num !== num;
};

/**
 * Bind (a.k.a proxy or Context). A simple method for changing the context of a function
   It also stores a unique id on the function so it can be easily removed from events
 * @param  {*}   context The object to bind as scope
 * @param  {Function} fn      The function to be bound to a scope
 * @param  {Number=}   uid     An optional unique ID for the function to be set
 * @return {Function}
 * @private
 */
vjs.bind = function(context, fn, uid) {
  // Make sure the function has a unique ID
  if (!fn.guid) { fn.guid = vjs.guid++; }

  // Create the new function that changes the context
  var ret = function() {
    return fn.apply(context, arguments);
  };

  // Allow for the ability to individualize this function
  // Needed in the case where multiple objects might share the same prototype
  // IF both items add an event listener with the same function, then you try to remove just one
  // it will remove both because they both have the same guid.
  // when using this, you need to use the bind method when you remove the listener as well.
  // currently used in text tracks
  ret.guid = (uid) ? uid + '_' + fn.guid : fn.guid;

  return ret;
};

/**
 * Element Data Store. Allows for binding data to an element without putting it directly on the element.
 * Ex. Event listeners are stored here.
 * (also from jsninja.com, slightly modified and updated for closure compiler)
 * @type {Object}
 * @private
 */
vjs.cache = {};

/**
 * Unique ID for an element or function
 * @type {Number}
 * @private
 */
vjs.guid = 1;

/**
 * Unique attribute name to store an element's guid in
 * @type {String}
 * @constant
 * @private
 */
vjs.expando = 'vdata' + (new Date()).getTime();

/**
 * Returns the cache object where data for an element is stored
 * @param  {Element} el Element to store data for.
 * @return {Object}
 * @private
 */
vjs.getData = function(el){
  var id = el[vjs.expando];
  if (!id) {
    id = el[vjs.expando] = vjs.guid++;
  }
  if (!vjs.cache[id]) {
    vjs.cache[id] = {};
  }
  return vjs.cache[id];
};

/**
 * Returns the cache object where data for an element is stored
 * @param  {Element} el Element to store data for.
 * @return {Object}
 * @private
 */
vjs.hasData = function(el){
  var id = el[vjs.expando];
  return !(!id || vjs.isEmpty(vjs.cache[id]));
};

/**
 * Delete data for the element from the cache and the guid attr from getElementById
 * @param  {Element} el Remove data for an element
 * @private
 */
vjs.removeData = function(el){
  var id = el[vjs.expando];
  if (!id) { return; }
  // Remove all stored data
  // Changed to = null
  // http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/
  // vjs.cache[id] = null;
  delete vjs.cache[id];

  // Remove the expando property from the DOM node
  try {
    delete el[vjs.expando];
  } catch(e) {
    if (el.removeAttribute) {
      el.removeAttribute(vjs.expando);
    } else {
      // IE doesn't appear to support removeAttribute on the document element
      el[vjs.expando] = null;
    }
  }
};

/**
 * Check if an object is empty
 * @param  {Object}  obj The object to check for emptiness
 * @return {Boolean}
 * @private
 */
vjs.isEmpty = function(obj) {
  for (var prop in obj) {
    // Inlude null properties as empty.
    if (obj[prop] !== null) {
      return false;
    }
  }
  return true;
};

/**
 * Check if an element has a CSS class
 * @param {Element} element Element to check
 * @param {String} classToCheck Classname to check
 * @private
 */
vjs.hasClass = function(element, classToCheck){
  return ((' ' + element.className + ' ').indexOf(' ' + classToCheck + ' ') !== -1);
};


/**
 * Add a CSS class name to an element
 * @param {Element} element    Element to add class name to
 * @param {String} classToAdd Classname to add
 * @private
 */
vjs.addClass = function(element, classToAdd){
  if (!vjs.hasClass(element, classToAdd)) {
    element.className = element.className === '' ? classToAdd : element.className + ' ' + classToAdd;
  }
};

/**
 * Remove a CSS class name from an element
 * @param {Element} element    Element to remove from class name
 * @param {String} classToAdd Classname to remove
 * @private
 */
vjs.removeClass = function(element, classToRemove){
  var classNames, i;

  if (!vjs.hasClass(element, classToRemove)) {return;}

  classNames = element.className.split(' ');

  // no arr.indexOf in ie8, and we don't want to add a big shim
  for (i = classNames.length - 1; i >= 0; i--) {
    if (classNames[i] === classToRemove) {
      classNames.splice(i,1);
    }
  }

  element.className = classNames.join(' ');
};

/**
 * Element for testing browser HTML5 video capabilities
 * @type {Element}
 * @constant
 * @private
 */
vjs.TEST_VID = vjs.createEl('video');
(function() {
  var track = document.createElement('track');
  track.kind = 'captions';
  track.srclang = 'en';
  track.label = 'English';
  vjs.TEST_VID.appendChild(track);
})();

/**
 * Useragent for browser testing.
 * @type {String}
 * @constant
 * @private
 */
vjs.USER_AGENT = navigator.userAgent;

/**
 * Device is an iPhone
 * @type {Boolean}
 * @constant
 * @private
 */
vjs.IS_IPHONE = (/iPhone/i).test(vjs.USER_AGENT);
vjs.IS_IPAD = (/iPad/i).test(vjs.USER_AGENT);
vjs.IS_IPOD = (/iPod/i).test(vjs.USER_AGENT);
vjs.IS_IOS = vjs.IS_IPHONE || vjs.IS_IPAD || vjs.IS_IPOD;

vjs.IOS_VERSION = (function(){
  var match = vjs.USER_AGENT.match(/OS (\d+)_/i);
  if (match && match[1]) { return match[1]; }
})();

vjs.IS_ANDROID = (/Android/i).test(vjs.USER_AGENT);
vjs.ANDROID_VERSION = (function() {
  // This matches Android Major.Minor.Patch versions
  // ANDROID_VERSION is Major.Minor as a Number, if Minor isn't available, then only Major is returned
  var match = vjs.USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i),
    major,
    minor;

  if (!match) {
    return null;
  }

  major = match[1] && parseFloat(match[1]);
  minor = match[2] && parseFloat(match[2]);

  if (major && minor) {
    return parseFloat(match[1] + '.' + match[2]);
  } else if (major) {
    return major;
  } else {
    return null;
  }
})();
// Old Android is defined as Version older than 2.3, and requiring a webkit version of the android browser
vjs.IS_OLD_ANDROID = vjs.IS_ANDROID && (/webkit/i).test(vjs.USER_AGENT) && vjs.ANDROID_VERSION < 2.3;

vjs.IS_FIREFOX = (/Firefox/i).test(vjs.USER_AGENT);
vjs.IS_CHROME = (/Chrome/i).test(vjs.USER_AGENT);
vjs.IS_IE8 = (/MSIE\s8\.0/).test(vjs.USER_AGENT);

vjs.TOUCH_ENABLED = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
vjs.BACKGROUND_SIZE_SUPPORTED = 'backgroundSize' in vjs.TEST_VID.style;

/**
 * Apply attributes to an HTML element.
 * @param  {Element} el         Target element.
 * @param  {Object=} attributes Element attributes to be applied.
 * @private
 */
vjs.setElementAttributes = function(el, attributes){
  vjs.obj.each(attributes, function(attrName, attrValue) {
    if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
      el.removeAttribute(attrName);
    } else {
      el.setAttribute(attrName, (attrValue === true ? '' : attrValue));
    }
  });
};

/**
 * Get an element's attribute values, as defined on the HTML tag
 * Attributes are not the same as properties. They're defined on the tag
 * or with setAttribute (which shouldn't be used with HTML)
 * This will return true or false for boolean attributes.
 * @param  {Element} tag Element from which to get tag attributes
 * @return {Object}
 * @private
 */
vjs.getElementAttributes = function(tag){
  var obj, knownBooleans, attrs, attrName, attrVal;

  obj = {};

  // known boolean attributes
  // we can check for matching boolean properties, but older browsers
  // won't know about HTML5 boolean attributes that we still read from
  knownBooleans = ','+'autoplay,controls,loop,muted,default'+',';

  if (tag && tag.attributes && tag.attributes.length > 0) {
    attrs = tag.attributes;

    for (var i = attrs.length - 1; i >= 0; i--) {
      attrName = attrs[i].name;
      attrVal = attrs[i].value;

      // check for known booleans
      // the matching element property will return a value for typeof
      if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(','+attrName+',') !== -1) {
        // the value of an included boolean attribute is typically an empty
        // string ('') which would equal false if we just check for a false value.
        // we also don't want support bad code like autoplay='false'
        attrVal = (attrVal !== null) ? true : false;
      }

      obj[attrName] = attrVal;
    }
  }

  return obj;
};

/**
 * Get the computed style value for an element
 * From http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
 * @param  {Element} el        Element to get style value for
 * @param  {String} strCssRule Style name
 * @return {String}            Style value
 * @private
 */
vjs.getComputedDimension = function(el, strCssRule){
  var strValue = '';
  if(document.defaultView && document.defaultView.getComputedStyle){
    strValue = document.defaultView.getComputedStyle(el, '').getPropertyValue(strCssRule);

  } else if(el.currentStyle){
    // IE8 Width/Height support
    strValue = el['client'+strCssRule.substr(0,1).toUpperCase() + strCssRule.substr(1)] + 'px';
  }
  return strValue;
};

/**
 * Insert an element as the first child node of another
 * @param  {Element} child   Element to insert
 * @param  {[type]} parent Element to insert child into
 * @private
 */
vjs.insertFirst = function(child, parent){
  if (parent.firstChild) {
    parent.insertBefore(child, parent.firstChild);
  } else {
    parent.appendChild(child);
  }
};

/**
 * Object to hold browser support information
 * @type {Object}
 * @private
 */
vjs.browser = {};

/**
 * Shorthand for document.getElementById()
 * Also allows for CSS (jQuery) ID syntax. But nothing other than IDs.
 * @param  {String} id  Element ID
 * @return {Element}    Element with supplied ID
 * @private
 */
vjs.el = function(id){
  if (id.indexOf('#') === 0) {
    id = id.slice(1);
  }

  return document.getElementById(id);
};

/**
 * Format seconds as a time string, H:MM:SS or M:SS
 * Supplying a guide (in seconds) will force a number of leading zeros
 * to cover the length of the guide
 * @param  {Number} seconds Number of seconds to be turned into a string
 * @param  {Number} guide   Number (in seconds) to model the string after
 * @return {String}         Time formatted as H:MM:SS or M:SS
 * @private
 */
vjs.formatTime = function(seconds, guide) {
  // Default to using seconds as guide
  guide = guide || seconds;
  var s = Math.floor(seconds % 60),
      m = Math.floor(seconds / 60 % 60),
      h = Math.floor(seconds / 3600),
      gm = Math.floor(guide / 60 % 60),
      gh = Math.floor(guide / 3600);

  // handle invalid times
  if (isNaN(seconds) || seconds === Infinity) {
    // '-' is false for all relational operators (e.g. <, >=) so this setting
    // will add the minimum number of fields specified by the guide
    h = m = s = '-';
  }

  // Check if we need to show hours
  h = (h > 0 || gh > 0) ? h + ':' : '';

  // If hours are showing, we may need to add a leading zero.
  // Always show at least one digit of minutes.
  m = (((h || gm >= 10) && m < 10) ? '0' + m : m) + ':';

  // Check if leading zero is need for seconds
  s = (s < 10) ? '0' + s : s;

  return h + m + s;
};

// Attempt to block the ability to select text while dragging controls
vjs.blockTextSelection = function(){
  document.body.focus();
  document.onselectstart = function () { return false; };
};
// Turn off text selection blocking
vjs.unblockTextSelection = function(){ document.onselectstart = function () { return true; }; };

/**
 * Trim whitespace from the ends of a string.
 * @param  {String} string String to trim
 * @return {String}        Trimmed string
 * @private
 */
vjs.trim = function(str){
  return (str+'').replace(/^\s+|\s+$/g, '');
};

/**
 * Should round off a number to a decimal place
 * @param  {Number} num Number to round
 * @param  {Number} dec Number of decimal places to round to
 * @return {Number}     Rounded number
 * @private
 */
vjs.round = function(num, dec) {
  if (!dec) { dec = 0; }
  return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
};

/**
 * Should create a fake TimeRange object
 * Mimics an HTML5 time range instance, which has functions that
 * return the start and end times for a range
 * TimeRanges are returned by the buffered() method
 * @param  {Number} start Start time in seconds
 * @param  {Number} end   End time in seconds
 * @return {Object}       Fake TimeRange object
 * @private
 */
vjs.createTimeRange = function(start, end){
  if (start === undefined && end === undefined) {
    return {
      length: 0,
      start: function() {
        throw new Error('This TimeRanges object is empty');
      },
      end: function() {
        throw new Error('This TimeRanges object is empty');
      }
    };
  }

  return {
    length: 1,
    start: function() { return start; },
    end: function() { return end; }
  };
};

/**
 * Add to local storage (may removable)
 * @private
 */
vjs.setLocalStorage = function(key, value){
  try {
    // IE was throwing errors referencing the var anywhere without this
    var localStorage = window.localStorage || false;
    if (!localStorage) { return; }
    localStorage[key] = value;
  } catch(e) {
    if (e.code == 22 || e.code == 1014) { // Webkit == 22 / Firefox == 1014
      vjs.log('LocalStorage Full (VideoJS)', e);
    } else {
      if (e.code == 18) {
        vjs.log('LocalStorage not allowed (VideoJS)', e);
      } else {
        vjs.log('LocalStorage Error (VideoJS)', e);
      }
    }
  }
};

/**
 * Get absolute version of relative URL. Used to tell flash correct URL.
 * http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
 * @param  {String} url URL to make absolute
 * @return {String}     Absolute URL
 * @private
 */
vjs.getAbsoluteURL = function(url){

  // Check if absolute URL
  if (!url.match(/^https?:\/\//)) {
    // Convert to absolute URL. Flash hosted off-site needs an absolute URL.
    url = vjs.createEl('div', {
      innerHTML: '<a href="'+url+'">x</a>'
    }).firstChild.href;
  }

  return url;
};


/**
 * Resolve and parse the elements of a URL
 * @param  {String} url The url to parse
 * @return {Object}     An object of url details
 */
vjs.parseUrl = function(url) {
  var div, a, addToBody, props, details;

  props = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host'];

  // add the url to an anchor and let the browser parse the URL
  a = vjs.createEl('a', { href: url });

  // IE8 (and 9?) Fix
  // ie8 doesn't parse the URL correctly until the anchor is actually
  // added to the body, and an innerHTML is needed to trigger the parsing
  addToBody = (a.host === '' && a.protocol !== 'file:');
  if (addToBody) {
    div = vjs.createEl('div');
    div.innerHTML = '<a href="'+url+'"></a>';
    a = div.firstChild;
    // prevent the div from affecting layout
    div.setAttribute('style', 'display:none; position:absolute;');
    document.body.appendChild(div);
  }

  // Copy the specific URL properties to a new object
  // This is also needed for IE8 because the anchor loses its
  // properties when it's removed from the dom
  details = {};
  for (var i = 0; i < props.length; i++) {
    details[props[i]] = a[props[i]];
  }

  // IE9 adds the port to the host property unlike everyone else. If
  // a port identifier is added for standard ports, strip it.
  if (details.protocol === 'http:') {
    details.host = details.host.replace(/:80$/, '');
  }
  if (details.protocol === 'https:') {
    details.host = details.host.replace(/:443$/, '');
  }

  if (addToBody) {
    document.body.removeChild(div);
  }

  return details;
};

/**
 * Log messages to the console and history based on the type of message
 *
 * @param  {String} type The type of message, or `null` for `log`
 * @param  {[type]} args The args to be passed to the log
 * @private
 */
function _logType(type, args){
  var argsArray, noop, console;

  // convert args to an array to get array functions
  argsArray = Array.prototype.slice.call(args);
  // if there's no console then don't try to output messages
  // they will still be stored in vjs.log.history
  // Was setting these once outside of this function, but containing them
  // in the function makes it easier to test cases where console doesn't exist
  noop = function(){};
  console = window['console'] || {
    'log': noop,
    'warn': noop,
    'error': noop
  };

  if (type) {
    // add the type to the front of the message
    argsArray.unshift(type.toUpperCase()+':');
  } else {
    // default to log with no prefix
    type = 'log';
  }

  // add to history
  vjs.log.history.push(argsArray);

  // add console prefix after adding to history
  argsArray.unshift('VIDEOJS:');

  // call appropriate log function
  if (console[type].apply) {
    console[type].apply(console, argsArray);
  } else {
    // ie8 doesn't allow error.apply, but it will just join() the array anyway
    console[type](argsArray.join(' '));
  }
}

/**
 * Log plain debug messages
 */
vjs.log = function(){
  _logType(null, arguments);
};

/**
 * Keep a history of log messages
 * @type {Array}
 */
vjs.log.history = [];

/**
 * Log error messages
 */
vjs.log.error = function(){
  _logType('error', arguments);
};

/**
 * Log warning messages
 */
vjs.log.warn = function(){
  _logType('warn', arguments);
};

// Offset Left
// getBoundingClientRect technique from John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
vjs.findPosition = function(el) {
  var box, docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0
    };
  }

  docEl = document.documentElement;
  body = document.body;

  clientLeft = docEl.clientLeft || body.clientLeft || 0;
  scrollLeft = window.pageXOffset || body.scrollLeft;
  left = box.left + scrollLeft - clientLeft;

  clientTop = docEl.clientTop || body.clientTop || 0;
  scrollTop = window.pageYOffset || body.scrollTop;
  top = box.top + scrollTop - clientTop;

  // Android sometimes returns slightly off decimal values, so need to round
  return {
    left: vjs.round(left),
    top: vjs.round(top)
  };
};

/**
 * Array functions container
 * @type {Object}
 * @private
 */
vjs.arr = {};

/*
 * Loops through an array and runs a function for each item inside it.
 * @param  {Array}    array       The array
 * @param  {Function} callback    The function to be run for each item
 * @param  {*}        thisArg     The `this` binding of callback
 * @returns {Array}               The array
 * @private
 */
vjs.arr.forEach = function(array, callback, thisArg) {
  if (vjs.obj.isArray(array) && callback instanceof Function) {
    for (var i = 0, len = array.length; i < len; ++i) {
      callback.call(thisArg || vjs, array[i], i, array);
    }
  }

  return array;
};
/**
 * Simple http request for retrieving external files (e.g. text tracks)
 *
 * ##### Example
 *
 *     // using url string
 *     videojs.xhr('http://example.com/myfile.vtt', function(error, response, responseBody){});
 *
 *     // or options block
 *     videojs.xhr({
 *       uri: 'http://example.com/myfile.vtt',
 *       method: 'GET',
 *       responseType: 'text'
 *     }, function(error, response, responseBody){
 *       if (error) {
 *         // log the error
 *       } else {
 *         // successful, do something with the response
 *       }
 *     });
 *
 *
 * API is modeled after the Raynos/xhr, which we hope to use after
 * getting browserify implemented.
 * https://github.com/Raynos/xhr/blob/master/index.js
 *
 * @param  {Object|String}  options   Options block or URL string
 * @param  {Function}       callback  The callback function
 * @returns {Object}                  The request
 */
vjs.xhr = function(options, callback){
  var XHR, request, urlInfo, winLoc, fileUrl, crossOrigin, abortTimeout, successHandler, errorHandler;

  // If options is a string it's the url
  if (typeof options === 'string') {
    options = {
      uri: options
    };
  }

  // Merge with default options
  videojs.util.mergeOptions({
    method: 'GET',
    timeout: 45 * 1000
  }, options);

  callback = callback || function(){};

  successHandler = function(){
    window.clearTimeout(abortTimeout);
    callback(null, request, request.response || request.responseText);
  };

  errorHandler = function(err){
    window.clearTimeout(abortTimeout);

    if (!err || typeof err === 'string') {
      err = new Error(err);
    }

    callback(err, request);
  };

  XHR = window.XMLHttpRequest;

  if (typeof XHR === 'undefined') {
    // Shim XMLHttpRequest for older IEs
    XHR = function () {
      try { return new window.ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (e) {}
      try { return new window.ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (f) {}
      try { return new window.ActiveXObject('Msxml2.XMLHTTP'); } catch (g) {}
      throw new Error('This browser does not support XMLHttpRequest.');
    };
  }

  request = new XHR();
  // Store a reference to the url on the request instance
  request.uri = options.uri;

  urlInfo = vjs.parseUrl(options.uri);
  winLoc = window.location;
  // Check if url is for another domain/origin
  // IE8 doesn't know location.origin, so we won't rely on it here
  crossOrigin = (urlInfo.protocol + urlInfo.host) !== (winLoc.protocol + winLoc.host);

  // XDomainRequest -- Use for IE if XMLHTTPRequest2 isn't available
  // 'withCredentials' is only available in XMLHTTPRequest2
  // Also XDomainRequest has a lot of gotchas, so only use if cross domain
  if (crossOrigin && window.XDomainRequest && !('withCredentials' in request)) {
    request = new window.XDomainRequest();
    request.onload = successHandler;
    request.onerror = errorHandler;
    // These blank handlers need to be set to fix ie9
    // http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/
    request.onprogress = function(){};
    request.ontimeout = function(){};

  // XMLHTTPRequest
  } else {
    fileUrl = (urlInfo.protocol == 'file:' || winLoc.protocol == 'file:');

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.timedout) {
          return errorHandler('timeout');
        }

        if (request.status === 200 || fileUrl && request.status === 0) {
          successHandler();
        } else {
          errorHandler();
        }
      }
    };

    if (options.timeout) {
      abortTimeout = window.setTimeout(function() {
        if (request.readyState !== 4) {
          request.timedout = true;
          request.abort();
        }
      }, options.timeout);
    }
  }

  // open the connection
  try {
    // Third arg is async, or ignored by XDomainRequest
    request.open(options.method || 'GET', options.uri, true);
  } catch(err) {
    return errorHandler(err);
  }

  // withCredentials only supported by XMLHttpRequest2
  if(options.withCredentials) {
    request.withCredentials = true;
  }

  if (options.responseType) {
    request.responseType = options.responseType;
  }

  // send the request
  try {
    request.send();
  } catch(err) {
    return errorHandler(err);
  }

  return request;
};
/**
 * Utility functions namespace
 * @namespace
 * @type {Object}
 */
vjs.util = {};

/**
 * Merge two options objects, recursively merging any plain object properties as
 * well.  Previously `deepMerge`
 *
 * @param  {Object} obj1 Object to override values in
 * @param  {Object} obj2 Overriding object
 * @return {Object}      New object -- obj1 and obj2 will be untouched
 */
vjs.util.mergeOptions = function(obj1, obj2){
  var key, val1, val2;

  // make a copy of obj1 so we're not overwriting original values.
  // like prototype.options_ and all sub options objects
  obj1 = vjs.obj.copy(obj1);

  for (key in obj2){
    if (obj2.hasOwnProperty(key)) {
      val1 = obj1[key];
      val2 = obj2[key];

      // Check if both properties are pure objects and do a deep merge if so
      if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
        obj1[key] = vjs.util.mergeOptions(val1, val2);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
};vjs.EventEmitter = function() {
};

vjs.EventEmitter.prototype.allowedEvents_ = {
};

vjs.EventEmitter.prototype.on = function(type, fn) {
  // Remove the addEventListener alias before calling vjs.on
  // so we don't get into an infinite type loop
  var ael = this.addEventListener;
  this.addEventListener = Function.prototype;
  vjs.on(this, type, fn);
  this.addEventListener = ael;
};
vjs.EventEmitter.prototype.addEventListener = vjs.EventEmitter.prototype.on;

vjs.EventEmitter.prototype.off = function(type, fn) {
  vjs.off(this, type, fn);
};
vjs.EventEmitter.prototype.removeEventListener = vjs.EventEmitter.prototype.off;

vjs.EventEmitter.prototype.one = function(type, fn) {
  vjs.one(this, type, fn);
};

vjs.EventEmitter.prototype.trigger = function(event) {
  var type = event.type || event;

  if (typeof event === 'string') {
    event = {
      type: type
    };
  }
  event = vjs.fixEvent(event);

  if (this.allowedEvents_[type] && this['on' + type]) {
    this['on' + type](event);
  }

  vjs.trigger(this, event);
};
// The standard DOM EventTarget.dispatchEvent() is aliased to trigger()
vjs.EventEmitter.prototype.dispatchEvent = vjs.EventEmitter.prototype.trigger;
/**
 * @fileoverview Player Component - Base class for all UI objects
 *
 */

/**
 * Base UI Component class
 *
 * Components are embeddable UI objects that are represented by both a
 * javascript object and an element in the DOM. They can be children of other
 * components, and can have many children themselves.
 *
 *     // adding a button to the player
 *     var button = player.addChild('button');
 *     button.el(); // -> button element
 *
 *     <div class="video-js">
 *       <div class="vjs-button">Button</div>
 *     </div>
 *
 * Components are also event emitters.
 *
 *     button.on('click', function(){
 *       console.log('Button Clicked!');
 *     });
 *
 *     button.trigger('customevent');
 *
 * @param {Object} player  Main Player
 * @param {Object=} options
 * @class
 * @constructor
 * @extends vjs.CoreObject
 */
vjs.Component = vjs.CoreObject.extend({
  /**
   * the constructor function for the class
   *
   * @constructor
   */
  init: function(player, options, ready){
    this.player_ = player;

    // Make a copy of prototype.options_ to protect against overriding global defaults
    this.options_ = vjs.obj.copy(this.options_);

    // Updated options with supplied options
    options = this.options(options);

    // Get ID from options or options element if one is supplied
    this.id_ = options['id'] || (options['el'] && options['el']['id']);

    // If there was no ID from the options, generate one
    if (!this.id_) {
      // Don't require the player ID function in the case of mock players
      this.id_ = ((player.id && player.id()) || 'no_player') + '_component_' + vjs.guid++;
    }

    this.name_ = options['name'] || null;

    // Create element if one wasn't provided in options
    this.el_ = options['el'] || this.createEl();

    this.children_ = [];
    this.childIndex_ = {};
    this.childNameIndex_ = {};

    // Add any child components in options
    this.initChildren();

    this.ready(ready);
    // Don't want to trigger ready here or it will before init is actually
    // finished for all children that run this constructor

    if (options.reportTouchActivity !== false) {
      this.enableTouchActivity();
    }
  }
});

/**
 * Dispose of the component and all child components
 */
vjs.Component.prototype.dispose = function(){
  this.trigger({ type: 'dispose', 'bubbles': false });

  // Dispose all children.
  if (this.children_) {
    for (var i = this.children_.length - 1; i >= 0; i--) {
      if (this.children_[i].dispose) {
        this.children_[i].dispose();
      }
    }
  }

  // Delete child references
  this.children_ = null;
  this.childIndex_ = null;
  this.childNameIndex_ = null;

  // Remove all event listeners.
  this.off();

  // Remove element from DOM
  if (this.el_.parentNode) {
    this.el_.parentNode.removeChild(this.el_);
  }

  vjs.removeData(this.el_);
  this.el_ = null;
};

/**
 * Reference to main player instance
 *
 * @type {vjs.Player}
 * @private
 */
vjs.Component.prototype.player_ = true;

/**
 * Return the component's player
 *
 * @return {vjs.Player}
 */
vjs.Component.prototype.player = function(){
  return this.player_;
};

/**
 * The component's options object
 *
 * @type {Object}
 * @private
 */
vjs.Component.prototype.options_;

/**
 * Deep merge of options objects
 *
 * Whenever a property is an object on both options objects
 * the two properties will be merged using vjs.obj.deepMerge.
 *
 * This is used for merging options for child components. We
 * want it to be easy to override individual options on a child
 * component without having to rewrite all the other default options.
 *
 *     Parent.prototype.options_ = {
 *       children: {
 *         'childOne': { 'foo': 'bar', 'asdf': 'fdsa' },
 *         'childTwo': {},
 *         'childThree': {}
 *       }
 *     }
 *     newOptions = {
 *       children: {
 *         'childOne': { 'foo': 'baz', 'abc': '123' }
 *         'childTwo': null,
 *         'childFour': {}
 *       }
 *     }
 *
 *     this.options(newOptions);
 *
 * RESULT
 *
 *     {
 *       children: {
 *         'childOne': { 'foo': 'baz', 'asdf': 'fdsa', 'abc': '123' },
 *         'childTwo': null, // Disabled. Won't be initialized.
 *         'childThree': {},
 *         'childFour': {}
 *       }
 *     }
 *
 * @param  {Object} obj Object of new option values
 * @return {Object}     A NEW object of this.options_ and obj merged
 */
vjs.Component.prototype.options = function(obj){
  if (obj === undefined) return this.options_;

  return this.options_ = vjs.util.mergeOptions(this.options_, obj);
};

/**
 * The DOM element for the component
 *
 * @type {Element}
 * @private
 */
vjs.Component.prototype.el_;

/**
 * Create the component's DOM element
 *
 * @param  {String=} tagName  Element's node type. e.g. 'div'
 * @param  {Object=} attributes An object of element attributes that should be set on the element
 * @return {Element}
 */
vjs.Component.prototype.createEl = function(tagName, attributes){
  return vjs.createEl(tagName, attributes);
};

vjs.Component.prototype.localize = function(string){
  var lang = this.player_.language(),
      languages = this.player_.languages();
  if (languages && languages[lang] && languages[lang][string]) {
    return languages[lang][string];
  }
  return string;
};

/**
 * Get the component's DOM element
 *
 *     var domEl = myComponent.el();
 *
 * @return {Element}
 */
vjs.Component.prototype.el = function(){
  return this.el_;
};

/**
 * An optional element where, if defined, children will be inserted instead of
 * directly in `el_`
 *
 * @type {Element}
 * @private
 */
vjs.Component.prototype.contentEl_;

/**
 * Return the component's DOM element for embedding content.
 * Will either be el_ or a new element defined in createEl.
 *
 * @return {Element}
 */
vjs.Component.prototype.contentEl = function(){
  return this.contentEl_ || this.el_;
};

/**
 * The ID for the component
 *
 * @type {String}
 * @private
 */
vjs.Component.prototype.id_;

/**
 * Get the component's ID
 *
 *     var id = myComponent.id();
 *
 * @return {String}
 */
vjs.Component.prototype.id = function(){
  return this.id_;
};

/**
 * The name for the component. Often used to reference the component.
 *
 * @type {String}
 * @private
 */
vjs.Component.prototype.name_;

/**
 * Get the component's name. The name is often used to reference the component.
 *
 *     var name = myComponent.name();
 *
 * @return {String}
 */
vjs.Component.prototype.name = function(){
  return this.name_;
};

/**
 * Array of child components
 *
 * @type {Array}
 * @private
 */
vjs.Component.prototype.children_;

/**
 * Get an array of all child components
 *
 *     var kids = myComponent.children();
 *
 * @return {Array} The children
 */
vjs.Component.prototype.children = function(){
  return this.children_;
};

/**
 * Object of child components by ID
 *
 * @type {Object}
 * @private
 */
vjs.Component.prototype.childIndex_;

/**
 * Returns a child component with the provided ID
 *
 * @return {vjs.Component}
 */
vjs.Component.prototype.getChildById = function(id){
  return this.childIndex_[id];
};

/**
 * Object of child components by name
 *
 * @type {Object}
 * @private
 */
vjs.Component.prototype.childNameIndex_;

/**
 * Returns a child component with the provided name
 *
 * @return {vjs.Component}
 */
vjs.Component.prototype.getChild = function(name){
  return this.childNameIndex_[name];
};

/**
 * Adds a child component inside this component
 *
 *     myComponent.el();
 *     // -> <div class='my-component'></div>
 *     myComonent.children();
 *     // [empty array]
 *
 *     var myButton = myComponent.addChild('MyButton');
 *     // -> <div class='my-component'><div class="my-button">myButton<div></div>
 *     // -> myButton === myComonent.children()[0];
 *
 * Pass in options for child constructors and options for children of the child
 *
 *     var myButton = myComponent.addChild('MyButton', {
 *       text: 'Press Me',
 *       children: {
 *         buttonChildExample: {
 *           buttonChildOption: true
 *         }
 *       }
 *     });
 *
 * @param {String|vjs.Component} child The class name or instance of a child to add
 * @param {Object=} options Options, including options to be passed to children of the child.
 * @return {vjs.Component} The child component (created by this process if a string was used)
 * @suppress {accessControls|checkRegExp|checkTypes|checkVars|const|constantProperty|deprecated|duplicate|es5Strict|fileoverviewTags|globalThis|invalidCasts|missingProperties|nonStandardJsDocs|strictModuleDepCheck|undefinedNames|undefinedVars|unknownDefines|uselessCode|visibility}
 */
vjs.Component.prototype.addChild = function(child, options){
  var component, componentClass, componentName;

  // If child is a string, create new component with options
  if (typeof child === 'string') {
    componentName = child;

    // Make sure options is at least an empty object to protect against errors
    options = options || {};

    // If no componentClass in options, assume componentClass is the name lowercased
    // (e.g. playButton)
    componentClass = options['componentClass'] || vjs.capitalize(componentName);

    // Set name through options
    options['name'] = componentName;

    // Create a new object & element for this controls set
    // If there's no .player_, this is a player
    // Closure Compiler throws an 'incomplete alias' warning if we use the vjs variable directly.
    // Every class should be exported, so this should never be a problem here.
    component = new window['videojs'][componentClass](this.player_ || this, options);

  // child is a component instance
  } else {
    component = child;
  }

  this.children_.push(component);

  if (typeof component.id === 'function') {
    this.childIndex_[component.id()] = component;
  }

  // If a name wasn't used to create the component, check if we can use the
  // name function of the component
  componentName = componentName || (component.name && component.name());

  if (componentName) {
    this.childNameIndex_[componentName] = component;
  }

  // Add the UI object's element to the container div (box)
  // Having an element is not required
  if (typeof component['el'] === 'function' && component['el']()) {
    this.contentEl().appendChild(component['el']());
  }

  // Return so it can stored on parent object if desired.
  return component;
};

/**
 * Remove a child component from this component's list of children, and the
 * child component's element from this component's element
 *
 * @param  {vjs.Component} component Component to remove
 */
vjs.Component.prototype.removeChild = function(component){
  if (typeof component === 'string') {
    component = this.getChild(component);
  }

  if (!component || !this.children_) return;

  var childFound = false;
  for (var i = this.children_.length - 1; i >= 0; i--) {
    if (this.children_[i] === component) {
      childFound = true;
      this.children_.splice(i,1);
      break;
    }
  }

  if (!childFound) return;

  this.childIndex_[component.id()] = null;
  this.childNameIndex_[component.name()] = null;

  var compEl = component.el();
  if (compEl && compEl.parentNode === this.contentEl()) {
    this.contentEl().removeChild(component.el());
  }
};

/**
 * Add and initialize default child components from options
 *
 *     // when an instance of MyComponent is created, all children in options
 *     // will be added to the instance by their name strings and options
 *     MyComponent.prototype.options_.children = {
 *       myChildComponent: {
 *         myChildOption: true
 *       }
 *     }
 *
 *     // Or when creating the component
 *     var myComp = new MyComponent(player, {
 *       children: {
 *         myChildComponent: {
 *           myChildOption: true
 *         }
 *       }
 *     });
 *
 * The children option can also be an Array of child names or
 * child options objects (that also include a 'name' key).
 *
 *     var myComp = new MyComponent(player, {
 *       children: [
 *         'button',
 *         {
 *           name: 'button',
 *           someOtherOption: true
 *         }
 *       ]
 *     });
 *
 */
vjs.Component.prototype.initChildren = function(){
  var parent, parentOptions, children, child, name, opts, handleAdd;

  parent = this;
  parentOptions = parent.options();
  children = parentOptions['children'];

  if (children) {
    handleAdd = function(name, opts){
      // Allow options for children to be set at the parent options
      // e.g. videojs(id, { controlBar: false });
      // instead of videojs(id, { children: { controlBar: false });
      if (parentOptions[name] !== undefined) {
        opts = parentOptions[name];
      }

      // Allow for disabling default components
      // e.g. vjs.options['children']['posterImage'] = false
      if (opts === false) return;

      // Create and add the child component.
      // Add a direct reference to the child by name on the parent instance.
      // If two of the same component are used, different names should be supplied
      // for each
      parent[name] = parent.addChild(name, opts);
    };

    // Allow for an array of children details to passed in the options
    if (vjs.obj.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        child = children[i];

        if (typeof child == 'string') {
          // ['myComponent']
          name = child;
          opts = {};
        } else {
          // [{ name: 'myComponent', otherOption: true }]
          name = child.name;
          opts = child;
        }

        handleAdd(name, opts);
      }
    } else {
      vjs.obj.each(children, handleAdd);
    }
  }
};

/**
 * Allows sub components to stack CSS class names
 *
 * @return {String} The constructed class name
 */
vjs.Component.prototype.buildCSSClass = function(){
    // Child classes can include a function that does:
    // return 'CLASS NAME' + this._super();
    return '';
};

/* Events
============================================================================= */

/**
 * Add an event listener to this component's element
 *
 *     var myFunc = function(){
 *       var myComponent = this;
 *       // Do something when the event is fired
 *     };
 *
 *     myComponent.on('eventType', myFunc);
 *
 * The context of myFunc will be myComponent unless previously bound.
 *
 * Alternatively, you can add a listener to another element or component.
 *
 *     myComponent.on(otherElement, 'eventName', myFunc);
 *     myComponent.on(otherComponent, 'eventName', myFunc);
 *
 * The benefit of using this over `vjs.on(otherElement, 'eventName', myFunc)`
 * and `otherComponent.on('eventName', myFunc)` is that this way the listeners
 * will be automatically cleaned up when either component is disposed.
 * It will also bind myComponent as the context of myFunc.
 *
 * **NOTE**: When using this on elements in the page other than window
 * and document (both permanent), if you remove the element from the DOM
 * you need to call `vjs.trigger(el, 'dispose')` on it to clean up
 * references to it and allow the browser to garbage collect it.
 *
 * @param  {String|vjs.Component} first   The event type or other component
 * @param  {Function|String}      second  The event handler or event type
 * @param  {Function}             third   The event handler
 * @return {vjs.Component}        self
 */
vjs.Component.prototype.on = function(first, second, third){
  var target, type, fn, removeOnDispose, cleanRemover, thisComponent;

  if (typeof first === 'string' || vjs.obj.isArray(first)) {
    vjs.on(this.el_, first, vjs.bind(this, second));

  // Targeting another component or element
  } else {
    target = first;
    type = second;
    fn = vjs.bind(this, third);
    thisComponent = this;

    // When this component is disposed, remove the listener from the other component
    removeOnDispose = function(){
      thisComponent.off(target, type, fn);
    };
    // Use the same function ID so we can remove it later it using the ID
    // of the original listener
    removeOnDispose.guid = fn.guid;
    this.on('dispose', removeOnDispose);

    // If the other component is disposed first we need to clean the reference
    // to the other component in this component's removeOnDispose listener
    // Otherwise we create a memory leak.
    cleanRemover = function(){
      thisComponent.off('dispose', removeOnDispose);
    };
    // Add the same function ID so we can easily remove it later
    cleanRemover.guid = fn.guid;

    // Check if this is a DOM node
    if (first.nodeName) {
      // Add the listener to the other element
      vjs.on(target, type, fn);
      vjs.on(target, 'dispose', cleanRemover);

    // Should be a component
    // Not using `instanceof vjs.Component` because it makes mock players difficult
    } else if (typeof first.on === 'function') {
      // Add the listener to the other component
      target.on(type, fn);
      target.on('dispose', cleanRemover);
    }
  }

  return this;
};

/**
 * Remove an event listener from this component's element
 *
 *     myComponent.off('eventType', myFunc);
 *
 * If myFunc is excluded, ALL listeners for the event type will be removed.
 * If eventType is excluded, ALL listeners will be removed from the component.
 *
 * Alternatively you can use `off` to remove listeners that were added to other
 * elements or components using `myComponent.on(otherComponent...`.
 * In this case both the event type and listener function are REQUIRED.
 *
 *     myComponent.off(otherElement, 'eventType', myFunc);
 *     myComponent.off(otherComponent, 'eventType', myFunc);
 *
 * @param  {String=|vjs.Component}  first  The event type or other component
 * @param  {Function=|String}       second The listener function or event type
 * @param  {Function=}              third  The listener for other component
 * @return {vjs.Component}
 */
vjs.Component.prototype.off = function(first, second, third){
  var target, otherComponent, type, fn, otherEl;

  if (!first || typeof first === 'string' || vjs.obj.isArray(first)) {
    vjs.off(this.el_, first, second);
  } else {
    target = first;
    type = second;
    // Ensure there's at least a guid, even if the function hasn't been used
    fn = vjs.bind(this, third);

    // Remove the dispose listener on this component,
    // which was given the same guid as the event listener
    this.off('dispose', fn);

    if (first.nodeName) {
      // Remove the listener
      vjs.off(target, type, fn);
      // Remove the listener for cleaning the dispose listener
      vjs.off(target, 'dispose', fn);
    } else {
      target.off(type, fn);
      target.off('dispose', fn);
    }
  }

  return this;
};

/**
 * Add an event listener to be triggered only once and then removed
 *
 *     myComponent.one('eventName', myFunc);
 *
 * Alternatively you can add a listener to another element or component
 * that will be triggered only once.
 *
 *     myComponent.one(otherElement, 'eventName', myFunc);
 *     myComponent.one(otherComponent, 'eventName', myFunc);
 *
 * @param  {String|vjs.Component}  first   The event type or other component
 * @param  {Function|String}       second  The listener function or event type
 * @param  {Function=}             third   The listener function for other component
 * @return {vjs.Component}
 */
vjs.Component.prototype.one = function(first, second, third) {
  var target, type, fn, thisComponent, newFunc;

  if (typeof first === 'string' || vjs.obj.isArray(first)) {
    vjs.one(this.el_, first, vjs.bind(this, second));
  } else {
    target = first;
    type = second;
    fn = vjs.bind(this, third);
    thisComponent = this;

    newFunc = function(){
      thisComponent.off(target, type, newFunc);
      fn.apply(this, arguments);
    };
    // Keep the same function ID so we can remove it later
    newFunc.guid = fn.guid;

    this.on(target, type, newFunc);
  }

  return this;
};

/**
 * Trigger an event on an element
 *
 *     myComponent.trigger('eventName');
 *     myComponent.trigger({'type':'eventName'});
 *
 * @param  {Event|Object|String} event  A string (the type) or an event object with a type attribute
 * @return {vjs.Component}       self
 */
vjs.Component.prototype.trigger = function(event){
  vjs.trigger(this.el_, event);
  return this;
};

/* Ready
================================================================================ */
/**
 * Is the component loaded
 * This can mean different things depending on the component.
 *
 * @private
 * @type {Boolean}
 */
vjs.Component.prototype.isReady_;

/**
 * Trigger ready as soon as initialization is finished
 *
 * Allows for delaying ready. Override on a sub class prototype.
 * If you set this.isReadyOnInitFinish_ it will affect all components.
 * Specially used when waiting for the Flash player to asynchronously load.
 *
 * @type {Boolean}
 * @private
 */
vjs.Component.prototype.isReadyOnInitFinish_ = true;

/**
 * List of ready listeners
 *
 * @type {Array}
 * @private
 */
vjs.Component.prototype.readyQueue_;

/**
 * Bind a listener to the component's ready state
 *
 * Different from event listeners in that if the ready event has already happened
 * it will trigger the function immediately.
 *
 * @param  {Function} fn Ready listener
 * @return {vjs.Component}
 */
vjs.Component.prototype.ready = function(fn){
  if (fn) {
    if (this.isReady_) {
      fn.call(this);
    } else {
      if (this.readyQueue_ === undefined) {
        this.readyQueue_ = [];
      }
      this.readyQueue_.push(fn);
    }
  }
  return this;
};

/**
 * Trigger the ready listeners
 *
 * @return {vjs.Component}
 */
vjs.Component.prototype.triggerReady = function(){
  this.isReady_ = true;

  var readyQueue = this.readyQueue_;

  // Reset Ready Queue
  this.readyQueue_ = [];

  if (readyQueue && readyQueue.length > 0) {

    for (var i = 0, j = readyQueue.length; i < j; i++) {
      readyQueue[i].call(this);
    }

    // Allow for using event listeners also, in case you want to do something everytime a source is ready.
    this.trigger('ready');
  }
};

/* Display
============================================================================= */

/**
 * Check if a component's element has a CSS class name
 *
 * @param {String} classToCheck Classname to check
 * @return {vjs.Component}
 */
vjs.Component.prototype.hasClass = function(classToCheck){
  return vjs.hasClass(this.el_, classToCheck);
};

/**
 * Add a CSS class name to the component's element
 *
 * @param {String} classToAdd Classname to add
 * @return {vjs.Component}
 */
vjs.Component.prototype.addClass = function(classToAdd){
  vjs.addClass(this.el_, classToAdd);
  return this;
};

/**
 * Remove a CSS class name from the component's element
 *
 * @param {String} classToRemove Classname to remove
 * @return {vjs.Component}
 */
vjs.Component.prototype.removeClass = function(classToRemove){
  vjs.removeClass(this.el_, classToRemove);
  return this;
};

/**
 * Show the component element if hidden
 *
 * @return {vjs.Component}
 */
vjs.Component.prototype.show = function(){
  this.removeClass('vjs-hidden');
  return this;
};

/**
 * Hide the component element if currently showing
 *
 * @return {vjs.Component}
 */
vjs.Component.prototype.hide = function(){
  this.addClass('vjs-hidden');
  return this;
};

/**
 * Lock an item in its visible state
 * To be used with fadeIn/fadeOut.
 *
 * @return {vjs.Component}
 * @private
 */
vjs.Component.prototype.lockShowing = function(){
  this.addClass('vjs-lock-showing');
  return this;
};

/**
 * Unlock an item to be hidden
 * To be used with fadeIn/fadeOut.
 *
 * @return {vjs.Component}
 * @private
 */
vjs.Component.prototype.unlockShowing = function(){
  this.removeClass('vjs-lock-showing');
  return this;
};

/**
 * Disable component by making it unshowable
 *
 * Currently private because we're moving towards more css-based states.
 * @private
 */
vjs.Component.prototype.disable = function(){
  this.hide();
  this.show = function(){};
};

/**
 * Set or get the width of the component (CSS values)
 *
 * Setting the video tag dimension values only works with values in pixels.
 * Percent values will not work.
 * Some percents can be used, but width()/height() will return the number + %,
 * not the actual computed width/height.
 *
 * @param  {Number|String=} num   Optional width number
 * @param  {Boolean} skipListeners Skip the 'resize' event trigger
 * @return {vjs.Component} This component, when setting the width
 * @return {Number|String} The width, when getting
 */
vjs.Component.prototype.width = function(num, skipListeners){
  return this.dimension('width', num, skipListeners);
};

/**
 * Get or set the height of the component (CSS values)
 *
 * Setting the video tag dimension values only works with values in pixels.
 * Percent values will not work.
 * Some percents can be used, but width()/height() will return the number + %,
 * not the actual computed width/height.
 *
 * @param  {Number|String=} num     New component height
 * @param  {Boolean=} skipListeners Skip the resize event trigger
 * @return {vjs.Component} This component, when setting the height
 * @return {Number|String} The height, when getting
 */
vjs.Component.prototype.height = function(num, skipListeners){
  return this.dimension('height', num, skipListeners);
};

/**
 * Set both width and height at the same time
 *
 * @param  {Number|String} width
 * @param  {Number|String} height
 * @return {vjs.Component} The component
 */
vjs.Component.prototype.dimensions = function(width, height){
  // Skip resize listeners on width for optimization
  return this.width(width, true).height(height);
};

/**
 * Get or set width or height
 *
 * This is the shared code for the width() and height() methods.
 * All for an integer, integer + 'px' or integer + '%';
 *
 * Known issue: Hidden elements officially have a width of 0. We're defaulting
 * to the style.width value and falling back to computedStyle which has the
 * hidden element issue. Info, but probably not an efficient fix:
 * http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/
 *
 * @param  {String} widthOrHeight  'width' or 'height'
 * @param  {Number|String=} num     New dimension
 * @param  {Boolean=} skipListeners Skip resize event trigger
 * @return {vjs.Component} The component if a dimension was set
 * @return {Number|String} The dimension if nothing was set
 * @private
 */
vjs.Component.prototype.dimension = function(widthOrHeight, num, skipListeners){
  if (num !== undefined) {
    if (num === null || vjs.isNaN(num)) {
      num = 0;
    }

    // Check if using css width/height (% or px) and adjust
    if ((''+num).indexOf('%') !== -1 || (''+num).indexOf('px') !== -1) {
      this.el_.style[widthOrHeight] = num;
    } else if (num === 'auto') {
      this.el_.style[widthOrHeight] = '';
    } else {
      this.el_.style[widthOrHeight] = num+'px';
    }

    // skipListeners allows us to avoid triggering the resize event when setting both width and height
    if (!skipListeners) { this.trigger('resize'); }

    // Return component
    return this;
  }

  // Not setting a value, so getting it
  // Make sure element exists
  if (!this.el_) return 0;

  // Get dimension value from style
  var val = this.el_.style[widthOrHeight];
  var pxIndex = val.indexOf('px');
  if (pxIndex !== -1) {
    // Return the pixel value with no 'px'
    return parseInt(val.slice(0,pxIndex), 10);

  // No px so using % or no style was set, so falling back to offsetWidth/height
  // If component has display:none, offset will return 0
  // TODO: handle display:none and no dimension style using px
  } else {

    return parseInt(this.el_['offset'+vjs.capitalize(widthOrHeight)], 10);

    // ComputedStyle version.
    // Only difference is if the element is hidden it will return
    // the percent value (e.g. '100%'')
    // instead of zero like offsetWidth returns.
    // var val = vjs.getComputedStyleValue(this.el_, widthOrHeight);
    // var pxIndex = val.indexOf('px');

    // if (pxIndex !== -1) {
    //   return val.slice(0, pxIndex);
    // } else {
    //   return val;
    // }
  }
};

/**
 * Fired when the width and/or height of the component changes
 * @event resize
 */
vjs.Component.prototype.onResize;

/**
 * Emit 'tap' events when touch events are supported
 *
 * This is used to support toggling the controls through a tap on the video.
 *
 * We're requiring them to be enabled because otherwise every component would
 * have this extra overhead unnecessarily, on mobile devices where extra
 * overhead is especially bad.
 * @private
 */
vjs.Component.prototype.emitTapEvents = function(){
  var touchStart, firstTouch, touchTime, couldBeTap, noTap,
      xdiff, ydiff, touchDistance, tapMovementThreshold, touchTimeThreshold;

  // Track the start time so we can determine how long the touch lasted
  touchStart = 0;
  firstTouch = null;

  // Maximum movement allowed during a touch event to still be considered a tap
  // Other popular libs use anywhere from 2 (hammer.js) to 15, so 10 seems like a nice, round number.
  tapMovementThreshold = 10;

  // The maximum length a touch can be while still being considered a tap
  touchTimeThreshold = 200;

  this.on('touchstart', function(event) {
    // If more than one finger, don't consider treating this as a click
    if (event.touches.length === 1) {
      firstTouch = vjs.obj.copy(event.touches[0]);
      // Record start time so we can detect a tap vs. "touch and hold"
      touchStart = new Date().getTime();
      // Reset couldBeTap tracking
      couldBeTap = true;
    }
  });

  this.on('touchmove', function(event) {
    // If more than one finger, don't consider treating this as a click
    if (event.touches.length > 1) {
      couldBeTap = false;
    } else if (firstTouch) {
      // Some devices will throw touchmoves for all but the slightest of taps.
      // So, if we moved only a small distance, this could still be a tap
      xdiff = event.touches[0].pageX - firstTouch.pageX;
      ydiff = event.touches[0].pageY - firstTouch.pageY;
      touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      if (touchDistance > tapMovementThreshold) {
        couldBeTap = false;
      }
    }
  });

  noTap = function(){
    couldBeTap = false;
  };
  // TODO: Listen to the original target. http://youtu.be/DujfpXOKUp8?t=13m8s
  this.on('touchleave', noTap);
  this.on('touchcancel', noTap);

  // When the touch ends, measure how long it took and trigger the appropriate
  // event
  this.on('touchend', function(event) {
    firstTouch = null;
    // Proceed only if the touchmove/leave/cancel event didn't happen
    if (couldBeTap === true) {
      // Measure how long the touch lasted
      touchTime = new Date().getTime() - touchStart;
      // Make sure the touch was less than the threshold to be considered a tap
      if (touchTime < touchTimeThreshold) {
        event.preventDefault(); // Don't let browser turn this into a click
        this.trigger('tap');
        // It may be good to copy the touchend event object and change the
        // type to tap, if the other event properties aren't exact after
        // vjs.fixEvent runs (e.g. event.target)
      }
    }
  });
};

/**
 * Report user touch activity when touch events occur
 *
 * User activity is used to determine when controls should show/hide. It's
 * relatively simple when it comes to mouse events, because any mouse event
 * should show the controls. So we capture mouse events that bubble up to the
 * player and report activity when that happens.
 *
 * With touch events it isn't as easy. We can't rely on touch events at the
 * player level, because a tap (touchstart + touchend) on the video itself on
 * mobile devices is meant to turn controls off (and on). User activity is
 * checked asynchronously, so what could happen is a tap event on the video
 * turns the controls off, then the touchend event bubbles up to the player,
 * which if it reported user activity, would turn the controls right back on.
 * (We also don't want to completely block touch events from bubbling up)
 *
 * Also a touchmove, touch+hold, and anything other than a tap is not supposed
 * to turn the controls back on on a mobile device.
 *
 * Here we're setting the default component behavior to report user activity
 * whenever touch events happen, and this can be turned off by components that
 * want touch events to act differently.
 */
vjs.Component.prototype.enableTouchActivity = function() {
  var report, touchHolding, touchEnd;

  // Don't continue if the root player doesn't support reporting user activity
  if (!this.player().reportUserActivity) {
    return;
  }

  // listener for reporting that the user is active
  report = vjs.bind(this.player(), this.player().reportUserActivity);

  this.on('touchstart', function() {
    report();
    // For as long as the they are touching the device or have their mouse down,
    // we consider them active even if they're not moving their finger or mouse.
    // So we want to continue to update that they are active
    this.clearInterval(touchHolding);
    // report at the same interval as activityCheck
    touchHolding = this.setInterval(report, 250);
  });

  touchEnd = function(event) {
    report();
    // stop the interval that maintains activity if the touch is holding
    this.clearInterval(touchHolding);
  };

  this.on('touchmove', report);
  this.on('touchend', touchEnd);
  this.on('touchcancel', touchEnd);
};

/**
 * Creates timeout and sets up disposal automatically.
 * @param {Function} fn The function to run after the timeout.
 * @param {Number} timeout Number of ms to delay before executing specified function.
 * @return {Number} Returns the timeout ID
 */
vjs.Component.prototype.setTimeout = function(fn, timeout) {
  fn = vjs.bind(this, fn);

  // window.setTimeout would be preferable here, but due to some bizarre issue with Sinon and/or Phantomjs, we can't.
  var timeoutId = setTimeout(fn, timeout);

  var disposeFn = function() {
    this.clearTimeout(timeoutId);
  };

  disposeFn.guid = 'vjs-timeout-'+ timeoutId;

  this.on('dispose', disposeFn);

  return timeoutId;
};


/**
 * Clears a timeout and removes the associated dispose listener
 * @param {Number} timeoutId The id of the timeout to clear
 * @return {Number} Returns the timeout ID
 */
vjs.Component.prototype.clearTimeout = function(timeoutId) {
  clearTimeout(timeoutId);

  var disposeFn = function(){};
  disposeFn.guid = 'vjs-timeout-'+ timeoutId;

  this.off('dispose', disposeFn);

  return timeoutId;
};

/**
 * Creates an interval and sets up disposal automatically.
 * @param {Function} fn The function to run every N seconds.
 * @param {Number} interval Number of ms to delay before executing specified function.
 * @return {Number} Returns the interval ID
 */
vjs.Component.prototype.setInterval = function(fn, interval) {
  fn = vjs.bind(this, fn);

  var intervalId = setInterval(fn, interval);

  var disposeFn = function() {
    this.clearInterval(intervalId);
  };

  disposeFn.guid = 'vjs-interval-'+ intervalId;

  this.on('dispose', disposeFn);

  return intervalId;
};

/**
 * Clears an interval and removes the associated dispose listener
 * @param {Number} intervalId The id of the interval to clear
 * @return {Number} Returns the interval ID
 */
vjs.Component.prototype.clearInterval = function(intervalId) {
  clearInterval(intervalId);

  var disposeFn = function(){};
  disposeFn.guid = 'vjs-interval-'+ intervalId;

  this.off('dispose', disposeFn);

  return intervalId;
};
/* Button - Base class for all buttons
================================================================================ */
/**
 * Base class for all buttons
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.Button = vjs.Component.extend({
  /**
   * @constructor
   * @inheritDoc
   */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    this.emitTapEvents();

    this.on('tap', this.onClick);
    this.on('click', this.onClick);
    this.on('focus', this.onFocus);
    this.on('blur', this.onBlur);
  }
});

vjs.Button.prototype.createEl = function(type, props){
  var el;

  // Add standard Aria and Tabindex info
  props = vjs.obj.merge({
    className: this.buildCSSClass(),
    'role': 'button',
    'aria-live': 'polite', // let the screen reader user know that the text of the button may change
    tabIndex: 0
  }, props);

  el = vjs.Component.prototype.createEl.call(this, type, props);

  // if innerHTML hasn't been overridden (bigPlayButton), add content elements
  if (!props.innerHTML) {
    this.contentEl_ = vjs.createEl('div', {
      className: 'vjs-control-content'
    });

    this.controlText_ = vjs.createEl('span', {
      className: 'vjs-control-text',
      innerHTML: this.localize(this.buttonText) || 'Need Text'
    });

    this.contentEl_.appendChild(this.controlText_);
    el.appendChild(this.contentEl_);
  }

  return el;
};

vjs.Button.prototype.buildCSSClass = function(){
  // TODO: Change vjs-control to vjs-button?
  return 'vjs-control ' + vjs.Component.prototype.buildCSSClass.call(this);
};

  // Click - Override with specific functionality for button
vjs.Button.prototype.onClick = function(){};

  // Focus - Add keyboard functionality to element
vjs.Button.prototype.onFocus = function(){
  vjs.on(document, 'keydown', vjs.bind(this, this.onKeyPress));
};

  // KeyPress (document level) - Trigger click when keys are pressed
vjs.Button.prototype.onKeyPress = function(event){
  // Check for space bar (32) or enter (13) keys
  if (event.which == 32 || event.which == 13) {
    event.preventDefault();
    this.onClick();
  }
};

// Blur - Remove keyboard triggers
vjs.Button.prototype.onBlur = function(){
  vjs.off(document, 'keydown', vjs.bind(this, this.onKeyPress));
};
/* Slider
================================================================================ */
/**
 * The base functionality for sliders like the volume bar and seek bar
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.Slider = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    // Set property names to bar and handle to match with the child Slider class is looking for
    this.bar = this.getChild(this.options_['barName']);
    this.handle = this.getChild(this.options_['handleName']);

    this.on('mousedown', this.onMouseDown);
    this.on('touchstart', this.onMouseDown);
    this.on('focus', this.onFocus);
    this.on('blur', this.onBlur);
    this.on('click', this.onClick);

    this.on(player, 'controlsvisible', this.update);
    this.on(player, this.playerEvent, this.update);
  }
});

vjs.Slider.prototype.createEl = function(type, props) {
  props = props || {};
  // Add the slider element class to all sub classes
  props.className = props.className + ' vjs-slider';
  props = vjs.obj.merge({
    'role': 'slider',
    'aria-valuenow': 0,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    tabIndex: 0
  }, props);

  return vjs.Component.prototype.createEl.call(this, type, props);
};

vjs.Slider.prototype.onMouseDown = function(event){
  event.preventDefault();
  vjs.blockTextSelection();
  this.addClass('vjs-sliding');

  this.on(document, 'mousemove', this.onMouseMove);
  this.on(document, 'mouseup', this.onMouseUp);
  this.on(document, 'touchmove', this.onMouseMove);
  this.on(document, 'touchend', this.onMouseUp);

  this.onMouseMove(event);
};

// To be overridden by a subclass
vjs.Slider.prototype.onMouseMove = function(){};

vjs.Slider.prototype.onMouseUp = function() {
  vjs.unblockTextSelection();
  this.removeClass('vjs-sliding');

  this.off(document, 'mousemove', this.onMouseMove);
  this.off(document, 'mouseup', this.onMouseUp);
  this.off(document, 'touchmove', this.onMouseMove);
  this.off(document, 'touchend', this.onMouseUp);

  this.update();
};

vjs.Slider.prototype.update = function(){
  // In VolumeBar init we have a setTimeout for update that pops and update to the end of the
  // execution stack. The player is destroyed before then update will cause an error
  if (!this.el_) return;

  // If scrubbing, we could use a cached value to make the handle keep up with the user's mouse.
  // On HTML5 browsers scrubbing is really smooth, but some flash players are slow, so we might want to utilize this later.
  // var progress =  (this.player_.scrubbing) ? this.player_.getCache().currentTime / this.player_.duration() : this.player_.currentTime() / this.player_.duration();

  var barProgress,
      progress = this.getPercent(),
      handle = this.handle,
      bar = this.bar;

  // Protect against no duration and other division issues
  if (typeof progress !== 'number' ||
      progress !== progress ||
      progress < 0 ||
      progress === Infinity) {
        progress = 0;
  }

  barProgress = progress;

  // If there is a handle, we need to account for the handle in our calculation for progress bar
  // so that it doesn't fall short of or extend past the handle.
  if (handle) {

    var box = this.el_,
        boxWidth = box.offsetWidth,

        handleWidth = handle.el().offsetWidth,

        // The width of the handle in percent of the containing box
        // In IE, widths may not be ready yet causing NaN
        handlePercent = (handleWidth) ? handleWidth / boxWidth : 0,

        // Get the adjusted size of the box, considering that the handle's center never touches the left or right side.
        // There is a margin of half the handle's width on both sides.
        boxAdjustedPercent = 1 - handlePercent,

        // Adjust the progress that we'll use to set widths to the new adjusted box width
        adjustedProgress = progress * boxAdjustedPercent;

    // The bar does reach the left side, so we need to account for this in the bar's width
    barProgress = adjustedProgress + (handlePercent / 2);

    // Move the handle from the left based on the adjected progress
    handle.el().style.left = vjs.round(adjustedProgress * 100, 2) + '%';
  }

  // Set the new bar width
  if (bar) {
    bar.el().style.width = vjs.round(barProgress * 100, 2) + '%';
  }
};

vjs.Slider.prototype.calculateDistance = function(event){
  var el, box, boxX, boxY, boxW, boxH, handle, pageX, pageY;

  el = this.el_;
  box = vjs.findPosition(el);
  boxW = boxH = el.offsetWidth;
  handle = this.handle;

  if (this.options()['vertical']) {
    boxY = box.top;

    if (event.changedTouches) {
      pageY = event.changedTouches[0].pageY;
    } else {
      pageY = event.pageY;
    }

    if (handle) {
      var handleH = handle.el().offsetHeight;
      // Adjusted X and Width, so handle doesn't go outside the bar
      boxY = boxY + (handleH / 2);
      boxH = boxH - handleH;
    }

    // Percent that the click is through the adjusted area
    return Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH));

  } else {
    boxX = box.left;

    if (event.changedTouches) {
      pageX = event.changedTouches[0].pageX;
    } else {
      pageX = event.pageX;
    }

    if (handle) {
      var handleW = handle.el().offsetWidth;

      // Adjusted X and Width, so handle doesn't go outside the bar
      boxX = boxX + (handleW / 2);
      boxW = boxW - handleW;
    }

    // Percent that the click is through the adjusted area
    return Math.max(0, Math.min(1, (pageX - boxX) / boxW));
  }
};

vjs.Slider.prototype.onFocus = function(){
  this.on(document, 'keydown', this.onKeyPress);
};

vjs.Slider.prototype.onKeyPress = function(event){
  if (event.which == 37 || event.which == 40) { // Left and Down Arrows
    event.preventDefault();
    this.stepBack();
  } else if (event.which == 38 || event.which == 39) { // Up and Right Arrows
    event.preventDefault();
    this.stepForward();
  }
};

vjs.Slider.prototype.onBlur = function(){
  this.off(document, 'keydown', this.onKeyPress);
};

/**
 * Listener for click events on slider, used to prevent clicks
 *   from bubbling up to parent elements like button menus.
 * @param  {Object} event Event object
 */
vjs.Slider.prototype.onClick = function(event){
  event.stopImmediatePropagation();
  event.preventDefault();
};

/**
 * SeekBar Behavior includes play progress bar, and seek handle
 * Needed so it can determine seek position based on handle position/size
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SliderHandle = vjs.Component.extend();

/**
 * Default value of the slider
 *
 * @type {Number}
 * @private
 */
vjs.SliderHandle.prototype.defaultValue = 0;

/** @inheritDoc */
vjs.SliderHandle.prototype.createEl = function(type, props) {
  props = props || {};
  // Add the slider element class to all sub classes
  props.className = props.className + ' vjs-slider-handle';
  props = vjs.obj.merge({
    innerHTML: '<span class="vjs-control-text">'+this.defaultValue+'</span>'
  }, props);

  return vjs.Component.prototype.createEl.call(this, 'div', props);
};
/* Menu
================================================================================ */
/**
 * The Menu component is used to build pop up menus, including subtitle and
 * captions selection menus.
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.Menu = vjs.Component.extend();

/**
 * Add a menu item to the menu
 * @param {Object|String} component Component or component type to add
 */
vjs.Menu.prototype.addItem = function(component){
  this.addChild(component);
  component.on('click', vjs.bind(this, function(){
    this.unlockShowing();
  }));
};

/** @inheritDoc */
vjs.Menu.prototype.createEl = function(){
  var contentElType = this.options().contentElType || 'ul';
  this.contentEl_ = vjs.createEl(contentElType, {
    className: 'vjs-menu-content'
  });
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    append: this.contentEl_,
    className: 'vjs-menu'
  });
  el.appendChild(this.contentEl_);

  // Prevent clicks from bubbling up. Needed for Menu Buttons,
  // where a click on the parent is significant
  vjs.on(el, 'click', function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
  });

  return el;
};

/**
 * The component for a menu item. `<li>`
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.MenuItem = vjs.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Button.call(this, player, options);
    this.selected(options['selected']);
  }
});

/** @inheritDoc */
vjs.MenuItem.prototype.createEl = function(type, props){
  return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
    className: 'vjs-menu-item',
    innerHTML: this.localize(this.options_['label'])
  }, props));
};

/**
 * Handle a click on the menu item, and set it to selected
 */
vjs.MenuItem.prototype.onClick = function(){
  this.selected(true);
};

/**
 * Set this menu item as selected or not
 * @param  {Boolean} selected
 */
vjs.MenuItem.prototype.selected = function(selected){
  if (selected) {
    this.addClass('vjs-selected');
    this.el_.setAttribute('aria-selected',true);
  } else {
    this.removeClass('vjs-selected');
    this.el_.setAttribute('aria-selected',false);
  }
};


/**
 * A button class with a popup menu
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.MenuButton = vjs.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Button.call(this, player, options);

    this.update();

    this.on('keydown', this.onKeyPress);
    this.el_.setAttribute('aria-haspopup', true);
    this.el_.setAttribute('role', 'button');
  }
});

vjs.MenuButton.prototype.update = function() {
  var menu = this.createMenu();

  if (this.menu) {
    this.removeChild(this.menu);
  }

  this.menu = menu;
  this.addChild(menu);

  if (this.items && this.items.length === 0) {
    this.hide();
  } else if (this.items && this.items.length > 1) {
    this.show();
  }
};

/**
 * Track the state of the menu button
 * @type {Boolean}
 * @private
 */
vjs.MenuButton.prototype.buttonPressed_ = false;

vjs.MenuButton.prototype.createMenu = function(){
  var menu = new vjs.Menu(this.player_);

  // Add a title list item to the top
  if (this.options().title) {
    menu.contentEl().appendChild(vjs.createEl('li', {
      className: 'vjs-menu-title',
      innerHTML: vjs.capitalize(this.options().title),
      tabindex: -1
    }));
  }

  this.items = this['createItems']();

  if (this.items) {
    // Add menu items to the menu
    for (var i = 0; i < this.items.length; i++) {
      menu.addItem(this.items[i]);
    }
  }

  return menu;
};

/**
 * Create the list of menu items. Specific to each subclass.
 */
vjs.MenuButton.prototype.createItems = function(){};

/** @inheritDoc */
vjs.MenuButton.prototype.buildCSSClass = function(){
  return this.className + ' vjs-menu-button ' + vjs.Button.prototype.buildCSSClass.call(this);
};

// Focus - Add keyboard functionality to element
// This function is not needed anymore. Instead, the keyboard functionality is handled by
// treating the button as triggering a submenu. When the button is pressed, the submenu
// appears. Pressing the button again makes the submenu disappear.
vjs.MenuButton.prototype.onFocus = function(){};
// Can't turn off list display that we turned on with focus, because list would go away.
vjs.MenuButton.prototype.onBlur = function(){};

vjs.MenuButton.prototype.onClick = function(){
  // When you click the button it adds focus, which will show the menu indefinitely.
  // So we'll remove focus when the mouse leaves the button.
  // Focus is needed for tab navigation.
  this.one('mouseout', vjs.bind(this, function(){
    this.menu.unlockShowing();
    this.el_.blur();
  }));
  if (this.buttonPressed_){
    this.unpressButton();
  } else {
    this.pressButton();
  }
};

vjs.MenuButton.prototype.onKeyPress = function(event){

  // Check for space bar (32) or enter (13) keys
  if (event.which == 32 || event.which == 13) {
    if (this.buttonPressed_){
      this.unpressButton();
    } else {
      this.pressButton();
    }
    event.preventDefault();
  // Check for escape (27) key
  } else if (event.which == 27){
    if (this.buttonPressed_){
      this.unpressButton();
    }
    event.preventDefault();
  }
};

vjs.MenuButton.prototype.pressButton = function(){
  this.buttonPressed_ = true;
  this.menu.lockShowing();
  this.el_.setAttribute('aria-pressed', true);
  if (this.items && this.items.length > 0) {
    this.items[0].el().focus(); // set the focus to the title of the submenu
  }
};

vjs.MenuButton.prototype.unpressButton = function(){
  this.buttonPressed_ = false;
  this.menu.unlockShowing();
  this.el_.setAttribute('aria-pressed', false);
};
/**
 * Custom MediaError to mimic the HTML5 MediaError
 * @param {Number} code The media error code
 */
vjs.MediaError = function(code){
  if (typeof code === 'number') {
    this.code = code;
  } else if (typeof code === 'string') {
    // default code is zero, so this is a custom error
    this.message = code;
  } else if (typeof code === 'object') { // object
    vjs.obj.merge(this, code);
  }

  if (!this.message) {
    this.message = vjs.MediaError.defaultMessages[this.code] || '';
  }
};

/**
 * The error code that refers two one of the defined
 * MediaError types
 * @type {Number}
 */
vjs.MediaError.prototype.code = 0;

/**
 * An optional message to be shown with the error.
 * Message is not part of the HTML5 video spec
 * but allows for more informative custom errors.
 * @type {String}
 */
vjs.MediaError.prototype.message = '';

/**
 * An optional status code that can be set by plugins
 * to allow even more detail about the error.
 * For example the HLS plugin might provide the specific
 * HTTP status code that was returned when the error
 * occurred, then allowing a custom error overlay
 * to display more information.
 * @type {[type]}
 */
vjs.MediaError.prototype.status = null;

vjs.MediaError.errorTypes = [
  'MEDIA_ERR_CUSTOM',            // = 0
  'MEDIA_ERR_ABORTED',           // = 1
  'MEDIA_ERR_NETWORK',           // = 2
  'MEDIA_ERR_DECODE',            // = 3
  'MEDIA_ERR_SRC_NOT_SUPPORTED', // = 4
  'MEDIA_ERR_ENCRYPTED'          // = 5
];

vjs.MediaError.defaultMessages = {
  1: 'You aborted the video playback',
  2: 'A network error caused the video download to fail part-way.',
  3: 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.',
  4: 'The video could not be loaded, either because the server or network failed or because the format is not supported.',
  5: 'The video is encrypted and we do not have the keys to decrypt it.'
};

// Add types as properties on MediaError
// e.g. MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
for (var errNum = 0; errNum < vjs.MediaError.errorTypes.length; errNum++) {
  vjs.MediaError[vjs.MediaError.errorTypes[errNum]] = errNum;
  // values should be accessible on both the class and instance
  vjs.MediaError.prototype[vjs.MediaError.errorTypes[errNum]] = errNum;
}
(function(){
  var apiMap, specApi, browserApi, i;

  /**
   * Store the browser-specific methods for the fullscreen API
   * @type {Object|undefined}
   * @private
   */
  vjs.browser.fullscreenAPI;

  // browser API methods
  // map approach from Screenful.js - https://github.com/sindresorhus/screenfull.js
  apiMap = [
    // Spec: https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
    [
      'requestFullscreen',
      'exitFullscreen',
      'fullscreenElement',
      'fullscreenEnabled',
      'fullscreenchange',
      'fullscreenerror'
    ],
    // WebKit
    [
      'webkitRequestFullscreen',
      'webkitExitFullscreen',
      'webkitFullscreenElement',
      'webkitFullscreenEnabled',
      'webkitfullscreenchange',
      'webkitfullscreenerror'
    ],
    // Old WebKit (Safari 5.1)
    [
      'webkitRequestFullScreen',
      'webkitCancelFullScreen',
      'webkitCurrentFullScreenElement',
      'webkitCancelFullScreen',
      'webkitfullscreenchange',
      'webkitfullscreenerror'
    ],
    // Mozilla
    [
      'mozRequestFullScreen',
      'mozCancelFullScreen',
      'mozFullScreenElement',
      'mozFullScreenEnabled',
      'mozfullscreenchange',
      'mozfullscreenerror'
    ],
    // Microsoft
    [
      'msRequestFullscreen',
      'msExitFullscreen',
      'msFullscreenElement',
      'msFullscreenEnabled',
      'MSFullscreenChange',
      'MSFullscreenError'
    ]
  ];

  specApi = apiMap[0];

  // determine the supported set of functions
  for (i=0; i<apiMap.length; i++) {
    // check for exitFullscreen function
    if (apiMap[i][1] in document) {
      browserApi = apiMap[i];
      break;
    }
  }

  // map the browser API names to the spec API names
  // or leave vjs.browser.fullscreenAPI undefined
  if (browserApi) {
    vjs.browser.fullscreenAPI = {};

    for (i=0; i<browserApi.length; i++) {
      vjs.browser.fullscreenAPI[specApi[i]] = browserApi[i];
    }
  }

})();
/**
 * An instance of the `vjs.Player` class is created when any of the Video.js setup methods are used to initialize a video.
 *
 * ```js
 * var myPlayer = videojs('example_video_1');
 * ```
 *
 * In the following example, the `data-setup` attribute tells the Video.js library to create a player instance when the library is ready.
 *
 * ```html
 * <video id="example_video_1" data-setup='{}' controls>
 *   <source src="my-source.mp4" type="video/mp4">
 * </video>
 * ```
 *
 * After an instance has been created it can be accessed globally using `Video('example_video_1')`.
 *
 * @class
 * @extends vjs.Component
 */
vjs.Player = vjs.Component.extend({

  /**
   * player's constructor function
   *
   * @constructs
   * @method init
   * @param {Element} tag        The original video tag used for configuring options
   * @param {Object=} options    Player options
   * @param {Function=} ready    Ready callback function
   */
  init: function(tag, options, ready){
    this.tag = tag; // Store the original tag used to set options

    // Make sure tag ID exists
    tag.id = tag.id || 'vjs_video_' + vjs.guid++;

    // Store the tag attributes used to restore html5 element
    this.tagAttributes = tag && vjs.getElementAttributes(tag);

    // Set Options
    // The options argument overrides options set in the video tag
    // which overrides globally set options.
    // This latter part coincides with the load order
    // (tag must exist before Player)
    options = vjs.obj.merge(this.getTagSettings(tag), options);

    // Update Current Language
    this.language_ = options['language'] || vjs.options['language'];

    // Update Supported Languages
    this.languages_ = options['languages'] || vjs.options['languages'];

    // Cache for video property values.
    this.cache_ = {};

    // Set poster
    this.poster_ = options['poster'] || '';

    // Set controls
    this.controls_ = !!options['controls'];
    // Original tag settings stored in options
    // now remove immediately so native controls don't flash.
    // May be turned back on by HTML5 tech if nativeControlsForTouch is true
    tag.controls = false;

    // we don't want the player to report touch activity on itself
    // see enableTouchActivity in Component
    options.reportTouchActivity = false;

    // Set isAudio based on whether or not an audio tag was used
    this.isAudio(this.tag.nodeName.toLowerCase() === 'audio');

    // Run base component initializing with new options.
    // Builds the element through createEl()
    // Inits and embeds any child components in opts
    vjs.Component.call(this, this, options, ready);

    // Update controls className. Can't do this when the controls are initially
    // set because the element doesn't exist yet.
    if (this.controls()) {
      this.addClass('vjs-controls-enabled');
    } else {
      this.addClass('vjs-controls-disabled');
    }

    if (this.isAudio()) {
      this.addClass('vjs-audio');
    }

    // TODO: Make this smarter. Toggle user state between touching/mousing
    // using events, since devices can have both touch and mouse events.
    // if (vjs.TOUCH_ENABLED) {
    //   this.addClass('vjs-touch-enabled');
    // }

    // Make player easily findable by ID
    vjs.players[this.id_] = this;

    if (options['plugins']) {
      vjs.obj.each(options['plugins'], function(key, val){
        this[key](val);
      }, this);
    }

    this.listenForUserActivity();
  }
});

/**
 * The player's stored language code
 *
 * @type {String}
 * @private
 */
vjs.Player.prototype.language_;

/**
 * The player's language code
 * @param  {String} languageCode  The locale string
 * @return {String}             The locale string when getting
 * @return {vjs.Player}         self, when setting
 */
vjs.Player.prototype.language = function (languageCode) {
  if (languageCode === undefined) {
    return this.language_;
  }

  this.language_ = languageCode;
  return this;
};

/**
 * The player's stored language dictionary
 *
 * @type {Object}
 * @private
 */
vjs.Player.prototype.languages_;

vjs.Player.prototype.languages = function(){
  return this.languages_;
};

/**
 * Player instance options, surfaced using vjs.options
 * vjs.options = vjs.Player.prototype.options_
 * Make changes in vjs.options, not here.
 * All options should use string keys so they avoid
 * renaming by closure compiler
 * @type {Object}
 * @private
 */
vjs.Player.prototype.options_ = vjs.options;

/**
 * Destroys the video player and does any necessary cleanup
 *
 *     myPlayer.dispose();
 *
 * This is especially helpful if you are dynamically adding and removing videos
 * to/from the DOM.
 */
vjs.Player.prototype.dispose = function(){
  this.trigger('dispose');
  // prevent dispose from being called twice
  this.off('dispose');

  // Kill reference to this player
  vjs.players[this.id_] = null;
  if (this.tag && this.tag['player']) { this.tag['player'] = null; }
  if (this.el_ && this.el_['player']) { this.el_['player'] = null; }

  if (this.tech) { this.tech.dispose(); }

  // Component dispose
  vjs.Component.prototype.dispose.call(this);
};

vjs.Player.prototype.getTagSettings = function(tag){
  var tagOptions,
      dataSetup,
      options = {
        'sources': [],
        'tracks': []
      };

  tagOptions = vjs.getElementAttributes(tag);
  dataSetup = tagOptions['data-setup'];

  // Check if data-setup attr exists.
  if (dataSetup !== null){
    // Parse options JSON
    // If empty string, make it a parsable json object.
    vjs.obj.merge(tagOptions, vjs.JSON.parse(dataSetup || '{}'));
  }

  vjs.obj.merge(options, tagOptions);

  // Get tag children settings
  if (tag.hasChildNodes()) {
    var children, child, childName, i, j;

    children = tag.childNodes;

    for (i=0,j=children.length; i<j; i++) {
      child = children[i];
      // Change case needed: http://ejohn.org/blog/nodename-case-sensitivity/
      childName = child.nodeName.toLowerCase();
      if (childName === 'source') {
        options['sources'].push(vjs.getElementAttributes(child));
      } else if (childName === 'track') {
        options['tracks'].push(vjs.getElementAttributes(child));
      }
    }
  }

  return options;
};

vjs.Player.prototype.createEl = function(){
  var
    el = this.el_ = vjs.Component.prototype.createEl.call(this, 'div'),
    tag = this.tag,
    attrs;

  // Remove width/height attrs from tag so CSS can make it 100% width/height
  tag.removeAttribute('width');
  tag.removeAttribute('height');

  // Copy over all the attributes from the tag, including ID and class
  // ID will now reference player box, not the video tag
  attrs = vjs.getElementAttributes(tag);
  vjs.obj.each(attrs, function(attr) {
    // workaround so we don't totally break IE7
    // http://stackoverflow.com/questions/3653444/css-styles-not-applied-on-dynamic-elements-in-internet-explorer-7
    if (attr == 'class') {
      el.className = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  });

  // Update tag id/class for use as HTML5 playback tech
  // Might think we should do this after embedding in container so .vjs-tech class
  // doesn't flash 100% width/height, but class only applies with .video-js parent
  tag.id += '_html5_api';
  tag.className = 'vjs-tech';

  // Make player findable on elements
  tag['player'] = el['player'] = this;
  // Default state of video is paused
  this.addClass('vjs-paused');

  // Make box use width/height of tag, or rely on default implementation
  // Enforce with CSS since width/height attrs don't work on divs
  this.width(this.options_['width'], true); // (true) Skip resize listener on load
  this.height(this.options_['height'], true);

  // vjs.insertFirst seems to cause the networkState to flicker from 3 to 2, so
  // keep track of the original for later so we can know if the source originally failed
  tag.initNetworkState_ = tag.networkState;

  // Wrap video tag in div (el/box) container
  if (tag.parentNode) {
    tag.parentNode.insertBefore(el, tag);
  }
  vjs.insertFirst(tag, el); // Breaks iPhone, fixed in HTML5 setup.

  // The event listeners need to be added before the children are added
  // in the component init because the tech (loaded with mediaLoader) may
  // fire events, like loadstart, that these events need to capture.
  // Long term it might be better to expose a way to do this in component.init
  // like component.initEventListeners() that runs between el creation and
  // adding children
  this.el_ = el;
  this.on('loadstart', this.onLoadStart);
  this.on('waiting', this.onWaiting);
  this.on(['canplay', 'canplaythrough', 'playing', 'ended'], this.onWaitEnd);
  this.on('seeking', this.onSeeking);
  this.on('seeked', this.onSeeked);
  this.on('ended', this.onEnded);
  this.on('play', this.onPlay);
  this.on('firstplay', this.onFirstPlay);
  this.on('pause', this.onPause);
  this.on('progress', this.onProgress);
  this.on('durationchange', this.onDurationChange);
  this.on('fullscreenchange', this.onFullscreenChange);

  return el;
};

// /* Media Technology (tech)
// ================================================================================ */
// Load/Create an instance of playback technology including element and API methods
// And append playback element in player div.
vjs.Player.prototype.loadTech = function(techName, source){

  // Pause and remove current playback technology
  if (this.tech) {
    this.unloadTech();
  }

  // get rid of the HTML5 video tag as soon as we are using another tech
  if (techName !== 'Html5' && this.tag) {
    vjs.Html5.disposeMediaElement(this.tag);
    this.tag = null;
  }

  this.techName = techName;

  // Turn off API access because we're loading a new tech that might load asynchronously
  this.isReady_ = false;

  var techReady = function(){
    this.player_.triggerReady();
  };

  // Grab tech-specific options from player options and add source and parent element to use.
  var techOptions = vjs.obj.merge({ 'source': source, 'parentEl': this.el_ }, this.options_[techName.toLowerCase()]);

  if (source) {
    this.currentType_ = source.type;
    if (source.src == this.cache_.src && this.cache_.currentTime > 0) {
      techOptions['startTime'] = this.cache_.currentTime;
    }

    this.cache_.src = source.src;
  }

  // Initialize tech instance
  this.tech = new window['videojs'][techName](this, techOptions);

  this.tech.ready(techReady);
};

vjs.Player.prototype.unloadTech = function(){
  this.isReady_ = false;

  this.tech.dispose();

  this.tech = false;
};

// There's many issues around changing the size of a Flash (or other plugin) object.
// First is a plugin reload issue in Firefox that has been around for 11 years: https://bugzilla.mozilla.org/show_bug.cgi?id=90268
// Then with the new fullscreen API, Mozilla and webkit browsers will reload the flash object after going to fullscreen.
// To get around this, we're unloading the tech, caching source and currentTime values, and reloading the tech once the plugin is resized.
// reloadTech: function(betweenFn){
//   vjs.log('unloadingTech')
//   this.unloadTech();
//   vjs.log('unloadedTech')
//   if (betweenFn) { betweenFn.call(); }
//   vjs.log('LoadingTech')
//   this.loadTech(this.techName, { src: this.cache_.src })
//   vjs.log('loadedTech')
// },

// /* Player event handlers (how the player reacts to certain events)
// ================================================================================ */

/**
 * Fired when the user agent begins looking for media data
 * @event loadstart
 */
vjs.Player.prototype.onLoadStart = function() {
  // TODO: Update to use `emptied` event instead. See #1277.

  this.removeClass('vjs-ended');

  // reset the error state
  this.error(null);

  // If it's already playing we want to trigger a firstplay event now.
  // The firstplay event relies on both the play and loadstart events
  // which can happen in any order for a new source
  if (!this.paused()) {
    this.trigger('firstplay');
  } else {
    // reset the hasStarted state
    this.hasStarted(false);
  }
};

vjs.Player.prototype.hasStarted_ = false;

vjs.Player.prototype.hasStarted = function(hasStarted){
  if (hasStarted !== undefined) {
    // only update if this is a new value
    if (this.hasStarted_ !== hasStarted) {
      this.hasStarted_ = hasStarted;
      if (hasStarted) {
        this.addClass('vjs-has-started');
        // trigger the firstplay event if this newly has played
        this.trigger('firstplay');
      } else {
        this.removeClass('vjs-has-started');
      }
    }
    return this;
  }
  return this.hasStarted_;
};

/**
 * Fired when the player has initial duration and dimension information
 * @event loadedmetadata
 */
vjs.Player.prototype.onLoadedMetaData;

/**
 * Fired when the player has downloaded data at the current playback position
 * @event loadeddata
 */
vjs.Player.prototype.onLoadedData;

/**
 * Fired when the player has finished downloading the source data
 * @event loadedalldata
 */
vjs.Player.prototype.onLoadedAllData;

/**
 * Fired whenever the media begins or resumes playback
 * @event play
 */
vjs.Player.prototype.onPlay = function(){
  this.removeClass('vjs-ended');
  this.removeClass('vjs-paused');
  this.addClass('vjs-playing');

  // hide the poster when the user hits play
  // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-play
  this.hasStarted(true);
};

/**
 * Fired whenever the media begins waiting
 * @event waiting
 */
vjs.Player.prototype.onWaiting = function(){
  this.addClass('vjs-waiting');
};

/**
 * A handler for events that signal that waiting has ended
 * which is not consistent between browsers. See #1351
 * @private
 */
vjs.Player.prototype.onWaitEnd = function(){
  this.removeClass('vjs-waiting');
};

/**
 * Fired whenever the player is jumping to a new time
 * @event seeking
 */
vjs.Player.prototype.onSeeking = function(){
  this.addClass('vjs-seeking');
};

/**
 * Fired when the player has finished jumping to a new time
 * @event seeked
 */
vjs.Player.prototype.onSeeked = function(){
  this.removeClass('vjs-seeking');
};

/**
 * Fired the first time a video is played
 *
 * Not part of the HLS spec, and we're not sure if this is the best
 * implementation yet, so use sparingly. If you don't have a reason to
 * prevent playback, use `myPlayer.one('play');` instead.
 *
 * @event firstplay
 */
vjs.Player.prototype.onFirstPlay = function(){
    //If the first starttime attribute is specified
    //then we will start at the given offset in seconds
    if(this.options_['starttime']){
      this.currentTime(this.options_['starttime']);
    }

    this.addClass('vjs-has-started');
};

/**
 * Fired whenever the media has been paused
 * @event pause
 */
vjs.Player.prototype.onPause = function(){
  this.removeClass('vjs-playing');
  this.addClass('vjs-paused');
};

/**
 * Fired when the current playback position has changed
 *
 * During playback this is fired every 15-250 milliseconds, depending on the
 * playback technology in use.
 * @event timeupdate
 */
vjs.Player.prototype.onTimeUpdate;

/**
 * Fired while the user agent is downloading media data
 * @event progress
 */
vjs.Player.prototype.onProgress = function(){
  // Add custom event for when source is finished downloading.
  if (this.bufferedPercent() == 1) {
    this.trigger('loadedalldata');
  }
};

/**
 * Fired when the end of the media resource is reached (currentTime == duration)
 * @event ended
 */
vjs.Player.prototype.onEnded = function(){
  this.addClass('vjs-ended');
  if (this.options_['loop']) {
    this.currentTime(0);
    this.play();
  } else if (!this.paused()) {
    this.pause();
  }
};

/**
 * Fired when the duration of the media resource is first known or changed
 * @event durationchange
 */
vjs.Player.prototype.onDurationChange = function(){
  // Allows for caching value instead of asking player each time.
  // We need to get the techGet response and check for a value so we don't
  // accidentally cause the stack to blow up.
  var duration = this.techGet('duration');
  if (duration) {
    if (duration < 0) {
      duration = Infinity;
    }
    this.duration(duration);
    // Determine if the stream is live and propagate styles down to UI.
    if (duration === Infinity) {
      this.addClass('vjs-live');
    } else {
      this.removeClass('vjs-live');
    }
  }
};

/**
 * Fired when the volume changes
 * @event volumechange
 */
vjs.Player.prototype.onVolumeChange;

/**
 * Fired when the player switches in or out of fullscreen mode
 * @event fullscreenchange
 */
vjs.Player.prototype.onFullscreenChange = function() {
  if (this.isFullscreen()) {
    this.addClass('vjs-fullscreen');
  } else {
    this.removeClass('vjs-fullscreen');
  }
};

/**
 * Fired when an error occurs
 * @event error
 */
vjs.Player.prototype.onError;

// /* Player API
// ================================================================================ */

/**
 * Object for cached values.
 * @private
 */
vjs.Player.prototype.cache_;

vjs.Player.prototype.getCache = function(){
  return this.cache_;
};

// Pass values to the playback tech
vjs.Player.prototype.techCall = function(method, arg){
  // If it's not ready yet, call method when it is
  if (this.tech && !this.tech.isReady_) {
    this.tech.ready(function(){
      this[method](arg);
    });

  // Otherwise call method now
  } else {
    try {
      this.tech[method](arg);
    } catch(e) {
      vjs.log(e);
      throw e;
    }
  }
};

// Get calls can't wait for the tech, and sometimes don't need to.
vjs.Player.prototype.techGet = function(method){
  if (this.tech && this.tech.isReady_) {

    // Flash likes to die and reload when you hide or reposition it.
    // In these cases the object methods go away and we get errors.
    // When that happens we'll catch the errors and inform tech that it's not ready any more.
    try {
      return this.tech[method]();
    } catch(e) {
      // When building additional tech libs, an expected method may not be defined yet
      if (this.tech[method] === undefined) {
        vjs.log('Video.js: ' + method + ' method not defined for '+this.techName+' playback technology.', e);
      } else {
        // When a method isn't available on the object it throws a TypeError
        if (e.name == 'TypeError') {
          vjs.log('Video.js: ' + method + ' unavailable on '+this.techName+' playback technology element.', e);
          this.tech.isReady_ = false;
        } else {
          vjs.log(e);
        }
      }
      throw e;
    }
  }

  return;
};

/**
 * start media playback
 *
 *     myPlayer.play();
 *
 * @return {vjs.Player} self
 */
vjs.Player.prototype.play = function(){
  this.techCall('play');
  return this;
};

/**
 * Pause the video playback
 *
 *     myPlayer.pause();
 *
 * @return {vjs.Player} self
 */
vjs.Player.prototype.pause = function(){
  this.techCall('pause');
  return this;
};

/**
 * Check if the player is paused
 *
 *     var isPaused = myPlayer.paused();
 *     var isPlaying = !myPlayer.paused();
 *
 * @return {Boolean} false if the media is currently playing, or true otherwise
 */
vjs.Player.prototype.paused = function(){
  // The initial state of paused should be true (in Safari it's actually false)
  return (this.techGet('paused') === false) ? false : true;
};

/**
 * Get or set the current time (in seconds)
 *
 *     // get
 *     var whereYouAt = myPlayer.currentTime();
 *
 *     // set
 *     myPlayer.currentTime(120); // 2 minutes into the video
 *
 * @param  {Number|String=} seconds The time to seek to
 * @return {Number}        The time in seconds, when not setting
 * @return {vjs.Player}    self, when the current time is set
 */
vjs.Player.prototype.currentTime = function(seconds){
  if (seconds !== undefined) {

    this.techCall('setCurrentTime', seconds);

    return this;
  }

  // cache last currentTime and return. default to 0 seconds
  //
  // Caching the currentTime is meant to prevent a massive amount of reads on the tech's
  // currentTime when scrubbing, but may not provide much performance benefit afterall.
  // Should be tested. Also something has to read the actual current time or the cache will
  // never get updated.
  return this.cache_.currentTime = (this.techGet('currentTime') || 0);
};

/**
 * Get the length in time of the video in seconds
 *
 *     var lengthOfVideo = myPlayer.duration();
 *
 * **NOTE**: The video must have started loading before the duration can be
 * known, and in the case of Flash, may not be known until the video starts
 * playing.
 *
 * @return {Number} The duration of the video in seconds
 */
vjs.Player.prototype.duration = function(seconds){
  if (seconds !== undefined) {

    // cache the last set value for optimized scrubbing (esp. Flash)
    this.cache_.duration = parseFloat(seconds);

    return this;
  }

  if (this.cache_.duration === undefined) {
    this.onDurationChange();
  }

  return this.cache_.duration || 0;
};

/**
 * Calculates how much time is left.
 *
 *     var timeLeft = myPlayer.remainingTime();
 *
 * Not a native video element function, but useful
 * @return {Number} The time remaining in seconds
 */
vjs.Player.prototype.remainingTime = function(){
  return this.duration() - this.currentTime();
};

// http://dev.w3.org/html5/spec/video.html#dom-media-buffered
// Buffered returns a timerange object.
// Kind of like an array of portions of the video that have been downloaded.

/**
 * Get a TimeRange object with the times of the video that have been downloaded
 *
 * If you just want the percent of the video that's been downloaded,
 * use bufferedPercent.
 *
 *     // Number of different ranges of time have been buffered. Usually 1.
 *     numberOfRanges = bufferedTimeRange.length,
 *
 *     // Time in seconds when the first range starts. Usually 0.
 *     firstRangeStart = bufferedTimeRange.start(0),
 *
 *     // Time in seconds when the first range ends
 *     firstRangeEnd = bufferedTimeRange.end(0),
 *
 *     // Length in seconds of the first time range
 *     firstRangeLength = firstRangeEnd - firstRangeStart;
 *
 * @return {Object} A mock TimeRange object (following HTML spec)
 */
vjs.Player.prototype.buffered = function(){
  var buffered = this.techGet('buffered');

  if (!buffered || !buffered.length) {
    buffered = vjs.createTimeRange(0,0);
  }

  return buffered;
};

/**
 * Get the percent (as a decimal) of the video that's been downloaded
 *
 *     var howMuchIsDownloaded = myPlayer.bufferedPercent();
 *
 * 0 means none, 1 means all.
 * (This method isn't in the HTML5 spec, but it's very convenient)
 *
 * @return {Number} A decimal between 0 and 1 representing the percent
 */
vjs.Player.prototype.bufferedPercent = function(){
  var duration = this.duration(),
      buffered = this.buffered(),
      bufferedDuration = 0,
      start, end;

  if (!duration) {
    return 0;
  }

  for (var i=0; i<buffered.length; i++){
    start = buffered.start(i);
    end   = buffered.end(i);

    // buffered end can be bigger than duration by a very small fraction
    if (end > duration) {
      end = duration;
    }

    bufferedDuration += end - start;
  }

  return bufferedDuration / duration;
};

/**
 * Get the ending time of the last buffered time range
 *
 * This is used in the progress bar to encapsulate all time ranges.
 * @return {Number} The end of the last buffered time range
 */
vjs.Player.prototype.bufferedEnd = function(){
  var buffered = this.buffered(),
      duration = this.duration(),
      end = buffered.end(buffered.length-1);

  if (end > duration) {
    end = duration;
  }

  return end;
};

/**
 * Get or set the current volume of the media
 *
 *     // get
 *     var howLoudIsIt = myPlayer.volume();
 *
 *     // set
 *     myPlayer.volume(0.5); // Set volume to half
 *
 * 0 is off (muted), 1.0 is all the way up, 0.5 is half way.
 *
 * @param  {Number} percentAsDecimal The new volume as a decimal percent
 * @return {Number}                  The current volume, when getting
 * @return {vjs.Player}              self, when setting
 */
vjs.Player.prototype.volume = function(percentAsDecimal){
  var vol;

  if (percentAsDecimal !== undefined) {
    vol = Math.max(0, Math.min(1, parseFloat(percentAsDecimal))); // Force value to between 0 and 1
    this.cache_.volume = vol;
    this.techCall('setVolume', vol);
    vjs.setLocalStorage('volume', vol);
    return this;
  }

  // Default to 1 when returning current volume.
  vol = parseFloat(this.techGet('volume'));
  return (isNaN(vol)) ? 1 : vol;
};


/**
 * Get the current muted state, or turn mute on or off
 *
 *     // get
 *     var isVolumeMuted = myPlayer.muted();
 *
 *     // set
 *     myPlayer.muted(true); // mute the volume
 *
 * @param  {Boolean=} muted True to mute, false to unmute
 * @return {Boolean} True if mute is on, false if not, when getting
 * @return {vjs.Player} self, when setting mute
 */
vjs.Player.prototype.muted = function(muted){
  if (muted !== undefined) {
    this.techCall('setMuted', muted);
    return this;
  }
  return this.techGet('muted') || false; // Default to false
};

// Check if current tech can support native fullscreen
// (e.g. with built in controls like iOS, so not our flash swf)
vjs.Player.prototype.supportsFullScreen = function(){
  return this.techGet('supportsFullScreen') || false;
};

/**
 * is the player in fullscreen
 * @type {Boolean}
 * @private
 */
vjs.Player.prototype.isFullscreen_ = false;

/**
 * Check if the player is in fullscreen mode
 *
 *     // get
 *     var fullscreenOrNot = myPlayer.isFullscreen();
 *
 *     // set
 *     myPlayer.isFullscreen(true); // tell the player it's in fullscreen
 *
 * NOTE: As of the latest HTML5 spec, isFullscreen is no longer an official
 * property and instead document.fullscreenElement is used. But isFullscreen is
 * still a valuable property for internal player workings.
 *
 * @param  {Boolean=} isFS Update the player's fullscreen state
 * @return {Boolean} true if fullscreen, false if not
 * @return {vjs.Player} self, when setting
 */
vjs.Player.prototype.isFullscreen = function(isFS){
  if (isFS !== undefined) {
    this.isFullscreen_ = !!isFS;
    return this;
  }
  return this.isFullscreen_;
};

/**
 * Old naming for isFullscreen()
 * @deprecated for lowercase 's' version
 */
vjs.Player.prototype.isFullScreen = function(isFS){
  vjs.log.warn('player.isFullScreen() has been deprecated, use player.isFullscreen() with a lowercase "s")');
  return this.isFullscreen(isFS);
};

/**
 * Increase the size of the video to full screen
 *
 *     myPlayer.requestFullscreen();
 *
 * In some browsers, full screen is not supported natively, so it enters
 * "full window mode", where the video fills the browser window.
 * In browsers and devices that support native full screen, sometimes the
 * browser's default controls will be shown, and not the Video.js custom skin.
 * This includes most mobile devices (iOS, Android) and older versions of
 * Safari.
 *
 * @return {vjs.Player} self
 */
vjs.Player.prototype.requestFullscreen = function(){
  var fsApi = vjs.browser.fullscreenAPI;

  this.isFullscreen(true);

  if (fsApi) {
    // the browser supports going fullscreen at the element level so we can
    // take the controls fullscreen as well as the video

    // Trigger fullscreenchange event after change
    // We have to specifically add this each time, and remove
    // when canceling fullscreen. Otherwise if there's multiple
    // players on a page, they would all be reacting to the same fullscreen
    // events
    vjs.on(document, fsApi['fullscreenchange'], vjs.bind(this, function(e){
      this.isFullscreen(document[fsApi.fullscreenElement]);

      // If cancelling fullscreen, remove event listener.
      if (this.isFullscreen() === false) {
        vjs.off(document, fsApi['fullscreenchange'], arguments.callee);
      }

      this.trigger('fullscreenchange');
    }));

    this.el_[fsApi.requestFullscreen]();

  } else if (this.tech.supportsFullScreen()) {
    // we can't take the video.js controls fullscreen but we can go fullscreen
    // with native controls
    this.techCall('enterFullScreen');
  } else {
    // fullscreen isn't supported so we'll just stretch the video element to
    // fill the viewport
    this.enterFullWindow();
    this.trigger('fullscreenchange');
  }

  return this;
};

/**
 * Old naming for requestFullscreen
 * @deprecated for lower case 's' version
 */
vjs.Player.prototype.requestFullScreen = function(){
  vjs.log.warn('player.requestFullScreen() has been deprecated, use player.requestFullscreen() with a lowercase "s")');
  return this.requestFullscreen();
};


/**
 * Return the video to its normal size after having been in full screen mode
 *
 *     myPlayer.exitFullscreen();
 *
 * @return {vjs.Player} self
 */
vjs.Player.prototype.exitFullscreen = function(){
  var fsApi = vjs.browser.fullscreenAPI;
  this.isFullscreen(false);

  // Check for browser element fullscreen support
  if (fsApi) {
    document[fsApi.exitFullscreen]();
  } else if (this.tech.supportsFullScreen()) {
   this.techCall('exitFullScreen');
  } else {
   this.exitFullWindow();
   this.trigger('fullscreenchange');
  }

  return this;
};

/**
 * Old naming for exitFullscreen
 * @deprecated for exitFullscreen
 */
vjs.Player.prototype.cancelFullScreen = function(){
  vjs.log.warn('player.cancelFullScreen() has been deprecated, use player.exitFullscreen()');
  return this.exitFullscreen();
};

// When fullscreen isn't supported we can stretch the video container to as wide as the browser will let us.
vjs.Player.prototype.enterFullWindow = function(){
  this.isFullWindow = true;

  // Storing original doc overflow value to return to when fullscreen is off
  this.docOrigOverflow = document.documentElement.style.overflow;

  // Add listener for esc key to exit fullscreen
  vjs.on(document, 'keydown', vjs.bind(this, this.fullWindowOnEscKey));

  // Hide any scroll bars
  document.documentElement.style.overflow = 'hidden';

  // Apply fullscreen styles
  vjs.addClass(document.body, 'vjs-full-window');

  this.trigger('enterFullWindow');
};
vjs.Player.prototype.fullWindowOnEscKey = function(event){
  if (event.keyCode === 27) {
    if (this.isFullscreen() === true) {
      this.exitFullscreen();
    } else {
      this.exitFullWindow();
    }
  }
};

vjs.Player.prototype.exitFullWindow = function(){
  this.isFullWindow = false;
  vjs.off(document, 'keydown', this.fullWindowOnEscKey);

  // Unhide scroll bars.
  document.documentElement.style.overflow = this.docOrigOverflow;

  // Remove fullscreen styles
  vjs.removeClass(document.body, 'vjs-full-window');

  // Resize the box, controller, and poster to original sizes
  // this.positionAll();
  this.trigger('exitFullWindow');
};

vjs.Player.prototype.selectSource = function(sources){
  // Loop through each playback technology in the options order
  for (var i=0,j=this.options_['techOrder'];i<j.length;i++) {
    var techName = vjs.capitalize(j[i]),
        tech = window['videojs'][techName];

    // Check if the current tech is defined before continuing
    if (!tech) {
      vjs.log.error('The "' + techName + '" tech is undefined. Skipped browser support check for that tech.');
      continue;
    }

    // Check if the browser supports this technology
    if (tech.isSupported()) {
      // Loop through each source object
      for (var a=0,b=sources;a<b.length;a++) {
        var source = b[a];

        // Check if source can be played with this technology
        if (tech['canPlaySource'](source)) {
          return { source: source, tech: techName };
        }
      }
    }
  }

  return false;
};

/**
 * The source function updates the video source
 *
 * There are three types of variables you can pass as the argument.
 *
 * **URL String**: A URL to the the video file. Use this method if you are sure
 * the current playback technology (HTML5/Flash) can support the source you
 * provide. Currently only MP4 files can be used in both HTML5 and Flash.
 *
 *     myPlayer.src("http://www.example.com/path/to/video.mp4");
 *
 * **Source Object (or element):** A javascript object containing information
 * about the source file. Use this method if you want the player to determine if
 * it can support the file using the type information.
 *
 *     myPlayer.src({ type: "video/mp4", src: "http://www.example.com/path/to/video.mp4" });
 *
 * **Array of Source Objects:** To provide multiple versions of the source so
 * that it can be played using HTML5 across browsers you can use an array of
 * source objects. Video.js will detect which version is supported and load that
 * file.
 *
 *     myPlayer.src([
 *       { type: "video/mp4", src: "http://www.example.com/path/to/video.mp4" },
 *       { type: "video/webm", src: "http://www.example.com/path/to/video.webm" },
 *       { type: "video/ogg", src: "http://www.example.com/path/to/video.ogv" }
 *     ]);
 *
 * @param  {String|Object|Array=} source The source URL, object, or array of sources
 * @return {String} The current video source when getting
 * @return {String} The player when setting
 */
vjs.Player.prototype.src = function(source){
  if (source === undefined) {
    return this.techGet('src');
  }

  // case: Array of source objects to choose from and pick the best to play
  if (vjs.obj.isArray(source)) {
    this.sourceList_(source);

  // case: URL String (http://myvideo...)
  } else if (typeof source === 'string') {
    // create a source object from the string
    this.src({ src: source });

  // case: Source object { src: '', type: '' ... }
  } else if (source instanceof Object) {
    // check if the source has a type and the loaded tech cannot play the source
    // if there's no type we'll just try the current tech
    if (source.type && !window['videojs'][this.techName]['canPlaySource'](source)) {
      // create a source list with the current source and send through
      // the tech loop to check for a compatible technology
      this.sourceList_([source]);
    } else {
      this.cache_.src = source.src;
      this.currentType_ = source.type || '';

      // wait until the tech is ready to set the source
      this.ready(function(){

        // The setSource tech method was added with source handlers
        // so older techs won't support it
        // We need to check the direct prototype for the case where subclasses
        // of the tech do not support source handlers
        if (window['videojs'][this.techName].prototype.hasOwnProperty('setSource')) {
          this.techCall('setSource', source);
        } else {
          this.techCall('src', source.src);
        }

        if (this.options_['preload'] == 'auto') {
          this.load();
        }

        if (this.options_['autoplay']) {
          this.play();
        }
      });
    }
  }

  return this;
};

/**
 * Handle an array of source objects
 * @param  {[type]} sources Array of source objects
 * @private
 */
vjs.Player.prototype.sourceList_ = function(sources){
  var sourceTech = this.selectSource(sources);

  if (sourceTech) {
    if (sourceTech.tech === this.techName) {
      // if this technology is already loaded, set the source
      this.src(sourceTech.source);
    } else {
      // load this technology with the chosen source
      this.loadTech(sourceTech.tech, sourceTech.source);
    }
  } else {
    // We need to wrap this in a timeout to give folks a chance to add error event handlers
    this.setTimeout( function() {
      this.error({ code: 4, message: this.localize(this.options()['notSupportedMessage']) });
    }, 0);

    // we could not find an appropriate tech, but let's still notify the delegate that this is it
    // this needs a better comment about why this is needed
    this.triggerReady();
  }
};

/**
 * Begin loading the src data.
 * @return {vjs.Player} Returns the player
 */
vjs.Player.prototype.load = function(){
  this.techCall('load');
  return this;
};

/**
 * Returns the fully qualified URL of the current source value e.g. http://mysite.com/video.mp4
 * Can be used in conjuction with `currentType` to assist in rebuilding the current source object.
 * @return {String} The current source
 */
vjs.Player.prototype.currentSrc = function(){
  return this.techGet('currentSrc') || this.cache_.src || '';
};

/**
 * Get the current source type e.g. video/mp4
 * This can allow you rebuild the current source object so that you could load the same
 * source and tech later
 * @return {String} The source MIME type
 */
vjs.Player.prototype.currentType = function(){
    return this.currentType_ || '';
};

/**
 * Get or set the preload attribute.
 * @return {String} The preload attribute value when getting
 * @return {vjs.Player} Returns the player when setting
 */
vjs.Player.prototype.preload = function(value){
  if (value !== undefined) {
    this.techCall('setPreload', value);
    this.options_['preload'] = value;
    return this;
  }
  return this.techGet('preload');
};

/**
 * Get or set the autoplay attribute.
 * @return {String} The autoplay attribute value when getting
 * @return {vjs.Player} Returns the player when setting
 */
vjs.Player.prototype.autoplay = function(value){
  if (value !== undefined) {
    this.techCall('setAutoplay', value);
    this.options_['autoplay'] = value;
    return this;
  }
  return this.techGet('autoplay', value);
};

/**
 * Get or set the loop attribute on the video element.
 * @return {String} The loop attribute value when getting
 * @return {vjs.Player} Returns the player when setting
 */
vjs.Player.prototype.loop = function(value){
  if (value !== undefined) {
    this.techCall('setLoop', value);
    this.options_['loop'] = value;
    return this;
  }
  return this.techGet('loop');
};

/**
 * the url of the poster image source
 * @type {String}
 * @private
 */
vjs.Player.prototype.poster_;

/**
 * get or set the poster image source url
 *
 * ##### EXAMPLE:
 *
 *     // getting
 *     var currentPoster = myPlayer.poster();
 *
 *     // setting
 *     myPlayer.poster('http://example.com/myImage.jpg');
 *
 * @param  {String=} [src] Poster image source URL
 * @return {String} poster URL when getting
 * @return {vjs.Player} self when setting
 */
vjs.Player.prototype.poster = function(src){
  if (src === undefined) {
    return this.poster_;
  }

  // The correct way to remove a poster is to set as an empty string
  // other falsey values will throw errors
  if (!src) {
    src = '';
  }

  // update the internal poster variable
  this.poster_ = src;

  // update the tech's poster
  this.techCall('setPoster', src);

  // alert components that the poster has been set
  this.trigger('posterchange');

  return this;
};

/**
 * Whether or not the controls are showing
 * @type {Boolean}
 * @private
 */
vjs.Player.prototype.controls_;

/**
 * Get or set whether or not the controls are showing.
 * @param  {Boolean} controls Set controls to showing or not
 * @return {Boolean}    Controls are showing
 */
vjs.Player.prototype.controls = function(bool){
  if (bool !== undefined) {
    bool = !!bool; // force boolean
    // Don't trigger a change event unless it actually changed
    if (this.controls_ !== bool) {
      this.controls_ = bool;
      if (bool) {
        this.removeClass('vjs-controls-disabled');
        this.addClass('vjs-controls-enabled');
        this.trigger('controlsenabled');
      } else {
        this.removeClass('vjs-controls-enabled');
        this.addClass('vjs-controls-disabled');
        this.trigger('controlsdisabled');
      }
    }
    return this;
  }
  return this.controls_;
};

vjs.Player.prototype.usingNativeControls_;

/**
 * Toggle native controls on/off. Native controls are the controls built into
 * devices (e.g. default iPhone controls), Flash, or other techs
 * (e.g. Vimeo Controls)
 *
 * **This should only be set by the current tech, because only the tech knows
 * if it can support native controls**
 *
 * @param  {Boolean} bool    True signals that native controls are on
 * @return {vjs.Player}      Returns the player
 * @private
 */
vjs.Player.prototype.usingNativeControls = function(bool){
  if (bool !== undefined) {
    bool = !!bool; // force boolean
    // Don't trigger a change event unless it actually changed
    if (this.usingNativeControls_ !== bool) {
      this.usingNativeControls_ = bool;
      if (bool) {
        this.addClass('vjs-using-native-controls');

        /**
         * player is using the native device controls
         *
         * @event usingnativecontrols
         * @memberof vjs.Player
         * @instance
         * @private
         */
        this.trigger('usingnativecontrols');
      } else {
        this.removeClass('vjs-using-native-controls');

        /**
         * player is using the custom HTML controls
         *
         * @event usingcustomcontrols
         * @memberof vjs.Player
         * @instance
         * @private
         */
        this.trigger('usingcustomcontrols');
      }
    }
    return this;
  }
  return this.usingNativeControls_;
};

/**
 * Store the current media error
 * @type {Object}
 * @private
 */
vjs.Player.prototype.error_ = null;

/**
 * Set or get the current MediaError
 * @param  {*} err A MediaError or a String/Number to be turned into a MediaError
 * @return {vjs.MediaError|null}     when getting
 * @return {vjs.Player}              when setting
 */
vjs.Player.prototype.error = function(err){
  if (err === undefined) {
    return this.error_;
  }

  // restoring to default
  if (err === null) {
    this.error_ = err;
    this.removeClass('vjs-error');
    return this;
  }

  // error instance
  if (err instanceof vjs.MediaError) {
    this.error_ = err;
  } else {
    this.error_ = new vjs.MediaError(err);
  }

  // fire an error event on the player
  this.trigger('error');

  // add the vjs-error classname to the player
  this.addClass('vjs-error');

  // log the name of the error type and any message
  // ie8 just logs "[object object]" if you just log the error object
  vjs.log.error('(CODE:'+this.error_.code+' '+vjs.MediaError.errorTypes[this.error_.code]+')', this.error_.message, this.error_);

  return this;
};

/**
 * Returns whether or not the player is in the "ended" state.
 * @return {Boolean} True if the player is in the ended state, false if not.
 */
vjs.Player.prototype.ended = function(){ return this.techGet('ended'); };

/**
 * Returns whether or not the player is in the "seeking" state.
 * @return {Boolean} True if the player is in the seeking state, false if not.
 */
vjs.Player.prototype.seeking = function(){ return this.techGet('seeking'); };

/**
 * Returns the TimeRanges of the media that are currently available
 * for seeking to.
 * @return {TimeRanges} the seekable intervals of the media timeline
 */
vjs.Player.prototype.seekable = function(){ return this.techGet('seekable'); };

// When the player is first initialized, trigger activity so components
// like the control bar show themselves if needed
vjs.Player.prototype.userActivity_ = true;
vjs.Player.prototype.reportUserActivity = function(event){
  this.userActivity_ = true;
};

vjs.Player.prototype.userActive_ = true;
vjs.Player.prototype.userActive = function(bool){
  if (bool !== undefined) {
    bool = !!bool;
    if (bool !== this.userActive_) {
      this.userActive_ = bool;
      if (bool) {
        // If the user was inactive and is now active we want to reset the
        // inactivity timer
        this.userActivity_ = true;
        this.removeClass('vjs-user-inactive');
        this.addClass('vjs-user-active');
        this.trigger('useractive');
      } else {
        // We're switching the state to inactive manually, so erase any other
        // activity
        this.userActivity_ = false;

        // Chrome/Safari/IE have bugs where when you change the cursor it can
        // trigger a mousemove event. This causes an issue when you're hiding
        // the cursor when the user is inactive, and a mousemove signals user
        // activity. Making it impossible to go into inactive mode. Specifically
        // this happens in fullscreen when we really need to hide the cursor.
        //
        // When this gets resolved in ALL browsers it can be removed
        // https://code.google.com/p/chromium/issues/detail?id=103041
        if(this.tech) {
          this.tech.one('mousemove', function(e){
            e.stopPropagation();
            e.preventDefault();
          });
        }

        this.removeClass('vjs-user-active');
        this.addClass('vjs-user-inactive');
        this.trigger('userinactive');
      }
    }
    return this;
  }
  return this.userActive_;
};

vjs.Player.prototype.listenForUserActivity = function(){
  var onActivity, onMouseMove, onMouseDown, mouseInProgress, onMouseUp,
      activityCheck, inactivityTimeout, lastMoveX, lastMoveY;

  onActivity = vjs.bind(this, this.reportUserActivity);

  onMouseMove = function(e) {
    // #1068 - Prevent mousemove spamming
    // Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=366970
    if(e.screenX != lastMoveX || e.screenY != lastMoveY) {
      lastMoveX = e.screenX;
      lastMoveY = e.screenY;
      onActivity();
    }
  };

  onMouseDown = function() {
    onActivity();
    // For as long as the they are touching the device or have their mouse down,
    // we consider them active even if they're not moving their finger or mouse.
    // So we want to continue to update that they are active
    this.clearInterval(mouseInProgress);
    // Setting userActivity=true now and setting the interval to the same time
    // as the activityCheck interval (250) should ensure we never miss the
    // next activityCheck
    mouseInProgress = this.setInterval(onActivity, 250);
  };

  onMouseUp = function(event) {
    onActivity();
    // Stop the interval that maintains activity if the mouse/touch is down
    this.clearInterval(mouseInProgress);
  };

  // Any mouse movement will be considered user activity
  this.on('mousedown', onMouseDown);
  this.on('mousemove', onMouseMove);
  this.on('mouseup', onMouseUp);

  // Listen for keyboard navigation
  // Shouldn't need to use inProgress interval because of key repeat
  this.on('keydown', onActivity);
  this.on('keyup', onActivity);

  // Run an interval every 250 milliseconds instead of stuffing everything into
  // the mousemove/touchmove function itself, to prevent performance degradation.
  // `this.reportUserActivity` simply sets this.userActivity_ to true, which
  // then gets picked up by this loop
  // http://ejohn.org/blog/learning-from-twitter/
  activityCheck = this.setInterval(function() {
    // Check to see if mouse/touch activity has happened
    if (this.userActivity_) {
      // Reset the activity tracker
      this.userActivity_ = false;

      // If the user state was inactive, set the state to active
      this.userActive(true);

      // Clear any existing inactivity timeout to start the timer over
      this.clearTimeout(inactivityTimeout);

      var timeout = this.options()['inactivityTimeout'];
      if (timeout > 0) {
          // In <timeout> milliseconds, if no more activity has occurred the
          // user will be considered inactive
          inactivityTimeout = this.setTimeout(function () {
              // Protect against the case where the inactivityTimeout can trigger just
              // before the next user activity is picked up by the activityCheck loop
              // causing a flicker
              if (!this.userActivity_) {
                  this.userActive(false);
              }
          }, timeout);
      }
    }
  }, 250);
};

/**
 * Gets or sets the current playback rate.
 * @param  {Boolean} rate   New playback rate to set.
 * @return {Number}         Returns the new playback rate when setting
 * @return {Number}         Returns the current playback rate when getting
 */
vjs.Player.prototype.playbackRate = function(rate) {
  if (rate !== undefined) {
    this.techCall('setPlaybackRate', rate);
    return this;
  }

  if (this.tech && this.tech['featuresPlaybackRate']) {
    return this.techGet('playbackRate');
  } else {
    return 1.0;
  }

};

/**
 * Store the current audio state
 * @type {Boolean}
 * @private
 */
vjs.Player.prototype.isAudio_ = false;

/**
 * Gets or sets the audio flag
 *
 * @param  {Boolean} bool    True signals that this is an audio player.
 * @return {Boolean}         Returns true if player is audio, false if not when getting
 * @return {vjs.Player}      Returns the player if setting
 * @private
 */
vjs.Player.prototype.isAudio = function(bool) {
  if (bool !== undefined) {
    this.isAudio_ = !!bool;
    return this;
  }

  return this.isAudio_;
};

/**
 * Returns the current state of network activity for the element, from
 * the codes in the list below.
 * - NETWORK_EMPTY (numeric value 0)
 *   The element has not yet been initialised. All attributes are in
 *   their initial states.
 * - NETWORK_IDLE (numeric value 1)
 *   The element's resource selection algorithm is active and has
 *   selected a resource, but it is not actually using the network at
 *   this time.
 * - NETWORK_LOADING (numeric value 2)
 *   The user agent is actively trying to download data.
 * - NETWORK_NO_SOURCE (numeric value 3)
 *   The element's resource selection algorithm is active, but it has
 *   not yet found a resource to use.
 * @return {Number} the current network activity state
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#network-states
 */
vjs.Player.prototype.networkState = function(){
  return this.techGet('networkState');
};

/**
 * Returns a value that expresses the current state of the element
 * with respect to rendering the current playback position, from the
 * codes in the list below.
 * - HAVE_NOTHING (numeric value 0)
 *   No information regarding the media resource is available.
 * - HAVE_METADATA (numeric value 1)
 *   Enough of the resource has been obtained that the duration of the
 *   resource is available.
 * - HAVE_CURRENT_DATA (numeric value 2)
 *   Data for the immediate current playback position is available.
 * - HAVE_FUTURE_DATA (numeric value 3)
 *   Data for the immediate current playback position is available, as
 *   well as enough data for the user agent to advance the current
 *   playback position in the direction of playback.
 * - HAVE_ENOUGH_DATA (numeric value 4)
 *   The user agent estimates that enough data is available for
 *   playback to proceed uninterrupted.
 * @return {Number} the current playback rendering state
 * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-media-readystate
 */
vjs.Player.prototype.readyState = function(){
  return this.techGet('readyState');
};

/**
 * Text tracks are tracks of timed text events.
 * Captions - text displayed over the video for the hearing impaired
 * Subtitles - text displayed over the video for those who don't understand language in the video
 * Chapters - text displayed in a menu allowing the user to jump to particular points (chapters) in the video
 * Descriptions (not supported yet) - audio descriptions that are read back to the user by a screen reading device
 */

/**
 * Get an array of associated text tracks. captions, subtitles, chapters, descriptions
 * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-texttracks
 * @return {Array}           Array of track objects
 */
vjs.Player.prototype.textTracks = function(){
  // cannot use techGet directly because it checks to see whether the tech is ready.
  // Flash is unlikely to be ready in time but textTracks should still work.
  return this.tech && this.tech['textTracks']();
};

vjs.Player.prototype.remoteTextTracks = function() {
  return this.tech && this.tech['remoteTextTracks']();
};

/**
 * Add a text track
 * In addition to the W3C settings we allow adding additional info through options.
 * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-addtexttrack
 * @param {String}  kind        Captions, subtitles, chapters, descriptions, or metadata
 * @param {String=} label       Optional label
 * @param {String=} language    Optional language
 */
vjs.Player.prototype.addTextTrack = function(kind, label, language) {
  return this.tech && this.tech['addTextTrack'](kind, label, language);
};

vjs.Player.prototype.addRemoteTextTrack = function(options) {
  return this.tech && this.tech['addRemoteTextTrack'](options);
};

vjs.Player.prototype.removeRemoteTextTrack = function(track) {
  this.tech && this.tech['removeRemoteTextTrack'](track);
};

// Methods to add support for
// initialTime: function(){ return this.techCall('initialTime'); },
// startOffsetTime: function(){ return this.techCall('startOffsetTime'); },
// played: function(){ return this.techCall('played'); },
// seekable: function(){ return this.techCall('seekable'); },
// videoTracks: function(){ return this.techCall('videoTracks'); },
// audioTracks: function(){ return this.techCall('audioTracks'); },
// videoWidth: function(){ return this.techCall('videoWidth'); },
// videoHeight: function(){ return this.techCall('videoHeight'); },
// defaultPlaybackRate: function(){ return this.techCall('defaultPlaybackRate'); },
// mediaGroup: function(){ return this.techCall('mediaGroup'); },
// controller: function(){ return this.techCall('controller'); },
// defaultMuted: function(){ return this.techCall('defaultMuted'); }

// TODO
// currentSrcList: the array of sources including other formats and bitrates
// playList: array of source lists in order of playback
/**
 * Container of main controls
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 * @extends vjs.Component
 */
vjs.ControlBar = vjs.Component.extend();

vjs.ControlBar.prototype.options_ = {
  loadEvent: 'play',
  children: {
    'playToggle': {},
    'currentTimeDisplay': {},
    'timeDivider': {},
    'durationDisplay': {},
    'remainingTimeDisplay': {},
    'liveDisplay': {},
    'progressControl': {},
    'fullscreenToggle': {},
    'volumeControl': {},
    'muteToggle': {},
    // 'volumeMenuButton': {},
    'playbackRateMenuButton': {},
    'subtitlesButton': {},
    'captionsButton': {},
    'chaptersButton': {}
  }
};

vjs.ControlBar.prototype.createEl = function(){
  return vjs.createEl('div', {
    className: 'vjs-control-bar'
  });
};
/**
 * Displays the live indicator
 * TODO - Future make it click to snap to live
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.LiveDisplay = vjs.Component.extend({
  init: function(player, options){
    vjs.Component.call(this, player, options);
  }
});

vjs.LiveDisplay.prototype.createEl = function(){
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-live-controls vjs-control'
  });

  this.contentEl_ = vjs.createEl('div', {
    className: 'vjs-live-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Stream Type') + '</span>' + this.localize('LIVE'),
    'aria-live': 'off'
  });

  el.appendChild(this.contentEl_);

  return el;
};
/**
 * Button to toggle between play and pause
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.PlayToggle = vjs.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Button.call(this, player, options);

    this.on(player, 'play', this.onPlay);
    this.on(player, 'pause', this.onPause);
  }
});

vjs.PlayToggle.prototype.buttonText = 'Play';

vjs.PlayToggle.prototype.buildCSSClass = function(){
  return 'vjs-play-control ' + vjs.Button.prototype.buildCSSClass.call(this);
};

// OnClick - Toggle between play and pause
vjs.PlayToggle.prototype.onClick = function(){
  if (this.player_.paused()) {
    this.player_.play();
  } else {
    this.player_.pause();
  }
};

  // OnPlay - Add the vjs-playing class to the element so it can change appearance
vjs.PlayToggle.prototype.onPlay = function(){
  this.removeClass('vjs-paused');
  this.addClass('vjs-playing');
  this.el_.children[0].children[0].innerHTML = this.localize('Pause'); // change the button text to "Pause"
};

  // OnPause - Add the vjs-paused class to the element so it can change appearance
vjs.PlayToggle.prototype.onPause = function(){
  this.removeClass('vjs-playing');
  this.addClass('vjs-paused');
  this.el_.children[0].children[0].innerHTML = this.localize('Play'); // change the button text to "Play"
};
/**
 * Displays the current time
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.CurrentTimeDisplay = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    this.on(player, 'timeupdate', this.updateContent);
  }
});

vjs.CurrentTimeDisplay.prototype.createEl = function(){
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-current-time vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs.createEl('div', {
    className: 'vjs-current-time-display',
    innerHTML: '<span class="vjs-control-text">Current Time </span>' + '0:00', // label the current time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs.CurrentTimeDisplay.prototype.updateContent = function(){
  // Allows for smooth scrubbing, when player can't keep up.
  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Current Time') + '</span> ' + vjs.formatTime(time, this.player_.duration());
};

/**
 * Displays the duration
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.DurationDisplay = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    // this might need to be changed to 'durationchange' instead of 'timeupdate' eventually,
    // however the durationchange event fires before this.player_.duration() is set,
    // so the value cannot be written out using this method.
    // Once the order of durationchange and this.player_.duration() being set is figured out,
    // this can be updated.
    this.on(player, 'timeupdate', this.updateContent);
    this.on(player, 'loadedmetadata', this.updateContent);
  }
});

vjs.DurationDisplay.prototype.createEl = function(){
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-duration vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs.createEl('div', {
    className: 'vjs-duration-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + '0:00', // label the duration time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs.DurationDisplay.prototype.updateContent = function(){
  var duration = this.player_.duration();
  if (duration) {
      this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + vjs.formatTime(duration); // label the duration time for screen reader users
  }
};

/**
 * The separator between the current time and duration
 *
 * Can be hidden if it's not needed in the design.
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.TimeDivider = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);
  }
});

vjs.TimeDivider.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-time-divider',
    innerHTML: '<div><span>/</span></div>'
  });
};

/**
 * Displays the time left in the video
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.RemainingTimeDisplay = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    this.on(player, 'timeupdate', this.updateContent);
  }
});

vjs.RemainingTimeDisplay.prototype.createEl = function(){
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-remaining-time vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs.createEl('div', {
    className: 'vjs-remaining-time-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-0:00', // label the remaining time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs.RemainingTimeDisplay.prototype.updateContent = function(){
  if (this.player_.duration()) {
    this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-'+ vjs.formatTime(this.player_.remainingTime());
  }

  // Allows for smooth scrubbing, when player can't keep up.
  // var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  // this.contentEl_.innerHTML = vjs.formatTime(time, this.player_.duration());
};
/**
 * Toggle fullscreen video
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @extends vjs.Button
 */
vjs.FullscreenToggle = vjs.Button.extend({
  /**
   * @constructor
   * @memberof vjs.FullscreenToggle
   * @instance
   */
  init: function(player, options){
    vjs.Button.call(this, player, options);
  }
});

vjs.FullscreenToggle.prototype.buttonText = 'Fullscreen';

vjs.FullscreenToggle.prototype.buildCSSClass = function(){
  return 'vjs-fullscreen-control ' + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.FullscreenToggle.prototype.onClick = function(){
  if (!this.player_.isFullscreen()) {
    this.player_.requestFullscreen();
    this.controlText_.innerHTML = this.localize('Non-Fullscreen');
  } else {
    this.player_.exitFullscreen();
    this.controlText_.innerHTML = this.localize('Fullscreen');
  }
};
/**
 * The Progress Control component contains the seek bar, load progress,
 * and play progress
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.ProgressControl = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);
  }
});

vjs.ProgressControl.prototype.options_ = {
  children: {
    'seekBar': {}
  }
};

vjs.ProgressControl.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-progress-control vjs-control'
  });
};

/**
 * Seek Bar and holder for the progress bars
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SeekBar = vjs.Slider.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Slider.call(this, player, options);
    this.on(player, 'timeupdate', this.updateARIAAttributes);
    player.ready(vjs.bind(this, this.updateARIAAttributes));
  }
});

vjs.SeekBar.prototype.options_ = {
  children: {
    'loadProgressBar': {},
    'playProgressBar': {},
    'seekHandle': {}
  },
  'barName': 'playProgressBar',
  'handleName': 'seekHandle'
};

vjs.SeekBar.prototype.playerEvent = 'timeupdate';

vjs.SeekBar.prototype.createEl = function(){
  return vjs.Slider.prototype.createEl.call(this, 'div', {
    className: 'vjs-progress-holder',
    'aria-label': 'video progress bar'
  });
};

vjs.SeekBar.prototype.updateARIAAttributes = function(){
    // Allows for smooth scrubbing, when player can't keep up.
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.el_.setAttribute('aria-valuenow',vjs.round(this.getPercent()*100, 2)); // machine readable value of progress bar (percentage complete)
    this.el_.setAttribute('aria-valuetext',vjs.formatTime(time, this.player_.duration())); // human readable value of progress bar (time complete)
};

vjs.SeekBar.prototype.getPercent = function(){
  return this.player_.currentTime() / this.player_.duration();
};

vjs.SeekBar.prototype.onMouseDown = function(event){
  vjs.Slider.prototype.onMouseDown.call(this, event);

  this.player_.scrubbing = true;
  this.player_.addClass('vjs-scrubbing');

  this.videoWasPlaying = !this.player_.paused();
  this.player_.pause();
};

vjs.SeekBar.prototype.onMouseMove = function(event){
  var newTime = this.calculateDistance(event) * this.player_.duration();

  // Don't let video end while scrubbing.
  if (newTime == this.player_.duration()) { newTime = newTime - 0.1; }

  // Set new time (tell player to seek to new time)
  this.player_.currentTime(newTime);
};

vjs.SeekBar.prototype.onMouseUp = function(event){
  vjs.Slider.prototype.onMouseUp.call(this, event);

  this.player_.scrubbing = false;
  this.player_.removeClass('vjs-scrubbing');
  if (this.videoWasPlaying) {
    this.player_.play();
  }
};

vjs.SeekBar.prototype.stepForward = function(){
  this.player_.currentTime(this.player_.currentTime() + 5); // more quickly fast forward for keyboard-only users
};

vjs.SeekBar.prototype.stepBack = function(){
  this.player_.currentTime(this.player_.currentTime() - 5); // more quickly rewind for keyboard-only users
};

/**
 * Shows load progress
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.LoadProgressBar = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);
    this.on(player, 'progress', this.update);
  }
});

vjs.LoadProgressBar.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-load-progress',
    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Loaded') + '</span>: 0%</span>'
  });
};

vjs.LoadProgressBar.prototype.update = function(){
  var i, start, end, part,
      buffered = this.player_.buffered(),
      duration = this.player_.duration(),
      bufferedEnd = this.player_.bufferedEnd(),
      children = this.el_.children,
      // get the percent width of a time compared to the total end
      percentify = function (time, end){
        var percent = (time / end) || 0; // no NaN
        return (percent * 100) + '%';
      };

  // update the width of the progress bar
  this.el_.style.width = percentify(bufferedEnd, duration);

  // add child elements to represent the individual buffered time ranges
  for (i = 0; i < buffered.length; i++) {
    start = buffered.start(i),
    end = buffered.end(i),
    part = children[i];

    if (!part) {
      part = this.el_.appendChild(vjs.createEl());
    }

    // set the percent based on the width of the progress bar (bufferedEnd)
    part.style.left = percentify(start, bufferedEnd);
    part.style.width = percentify(end - start, bufferedEnd);
  }

  // remove unused buffered range elements
  for (i = children.length; i > buffered.length; i--) {
    this.el_.removeChild(children[i-1]);
  }
};

/**
 * Shows play progress
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.PlayProgressBar = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);
  }
});

vjs.PlayProgressBar.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-play-progress',
    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Progress') + '</span>: 0%</span>'
  });
};

/**
 * The Seek Handle shows the current position of the playhead during playback,
 * and can be dragged to adjust the playhead.
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SeekHandle = vjs.SliderHandle.extend({
  init: function(player, options) {
    vjs.SliderHandle.call(this, player, options);
    this.on(player, 'timeupdate', this.updateContent);
  }
});

/**
 * The default value for the handle content, which may be read by screen readers
 *
 * @type {String}
 * @private
 */
vjs.SeekHandle.prototype.defaultValue = '00:00';

/** @inheritDoc */
vjs.SeekHandle.prototype.createEl = function() {
  return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
    className: 'vjs-seek-handle',
    'aria-live': 'off'
  });
};

vjs.SeekHandle.prototype.updateContent = function() {
  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  this.el_.innerHTML = '<span class="vjs-control-text">' + vjs.formatTime(time, this.player_.duration()) + '</span>';
};
/**
 * The component for controlling the volume level
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.VolumeControl = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    // hide volume controls when they're not supported by the current tech
    if (player.tech && player.tech['featuresVolumeControl'] === false) {
      this.addClass('vjs-hidden');
    }
    this.on(player, 'loadstart', function(){
      if (player.tech['featuresVolumeControl'] === false) {
        this.addClass('vjs-hidden');
      } else {
        this.removeClass('vjs-hidden');
      }
    });
  }
});

vjs.VolumeControl.prototype.options_ = {
  children: {
    'volumeBar': {}
  }
};

vjs.VolumeControl.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-control vjs-control'
  });
};

/**
 * The bar that contains the volume level and can be clicked on to adjust the level
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.VolumeBar = vjs.Slider.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Slider.call(this, player, options);
    this.on(player, 'volumechange', this.updateARIAAttributes);
    player.ready(vjs.bind(this, this.updateARIAAttributes));
  }
});

vjs.VolumeBar.prototype.updateARIAAttributes = function(){
  // Current value of volume bar as a percentage
  this.el_.setAttribute('aria-valuenow',vjs.round(this.player_.volume()*100, 2));
  this.el_.setAttribute('aria-valuetext',vjs.round(this.player_.volume()*100, 2)+'%');
};

vjs.VolumeBar.prototype.options_ = {
  children: {
    'volumeLevel': {},
    'volumeHandle': {}
  },
  'barName': 'volumeLevel',
  'handleName': 'volumeHandle'
};

vjs.VolumeBar.prototype.playerEvent = 'volumechange';

vjs.VolumeBar.prototype.createEl = function(){
  return vjs.Slider.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-bar',
    'aria-label': 'volume level'
  });
};

vjs.VolumeBar.prototype.onMouseMove = function(event) {
  if (this.player_.muted()) {
    this.player_.muted(false);
  }

  this.player_.volume(this.calculateDistance(event));
};

vjs.VolumeBar.prototype.getPercent = function(){
  if (this.player_.muted()) {
    return 0;
  } else {
    return this.player_.volume();
  }
};

vjs.VolumeBar.prototype.stepForward = function(){
  this.player_.volume(this.player_.volume() + 0.1);
};

vjs.VolumeBar.prototype.stepBack = function(){
  this.player_.volume(this.player_.volume() - 0.1);
};

/**
 * Shows volume level
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.VolumeLevel = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);
  }
});

vjs.VolumeLevel.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-level',
    innerHTML: '<span class="vjs-control-text"></span>'
  });
};

/**
 * The volume handle can be dragged to adjust the volume level
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
 vjs.VolumeHandle = vjs.SliderHandle.extend();

 vjs.VolumeHandle.prototype.defaultValue = '00:00';

 /** @inheritDoc */
 vjs.VolumeHandle.prototype.createEl = function(){
   return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
     className: 'vjs-volume-handle'
   });
 };
/**
 * A button component for muting the audio
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.MuteToggle = vjs.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Button.call(this, player, options);

    this.on(player, 'volumechange', this.update);

    // hide mute toggle if the current tech doesn't support volume control
    if (player.tech && player.tech['featuresVolumeControl'] === false) {
      this.addClass('vjs-hidden');
    }

    this.on(player, 'loadstart', function(){
      if (player.tech['featuresVolumeControl'] === false) {
        this.addClass('vjs-hidden');
      } else {
        this.removeClass('vjs-hidden');
      }
    });
  }
});

vjs.MuteToggle.prototype.createEl = function(){
  return vjs.Button.prototype.createEl.call(this, 'div', {
    className: 'vjs-mute-control vjs-control',
    innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
  });
};

vjs.MuteToggle.prototype.onClick = function(){
  this.player_.muted( this.player_.muted() ? false : true );
};

vjs.MuteToggle.prototype.update = function(){
  var vol = this.player_.volume(),
      level = 3;

  if (vol === 0 || this.player_.muted()) {
    level = 0;
  } else if (vol < 0.33) {
    level = 1;
  } else if (vol < 0.67) {
    level = 2;
  }

  // Don't rewrite the button text if the actual text doesn't change.
  // This causes unnecessary and confusing information for screen reader users.
  // This check is needed because this function gets called every time the volume level is changed.
  if(this.player_.muted()){
      if(this.el_.children[0].children[0].innerHTML!=this.localize('Unmute')){
          this.el_.children[0].children[0].innerHTML = this.localize('Unmute'); // change the button text to "Unmute"
      }
  } else {
      if(this.el_.children[0].children[0].innerHTML!=this.localize('Mute')){
          this.el_.children[0].children[0].innerHTML = this.localize('Mute'); // change the button text to "Mute"
      }
  }

  /* TODO improve muted icon classes */
  for (var i = 0; i < 4; i++) {
    vjs.removeClass(this.el_, 'vjs-vol-'+i);
  }
  vjs.addClass(this.el_, 'vjs-vol-'+level);
};
/**
 * Menu button with a popup for showing the volume slider.
 * @constructor
 */
vjs.VolumeMenuButton = vjs.MenuButton.extend({
  /** @constructor */
  init: function(player, options){
    vjs.MenuButton.call(this, player, options);

    // Same listeners as MuteToggle
    this.on(player, 'volumechange', this.volumeUpdate);

    // hide mute toggle if the current tech doesn't support volume control
    if (player.tech && player.tech['featuresVolumeControl'] === false) {
      this.addClass('vjs-hidden');
    }
    this.on(player, 'loadstart', function(){
      if (player.tech['featuresVolumeControl'] === false) {
        this.addClass('vjs-hidden');
      } else {
        this.removeClass('vjs-hidden');
      }
    });
    this.addClass('vjs-menu-button');
  }
});

vjs.VolumeMenuButton.prototype.createMenu = function(){
  var menu = new vjs.Menu(this.player_, {
    contentElType: 'div'
  });
  var vc = new vjs.VolumeBar(this.player_, this.options_['volumeBar']);
  vc.on('focus', function() {
    menu.lockShowing();
  });
  vc.on('blur', function() {
    menu.unlockShowing();
  });
  menu.addChild(vc);
  return menu;
};

vjs.VolumeMenuButton.prototype.onClick = function(){
  vjs.MuteToggle.prototype.onClick.call(this);
  vjs.MenuButton.prototype.onClick.call(this);
};

vjs.VolumeMenuButton.prototype.createEl = function(){
  return vjs.Button.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-menu-button vjs-menu-button vjs-control',
    innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
  });
};
vjs.VolumeMenuButton.prototype.volumeUpdate = vjs.MuteToggle.prototype.update;
/**
 * The component for controlling the playback rate
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.PlaybackRateMenuButton = vjs.MenuButton.extend({
  /** @constructor */
  init: function(player, options){
    vjs.MenuButton.call(this, player, options);

    this.updateVisibility();
    this.updateLabel();

    this.on(player, 'loadstart', this.updateVisibility);
    this.on(player, 'ratechange', this.updateLabel);
  }
});

vjs.PlaybackRateMenuButton.prototype.buttonText = 'Playback Rate';
vjs.PlaybackRateMenuButton.prototype.className = 'vjs-playback-rate';

vjs.PlaybackRateMenuButton.prototype.createEl = function(){
  var el = vjs.MenuButton.prototype.createEl.call(this);

  this.labelEl_ = vjs.createEl('div', {
    className: 'vjs-playback-rate-value',
    innerHTML: 1.0
  });

  el.appendChild(this.labelEl_);

  return el;
};

// Menu creation
vjs.PlaybackRateMenuButton.prototype.createMenu = function(){
  var menu = new vjs.Menu(this.player());
  var rates = this.player().options()['playbackRates'];

  if (rates) {
    for (var i = rates.length - 1; i >= 0; i--) {
      menu.addChild(
        new vjs.PlaybackRateMenuItem(this.player(), { 'rate': rates[i] + 'x'})
        );
    }
  }

  return menu;
};

vjs.PlaybackRateMenuButton.prototype.updateARIAAttributes = function(){
  // Current playback rate
  this.el().setAttribute('aria-valuenow', this.player().playbackRate());
};

vjs.PlaybackRateMenuButton.prototype.onClick = function(){
  // select next rate option
  var currentRate = this.player().playbackRate();
  var rates = this.player().options()['playbackRates'];
  // this will select first one if the last one currently selected
  var newRate = rates[0];
  for (var i = 0; i <rates.length ; i++) {
    if (rates[i] > currentRate) {
      newRate = rates[i];
      break;
    }
  }
  this.player().playbackRate(newRate);
};

vjs.PlaybackRateMenuButton.prototype.playbackRateSupported = function(){
  return this.player().tech
    && this.player().tech['featuresPlaybackRate']
    && this.player().options()['playbackRates']
    && this.player().options()['playbackRates'].length > 0
  ;
};

/**
 * Hide playback rate controls when they're no playback rate options to select
 */
vjs.PlaybackRateMenuButton.prototype.updateVisibility = function(){
  if (this.playbackRateSupported()) {
    this.removeClass('vjs-hidden');
  } else {
    this.addClass('vjs-hidden');
  }
};

/**
 * Update button label when rate changed
 */
vjs.PlaybackRateMenuButton.prototype.updateLabel = function(){
  if (this.playbackRateSupported()) {
    this.labelEl_.innerHTML = this.player().playbackRate() + 'x';
  }
};

/**
 * The specific menu item type for selecting a playback rate
 *
 * @constructor
 */
vjs.PlaybackRateMenuItem = vjs.MenuItem.extend({
  contentElType: 'button',
  /** @constructor */
  init: function(player, options){
    var label = this.label = options['rate'];
    var rate = this.rate = parseFloat(label, 10);

    // Modify options for parent MenuItem class's init.
    options['label'] = label;
    options['selected'] = rate === 1;
    vjs.MenuItem.call(this, player, options);

    this.on(player, 'ratechange', this.update);
  }
});

vjs.PlaybackRateMenuItem.prototype.onClick = function(){
  vjs.MenuItem.prototype.onClick.call(this);
  this.player().playbackRate(this.rate);
};

vjs.PlaybackRateMenuItem.prototype.update = function(){
  this.selected(this.player().playbackRate() == this.rate);
};
/* Poster Image
================================================================================ */
/**
 * The component that handles showing the poster image.
 *
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.PosterImage = vjs.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Button.call(this, player, options);

    this.update();
    player.on('posterchange', vjs.bind(this, this.update));
  }
});

/**
 * Clean up the poster image
 */
vjs.PosterImage.prototype.dispose = function(){
  this.player().off('posterchange', this.update);
  vjs.Button.prototype.dispose.call(this);
};

/**
 * Create the poster image element
 * @return {Element}
 */
vjs.PosterImage.prototype.createEl = function(){
  var el = vjs.createEl('div', {
    className: 'vjs-poster',

    // Don't want poster to be tabbable.
    tabIndex: -1
  });

  // To ensure the poster image resizes while maintaining its original aspect
  // ratio, use a div with `background-size` when available. For browsers that
  // do not support `background-size` (e.g. IE8), fall back on using a regular
  // img element.
  if (!vjs.BACKGROUND_SIZE_SUPPORTED) {
    this.fallbackImg_ = vjs.createEl('img');
    el.appendChild(this.fallbackImg_);
  }

  return el;
};

/**
 * Event handler for updates to the player's poster source
 */
vjs.PosterImage.prototype.update = function(){
  var url = this.player().poster();

  this.setSrc(url);

  // If there's no poster source we should display:none on this component
  // so it's not still clickable or right-clickable
  if (url) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * Set the poster source depending on the display method
 */
vjs.PosterImage.prototype.setSrc = function(url){
  var backgroundImage;

  if (this.fallbackImg_) {
    this.fallbackImg_.src = url;
  } else {
    backgroundImage = '';
    // Any falsey values should stay as an empty string, otherwise
    // this will throw an extra error
    if (url) {
      backgroundImage = 'url("' + url + '")';
    }

    this.el_.style.backgroundImage = backgroundImage;
  }
};

/**
 * Event handler for clicks on the poster image
 */
vjs.PosterImage.prototype.onClick = function(){
  // We don't want a click to trigger playback when controls are disabled
  // but CSS should be hiding the poster to prevent that from happening
  this.player_.play();
};
/* Loading Spinner
================================================================================ */
/**
 * Loading spinner for waiting events
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.LoadingSpinner = vjs.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs.Component.call(this, player, options);

    // MOVING DISPLAY HANDLING TO CSS

    // player.on('canplay', vjs.bind(this, this.hide));
    // player.on('canplaythrough', vjs.bind(this, this.hide));
    // player.on('playing', vjs.bind(this, this.hide));
    // player.on('seeking', vjs.bind(this, this.show));

    // in some browsers seeking does not trigger the 'playing' event,
    // so we also need to trap 'seeked' if we are going to set a
    // 'seeking' event
    // player.on('seeked', vjs.bind(this, this.hide));

    // player.on('ended', vjs.bind(this, this.hide));

    // Not showing spinner on stalled any more. Browsers may stall and then not trigger any events that would remove the spinner.
    // Checked in Chrome 16 and Safari 5.1.2. http://help.videojs.com/discussions/problems/883-why-is-the-download-progress-showing
    // player.on('stalled', vjs.bind(this, this.show));

    // player.on('waiting', vjs.bind(this, this.show));
  }
});

vjs.LoadingSpinner.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-loading-spinner'
  });
};
/* Big Play Button
================================================================================ */
/**
 * Initial play button. Shows before the video has played. The hiding of the
 * big play button is done via CSS and player states.
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs.BigPlayButton = vjs.Button.extend();

vjs.BigPlayButton.prototype.createEl = function(){
  return vjs.Button.prototype.createEl.call(this, 'div', {
    className: 'vjs-big-play-button',
    innerHTML: '<span aria-hidden="true"></span>',
    'aria-label': 'play video'
  });
};

vjs.BigPlayButton.prototype.onClick = function(){
  this.player_.play();
};
/**
 * Display that an error has occurred making the video unplayable
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.ErrorDisplay = vjs.Component.extend({
  init: function(player, options){
    vjs.Component.call(this, player, options);

    this.update();
    this.on(player, 'error', this.update);
  }
});

vjs.ErrorDisplay.prototype.createEl = function(){
  var el = vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-error-display'
  });

  this.contentEl_ = vjs.createEl('div');
  el.appendChild(this.contentEl_);

  return el;
};

vjs.ErrorDisplay.prototype.update = function(){
  if (this.player().error()) {
    this.contentEl_.innerHTML = this.localize(this.player().error().message);
  }
};
(function() {
  var createTrackHelper;
/**
 * @fileoverview Media Technology Controller - Base class for media playback
 * technology controllers like Flash and HTML5
 */

/**
 * Base class for media (HTML5 Video, Flash) controllers
 * @param {vjs.Player|Object} player  Central player instance
 * @param {Object=} options Options object
 * @constructor
 */
vjs.MediaTechController = vjs.Component.extend({
  /** @constructor */
  init: function(player, options, ready){
    options = options || {};
    // we don't want the tech to report user activity automatically.
    // This is done manually in addControlsListeners
    options.reportTouchActivity = false;
    vjs.Component.call(this, player, options, ready);

    // Manually track progress in cases where the browser/flash player doesn't report it.
    if (!this['featuresProgressEvents']) {
      this.manualProgressOn();
    }

    // Manually track timeupdates in cases where the browser/flash player doesn't report it.
    if (!this['featuresTimeupdateEvents']) {
      this.manualTimeUpdatesOn();
    }

    this.initControlsListeners();

    if (!this['featuresNativeTextTracks']) {
      this.emulateTextTracks();
    }

    this.initTextTrackListeners();
  }
});

/**
 * Set up click and touch listeners for the playback element
 * On desktops, a click on the video itself will toggle playback,
 * on a mobile device a click on the video toggles controls.
 * (toggling controls is done by toggling the user state between active and
 * inactive)
 *
 * A tap can signal that a user has become active, or has become inactive
 * e.g. a quick tap on an iPhone movie should reveal the controls. Another
 * quick tap should hide them again (signaling the user is in an inactive
 * viewing state)
 *
 * In addition to this, we still want the user to be considered inactive after
 * a few seconds of inactivity.
 *
 * Note: the only part of iOS interaction we can't mimic with this setup
 * is a touch and hold on the video element counting as activity in order to
 * keep the controls showing, but that shouldn't be an issue. A touch and hold on
 * any controls will still keep the user active
 */
vjs.MediaTechController.prototype.initControlsListeners = function(){
  var player, activateControls;

  player = this.player();

  activateControls = function(){
    if (player.controls() && !player.usingNativeControls()) {
      this.addControlsListeners();
    }
  };

  // Set up event listeners once the tech is ready and has an element to apply
  // listeners to
  this.ready(activateControls);
  this.on(player, 'controlsenabled', activateControls);
  this.on(player, 'controlsdisabled', this.removeControlsListeners);

  // if we're loading the playback object after it has started loading or playing the
  // video (often with autoplay on) then the loadstart event has already fired and we
  // need to fire it manually because many things rely on it.
  // Long term we might consider how we would do this for other events like 'canplay'
  // that may also have fired.
  this.ready(function(){
    if (this.networkState && this.networkState() > 0) {
      this.player().trigger('loadstart');
    }
  });
};

vjs.MediaTechController.prototype.addControlsListeners = function(){
  var userWasActive;

  // Some browsers (Chrome & IE) don't trigger a click on a flash swf, but do
  // trigger mousedown/up.
  // http://stackoverflow.com/questions/1444562/javascript-onclick-event-over-flash-object
  // Any touch events are set to block the mousedown event from happening
  this.on('mousedown', this.onClick);

  // If the controls were hidden we don't want that to change without a tap event
  // so we'll check if the controls were already showing before reporting user
  // activity
  this.on('touchstart', function(event) {
    userWasActive = this.player_.userActive();
  });

  this.on('touchmove', function(event) {
    if (userWasActive){
      this.player().reportUserActivity();
    }
  });

  this.on('touchend', function(event) {
    // Stop the mouse events from also happening
    event.preventDefault();
  });

  // Turn on component tap events
  this.emitTapEvents();

  // The tap listener needs to come after the touchend listener because the tap
  // listener cancels out any reportedUserActivity when setting userActive(false)
  this.on('tap', this.onTap);
};

/**
 * Remove the listeners used for click and tap controls. This is needed for
 * toggling to controls disabled, where a tap/touch should do nothing.
 */
vjs.MediaTechController.prototype.removeControlsListeners = function(){
  // We don't want to just use `this.off()` because there might be other needed
  // listeners added by techs that extend this.
  this.off('tap');
  this.off('touchstart');
  this.off('touchmove');
  this.off('touchleave');
  this.off('touchcancel');
  this.off('touchend');
  this.off('click');
  this.off('mousedown');
};

/**
 * Handle a click on the media element. By default will play/pause the media.
 */
vjs.MediaTechController.prototype.onClick = function(event){
  // We're using mousedown to detect clicks thanks to Flash, but mousedown
  // will also be triggered with right-clicks, so we need to prevent that
  if (event.button !== 0) return;

  // When controls are disabled a click should not toggle playback because
  // the click is considered a control
  if (this.player().controls()) {
    if (this.player().paused()) {
      this.player().play();
    } else {
      this.player().pause();
    }
  }
};

/**
 * Handle a tap on the media element. By default it will toggle the user
 * activity state, which hides and shows the controls.
 */
vjs.MediaTechController.prototype.onTap = function(){
  this.player().userActive(!this.player().userActive());
};

/* Fallbacks for unsupported event types
================================================================================ */
// Manually trigger progress events based on changes to the buffered amount
// Many flash players and older HTML5 browsers don't send progress or progress-like events
vjs.MediaTechController.prototype.manualProgressOn = function(){
  this.manualProgress = true;

  // Trigger progress watching when a source begins loading
  this.trackProgress();
};

vjs.MediaTechController.prototype.manualProgressOff = function(){
  this.manualProgress = false;
  this.stopTrackingProgress();
};

vjs.MediaTechController.prototype.trackProgress = function(){
  this.progressInterval = this.setInterval(function(){
    // Don't trigger unless buffered amount is greater than last time

    var bufferedPercent = this.player().bufferedPercent();

    if (this.bufferedPercent_ != bufferedPercent) {
      this.player().trigger('progress');
    }

    this.bufferedPercent_ = bufferedPercent;

    if (bufferedPercent === 1) {
      this.stopTrackingProgress();
    }
  }, 500);
};
vjs.MediaTechController.prototype.stopTrackingProgress = function(){ this.clearInterval(this.progressInterval); };

/*! Time Tracking -------------------------------------------------------------- */
vjs.MediaTechController.prototype.manualTimeUpdatesOn = function(){
  var player = this.player_;

  this.manualTimeUpdates = true;

  this.on(player, 'play', this.trackCurrentTime);
  this.on(player, 'pause', this.stopTrackingCurrentTime);
  // timeupdate is also called by .currentTime whenever current time is set

  // Watch for native timeupdate event
  this.one('timeupdate', function(){
    // Update known progress support for this playback technology
    this['featuresTimeupdateEvents'] = true;
    // Turn off manual progress tracking
    this.manualTimeUpdatesOff();
  });
};

vjs.MediaTechController.prototype.manualTimeUpdatesOff = function(){
  var player = this.player_;

  this.manualTimeUpdates = false;
  this.stopTrackingCurrentTime();
  this.off(player, 'play', this.trackCurrentTime);
  this.off(player, 'pause', this.stopTrackingCurrentTime);
};

vjs.MediaTechController.prototype.trackCurrentTime = function(){
  if (this.currentTimeInterval) { this.stopTrackingCurrentTime(); }
  this.currentTimeInterval = this.setInterval(function(){
    this.player().trigger('timeupdate');
  }, 250); // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
};

// Turn off play progress tracking (when paused or dragging)
vjs.MediaTechController.prototype.stopTrackingCurrentTime = function(){
  this.clearInterval(this.currentTimeInterval);

  // #1002 - if the video ends right before the next timeupdate would happen,
  // the progress bar won't make it all the way to the end
  this.player().trigger('timeupdate');
};

vjs.MediaTechController.prototype.dispose = function() {
  // Turn off any manual progress or timeupdate tracking
  if (this.manualProgress) { this.manualProgressOff(); }

  if (this.manualTimeUpdates) { this.manualTimeUpdatesOff(); }

  vjs.Component.prototype.dispose.call(this);
};

vjs.MediaTechController.prototype.setCurrentTime = function() {
  // improve the accuracy of manual timeupdates
  if (this.manualTimeUpdates) { this.player().trigger('timeupdate'); }
};

// TODO: Consider looking at moving this into the text track display directly
// https://github.com/videojs/video.js/issues/1863
vjs.MediaTechController.prototype.initTextTrackListeners = function() {
  var player = this.player_,
      tracks,
      textTrackListChanges = function() {
        var textTrackDisplay = player.getChild('textTrackDisplay'),
            controlBar;

        if (textTrackDisplay) {
          textTrackDisplay.updateDisplay();
        }
      };

  tracks = this.textTracks();

  if (!tracks) {
    return;
  }

  tracks.addEventListener('removetrack', textTrackListChanges);
  tracks.addEventListener('addtrack', textTrackListChanges);

  this.on('dispose', vjs.bind(this, function() {
    tracks.removeEventListener('removetrack', textTrackListChanges);
    tracks.removeEventListener('addtrack', textTrackListChanges);
  }));
};

vjs.MediaTechController.prototype.emulateTextTracks = function() {
  var player = this.player_,
      textTracksChanges,
      tracks,
      script;

  if (!window['WebVTT']) {
    script = document.createElement('script');
    script.src = player.options()['vtt.js'] || '../node_modules/vtt.js/dist/vtt.js';
    player.el().appendChild(script);
    window['WebVTT'] = true;
  }

  tracks = this.textTracks();
  if (!tracks) {
    return;
  }

  textTracksChanges = function() {
    var i, track, textTrackDisplay;

    textTrackDisplay = player.getChild('textTrackDisplay'),

    textTrackDisplay.updateDisplay();

    for (i = 0; i < this.length; i++) {
      track = this[i];
      track.removeEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay));
      if (track.mode === 'showing') {
        track.addEventListener('cuechange', vjs.bind(textTrackDisplay, textTrackDisplay.updateDisplay));
      }
    }
  };

  tracks.addEventListener('change', textTracksChanges);

  this.on('dispose', vjs.bind(this, function() {
    tracks.removeEventListener('change', textTracksChanges);
  }));
};

/**
 * Provide default methods for text tracks.
 *
 * Html5 tech overrides these.
 */

/**
 * List of associated text tracks
 * @type {Array}
 * @private
 */
vjs.MediaTechController.prototype.textTracks_;

vjs.MediaTechController.prototype.textTracks = function() {
  this.player_.textTracks_ = this.player_.textTracks_ || new vjs.TextTrackList();
  return this.player_.textTracks_;
};

vjs.MediaTechController.prototype.remoteTextTracks = function() {
  this.player_.remoteTextTracks_ = this.player_.remoteTextTracks_ || new vjs.TextTrackList();
  return this.player_.remoteTextTracks_;
};

createTrackHelper = function(self, kind, label, language, options) {
  var tracks = self.textTracks(),
      track;

  options = options || {};

  options['kind'] = kind;
  if (label) {
    options['label'] = label;
  }
  if (language) {
    options['language'] = language;
  }
  options['player'] = self.player_;

  track = new vjs.TextTrack(options);
  tracks.addTrack_(track);

  return track;
};

vjs.MediaTechController.prototype.addTextTrack = function(kind, label, language) {
  if (!kind) {
    throw new Error('TextTrack kind is required but was not provided');
  }

  return createTrackHelper(this, kind, label, language);
};

vjs.MediaTechController.prototype.addRemoteTextTrack = function(options) {
  var track = createTrackHelper(this, options['kind'], options['label'], options['language'], options);
  this.remoteTextTracks().addTrack_(track);
  return {
    track: track
  };
};

vjs.MediaTechController.prototype.removeRemoteTextTrack = function(track) {
  this.textTracks().removeTrack_(track);
  this.remoteTextTracks().removeTrack_(track);
};

/**
 * Provide a default setPoster method for techs
 *
 * Poster support for techs should be optional, so we don't want techs to
 * break if they don't have a way to set a poster.
 */
vjs.MediaTechController.prototype.setPoster = function(){};

vjs.MediaTechController.prototype['featuresVolumeControl'] = true;

// Resizing plugins using request fullscreen reloads the plugin
vjs.MediaTechController.prototype['featuresFullscreenResize'] = false;
vjs.MediaTechController.prototype['featuresPlaybackRate'] = false;

// Optional events that we can manually mimic with timers
// currently not triggered by video-js-swf
vjs.MediaTechController.prototype['featuresProgressEvents'] = false;
vjs.MediaTechController.prototype['featuresTimeupdateEvents'] = false;

vjs.MediaTechController.prototype['featuresNativeTextTracks'] = false;

/**
 * A functional mixin for techs that want to use the Source Handler pattern.
 *
 * ##### EXAMPLE:
 *
 *   videojs.MediaTechController.withSourceHandlers.call(MyTech);
 *
 */
vjs.MediaTechController.withSourceHandlers = function(Tech){
  /**
   * Register a source handler
   * Source handlers are scripts for handling specific formats.
   * The source handler pattern is used for adaptive formats (HLS, DASH) that
   * manually load video data and feed it into a Source Buffer (Media Source Extensions)
   * @param  {Function} handler  The source handler
   * @param  {Boolean}  first    Register it before any existing handlers
   */
  Tech['registerSourceHandler'] = function(handler, index){
    var handlers = Tech.sourceHandlers;

    if (!handlers) {
      handlers = Tech.sourceHandlers = [];
    }

    if (index === undefined) {
      // add to the end of the list
      index = handlers.length;
    }

    handlers.splice(index, 0, handler);
  };

  /**
   * Return the first source handler that supports the source
   * TODO: Answer question: should 'probably' be prioritized over 'maybe'
   * @param  {Object} source The source object
   * @returns {Object}       The first source handler that supports the source
   * @returns {null}         Null if no source handler is found
   */
  Tech.selectSourceHandler = function(source){
    var handlers = Tech.sourceHandlers || [],
        can;

    for (var i = 0; i < handlers.length; i++) {
      can = handlers[i]['canHandleSource'](source);

      if (can) {
        return handlers[i];
      }
    }

    return null;
  };

  /**
  * Check if the tech can support the given source
  * @param  {Object} srcObj  The source object
  * @return {String}         'probably', 'maybe', or '' (empty string)
  */
  Tech.canPlaySource = function(srcObj){
    var sh = Tech.selectSourceHandler(srcObj);

    if (sh) {
      return sh['canHandleSource'](srcObj);
    }

    return '';
  };

  /**
   * Create a function for setting the source using a source object
   * and source handlers.
   * Should never be called unless a source handler was found.
   * @param {Object} source  A source object with src and type keys
   * @return {vjs.MediaTechController} self
   */
  Tech.prototype.setSource = function(source){
    var sh = Tech.selectSourceHandler(source);

    if (!sh) {
      // Fall back to a native source hander when unsupported sources are
      // deliberately set
      if (Tech['nativeSourceHandler']) {
        sh = Tech['nativeSourceHandler'];
      } else {
        vjs.log.error('No source hander found for the current source.');
      }
    }

    // Dispose any existing source handler
    this.disposeSourceHandler();
    this.off('dispose', this.disposeSourceHandler);

    this.currentSource_ = source;
    this.sourceHandler_ = sh['handleSource'](source, this);
    this.on('dispose', this.disposeSourceHandler);

    return this;
  };

  /**
   * Clean up any existing source handler
   */
  Tech.prototype.disposeSourceHandler = function(){
    if (this.sourceHandler_ && this.sourceHandler_['dispose']) {
      this.sourceHandler_['dispose']();
    }
  };

};

vjs.media = {};

})();
/**
 * @fileoverview HTML5 Media Controller - Wrapper for HTML5 Media API
 */

/**
 * HTML5 Media Controller - Wrapper for HTML5 Media API
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
vjs.Html5 = vjs.MediaTechController.extend({
  /** @constructor */
  init: function(player, options, ready){
    var  nodes, nodesLength, i, node, nodeName, removeNodes;

    if (options['nativeCaptions'] === false || options['nativeTextTracks'] === false) {
      this['featuresNativeTextTracks'] = false;
    }

    vjs.MediaTechController.call(this, player, options, ready);

    this.setupTriggers();

    var source = options['source'];

    // Set the source if one is provided
    // 1) Check if the source is new (if not, we want to keep the original so playback isn't interrupted)
    // 2) Check to see if the network state of the tag was failed at init, and if so, reset the source
    // anyway so the error gets fired.
    if (source && (this.el_.currentSrc !== source.src || (player.tag && player.tag.initNetworkState_ === 3))) {
      this.setSource(source);
    }

    if (this.el_.hasChildNodes()) {

      nodes = this.el_.childNodes;
      nodesLength = nodes.length;
      removeNodes = [];

      while (nodesLength--) {
        node = nodes[nodesLength];
        nodeName = node.nodeName.toLowerCase();
        if (nodeName === 'track') {
          if (!this['featuresNativeTextTracks']) {
            // Empty video tag tracks so the built-in player doesn't use them also.
            // This may not be fast enough to stop HTML5 browsers from reading the tags
            // so we'll need to turn off any default tracks if we're manually doing
            // captions and subtitles. videoElement.textTracks
            removeNodes.push(node);
          } else {
            this.remoteTextTracks().addTrack_(node['track']);
          }
        }
      }

      for (i=0; i<removeNodes.length; i++) {
        this.el_.removeChild(removeNodes[i]);
      }
    }

    // Determine if native controls should be used
    // Our goal should be to get the custom controls on mobile solid everywhere
    // so we can remove this all together. Right now this will block custom
    // controls on touch enabled laptops like the Chrome Pixel
    if (vjs.TOUCH_ENABLED && player.options()['nativeControlsForTouch'] === true) {
      this.useNativeControls();
    }

    // Chrome and Safari both have issues with autoplay.
    // In Safari (5.1.1), when we move the video element into the container div, autoplay doesn't work.
    // In Chrome (15), if you have autoplay + a poster + no controls, the video gets hidden (but audio plays)
    // This fixes both issues. Need to wait for API, so it updates displays correctly
    player.ready(function(){
      if (this.src() && this.tag && this.options_['autoplay'] && this.paused()) {
        delete this.tag['poster']; // Chrome Fix. Fixed in Chrome v16.
        this.play();
      }
    });

    this.triggerReady();
  }
});

vjs.Html5.prototype.dispose = function(){
  vjs.Html5.disposeMediaElement(this.el_);
  vjs.MediaTechController.prototype.dispose.call(this);
};

vjs.Html5.prototype.createEl = function(){
  var player = this.player_,
      track,
      trackEl,
      i,
      // If possible, reuse original tag for HTML5 playback technology element
      el = player.tag,
      attributes,
      newEl,
      clone;

  // Check if this browser supports moving the element into the box.
  // On the iPhone video will break if you move the element,
  // So we have to create a brand new element.
  if (!el || this['movingMediaElementInDOM'] === false) {

    // If the original tag is still there, clone and remove it.
    if (el) {
      clone = el.cloneNode(false);
      vjs.Html5.disposeMediaElement(el);
      el = clone;
      player.tag = null;
    } else {
      el = vjs.createEl('video');

      // determine if native controls should be used
      attributes = videojs.util.mergeOptions({}, player.tagAttributes);
      if (!vjs.TOUCH_ENABLED || player.options()['nativeControlsForTouch'] !== true) {
        delete attributes.controls;
      }

      vjs.setElementAttributes(el,
        vjs.obj.merge(attributes, {
          id:player.id() + '_html5_api',
          'class':'vjs-tech'
        })
      );
    }
    // associate the player with the new tag
    el['player'] = player;

    if (player.options_.tracks) {
      for (i = 0; i < player.options_.tracks.length; i++) {
        track = player.options_.tracks[i];
        trackEl = document.createElement('track');
        trackEl.kind = track.kind;
        trackEl.label = track.label;
        trackEl.srclang = track.srclang;
        trackEl.src = track.src;
        if ('default' in track) {
          trackEl.setAttribute('default', 'default');
        }
        el.appendChild(trackEl);
      }
    }

    vjs.insertFirst(el, player.el());
  }

  // Update specific tag settings, in case they were overridden
  var settingsAttrs = ['autoplay','preload','loop','muted'];
  for (i = settingsAttrs.length - 1; i >= 0; i--) {
    var attr = settingsAttrs[i];
    var overwriteAttrs = {};
    if (typeof player.options_[attr] !== 'undefined') {
      overwriteAttrs[attr] = player.options_[attr];
    }
    vjs.setElementAttributes(el, overwriteAttrs);
  }

  return el;
  // jenniisawesome = true;
};

// Make video events trigger player events
// May seem verbose here, but makes other APIs possible.
// Triggers removed using this.off when disposed
vjs.Html5.prototype.setupTriggers = function(){
  for (var i = vjs.Html5.Events.length - 1; i >= 0; i--) {
    this.on(vjs.Html5.Events[i], this.eventHandler);
  }
};

vjs.Html5.prototype.eventHandler = function(evt){
  // In the case of an error on the video element, set the error prop
  // on the player and let the player handle triggering the event. On
  // some platforms, error events fire that do not cause the error
  // property on the video element to be set. See #1465 for an example.
  if (evt.type == 'error' && this.error()) {
    this.player().error(this.error().code);

  // in some cases we pass the event directly to the player
  } else {
    // No need for media events to bubble up.
    evt.bubbles = false;

    this.player().trigger(evt);
  }
};

vjs.Html5.prototype.useNativeControls = function(){
  var tech, player, controlsOn, controlsOff, cleanUp;

  tech = this;
  player = this.player();

  // If the player controls are enabled turn on the native controls
  tech.setControls(player.controls());

  // Update the native controls when player controls state is updated
  controlsOn = function(){
    tech.setControls(true);
  };
  controlsOff = function(){
    tech.setControls(false);
  };
  player.on('controlsenabled', controlsOn);
  player.on('controlsdisabled', controlsOff);

  // Clean up when not using native controls anymore
  cleanUp = function(){
    player.off('controlsenabled', controlsOn);
    player.off('controlsdisabled', controlsOff);
  };
  tech.on('dispose', cleanUp);
  player.on('usingcustomcontrols', cleanUp);

  // Update the state of the player to using native controls
  player.usingNativeControls(true);
};


vjs.Html5.prototype.play = function(){ this.el_.play(); };
vjs.Html5.prototype.pause = function(){ this.el_.pause(); };
vjs.Html5.prototype.paused = function(){ return this.el_.paused; };

vjs.Html5.prototype.currentTime = function(){ return this.el_.currentTime; };
vjs.Html5.prototype.setCurrentTime = function(seconds){
  try {
    this.el_.currentTime = seconds;
  } catch(e) {
    vjs.log(e, 'Video is not ready. (Video.js)');
    // this.warning(VideoJS.warnings.videoNotReady);
  }
};

vjs.Html5.prototype.duration = function(){ return this.el_.duration || 0; };
vjs.Html5.prototype.buffered = function(){ return this.el_.buffered; };

vjs.Html5.prototype.volume = function(){ return this.el_.volume; };
vjs.Html5.prototype.setVolume = function(percentAsDecimal){ this.el_.volume = percentAsDecimal; };
vjs.Html5.prototype.muted = function(){ return this.el_.muted; };
vjs.Html5.prototype.setMuted = function(muted){ this.el_.muted = muted; };

vjs.Html5.prototype.width = function(){ return this.el_.offsetWidth; };
vjs.Html5.prototype.height = function(){ return this.el_.offsetHeight; };

vjs.Html5.prototype.supportsFullScreen = function(){
  if (typeof this.el_.webkitEnterFullScreen == 'function') {

    // Seems to be broken in Chromium/Chrome && Safari in Leopard
    if (/Android/.test(vjs.USER_AGENT) || !/Chrome|Mac OS X 10.5/.test(vjs.USER_AGENT)) {
      return true;
    }
  }
  return false;
};

vjs.Html5.prototype.enterFullScreen = function(){
  var video = this.el_;

  if ('webkitDisplayingFullscreen' in video) {
    this.one('webkitbeginfullscreen', function() {
      this.player_.isFullscreen(true);

      this.one('webkitendfullscreen', function() {
        this.player_.isFullscreen(false);
        this.player_.trigger('fullscreenchange');
      });

      this.player_.trigger('fullscreenchange');
    });
  }

  if (video.paused && video.networkState <= video.HAVE_METADATA) {
    // attempt to prime the video element for programmatic access
    // this isn't necessary on the desktop but shouldn't hurt
    this.el_.play();

    // playing and pausing synchronously during the transition to fullscreen
    // can get iOS ~6.1 devices into a play/pause loop
    this.setTimeout(function(){
      video.pause();
      video.webkitEnterFullScreen();
    }, 0);
  } else {
    video.webkitEnterFullScreen();
  }
};

vjs.Html5.prototype.exitFullScreen = function(){
  this.el_.webkitExitFullScreen();
};

// Checks to see if the element's reported URI (either from `el_.src`
// or `el_.currentSrc`) is a blob-uri and, if so, returns the uri that
// was passed into the source-handler when it was first invoked instead
// of the blob-uri
vjs.Html5.prototype.returnOriginalIfBlobURI_ = function (elementURI, originalURI) {
  var blobURIRegExp = /^blob\:/i;

  // If originalURI is undefined then we are probably in a non-source-handler-enabled
  // tech that inherits from the Html5 tech so we should just return the elementURI
  // regardless of it's blobby-ness
  if (originalURI && elementURI && blobURIRegExp.test(elementURI)) {
    return originalURI;
  }
  return elementURI;
};

vjs.Html5.prototype.src = function(src) {
  var elementSrc = this.el_.src;

  if (src === undefined) {
    return this.returnOriginalIfBlobURI_(elementSrc, this.source_);
  } else {
    // Setting src through `src` instead of `setSrc` will be deprecated
    this.setSrc(src);
  }
};

vjs.Html5.prototype.setSrc = function(src) {
  this.el_.src = src;
};

vjs.Html5.prototype.load = function(){ this.el_.load(); };
vjs.Html5.prototype.currentSrc = function(){
  var elementSrc = this.el_.currentSrc;

  if (!this.currentSource_) {
    return elementSrc;
  }

  return this.returnOriginalIfBlobURI_(elementSrc, this.currentSource_.src);
};

vjs.Html5.prototype.poster = function(){ return this.el_.poster; };
vjs.Html5.prototype.setPoster = function(val){ this.el_.poster = val; };

vjs.Html5.prototype.preload = function(){ return this.el_.preload; };
vjs.Html5.prototype.setPreload = function(val){ this.el_.preload = val; };

vjs.Html5.prototype.autoplay = function(){ return this.el_.autoplay; };
vjs.Html5.prototype.setAutoplay = function(val){ this.el_.autoplay = val; };

vjs.Html5.prototype.controls = function(){ return this.el_.controls; };
vjs.Html5.prototype.setControls = function(val){ this.el_.controls = !!val; };

vjs.Html5.prototype.loop = function(){ return this.el_.loop; };
vjs.Html5.prototype.setLoop = function(val){ this.el_.loop = val; };

vjs.Html5.prototype.error = function(){ return this.el_.error; };
vjs.Html5.prototype.seeking = function(){ return this.el_.seeking; };
vjs.Html5.prototype.seekable = function(){ return this.el_.seekable; };
vjs.Html5.prototype.ended = function(){ return this.el_.ended; };
vjs.Html5.prototype.defaultMuted = function(){ return this.el_.defaultMuted; };

vjs.Html5.prototype.playbackRate = function(){ return this.el_.playbackRate; };
vjs.Html5.prototype.setPlaybackRate = function(val){ this.el_.playbackRate = val; };

vjs.Html5.prototype.networkState = function(){ return this.el_.networkState; };
vjs.Html5.prototype.readyState = function(){ return this.el_.readyState; };

vjs.Html5.prototype.textTracks = function() {
  if (!this['featuresNativeTextTracks']) {
    return vjs.MediaTechController.prototype.textTracks.call(this);
  }

  return this.el_.textTracks;
};
vjs.Html5.prototype.addTextTrack = function(kind, label, language) {
  if (!this['featuresNativeTextTracks']) {
    return vjs.MediaTechController.prototype.addTextTrack.call(this, kind, label, language);
  }

  return this.el_.addTextTrack(kind, label, language);
};

vjs.Html5.prototype.addRemoteTextTrack = function(options) {
  if (!this['featuresNativeTextTracks']) {
    return vjs.MediaTechController.prototype.addRemoteTextTrack.call(this, options);
  }

  var track = document.createElement('track');
  options = options || {};

  if (options['kind']) {
    track['kind'] = options['kind'];
  }
  if (options['label']) {
    track['label'] = options['label'];
  }
  if (options['language'] || options['srclang']) {
    track['srclang'] = options['language'] || options['srclang'];
  }
  if (options['default']) {
    track['default'] = options['default'];
  }
  if (options['id']) {
    track['id'] = options['id'];
  }
  if (options['src']) {
    track['src'] = options['src'];
  }

  this.el().appendChild(track);
  this.remoteTextTracks().addTrack_(track.track);

  return track;
};

vjs.Html5.prototype.removeRemoteTextTrack = function(track) {
  if (!this['featuresNativeTextTracks']) {
    return vjs.MediaTechController.prototype.removeRemoteTextTrack.call(this, track);
  }

  var tracks, i;

  this.remoteTextTracks().removeTrack_(track);

  tracks = this.el()['querySelectorAll']('track');

  for (i = 0; i < tracks.length; i++) {
    if (tracks[i] === track || tracks[i]['track'] === track) {
      tracks[i]['parentNode']['removeChild'](tracks[i]);
      break;
    }
  }
};

/* HTML5 Support Testing ---------------------------------------------------- */

/**
 * Check if HTML5 video is supported by this browser/device
 * @return {Boolean}
 */
vjs.Html5.isSupported = function(){
  // IE9 with no Media Player is a LIAR! (#984)
  try {
    vjs.TEST_VID['volume'] = 0.5;
  } catch (e) {
    return false;
  }

  return !!vjs.TEST_VID.canPlayType;
};

// Add Source Handler pattern functions to this tech
vjs.MediaTechController.withSourceHandlers(vjs.Html5);

/*
 * Override the withSourceHandler mixin's methods with our own because
 * the HTML5 Media Element returns blob urls when utilizing MSE and we
 * want to still return proper source urls even when in that case
 */
(function(){
  var
    origSetSource = vjs.Html5.prototype.setSource,
    origDisposeSourceHandler = vjs.Html5.prototype.disposeSourceHandler;

  vjs.Html5.prototype.setSource = function (source) {
    var retVal = origSetSource.call(this, source);
    this.source_ = source.src;
    return retVal;
  };

  vjs.Html5.prototype.disposeSourceHandler = function () {
    this.source_ = undefined;
    return origDisposeSourceHandler.call(this);
  };
})();

/**
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 * @param  {Object} source   The source object
 * @param  {vjs.Html5} tech  The instance of the HTML5 tech
 */
vjs.Html5['nativeSourceHandler'] = {};

/**
 * Check if the video element can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
vjs.Html5['nativeSourceHandler']['canHandleSource'] = function(source){
  var match, ext;

  function canPlayType(type){
    // IE9 on Windows 7 without MediaPlayer throws an error here
    // https://github.com/videojs/video.js/issues/519
    try {
      return vjs.TEST_VID.canPlayType(type);
    } catch(e) {
      return '';
    }
  }

  // If a type was provided we should rely on that
  if (source.type) {
    return canPlayType(source.type);
  } else if (source.src) {
    // If no type, fall back to checking 'video/[EXTENSION]'
    match = source.src.match(/\.([^.\/\?]+)(\?[^\/]+)?$/i);
    ext = match && match[1];

    return canPlayType('video/'+ext);
  }

  return '';
};

/**
 * Pass the source to the video element
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {vjs.Html5} tech   The instance of the Html5 tech
 */
vjs.Html5['nativeSourceHandler']['handleSource'] = function(source, tech){
  tech.setSrc(source.src);
};

/**
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
vjs.Html5['nativeSourceHandler']['dispose'] = function(){};

// Register the native source handler
vjs.Html5['registerSourceHandler'](vjs.Html5['nativeSourceHandler']);

/**
 * Check if the volume can be changed in this browser/device.
 * Volume cannot be changed in a lot of mobile devices.
 * Specifically, it can't be changed from 1 on iOS.
 * @return {Boolean}
 */
vjs.Html5.canControlVolume = function(){
  var volume =  vjs.TEST_VID.volume;
  vjs.TEST_VID.volume = (volume / 2) + 0.1;
  return volume !== vjs.TEST_VID.volume;
};

/**
 * Check if playbackRate is supported in this browser/device.
 * @return {[type]} [description]
 */
vjs.Html5.canControlPlaybackRate = function(){
  var playbackRate =  vjs.TEST_VID.playbackRate;
  vjs.TEST_VID.playbackRate = (playbackRate / 2) + 0.1;
  return playbackRate !== vjs.TEST_VID.playbackRate;
};

/**
 * Check to see if native text tracks are supported by this browser/device
 * @return {Boolean}
 */
vjs.Html5.supportsNativeTextTracks = function() {
  var supportsTextTracks;

  // Figure out native text track support
  // If mode is a number, we cannot change it because it'll disappear from view.
  // Browsers with numeric modes include IE10 and older (<=2013) samsung android models.
  // Firefox isn't playing nice either with modifying the mode
  // TODO: Investigate firefox: https://github.com/videojs/video.js/issues/1862
  supportsTextTracks = !!vjs.TEST_VID.textTracks;
  if (supportsTextTracks && vjs.TEST_VID.textTracks.length > 0) {
    supportsTextTracks = typeof vjs.TEST_VID.textTracks[0]['mode'] !== 'number';
  }
  if (supportsTextTracks && vjs.IS_FIREFOX) {
    supportsTextTracks = false;
  }

  return supportsTextTracks;
};

/**
 * Set the tech's volume control support status
 * @type {Boolean}
 */
vjs.Html5.prototype['featuresVolumeControl'] = vjs.Html5.canControlVolume();

/**
 * Set the tech's playbackRate support status
 * @type {Boolean}
 */
vjs.Html5.prototype['featuresPlaybackRate'] = vjs.Html5.canControlPlaybackRate();

/**
 * Set the tech's status on moving the video element.
 * In iOS, if you move a video element in the DOM, it breaks video playback.
 * @type {Boolean}
 */
vjs.Html5.prototype['movingMediaElementInDOM'] = !vjs.IS_IOS;

/**
 * Set the the tech's fullscreen resize support status.
 * HTML video is able to automatically resize when going to fullscreen.
 * (No longer appears to be used. Can probably be removed.)
 */
vjs.Html5.prototype['featuresFullscreenResize'] = true;

/**
 * Set the tech's progress event support status
 * (this disables the manual progress events of the MediaTechController)
 */
vjs.Html5.prototype['featuresProgressEvents'] = true;

/**
 * Sets the tech's status on native text track support
 * @type {Boolean}
 */
vjs.Html5.prototype['featuresNativeTextTracks'] = vjs.Html5.supportsNativeTextTracks();

// HTML5 Feature detection and Device Fixes --------------------------------- //
(function() {
  var canPlayType,
      mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i,
      mp4RE = /^video\/mp4/i;

  vjs.Html5.patchCanPlayType = function() {
    // Android 4.0 and above can play HLS to some extent but it reports being unable to do so
    if (vjs.ANDROID_VERSION >= 4.0) {
      if (!canPlayType) {
        canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
      }

      vjs.TEST_VID.constructor.prototype.canPlayType = function(type) {
        if (type && mpegurlRE.test(type)) {
          return 'maybe';
        }
        return canPlayType.call(this, type);
      };
    }

    // Override Android 2.2 and less canPlayType method which is broken
    if (vjs.IS_OLD_ANDROID) {
      if (!canPlayType) {
        canPlayType = vjs.TEST_VID.constructor.prototype.canPlayType;
      }

      vjs.TEST_VID.constructor.prototype.canPlayType = function(type){
        if (type && mp4RE.test(type)) {
          return 'maybe';
        }
        return canPlayType.call(this, type);
      };
    }
  };

  vjs.Html5.unpatchCanPlayType = function() {
    var r = vjs.TEST_VID.constructor.prototype.canPlayType;
    vjs.TEST_VID.constructor.prototype.canPlayType = canPlayType;
    canPlayType = null;
    return r;
  };

  // by default, patch the video element
  vjs.Html5.patchCanPlayType();
})();

// List of all HTML5 events (various uses).
vjs.Html5.Events = 'loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange'.split(',');

vjs.Html5.disposeMediaElement = function(el){
  if (!el) { return; }

  el['player'] = null;

  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }

  // remove any child track or source nodes to prevent their loading
  while(el.hasChildNodes()) {
    el.removeChild(el.firstChild);
  }

  // remove any src reference. not setting `src=''` because that causes a warning
  // in firefox
  el.removeAttribute('src');

  // force the media element to update its loading state by calling load()
  // however IE on Windows 7N has a bug that throws an error so need a try/catch (#793)
  if (typeof el.load === 'function') {
    // wrapping in an iife so it's not deoptimized (#1060#discussion_r10324473)
    (function() {
      try {
        el.load();
      } catch (e) {
        // not supported
      }
    })();
  }
};
/**
 * @fileoverview VideoJS-SWF - Custom Flash Player with HTML5-ish API
 * https://github.com/zencoder/video-js-swf
 * Not using setupTriggers. Using global onEvent func to distribute events
 */

/**
 * Flash Media Controller - Wrapper for fallback SWF API
 *
 * @param {vjs.Player} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
vjs.Flash = vjs.MediaTechController.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.MediaTechController.call(this, player, options, ready);

    var source = options['source'],

        // Generate ID for swf object
        objId = player.id()+'_flash_api',

        // Store player options in local var for optimization
        // TODO: switch to using player methods instead of options
        // e.g. player.autoplay();
        playerOptions = player.options_,

        // Merge default flashvars with ones passed in to init
        flashVars = vjs.obj.merge({

          // SWF Callback Functions
          'readyFunction': 'videojs.Flash.onReady',
          'eventProxyFunction': 'videojs.Flash.onEvent',
          'errorEventProxyFunction': 'videojs.Flash.onError',

          // Player Settings
          'autoplay': playerOptions.autoplay,
          'preload': playerOptions.preload,
          'loop': playerOptions.loop,
          'muted': playerOptions.muted

        }, options['flashVars']),

        // Merge default parames with ones passed in
        params = vjs.obj.merge({
          'wmode': 'opaque', // Opaque is needed to overlay controls, but can affect playback performance
          'bgcolor': '#000000' // Using bgcolor prevents a white flash when the object is loading
        }, options['params']),

        // Merge default attributes with ones passed in
        attributes = vjs.obj.merge({
          'id': objId,
          'name': objId, // Both ID and Name needed or swf to identify itself
          'class': 'vjs-tech'
        }, options['attributes'])
    ;

    // If source was supplied pass as a flash var.
    if (source) {
      this.ready(function(){
        this.setSource(source);
      });
    }

    // Add placeholder to player div
    vjs.insertFirst(this.el_, options['parentEl']);

    // Having issues with Flash reloading on certain page actions (hide/resize/fullscreen) in certain browsers
    // This allows resetting the playhead when we catch the reload
    if (options['startTime']) {
      this.ready(function(){
        this.load();
        this.play();
        this['currentTime'](options['startTime']);
      });
    }

    // firefox doesn't bubble mousemove events to parent. videojs/video-js-swf#37
    // bugzilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=836786
    if (vjs.IS_FIREFOX) {
      this.ready(function(){
        this.on('mousemove', function(){
          // since it's a custom event, don't bubble higher than the player
          this.player().trigger({ 'type':'mousemove', 'bubbles': false });
        });
      });
    }

    // native click events on the SWF aren't triggered on IE11, Win8.1RT
    // use stageclick events triggered from inside the SWF instead
    player.on('stageclick', player.reportUserActivity);

    this.el_ = vjs.Flash.embed(options['swf'], this.el_, flashVars, params, attributes);
  }
});

vjs.Flash.prototype.dispose = function(){
  vjs.MediaTechController.prototype.dispose.call(this);
};

vjs.Flash.prototype.play = function(){
  this.el_.vjs_play();
};

vjs.Flash.prototype.pause = function(){
  this.el_.vjs_pause();
};

vjs.Flash.prototype.src = function(src){
  if (src === undefined) {
    return this['currentSrc']();
  }

  // Setting src through `src` not `setSrc` will be deprecated
  return this.setSrc(src);
};

vjs.Flash.prototype.setSrc = function(src){
  // Make sure source URL is absolute.
  src = vjs.getAbsoluteURL(src);
  this.el_.vjs_src(src);

  // Currently the SWF doesn't autoplay if you load a source later.
  // e.g. Load player w/ no source, wait 2s, set src.
  if (this.player_.autoplay()) {
    var tech = this;
    this.setTimeout(function(){ tech.play(); }, 0);
  }
};

vjs.Flash.prototype['setCurrentTime'] = function(time){
  this.lastSeekTarget_ = time;
  this.el_.vjs_setProperty('currentTime', time);
  vjs.MediaTechController.prototype.setCurrentTime.call(this);
};

vjs.Flash.prototype['currentTime'] = function(time){
  // when seeking make the reported time keep up with the requested time
  // by reading the time we're seeking to
  if (this.seeking()) {
    return this.lastSeekTarget_ || 0;
  }
  return this.el_.vjs_getProperty('currentTime');
};

vjs.Flash.prototype['currentSrc'] = function(){
  if (this.currentSource_) {
    return this.currentSource_.src;
  } else {
    return this.el_.vjs_getProperty('currentSrc');
  }
};

vjs.Flash.prototype.load = function(){
  this.el_.vjs_load();
};

vjs.Flash.prototype.poster = function(){
  this.el_.vjs_getProperty('poster');
};
vjs.Flash.prototype['setPoster'] = function(){
  // poster images are not handled by the Flash tech so make this a no-op
};

vjs.Flash.prototype.seekable = function() {
  var duration = this.duration();
  if (duration === 0) {
    // The SWF reports a duration of zero when the actual duration is unknown
    return vjs.createTimeRange();
  }
  return vjs.createTimeRange(0, this.duration());
};

vjs.Flash.prototype.buffered = function(){
  if (!this.el_.vjs_getProperty) {
    return vjs.createTimeRange();
  }
  return vjs.createTimeRange(0, this.el_.vjs_getProperty('buffered'));
};

vjs.Flash.prototype.duration = function(){
  if (!this.el_.vjs_getProperty) {
    return 0;
  }
  return this.el_.vjs_getProperty('duration');
};

vjs.Flash.prototype.supportsFullScreen = function(){
  return false; // Flash does not allow fullscreen through javascript
};

vjs.Flash.prototype.enterFullScreen = function(){
  return false;
};

(function(){
  // Create setters and getters for attributes
  var api = vjs.Flash.prototype,
    readWrite = 'rtmpConnection,rtmpStream,preload,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted'.split(','),
    readOnly = 'error,networkState,readyState,seeking,initialTime,startOffsetTime,paused,played,ended,videoTracks,audioTracks,videoWidth,videoHeight'.split(','),
    // Overridden: buffered, currentTime, currentSrc
    i;

  function createSetter(attr){
    var attrUpper = attr.charAt(0).toUpperCase() + attr.slice(1);
    api['set'+attrUpper] = function(val){ return this.el_.vjs_setProperty(attr, val); };
  }
  function createGetter(attr) {
    api[attr] = function(){ return this.el_.vjs_getProperty(attr); };
  }

  // Create getter and setters for all read/write attributes
  for (i = 0; i < readWrite.length; i++) {
    createGetter(readWrite[i]);
    createSetter(readWrite[i]);
  }

  // Create getters for read-only attributes
  for (i = 0; i < readOnly.length; i++) {
    createGetter(readOnly[i]);
  }
})();

/* Flash Support Testing -------------------------------------------------------- */

vjs.Flash.isSupported = function(){
  return vjs.Flash.version()[0] >= 10;
  // return swfobject.hasFlashPlayerVersion('10');
};

// Add Source Handler pattern functions to this tech
vjs.MediaTechController.withSourceHandlers(vjs.Flash);

/**
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 * @param  {Object} source   The source object
 * @param  {vjs.Flash} tech  The instance of the Flash tech
 */
vjs.Flash['nativeSourceHandler'] = {};

/**
 * Check Flash can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
vjs.Flash['nativeSourceHandler']['canHandleSource'] = function(source){
  var type;

  if (!source.type) {
    return '';
  }

  // Strip code information from the type because we don't get that specific
  type = source.type.replace(/;.*/,'').toLowerCase();

  if (type in vjs.Flash.formats) {
    return 'maybe';
  }

  return '';
};

/**
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {vjs.Flash} tech   The instance of the Flash tech
 */
vjs.Flash['nativeSourceHandler']['handleSource'] = function(source, tech){
  tech.setSrc(source.src);
};

/**
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
vjs.Flash['nativeSourceHandler']['dispose'] = function(){};

// Register the native source handler
vjs.Flash['registerSourceHandler'](vjs.Flash['nativeSourceHandler']);

vjs.Flash.formats = {
  'video/flv': 'FLV',
  'video/x-flv': 'FLV',
  'video/mp4': 'MP4',
  'video/m4v': 'MP4'
};

vjs.Flash['onReady'] = function(currSwf){
  var el, player;

  el = vjs.el(currSwf);

  // get player from the player div property
  player = el && el.parentNode && el.parentNode['player'];

  // if there is no el or player then the tech has been disposed
  // and the tech element was removed from the player div
  if (player) {
    // reference player on tech element
    el['player'] = player;
    // check that the flash object is really ready
    vjs.Flash['checkReady'](player.tech);
  }
};

// The SWF isn't always ready when it says it is. Sometimes the API functions still need to be added to the object.
// If it's not ready, we set a timeout to check again shortly.
vjs.Flash['checkReady'] = function(tech){
  // stop worrying if the tech has been disposed
  if (!tech.el()) {
    return;
  }

  // check if API property exists
  if (tech.el().vjs_getProperty) {
    // tell tech it's ready
    tech.triggerReady();
  } else {
    // wait longer
    this.setTimeout(function(){
      vjs.Flash['checkReady'](tech);
    }, 50);
  }
};

// Trigger events from the swf on the player
vjs.Flash['onEvent'] = function(swfID, eventName){
  var player = vjs.el(swfID)['player'];
  player.trigger(eventName);
};

// Log errors from the swf
vjs.Flash['onError'] = function(swfID, err){
  var player = vjs.el(swfID)['player'];
  var msg = 'FLASH: '+err;

  if (err == 'srcnotfound') {
    player.error({ code: 4, message: msg });

  // errors we haven't categorized into the media errors
  } else {
    player.error(msg);
  }
};

// Flash Version Check
vjs.Flash.version = function(){
  var version = '0,0,0';

  // IE
  try {
    version = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];

  // other browsers
  } catch(e) {
    try {
      if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin){
        version = (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
      }
    } catch(err) {}
  }
  return version.split(',');
};

// Flash embedding method. Only used in non-iframe mode
vjs.Flash.embed = function(swf, placeHolder, flashVars, params, attributes){
  var code = vjs.Flash.getEmbedCode(swf, flashVars, params, attributes),

      // Get element by embedding code and retrieving created element
      obj = vjs.createEl('div', { innerHTML: code }).childNodes[0],

      par = placeHolder.parentNode
  ;

  placeHolder.parentNode.replaceChild(obj, placeHolder);
  obj[vjs.expando] = placeHolder[vjs.expando];

  // IE6 seems to have an issue where it won't initialize the swf object after injecting it.
  // This is a dumb fix
  var newObj = par.childNodes[0];
  setTimeout(function(){
    newObj.style.display = 'block';
  }, 1000);

  return obj;

};

vjs.Flash.getEmbedCode = function(swf, flashVars, params, attributes){

  var objTag = '<object type="application/x-shockwave-flash" ',
      flashVarsString = '',
      paramsString = '',
      attrsString = '';

  // Convert flash vars to string
  if (flashVars) {
    vjs.obj.each(flashVars, function(key, val){
      flashVarsString += (key + '=' + val + '&amp;');
    });
  }

  // Add swf, flashVars, and other default params
  params = vjs.obj.merge({
    'movie': swf,
    'flashvars': flashVarsString,
    'allowScriptAccess': 'always', // Required to talk to swf
    'allowNetworking': 'all' // All should be default, but having security issues.
  }, params);

  // Create param tags string
  vjs.obj.each(params, function(key, val){
    paramsString += '<param name="'+key+'" value="'+val+'" />';
  });

  attributes = vjs.obj.merge({
    // Add swf to attributes (need both for IE and Others to work)
    'data': swf,

    // Default to 100% width/height
    'width': '100%',
    'height': '100%'

  }, attributes);

  // Create Attributes string
  vjs.obj.each(attributes, function(key, val){
    attrsString += (key + '="' + val + '" ');
  });

  return objTag + attrsString + '>' + paramsString + '</object>';
};
vjs.Flash.streamingFormats = {
  'rtmp/mp4': 'MP4',
  'rtmp/flv': 'FLV'
};

vjs.Flash.streamFromParts = function(connection, stream) {
  return connection + '&' + stream;
};

vjs.Flash.streamToParts = function(src) {
  var parts = {
    connection: '',
    stream: ''
  };

  if (! src) {
    return parts;
  }

  // Look for the normal URL separator we expect, '&'.
  // If found, we split the URL into two pieces around the
  // first '&'.
  var connEnd = src.indexOf('&');
  var streamBegin;
  if (connEnd !== -1) {
    streamBegin = connEnd + 1;
  }
  else {
    // If there's not a '&', we use the last '/' as the delimiter.
    connEnd = streamBegin = src.lastIndexOf('/') + 1;
    if (connEnd === 0) {
      // really, there's not a '/'?
      connEnd = streamBegin = src.length;
    }
  }
  parts.connection = src.substring(0, connEnd);
  parts.stream = src.substring(streamBegin, src.length);

  return parts;
};

vjs.Flash.isStreamingType = function(srcType) {
  return srcType in vjs.Flash.streamingFormats;
};

// RTMP has four variations, any string starting
// with one of these protocols should be valid
vjs.Flash.RTMP_RE = /^rtmp[set]?:\/\//i;

vjs.Flash.isStreamingSrc = function(src) {
  return vjs.Flash.RTMP_RE.test(src);
};

/**
 * A source handler for RTMP urls
 * @type {Object}
 */
vjs.Flash.rtmpSourceHandler = {};

/**
 * Check Flash can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
vjs.Flash.rtmpSourceHandler['canHandleSource'] = function(source){
  if (vjs.Flash.isStreamingType(source.type) || vjs.Flash.isStreamingSrc(source.src)) {
    return 'maybe';
  }

  return '';
};

/**
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {vjs.Flash} tech   The instance of the Flash tech
 */
vjs.Flash.rtmpSourceHandler['handleSource'] = function(source, tech){
  var srcParts = vjs.Flash.streamToParts(source.src);

  tech['setRtmpConnection'](srcParts.connection);
  tech['setRtmpStream'](srcParts.stream);
};

// Register the native source handler
vjs.Flash['registerSourceHandler'](vjs.Flash.rtmpSourceHandler);
/**
 * The Media Loader is the component that decides which playback technology to load
 * when the player is initialized.
 *
 * @constructor
 */
vjs.MediaLoader = vjs.Component.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.Component.call(this, player, options, ready);

    // If there are no sources when the player is initialized,
    // load the first supported playback technology.
    if (!player.options_['sources'] || player.options_['sources'].length === 0) {
      for (var i=0,j=player.options_['techOrder']; i<j.length; i++) {
        var techName = vjs.capitalize(j[i]),
            tech = window['videojs'][techName];

        // Check if the browser supports this technology
        if (tech && tech.isSupported()) {
          player.loadTech(techName);
          break;
        }
      }
    } else {
      // // Loop through playback technologies (HTML5, Flash) and check for support.
      // // Then load the best source.
      // // A few assumptions here:
      // //   All playback technologies respect preload false.
      player.src(player.options_['sources']);
    }
  }
});
/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackmode
 *
 * enum TextTrackMode { "disabled",  "hidden",  "showing" };
 */
vjs.TextTrackMode = {
  'disabled': 'disabled',
  'hidden': 'hidden',
  'showing': 'showing'
};

/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackkind
 *
 * enum TextTrackKind { "subtitles",  "captions",  "descriptions",  "chapters",  "metadata" };
 */
vjs.TextTrackKind = {
  'subtitles': 'subtitles',
  'captions': 'captions',
  'descriptions': 'descriptions',
  'chapters': 'chapters',
  'metadata': 'metadata'
};
(function() {
/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrack
 *
 * interface TextTrack : EventTarget {
 *   readonly attribute TextTrackKind kind;
 *   readonly attribute DOMString label;
 *   readonly attribute DOMString language;
 *
 *   readonly attribute DOMString id;
 *   readonly attribute DOMString inBandMetadataTrackDispatchType;
 *
 *   attribute TextTrackMode mode;
 *
 *   readonly attribute TextTrackCueList? cues;
 *   readonly attribute TextTrackCueList? activeCues;
 *
 *   void addCue(TextTrackCue cue);
 *   void removeCue(TextTrackCue cue);
 *
 *   attribute EventHandler oncuechange;
 * };
 */

vjs.TextTrack = function(options) {
  var tt, id, mode, kind, label, language, cues, activeCues, timeupdateHandler, changed, prop;

  options = options || {};

  if (!options['player']) {
    throw new Error('A player was not provided.');
  }

  tt = this;
  if (vjs.IS_IE8) {
    tt = document.createElement('custom');

    for (prop in vjs.TextTrack.prototype) {
      tt[prop] = vjs.TextTrack.prototype[prop];
    }
  }

  tt.player_ = options['player'];

  mode = vjs.TextTrackMode[options['mode']] || 'disabled';
  kind = vjs.TextTrackKind[options['kind']] || 'subtitles';
  label = options['label'] || '';
  language = options['language'] || options['srclang'] || '';
  id = options['id'] || 'vjs_text_track_' + vjs.guid++;

  if (kind === 'metadata' || kind === 'chapters') {
    mode = 'hidden';
  }

  tt.cues_ = [];
  tt.activeCues_ = [];

  cues = new vjs.TextTrackCueList(tt.cues_);
  activeCues = new vjs.TextTrackCueList(tt.activeCues_);

  changed = false;
  timeupdateHandler = vjs.bind(tt, function() {
    this['activeCues'];
    if (changed) {
      this['trigger']('cuechange');
      changed = false;
    }
  });
  if (mode !== 'disabled') {
    tt.player_.on('timeupdate', timeupdateHandler);
  }

  Object.defineProperty(tt, 'kind', {
    get: function() {
      return kind;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'label', {
    get: function() {
      return label;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'language', {
    get: function() {
      return language;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'id', {
    get: function() {
      return id;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'mode', {
    get: function() {
      return mode;
    },
    set: function(newMode) {
      if (!vjs.TextTrackMode[newMode]) {
        return;
      }
      mode = newMode;
      if (mode === 'showing') {
        this.player_.on('timeupdate', timeupdateHandler);
      }
      this.trigger('modechange');
    }
  });

  Object.defineProperty(tt, 'cues', {
    get: function() {
      if (!this.loaded_) {
        return null;
      }

      return cues;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'activeCues', {
    get: function() {
      var i, l, active, ct, cue;

      if (!this.loaded_) {
        return null;
      }

      if (this['cues'].length === 0) {
        return activeCues; // nothing to do
      }

      ct = this.player_.currentTime();
      i = 0;
      l = this['cues'].length;
      active = [];

      for (; i < l; i++) {
        cue = this['cues'][i];
        if (cue['startTime'] <= ct && cue['endTime'] >= ct) {
          active.push(cue);
        } else if (cue['startTime'] === cue['endTime'] && cue['startTime'] <= ct && cue['startTime'] + 0.5 >= ct) {
          active.push(cue);
        }
      }

      changed = false;

      if (active.length !== this.activeCues_.length) {
        changed = true;
      } else {
        for (i = 0; i < active.length; i++) {
          if (indexOf.call(this.activeCues_, active[i]) === -1) {
            changed = true;
          }
        }
      }

      this.activeCues_ = active;
      activeCues.setCues_(this.activeCues_);

      return activeCues;
    },
    set: Function.prototype
  });

  if (options.src) {
    loadTrack(options.src, tt);
  } else {
    tt.loaded_ = true;
  }

  if (vjs.IS_IE8) {
    return tt;
  }
};

vjs.TextTrack.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
vjs.TextTrack.prototype.constructor = vjs.TextTrack;

/*
 * cuechange - One or more cues in the track have become active or stopped being active.
 */
vjs.TextTrack.prototype.allowedEvents_ = {
  'cuechange': 'cuechange'
};

vjs.TextTrack.prototype.addCue = function(cue) {
  var tracks = this.player_.textTracks(),
      i = 0;

  if (tracks) {
    for (; i < tracks.length; i++) {
      if (tracks[i] !== this) {
        tracks[i].removeCue(cue);
      }
    }
  }

  this.cues_.push(cue);
  this['cues'].setCues_(this.cues_);
};

vjs.TextTrack.prototype.removeCue = function(removeCue) {
  var i = 0,
      l = this.cues_.length,
      cue,
      removed = false;

  for (; i < l; i++) {
    cue = this.cues_[i];
    if (cue === removeCue) {
      this.cues_.splice(i, 1);
      removed = true;
    }
  }

  if (removed) {
    this.cues.setCues_(this.cues_);
  }
};

/*
 * Downloading stuff happens below this point
 */
var loadTrack, parseCues, indexOf;

loadTrack = function(src, track) {
  vjs.xhr(src, vjs.bind(this, function(err, response, responseBody){
    if (err) {
      return vjs.log.error(err);
    }


    track.loaded_ = true;
    parseCues(responseBody, track);
  }));
};

parseCues = function(srcContent, track) {
  if (typeof window['WebVTT'] !== 'function') {
    //try again a bit later
    return window.setTimeout(function() {
      parseCues(srcContent, track);
    }, 25);
  }

  var parser = new window['WebVTT']['Parser'](window, window['vttjs'], window['WebVTT']['StringDecoder']());

  parser['oncue'] = function(cue) {
    track.addCue(cue);
  };
  parser['onparsingerror'] = function(error) {
    vjs.log.error(error);
  };

  parser['parse'](srcContent);
  parser['flush']();
};

indexOf = function(searchElement, fromIndex) {

  var k;

  if (this == null) {
    throw new TypeError('"this" is null or not defined');
  }

  var O = Object(this);

  var len = O.length >>> 0;

  if (len === 0) {
    return -1;
  }

  var n = +fromIndex || 0;

  if (Math.abs(n) === Infinity) {
    n = 0;
  }

  if (n >= len) {
    return -1;
  }

  k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

  while (k < len) {
    if (k in O && O[k] === searchElement) {
      return k;
    }
    k++;
  }
  return -1;
};

})();
/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttracklist
 *
 * interface TextTrackList : EventTarget {
 *   readonly attribute unsigned long length;
 *   getter TextTrack (unsigned long index);
 *   TextTrack? getTrackById(DOMString id);
 * 
 *   attribute EventHandler onchange;
 *   attribute EventHandler onaddtrack;
 *   attribute EventHandler onremovetrack;
 * };
 */
vjs.TextTrackList = function(tracks) {
  var list = this,
      prop,
      i = 0;

  if (vjs.IS_IE8) {
    list = document.createElement('custom');

    for (prop in vjs.TextTrackList.prototype) {
      list[prop] = vjs.TextTrackList.prototype[prop];
    }
  }

  tracks = tracks || [];
  list.tracks_ = [];

  Object.defineProperty(list, 'length', {
    get: function() {
      return this.tracks_.length;
    }
  });

  for (; i < tracks.length; i++) {
    list.addTrack_(tracks[i]);
  }

  if (vjs.IS_IE8) {
    return list;
  }
};

vjs.TextTrackList.prototype = vjs.obj.create(vjs.EventEmitter.prototype);
vjs.TextTrackList.prototype.constructor = vjs.TextTrackList;

/*
 * change - One or more tracks in the track list have been enabled or disabled.
 * addtrack - A track has been added to the track list.
 * removetrack - A track has been removed from the track list.
*/
vjs.TextTrackList.prototype.allowedEvents_ = {
  'change': 'change',
  'addtrack': 'addtrack',
  'removetrack': 'removetrack'
};

// emulate attribute EventHandler support to allow for feature detection
(function() {
  var event;

  for (event in vjs.TextTrackList.prototype.allowedEvents_) {
    vjs.TextTrackList.prototype['on' + event] = null;
  }
})();

vjs.TextTrackList.prototype.addTrack_ = function(track) {
  var index = this.tracks_.length;
  if (!(''+index in this)) {
    Object.defineProperty(this, index, {
      get: function() {
        return this.tracks_[index];
      }
    });
  }

  track.addEventListener('modechange', vjs.bind(this, function() {
    this.trigger('change');
  }));
  this.tracks_.push(track);

  this.trigger({
    type: 'addtrack',
    track: track
  });
};

vjs.TextTrackList.prototype.removeTrack_ = function(rtrack) {
  var i = 0,
      l = this.length,
      result = null,
      track;

  for (; i < l; i++) {
    track = this[i];
    if (track === rtrack) {
      this.tracks_.splice(i, 1);
      break;
    }
  }

  this.trigger({
    type: 'removetrack',
    track: rtrack
  });
};

vjs.TextTrackList.prototype.getTrackById = function(id) {
  var i = 0,
      l = this.length,
      result = null,
      track;

  for (; i < l; i++) {
    track = this[i];
    if (track.id === id) {
      result = track;
      break;
    }
  }

  return result;
};
/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackcuelist
 *
 * interface TextTrackCueList {
 *   readonly attribute unsigned long length;
 *   getter TextTrackCue (unsigned long index);
 *   TextTrackCue? getCueById(DOMString id);
 * };
 */

vjs.TextTrackCueList = function(cues) {
  var list = this,
      prop;

  if (vjs.IS_IE8) {
    list = document.createElement('custom');

    for (prop in vjs.TextTrackCueList.prototype) {
      list[prop] = vjs.TextTrackCueList.prototype[prop];
    }
  }

  vjs.TextTrackCueList.prototype.setCues_.call(list, cues);

  Object.defineProperty(list, 'length', {
    get: function() {
      return this.length_;
    }
  });

  if (vjs.IS_IE8) {
    return list;
  }
};

vjs.TextTrackCueList.prototype.setCues_ = function(cues) {
  var oldLength = this.length || 0,
      i = 0,
      l = cues.length,
      defineProp;

  this.cues_ = cues;
  this.length_ = cues.length;

  defineProp = function(i) {
    if (!(''+i in this)) {
      Object.defineProperty(this, '' + i, {
        get: function() {
          return this.cues_[i];
        }
      });
    }
  };

  if (oldLength < l) {
    i = oldLength;
    for(; i < l; i++) {
      defineProp.call(this, i);
    }
  }
};

vjs.TextTrackCueList.prototype.getCueById = function(id) {
  var i = 0,
      l = this.length,
      result = null,
      cue;

  for (; i < l; i++) {
    cue = this[i];
    if (cue.id === id) {
      result = cue;
      break;
    }
  }

  return result;
};
(function() {
'use strict';

/* Text Track Display
============================================================================= */
// Global container for both subtitle and captions text. Simple div container.

/**
 * The component for displaying text track cues
 *
 * @constructor
 */
vjs.TextTrackDisplay = vjs.Component.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.Component.call(this, player, options, ready);

    player.on('loadstart', vjs.bind(this, this.toggleDisplay));

    // This used to be called during player init, but was causing an error
    // if a track should show by default and the display hadn't loaded yet.
    // Should probably be moved to an external track loader when we support
    // tracks that don't need a display.
    player.ready(vjs.bind(this, function() {
      if (player.tech && player.tech['featuresNativeTextTracks']) {
        this.hide();
        return;
      }

      var i, tracks, track;

      player.on('fullscreenchange', vjs.bind(this, this.updateDisplay));

      tracks = player.options_['tracks'] || [];
      for (i = 0; i < tracks.length; i++) {
        track = tracks[i];
        this.player_.addRemoteTextTrack(track);
      }
    }));
  }
});

vjs.TextTrackDisplay.prototype.toggleDisplay = function() {
  if (this.player_.tech && this.player_.tech['featuresNativeTextTracks']) {
    this.hide();
  } else {
    this.show();
  }
};

vjs.TextTrackDisplay.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-text-track-display'
  });
};

vjs.TextTrackDisplay.prototype.clearDisplay = function() {
  if (typeof window['WebVTT'] === 'function') {
    window['WebVTT']['processCues'](window, [], this.el_);
  }
};

// Add cue HTML to display
var constructColor = function(color, opacity) {
  return 'rgba(' +
    // color looks like "#f0e"
    parseInt(color[1] + color[1], 16) + ',' +
    parseInt(color[2] + color[2], 16) + ',' +
    parseInt(color[3] + color[3], 16) + ',' +
    opacity + ')';
};
var darkGray = '#222';
var lightGray = '#ccc';
var fontMap = {
  monospace:             'monospace',
  sansSerif:             'sans-serif',
  serif:                 'serif',
  monospaceSansSerif:    '"Andale Mono", "Lucida Console", monospace',
  monospaceSerif:        '"Courier New", monospace',
  proportionalSansSerif: 'sans-serif',
  proportionalSerif:     'serif',
  casual:                '"Comic Sans MS", Impact, fantasy',
  script:                '"Monotype Corsiva", cursive',
  smallcaps:             '"Andale Mono", "Lucida Console", monospace, sans-serif'
};
var tryUpdateStyle = function(el, style, rule) {
  // some style changes will throw an error, particularly in IE8. Those should be noops.
  try {
    el.style[style] = rule;
  } catch (e) {}
};

vjs.TextTrackDisplay.prototype.updateDisplay = function() {
  var tracks = this.player_.textTracks(),
      i = 0,
      track;

  this.clearDisplay();

  if (!tracks) {
    return;
  }

  for (; i < tracks.length; i++) {
    track = tracks[i];
    if (track['mode'] === 'showing') {
      this.updateForTrack(track);
    }
  }
};

vjs.TextTrackDisplay.prototype.updateForTrack = function(track) {
  if (typeof window['WebVTT'] !== 'function' || !track['activeCues']) {
    return;
  }

  var i = 0,
      property,
      cueDiv,
      overrides = this.player_['textTrackSettings'].getValues(),
      fontSize,
      cues = [];

  for (; i < track['activeCues'].length; i++) {
    cues.push(track['activeCues'][i]);
  }

  window['WebVTT']['processCues'](window, track['activeCues'], this.el_);

  i = cues.length;
  while (i--) {
    cueDiv = cues[i].displayState;
    if (overrides.color) {
      cueDiv.firstChild.style.color = overrides.color;
    }
    if (overrides.textOpacity) {
      tryUpdateStyle(cueDiv.firstChild,
                     'color',
                     constructColor(overrides.color || '#fff',
                                    overrides.textOpacity));
    }
    if (overrides.backgroundColor) {
      cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
    }
    if (overrides.backgroundOpacity) {
      tryUpdateStyle(cueDiv.firstChild,
                     'backgroundColor',
                     constructColor(overrides.backgroundColor || '#000',
                                    overrides.backgroundOpacity));
    }
    if (overrides.windowColor) {
      if (overrides.windowOpacity) {
        tryUpdateStyle(cueDiv,
                       'backgroundColor',
                       constructColor(overrides.windowColor, overrides.windowOpacity));
      } else {
        cueDiv.style.backgroundColor = overrides.windowColor;
      }
    }
    if (overrides.edgeStyle) {
      if (overrides.edgeStyle === 'dropshadow') {
        cueDiv.firstChild.style.textShadow = '2px 2px 3px ' + darkGray + ', 2px 2px 4px ' + darkGray + ', 2px 2px 5px ' + darkGray;
      } else if (overrides.edgeStyle === 'raised') {
        cueDiv.firstChild.style.textShadow = '1px 1px ' + darkGray + ', 2px 2px ' + darkGray + ', 3px 3px ' + darkGray;
      } else if (overrides.edgeStyle === 'depressed') {
        cueDiv.firstChild.style.textShadow = '1px 1px ' + lightGray + ', 0 1px ' + lightGray + ', -1px -1px ' + darkGray + ', 0 -1px ' + darkGray;
      } else if (overrides.edgeStyle === 'uniform') {
        cueDiv.firstChild.style.textShadow = '0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray;
      }
    }
    if (overrides.fontPercent && overrides.fontPercent !== 1) {
      fontSize = window.parseFloat(cueDiv.style.fontSize);
      cueDiv.style.fontSize = (fontSize * overrides.fontPercent) + 'px';
      cueDiv.style.height = 'auto';
      cueDiv.style.top = 'auto';
      cueDiv.style.bottom = '2px';
    }
    if (overrides.fontFamily && overrides.fontFamily !== 'default') {
      if (overrides.fontFamily === 'small-caps') {
        cueDiv.firstChild.style.fontVariant = 'small-caps';
      } else {
        cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily];
      }
    }
  }
};


/**
 * The specific menu item type for selecting a language within a text track kind
 *
 * @constructor
 */
vjs.TextTrackMenuItem = vjs.MenuItem.extend({
  /** @constructor */
  init: function(player, options){
    var track = this.track = options['track'],
        tracks = player.textTracks(),
        changeHandler,
        event;

    if (tracks) {
      changeHandler = vjs.bind(this, function() {
        var selected = this.track['mode'] === 'showing',
            track,
            i,
            l;

        if (this instanceof vjs.OffTextTrackMenuItem) {
          selected = true;

          i = 0,
          l = tracks.length;

          for (; i < l; i++) {
            track = tracks[i];
            if (track['kind'] === this.track['kind'] && track['mode'] === 'showing') {
              selected = false;
              break;
            }
          }
        }

        this.selected(selected);
      });
      tracks.addEventListener('change', changeHandler);
      player.on('dispose', function() {
        tracks.removeEventListener('change', changeHandler);
      });
    }

    // Modify options for parent MenuItem class's init.
    options['label'] = track['label'] || track['language'] || 'Unknown';
    options['selected'] = track['default'] || track['mode'] === 'showing';
    vjs.MenuItem.call(this, player, options);

    // iOS7 doesn't dispatch change events to TextTrackLists when an
    // associated track's mode changes. Without something like
    // Object.observe() (also not present on iOS7), it's not
    // possible to detect changes to the mode attribute and polyfill
    // the change event. As a poor substitute, we manually dispatch
    // change events whenever the controls modify the mode.
    if (tracks && tracks.onchange === undefined) {
      this.on(['tap', 'click'], function() {
        if (typeof window.Event !== 'object') {
          // Android 2.3 throws an Illegal Constructor error for window.Event
          try {
            event = new window.Event('change');
          } catch(err){}
        }

        if (!event) {
          event = document.createEvent('Event');
          event.initEvent('change', true, true);
        }

        tracks.dispatchEvent(event);
      });
    }
  }
});

vjs.TextTrackMenuItem.prototype.onClick = function(){
  var kind = this.track['kind'],
      tracks = this.player_.textTracks(),
      mode,
      track,
      i = 0;

  vjs.MenuItem.prototype.onClick.call(this);

  if (!tracks) {
    return;
  }

  for (; i < tracks.length; i++) {
    track = tracks[i];

    if (track['kind'] !== kind) {
      continue;
    }

    if (track === this.track) {
      track['mode'] = 'showing';
    } else {
      track['mode'] = 'disabled';
    }
  }
};

/**
 * A special menu item for turning of a specific type of text track
 *
 * @constructor
 */
vjs.OffTextTrackMenuItem = vjs.TextTrackMenuItem.extend({
  /** @constructor */
  init: function(player, options){
    // Create pseudo track info
    // Requires options['kind']
    options['track'] = {
      'kind': options['kind'],
      'player': player,
      'label': options['kind'] + ' off',
      'default': false,
      'mode': 'disabled'
    };
    vjs.TextTrackMenuItem.call(this, player, options);
    this.selected(true);
  }
});

vjs.CaptionSettingsMenuItem = vjs.TextTrackMenuItem.extend({
  init: function(player, options) {
    options['track'] = {
      'kind': options['kind'],
      'player': player,
      'label': options['kind'] + ' settings',
      'default': false,
      mode: 'disabled'
    };

    vjs.TextTrackMenuItem.call(this, player, options);
    this.addClass('vjs-texttrack-settings');
  }
});

vjs.CaptionSettingsMenuItem.prototype.onClick = function() {
  this.player().getChild('textTrackSettings').show();
};

/**
 * The base class for buttons that toggle specific text track types (e.g. subtitles)
 *
 * @constructor
 */
vjs.TextTrackButton = vjs.MenuButton.extend({
  /** @constructor */
  init: function(player, options){
    var tracks, updateHandler;

    vjs.MenuButton.call(this, player, options);

    tracks = this.player_.textTracks();

    if (this.items.length <= 1) {
      this.hide();
    }

    if (!tracks) {
      return;
    }

    updateHandler = vjs.bind(this, this.update);
    tracks.addEventListener('removetrack', updateHandler);
    tracks.addEventListener('addtrack', updateHandler);

    this.player_.on('dispose', function() {
      tracks.removeEventListener('removetrack', updateHandler);
      tracks.removeEventListener('addtrack', updateHandler);
    });
  }
});

// Create a menu item for each text track
vjs.TextTrackButton.prototype.createItems = function(){
  var items = [], track, tracks;

  if (this instanceof vjs.CaptionsButton && !(this.player().tech && this.player().tech['featuresNativeTextTracks'])) {
    items.push(new vjs.CaptionSettingsMenuItem(this.player_, { 'kind': this.kind_ }));
  }

  // Add an OFF menu item to turn all tracks off
  items.push(new vjs.OffTextTrackMenuItem(this.player_, { 'kind': this.kind_ }));

  tracks = this.player_.textTracks();

  if (!tracks) {
    return items;
  }

  for (var i = 0; i < tracks.length; i++) {
    track = tracks[i];

    // only add tracks that are of the appropriate kind and have a label
    if (track['kind'] === this.kind_) {
      items.push(new vjs.TextTrackMenuItem(this.player_, {
        'track': track
      }));
    }
  }

  return items;
};

/**
 * The button component for toggling and selecting captions
 *
 * @constructor
 */
vjs.CaptionsButton = vjs.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Captions Menu');
  }
});
vjs.CaptionsButton.prototype.kind_ = 'captions';
vjs.CaptionsButton.prototype.buttonText = 'Captions';
vjs.CaptionsButton.prototype.className = 'vjs-captions-button';

vjs.CaptionsButton.prototype.update = function() {
  var threshold = 2;
  vjs.TextTrackButton.prototype.update.call(this);

  // if native, then threshold is 1 because no settings button
  if (this.player().tech && this.player().tech['featuresNativeTextTracks']) {
    threshold = 1;
  }

  if (this.items && this.items.length > threshold) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * The button component for toggling and selecting subtitles
 *
 * @constructor
 */
vjs.SubtitlesButton = vjs.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Subtitles Menu');
  }
});
vjs.SubtitlesButton.prototype.kind_ = 'subtitles';
vjs.SubtitlesButton.prototype.buttonText = 'Subtitles';
vjs.SubtitlesButton.prototype.className = 'vjs-subtitles-button';

// Chapters act much differently than other text tracks
// Cues are navigation vs. other tracks of alternative languages
/**
 * The button component for toggling and selecting chapters
 *
 * @constructor
 */
vjs.ChaptersButton = vjs.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Chapters Menu');
  }
});
vjs.ChaptersButton.prototype.kind_ = 'chapters';
vjs.ChaptersButton.prototype.buttonText = 'Chapters';
vjs.ChaptersButton.prototype.className = 'vjs-chapters-button';

// Create a menu item for each text track
vjs.ChaptersButton.prototype.createItems = function(){
  var items = [], track, tracks;

  tracks = this.player_.textTracks();

  if (!tracks) {
    return items;
  }

  for (var i = 0; i < tracks.length; i++) {
    track = tracks[i];
    if (track['kind'] === this.kind_) {
      items.push(new vjs.TextTrackMenuItem(this.player_, {
        'track': track
      }));
    }
  }

  return items;
};

vjs.ChaptersButton.prototype.createMenu = function(){
  var tracks = this.player_.textTracks() || [],
      i = 0,
      l = tracks.length,
      track, chaptersTrack,
      items = this.items = [];

  for (; i < l; i++) {
    track = tracks[i];
    if (track['kind'] == this.kind_) {
      if (!track.cues) {
        track['mode'] = 'hidden';
        /* jshint loopfunc:true */
        // TODO see if we can figure out a better way of doing this https://github.com/videojs/video.js/issues/1864
        window.setTimeout(vjs.bind(this, function() {
          this.createMenu();
        }), 100);
        /* jshint loopfunc:false */
      } else {
        chaptersTrack = track;
        break;
      }
    }
  }

  var menu = this.menu;
  if (menu === undefined) {
    menu = new vjs.Menu(this.player_);
    menu.contentEl().appendChild(vjs.createEl('li', {
      className: 'vjs-menu-title',
      innerHTML: vjs.capitalize(this.kind_),
      tabindex: -1
    }));
  }

  if (chaptersTrack) {
    var cues = chaptersTrack['cues'], cue, mi;
    i = 0;
    l = cues.length;

    for (; i < l; i++) {
      cue = cues[i];

      mi = new vjs.ChaptersTrackMenuItem(this.player_, {
        'track': chaptersTrack,
        'cue': cue
      });

      items.push(mi);

      menu.addChild(mi);
    }
    this.addChild(menu);
  }

  if (this.items.length > 0) {
    this.show();
  }

  return menu;
};


/**
 * @constructor
 */
vjs.ChaptersTrackMenuItem = vjs.MenuItem.extend({
  /** @constructor */
  init: function(player, options){
    var track = this.track = options['track'],
        cue = this.cue = options['cue'],
        currentTime = player.currentTime();

    // Modify options for parent MenuItem class's init.
    options['label'] = cue.text;
    options['selected'] = (cue['startTime'] <= currentTime && currentTime < cue['endTime']);
    vjs.MenuItem.call(this, player, options);

    track.addEventListener('cuechange', vjs.bind(this, this.update));
  }
});

vjs.ChaptersTrackMenuItem.prototype.onClick = function(){
  vjs.MenuItem.prototype.onClick.call(this);
  this.player_.currentTime(this.cue.startTime);
  this.update(this.cue.startTime);
};

vjs.ChaptersTrackMenuItem.prototype.update = function(){
  var cue = this.cue,
      currentTime = this.player_.currentTime();

  // vjs.log(currentTime, cue.startTime);
  this.selected(cue['startTime'] <= currentTime && currentTime < cue['endTime']);
};
})();
(function() {
  'use strict';

  vjs.TextTrackSettings = vjs.Component.extend({
    init: function(player, options) {
      vjs.Component.call(this, player, options);
      this.hide();

      vjs.on(this.el().querySelector('.vjs-done-button'), 'click', vjs.bind(this, function() {
        this.saveSettings();
        this.hide();
      }));

      vjs.on(this.el().querySelector('.vjs-default-button'), 'click', vjs.bind(this, function() {
        this.el().querySelector('.vjs-fg-color > select').selectedIndex = 0;
        this.el().querySelector('.vjs-bg-color > select').selectedIndex = 0;
        this.el().querySelector('.window-color > select').selectedIndex = 0;
        this.el().querySelector('.vjs-text-opacity > select').selectedIndex = 0;
        this.el().querySelector('.vjs-bg-opacity > select').selectedIndex = 0;
        this.el().querySelector('.vjs-window-opacity > select').selectedIndex = 0;
        this.el().querySelector('.vjs-edge-style select').selectedIndex = 0;
        this.el().querySelector('.vjs-font-family select').selectedIndex = 0;
        this.el().querySelector('.vjs-font-percent select').selectedIndex = 2;
        this.updateDisplay();
      }));

      vjs.on(this.el().querySelector('.vjs-fg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-bg-color > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.window-color > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-text-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-bg-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-window-opacity > select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-font-percent select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-edge-style select'), 'change', vjs.bind(this, this.updateDisplay));
      vjs.on(this.el().querySelector('.vjs-font-family select'), 'change', vjs.bind(this, this.updateDisplay));

      if (player.options()['persistTextTrackSettings']) {
        this.restoreSettings();
      }
    }
  });

  vjs.TextTrackSettings.prototype.createEl = function() {
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-caption-settings vjs-modal-overlay',
      innerHTML: captionOptionsMenuTemplate()
    });
  };

  vjs.TextTrackSettings.prototype.getValues = function() {
    var el, bgOpacity, textOpacity, windowOpacity, textEdge, fontFamily, fgColor, bgColor, windowColor, result, name, fontPercent;

    el = this.el();

    textEdge = getSelectedOptionValue(el.querySelector('.vjs-edge-style select'));
    fontFamily = getSelectedOptionValue(el.querySelector('.vjs-font-family select'));
    fgColor = getSelectedOptionValue(el.querySelector('.vjs-fg-color > select'));
    textOpacity = getSelectedOptionValue(el.querySelector('.vjs-text-opacity > select'));
    bgColor = getSelectedOptionValue(el.querySelector('.vjs-bg-color > select'));
    bgOpacity = getSelectedOptionValue(el.querySelector('.vjs-bg-opacity > select'));
    windowColor = getSelectedOptionValue(el.querySelector('.window-color > select'));
    windowOpacity = getSelectedOptionValue(el.querySelector('.vjs-window-opacity > select'));
    fontPercent = window['parseFloat'](getSelectedOptionValue(el.querySelector('.vjs-font-percent > select')));

    result = {
      'backgroundOpacity': bgOpacity,
      'textOpacity': textOpacity,
      'windowOpacity': windowOpacity,
      'edgeStyle': textEdge,
      'fontFamily': fontFamily,
      'color': fgColor,
      'backgroundColor': bgColor,
      'windowColor': windowColor,
      'fontPercent': fontPercent
    };
    for (name in result) {
      if (result[name] === '' || result[name] === 'none' || (name === 'fontPercent' && result[name] === 1.00)) {
        delete result[name];
      }
    }
    return result;
  };

  vjs.TextTrackSettings.prototype.setValues = function(values) {
    var el = this.el(), fontPercent;

    setSelectedOption(el.querySelector('.vjs-edge-style select'), values.edgeStyle);
    setSelectedOption(el.querySelector('.vjs-font-family select'), values.fontFamily);
    setSelectedOption(el.querySelector('.vjs-fg-color > select'), values.color);
    setSelectedOption(el.querySelector('.vjs-text-opacity > select'), values.textOpacity);
    setSelectedOption(el.querySelector('.vjs-bg-color > select'), values.backgroundColor);
    setSelectedOption(el.querySelector('.vjs-bg-opacity > select'), values.backgroundOpacity);
    setSelectedOption(el.querySelector('.window-color > select'), values.windowColor);
    setSelectedOption(el.querySelector('.vjs-window-opacity > select'), values.windowOpacity);

    fontPercent = values.fontPercent;

    if (fontPercent) {
      fontPercent = fontPercent.toFixed(2);
    }

    setSelectedOption(el.querySelector('.vjs-font-percent > select'), fontPercent);
  };

  vjs.TextTrackSettings.prototype.restoreSettings = function() {
    var values;
    try {
      values = JSON.parse(window.localStorage.getItem('vjs-text-track-settings'));
    } catch (e) {}

    if (values) {
      this.setValues(values);
    }
  };

  vjs.TextTrackSettings.prototype.saveSettings = function() {
    var values;

    if (!this.player_.options()['persistTextTrackSettings']) {
      return;
    }

    values = this.getValues();
    try {
      if (!vjs.isEmpty(values)) {
        window.localStorage.setItem('vjs-text-track-settings', JSON.stringify(values));
      } else {
        window.localStorage.removeItem('vjs-text-track-settings');
      }
    } catch (e) {}
  };

  vjs.TextTrackSettings.prototype.updateDisplay = function() {
    var ttDisplay = this.player_.getChild('textTrackDisplay');
    if (ttDisplay) {
      ttDisplay.updateDisplay();
    }
  };

  function getSelectedOptionValue(target) {
    var selectedOption;
    // not all browsers support selectedOptions, so, fallback to options
    if (target.selectedOptions) {
      selectedOption = target.selectedOptions[0];
    } else if (target.options) {
      selectedOption = target.options[target.options.selectedIndex];
    }

    return selectedOption.value;
  }

  function setSelectedOption(target, value) {
    var i, option;

    if (!value) {
      return;
    }

    for (i = 0; i < target.options.length; i++) {
      option = target.options[i];
      if (option.value === value) {
        break;
      }
    }

    target.selectedIndex = i;
  }

  function captionOptionsMenuTemplate() {
    return '<div class="vjs-tracksettings">' +
        '<div class="vjs-tracksettings-colors">' +
          '<div class="vjs-fg-color vjs-tracksetting">' +
              '<label class="vjs-label">Foreground</label>' +
              '<select>' +
                '<option value="">---</option>' +
                '<option value="#FFF">White</option>' +
                '<option value="#000">Black</option>' +
                '<option value="#F00">Red</option>' +
                '<option value="#0F0">Green</option>' +
                '<option value="#00F">Blue</option>' +
                '<option value="#FF0">Yellow</option>' +
                '<option value="#F0F">Magenta</option>' +
                '<option value="#0FF">Cyan</option>' +
              '</select>' +
              '<span class="vjs-text-opacity vjs-opacity">' +
                '<select>' +
                  '<option value="">---</option>' +
                  '<option value="1">Opaque</option>' +
                  '<option value="0.5">Semi-Opaque</option>' +
                '</select>' +
              '</span>' +
          '</div>' + // vjs-fg-color
          '<div class="vjs-bg-color vjs-tracksetting">' +
              '<label class="vjs-label">Background</label>' +
              '<select>' +
                '<option value="">---</option>' +
                '<option value="#FFF">White</option>' +
                '<option value="#000">Black</option>' +
                '<option value="#F00">Red</option>' +
                '<option value="#0F0">Green</option>' +
                '<option value="#00F">Blue</option>' +
                '<option value="#FF0">Yellow</option>' +
                '<option value="#F0F">Magenta</option>' +
                '<option value="#0FF">Cyan</option>' +
              '</select>' +
              '<span class="vjs-bg-opacity vjs-opacity">' +
                  '<select>' +
                    '<option value="">---</option>' +
                    '<option value="1">Opaque</option>' +
                    '<option value="0.5">Semi-Transparent</option>' +
                    '<option value="0">Transparent</option>' +
                  '</select>' +
              '</span>' +
          '</div>' + // vjs-bg-color
          '<div class="window-color vjs-tracksetting">' +
              '<label class="vjs-label">Window</label>' +
              '<select>' +
                '<option value="">---</option>' +
                '<option value="#FFF">White</option>' +
                '<option value="#000">Black</option>' +
                '<option value="#F00">Red</option>' +
                '<option value="#0F0">Green</option>' +
                '<option value="#00F">Blue</option>' +
                '<option value="#FF0">Yellow</option>' +
                '<option value="#F0F">Magenta</option>' +
                '<option value="#0FF">Cyan</option>' +
              '</select>' +
              '<span class="vjs-window-opacity vjs-opacity">' +
                  '<select>' +
                    '<option value="">---</option>' +
                    '<option value="1">Opaque</option>' +
                    '<option value="0.5">Semi-Transparent</option>' +
                    '<option value="0">Transparent</option>' +
                  '</select>' +
              '</span>' +
          '</div>' + // vjs-window-color
        '</div>' + // vjs-tracksettings
        '<div class="vjs-tracksettings-font">' +
          '<div class="vjs-font-percent vjs-tracksetting">' +
            '<label class="vjs-label">Font Size</label>' +
            '<select>' +
              '<option value="0.50">50%</option>' +
              '<option value="0.75">75%</option>' +
              '<option value="1.00" selected>100%</option>' +
              '<option value="1.25">125%</option>' +
              '<option value="1.50">150%</option>' +
              '<option value="1.75">175%</option>' +
              '<option value="2.00">200%</option>' +
              '<option value="3.00">300%</option>' +
              '<option value="4.00">400%</option>' +
            '</select>' +
          '</div>' + // vjs-font-percent
          '<div class="vjs-edge-style vjs-tracksetting">' +
            '<label class="vjs-label">Text Edge Style</label>' +
            '<select>' +
              '<option value="none">None</option>' +
              '<option value="raised">Raised</option>' +
              '<option value="depressed">Depressed</option>' +
              '<option value="uniform">Uniform</option>' +
              '<option value="dropshadow">Dropshadow</option>' +
            '</select>' +
          '</div>' + // vjs-edge-style
          '<div class="vjs-font-family vjs-tracksetting">' +
            '<label class="vjs-label">Font Family</label>' +
            '<select>' +
              '<option value="">Default</option>' +
              '<option value="monospaceSerif">Monospace Serif</option>' +
              '<option value="proportionalSerif">Proportional Serif</option>' +
              '<option value="monospaceSansSerif">Monospace Sans-Serif</option>' +
              '<option value="proportionalSansSerif">Proportional Sans-Serif</option>' +
              '<option value="casual">Casual</option>' +
              '<option value="script">Script</option>' +
              '<option value="small-caps">Small Caps</option>' +
            '</select>' +
          '</div>' + // vjs-font-family
        '</div>' +
      '</div>' +
      '<div class="vjs-tracksettings-controls">' +
        '<button class="vjs-default-button">Defaults</button>' +
        '<button class="vjs-done-button">Done</button>' +
      '</div>';
  }

})();
/**
 * @fileoverview Add JSON support
 * @suppress {undefinedVars}
 * (Compiler doesn't like JSON not being declared)
 */

/**
 * Javascript JSON implementation
 * (Parse Method Only)
 * https://github.com/douglascrockford/JSON-js/blob/master/json2.js
 * Only using for parse method when parsing data-setup attribute JSON.
 * @suppress {undefinedVars}
 * @namespace
 * @private
 */
vjs.JSON;

if (typeof window.JSON !== 'undefined' && typeof window.JSON.parse === 'function') {
  vjs.JSON = window.JSON;

} else {
  vjs.JSON = {};

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  /**
   * parse the json
   *
   * @memberof vjs.JSON
   * @param {String} text The JSON string to parse
   * @param {Function=} [reviver] Optional function that can transform the results
   * @return {Object|Array} The parsed JSON
   */
  vjs.JSON.parse = function (text, reviver) {
      var j;

      function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }
      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

          j = eval('(' + text + ')');

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

      throw new SyntaxError('JSON.parse(): invalid or malformed JSON data');
  };
}
/**
 * @fileoverview Functions for automatically setting up a player
 * based on the data-setup attribute of the video tag
 */

// Automatically set up any tags that have a data-setup attribute
vjs.autoSetup = function(){
  var options, mediaEl, player, i, e;

  // One day, when we stop supporting IE8, go back to this, but in the meantime...*hack hack hack*
  // var vids = Array.prototype.slice.call(document.getElementsByTagName('video'));
  // var audios = Array.prototype.slice.call(document.getElementsByTagName('audio'));
  // var mediaEls = vids.concat(audios);

  // Because IE8 doesn't support calling slice on a node list, we need to loop through each list of elements
  // to build up a new, combined list of elements.
  var vids = document.getElementsByTagName('video');
  var audios = document.getElementsByTagName('audio');
  var mediaEls = [];
  if (vids && vids.length > 0) {
    for(i=0, e=vids.length; i<e; i++) {
      mediaEls.push(vids[i]);
    }
  }
  if (audios && audios.length > 0) {
    for(i=0, e=audios.length; i<e; i++) {
      mediaEls.push(audios[i]);
    }
  }

  // Check if any media elements exist
  if (mediaEls && mediaEls.length > 0) {

    for (i=0,e=mediaEls.length; i<e; i++) {
      mediaEl = mediaEls[i];

      // Check if element exists, has getAttribute func.
      // IE seems to consider typeof el.getAttribute == 'object' instead of 'function' like expected, at least when loading the player immediately.
      if (mediaEl && mediaEl.getAttribute) {

        // Make sure this player hasn't already been set up.
        if (mediaEl['player'] === undefined) {
          options = mediaEl.getAttribute('data-setup');

          // Check if data-setup attr exists.
          // We only auto-setup if they've added the data-setup attr.
          if (options !== null) {
            // Create new video.js instance.
            player = videojs(mediaEl);
          }
        }

      // If getAttribute isn't defined, we need to wait for the DOM.
      } else {
        vjs.autoSetupTimeout(1);
        break;
      }
    }

  // No videos were found, so keep looping unless page is finished loading.
  } else if (!vjs.windowLoaded) {
    vjs.autoSetupTimeout(1);
  }
};

// Pause to let the DOM keep processing
vjs.autoSetupTimeout = function(wait){
  setTimeout(vjs.autoSetup, wait);
};

if (document.readyState === 'complete') {
  vjs.windowLoaded = true;
} else {
  vjs.one(window, 'load', function(){
    vjs.windowLoaded = true;
  });
}

// Run Auto-load players
// You have to wait at least once in case this script is loaded after your video in the DOM (weird behavior only with minified version)
vjs.autoSetupTimeout(1);
/**
 * the method for registering a video.js plugin
 *
 * @param  {String} name The name of the plugin
 * @param  {Function} init The function that is run when the player inits
 */
vjs.plugin = function(name, init){
  vjs.Player.prototype[name] = init;
};

/* vtt.js - v0.12.1 (https://github.com/mozilla/vtt.js) built on 08-07-2015 */

(function(root) {
  var vttjs = root.vttjs = {};
  var cueShim = vttjs.VTTCue;
  var regionShim = vttjs.VTTRegion;
  var oldVTTCue = root.VTTCue;
  var oldVTTRegion = root.VTTRegion;

  vttjs.shim = function() {
    vttjs.VTTCue = cueShim;
    vttjs.VTTRegion = regionShim;
  };

  vttjs.restore = function() {
    vttjs.VTTCue = oldVTTCue;
    vttjs.VTTRegion = oldVTTRegion;
  };
}(this));

/**
 * Copyright 2013 vtt.js Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, vttjs) {

  var autoKeyword = "auto";
  var directionSetting = {
    "": true,
    "lr": true,
    "rl": true
  };
  var alignSetting = {
    "start": true,
    "middle": true,
    "end": true,
    "left": true,
    "right": true
  };

  function findDirectionSetting(value) {
    if (typeof value !== "string") {
      return false;
    }
    var dir = directionSetting[value.toLowerCase()];
    return dir ? value.toLowerCase() : false;
  }

  function findAlignSetting(value) {
    if (typeof value !== "string") {
      return false;
    }
    var align = alignSetting[value.toLowerCase()];
    return align ? value.toLowerCase() : false;
  }

  function extend(obj) {
    var i = 1;
    for (; i < arguments.length; i++) {
      var cobj = arguments[i];
      for (var p in cobj) {
        obj[p] = cobj[p];
      }
    }

    return obj;
  }

  function VTTCue(startTime, endTime, text) {
    var cue = this;
    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);
    var baseObj = {};

    if (isIE8) {
      cue = document.createElement('custom');
    } else {
      baseObj.enumerable = true;
    }

    /**
     * Shim implementation specific properties. These properties are not in
     * the spec.
     */

    // Lets us know when the VTTCue's data has changed in such a way that we need
    // to recompute its display state. This lets us compute its display state
    // lazily.
    cue.hasBeenReset = false;

    /**
     * VTTCue and TextTrackCue properties
     * http://dev.w3.org/html5/webvtt/#vttcue-interface
     */

    var _id = "";
    var _pauseOnExit = false;
    var _startTime = startTime;
    var _endTime = endTime;
    var _text = text;
    var _region = null;
    var _vertical = "";
    var _snapToLines = true;
    var _line = "auto";
    var _lineAlign = "start";
    var _position = 50;
    var _positionAlign = "middle";
    var _size = 50;
    var _align = "middle";

    Object.defineProperty(cue,
      "id", extend({}, baseObj, {
        get: function() {
          return _id;
        },
        set: function(value) {
          _id = "" + value;
        }
      }));

    Object.defineProperty(cue,
      "pauseOnExit", extend({}, baseObj, {
        get: function() {
          return _pauseOnExit;
        },
        set: function(value) {
          _pauseOnExit = !!value;
        }
      }));

    Object.defineProperty(cue,
      "startTime", extend({}, baseObj, {
        get: function() {
          return _startTime;
        },
        set: function(value) {
          if (typeof value !== "number") {
            throw new TypeError("Start time must be set to a number.");
          }
          _startTime = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "endTime", extend({}, baseObj, {
        get: function() {
          return _endTime;
        },
        set: function(value) {
          if (typeof value !== "number") {
            throw new TypeError("End time must be set to a number.");
          }
          _endTime = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "text", extend({}, baseObj, {
        get: function() {
          return _text;
        },
        set: function(value) {
          _text = "" + value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "region", extend({}, baseObj, {
        get: function() {
          return _region;
        },
        set: function(value) {
          _region = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "vertical", extend({}, baseObj, {
        get: function() {
          return _vertical;
        },
        set: function(value) {
          var setting = findDirectionSetting(value);
          // Have to check for false because the setting an be an empty string.
          if (setting === false) {
            throw new SyntaxError("An invalid or illegal string was specified.");
          }
          _vertical = setting;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "snapToLines", extend({}, baseObj, {
        get: function() {
          return _snapToLines;
        },
        set: function(value) {
          _snapToLines = !!value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "line", extend({}, baseObj, {
        get: function() {
          return _line;
        },
        set: function(value) {
          if (typeof value !== "number" && value !== autoKeyword) {
            throw new SyntaxError("An invalid number or illegal string was specified.");
          }
          _line = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "lineAlign", extend({}, baseObj, {
        get: function() {
          return _lineAlign;
        },
        set: function(value) {
          var setting = findAlignSetting(value);
          if (!setting) {
            throw new SyntaxError("An invalid or illegal string was specified.");
          }
          _lineAlign = setting;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "position", extend({}, baseObj, {
        get: function() {
          return _position;
        },
        set: function(value) {
          if (value < 0 || value > 100) {
            throw new Error("Position must be between 0 and 100.");
          }
          _position = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "positionAlign", extend({}, baseObj, {
        get: function() {
          return _positionAlign;
        },
        set: function(value) {
          var setting = findAlignSetting(value);
          if (!setting) {
            throw new SyntaxError("An invalid or illegal string was specified.");
          }
          _positionAlign = setting;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "size", extend({}, baseObj, {
        get: function() {
          return _size;
        },
        set: function(value) {
          if (value < 0 || value > 100) {
            throw new Error("Size must be between 0 and 100.");
          }
          _size = value;
          this.hasBeenReset = true;
        }
      }));

    Object.defineProperty(cue,
      "align", extend({}, baseObj, {
        get: function() {
          return _align;
        },
        set: function(value) {
          var setting = findAlignSetting(value);
          if (!setting) {
            throw new SyntaxError("An invalid or illegal string was specified.");
          }
          _align = setting;
          this.hasBeenReset = true;
        }
      }));

    /**
     * Other <track> spec defined properties
     */

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#text-track-cue-display-state
    cue.displayState = undefined;

    if (isIE8) {
      return cue;
    }
  }

  /**
   * VTTCue methods
   */

  VTTCue.prototype.getCueAsHTML = function() {
    // Assume WebVTT.convertCueToDOMTree is on the global.
    return WebVTT.convertCueToDOMTree(window, this.text);
  };

  root.VTTCue = root.VTTCue || VTTCue;
  vttjs.VTTCue = VTTCue;
}(this, (this.vttjs || {})));

/**
 * Copyright 2013 vtt.js Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, vttjs) {

  var scrollSetting = {
    "": true,
    "up": true
  };

  function findScrollSetting(value) {
    if (typeof value !== "string") {
      return false;
    }
    var scroll = scrollSetting[value.toLowerCase()];
    return scroll ? value.toLowerCase() : false;
  }

  function isValidPercentValue(value) {
    return typeof value === "number" && (value >= 0 && value <= 100);
  }

  // VTTRegion shim http://dev.w3.org/html5/webvtt/#vttregion-interface
  function VTTRegion() {
    var _width = 100;
    var _lines = 3;
    var _regionAnchorX = 0;
    var _regionAnchorY = 100;
    var _viewportAnchorX = 0;
    var _viewportAnchorY = 100;
    var _scroll = "";

    Object.defineProperties(this, {
      "width": {
        enumerable: true,
        get: function() {
          return _width;
        },
        set: function(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("Width must be between 0 and 100.");
          }
          _width = value;
        }
      },
      "lines": {
        enumerable: true,
        get: function() {
          return _lines;
        },
        set: function(value) {
          if (typeof value !== "number") {
            throw new TypeError("Lines must be set to a number.");
          }
          _lines = value;
        }
      },
      "regionAnchorY": {
        enumerable: true,
        get: function() {
          return _regionAnchorY;
        },
        set: function(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("RegionAnchorX must be between 0 and 100.");
          }
          _regionAnchorY = value;
        }
      },
      "regionAnchorX": {
        enumerable: true,
        get: function() {
          return _regionAnchorX;
        },
        set: function(value) {
          if(!isValidPercentValue(value)) {
            throw new Error("RegionAnchorY must be between 0 and 100.");
          }
          _regionAnchorX = value;
        }
      },
      "viewportAnchorY": {
        enumerable: true,
        get: function() {
          return _viewportAnchorY;
        },
        set: function(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("ViewportAnchorY must be between 0 and 100.");
          }
          _viewportAnchorY = value;
        }
      },
      "viewportAnchorX": {
        enumerable: true,
        get: function() {
          return _viewportAnchorX;
        },
        set: function(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("ViewportAnchorX must be between 0 and 100.");
          }
          _viewportAnchorX = value;
        }
      },
      "scroll": {
        enumerable: true,
        get: function() {
          return _scroll;
        },
        set: function(value) {
          var setting = findScrollSetting(value);
          // Have to check for false as an empty string is a legal value.
          if (setting === false) {
            throw new SyntaxError("An invalid or illegal string was specified.");
          }
          _scroll = setting;
        }
      }
    });
  }

  root.VTTRegion = root.VTTRegion || VTTRegion;
  vttjs.VTTRegion = VTTRegion;
}(this, (this.vttjs || {})));

/**
 * Copyright 2013 vtt.js Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(global) {

  var _objCreate = Object.create || (function() {
    function F() {}
    return function(o) {
      if (arguments.length !== 1) {
        throw new Error('Object.create shim only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    };
  })();

  // Creates a new ParserError object from an errorData object. The errorData
  // object should have default code and message properties. The default message
  // property can be overriden by passing in a message parameter.
  // See ParsingError.Errors below for acceptable errors.
  function ParsingError(errorData, message) {
    this.name = "ParsingError";
    this.code = errorData.code;
    this.message = message || errorData.message;
  }
  ParsingError.prototype = _objCreate(Error.prototype);
  ParsingError.prototype.constructor = ParsingError;

  // ParsingError metadata for acceptable ParsingErrors.
  ParsingError.Errors = {
    BadSignature: {
      code: 0,
      message: "Malformed WebVTT signature."
    },
    BadTimeStamp: {
      code: 1,
      message: "Malformed time stamp."
    }
  };

  // Try to parse input as a time stamp.
  function parseTimeStamp(input) {

    function computeSeconds(h, m, s, f) {
      return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
    }

    var m = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
    if (!m) {
      return null;
    }

    if (m[3]) {
      // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
      return computeSeconds(m[1], m[2], m[3].replace(":", ""), m[4]);
    } else if (m[1] > 59) {
      // Timestamp takes the form of [hours]:[minutes].[milliseconds]
      // First position is hours as it's over 59.
      return computeSeconds(m[1], m[2], 0,  m[4]);
    } else {
      // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
      return computeSeconds(0, m[1], m[2], m[4]);
    }
  }

  // A settings object holds key/value pairs and will ignore anything but the first
  // assignment to a specific key.
  function Settings() {
    this.values = _objCreate(null);
  }

  Settings.prototype = {
    // Only accept the first assignment to any key.
    set: function(k, v) {
      if (!this.get(k) && v !== "") {
        this.values[k] = v;
      }
    },
    // Return the value for a key, or a default value.
    // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
    // a number of possible default values as properties where 'defaultKey' is
    // the key of the property that will be chosen; otherwise it's assumed to be
    // a single value.
    get: function(k, dflt, defaultKey) {
      if (defaultKey) {
        return this.has(k) ? this.values[k] : dflt[defaultKey];
      }
      return this.has(k) ? this.values[k] : dflt;
    },
    // Check whether we have a value for a key.
    has: function(k) {
      return k in this.values;
    },
    // Accept a setting if its one of the given alternatives.
    alt: function(k, v, a) {
      for (var n = 0; n < a.length; ++n) {
        if (v === a[n]) {
          this.set(k, v);
          break;
        }
      }
    },
    // Accept a setting if its a valid (signed) integer.
    integer: function(k, v) {
      if (/^-?\d+$/.test(v)) { // integer
        this.set(k, parseInt(v, 10));
      }
    },
    // Accept a setting if its a valid percentage.
    percent: function(k, v) {
      var m;
      if ((m = v.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
        v = parseFloat(v);
        if (v >= 0 && v <= 100) {
          this.set(k, v);
          return true;
        }
      }
      return false;
    }
  };

  // Helper function to parse input into groups separated by 'groupDelim', and
  // interprete each group as a key/value pair separated by 'keyValueDelim'.
  function parseOptions(input, callback, keyValueDelim, groupDelim) {
    var groups = groupDelim ? input.split(groupDelim) : [input];
    for (var i in groups) {
      if (typeof groups[i] !== "string") {
        continue;
      }
      var kv = groups[i].split(keyValueDelim);
      if (kv.length !== 2) {
        continue;
      }
      var k = kv[0];
      var v = kv[1];
      callback(k, v);
    }
  }

  function parseCue(input, cue, regionList) {
    // Remember the original input if we need to throw an error.
    var oInput = input;
    // 4.1 WebVTT timestamp
    function consumeTimeStamp() {
      var ts = parseTimeStamp(input);
      if (ts === null) {
        throw new ParsingError(ParsingError.Errors.BadTimeStamp,
                              "Malformed timestamp: " + oInput);
      }
      // Remove time stamp from input.
      input = input.replace(/^[^\sa-zA-Z-]+/, "");
      return ts;
    }

    // 4.4.2 WebVTT cue settings
    function consumeCueSettings(input, cue) {
      var settings = new Settings();

      parseOptions(input, function (k, v) {
        switch (k) {
        case "region":
          // Find the last region we parsed with the same region id.
          for (var i = regionList.length - 1; i >= 0; i--) {
            if (regionList[i].id === v) {
              settings.set(k, regionList[i].region);
              break;
            }
          }
          break;
        case "vertical":
          settings.alt(k, v, ["rl", "lr"]);
          break;
        case "line":
          var vals = v.split(","),
              vals0 = vals[0];
          settings.integer(k, vals0);
          settings.percent(k, vals0) ? settings.set("snapToLines", false) : null;
          settings.alt(k, vals0, ["auto"]);
          if (vals.length === 2) {
            settings.alt("lineAlign", vals[1], ["start", "middle", "end"]);
          }
          break;
        case "position":
          vals = v.split(",");
          settings.percent(k, vals[0]);
          if (vals.length === 2) {
            settings.alt("positionAlign", vals[1], ["start", "middle", "end"]);
          }
          break;
        case "size":
          settings.percent(k, v);
          break;
        case "align":
          settings.alt(k, v, ["start", "middle", "end", "left", "right"]);
          break;
        }
      }, /:/, /\s/);

      // Apply default values for any missing fields.
      cue.region = settings.get("region", null);
      cue.vertical = settings.get("vertical", "");
      cue.line = settings.get("line", "auto");
      cue.lineAlign = settings.get("lineAlign", "start");
      cue.snapToLines = settings.get("snapToLines", true);
      cue.size = settings.get("size", 100);
      cue.align = settings.get("align", "middle");
      cue.position = settings.get("position", {
        start: 0,
        left: 0,
        middle: 50,
        end: 100,
        right: 100
      }, cue.align);
      cue.positionAlign = settings.get("positionAlign", {
        start: "start",
        left: "start",
        middle: "middle",
        end: "end",
        right: "end"
      }, cue.align);
    }

    function skipWhitespace() {
      input = input.replace(/^\s+/, "");
    }

    // 4.1 WebVTT cue timings.
    skipWhitespace();
    cue.startTime = consumeTimeStamp();   // (1) collect cue start time
    skipWhitespace();
    if (input.substr(0, 3) !== "-->") {     // (3) next characters must match "-->"
      throw new ParsingError(ParsingError.Errors.BadTimeStamp,
                             "Malformed time stamp (time stamps must be separated by '-->'): " +
                             oInput);
    }
    input = input.substr(3);
    skipWhitespace();
    cue.endTime = consumeTimeStamp();     // (5) collect cue end time

    // 4.1 WebVTT cue settings list.
    skipWhitespace();
    consumeCueSettings(input, cue);
  }

  var ESCAPE = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&lrm;": "\u200e",
    "&rlm;": "\u200f",
    "&nbsp;": "\u00a0"
  };

  var TAG_NAME = {
    c: "span",
    i: "i",
    b: "b",
    u: "u",
    ruby: "ruby",
    rt: "rt",
    v: "span",
    lang: "span"
  };

  var TAG_ANNOTATION = {
    v: "title",
    lang: "lang"
  };

  var NEEDS_PARENT = {
    rt: "ruby"
  };

  // Parse content into a document fragment.
  function parseContent(window, input) {
    function nextToken() {
      // Check for end-of-string.
      if (!input) {
        return null;
      }

      // Consume 'n' characters from the input.
      function consume(result) {
        input = input.substr(result.length);
        return result;
      }

      var m = input.match(/^([^<]*)(<[^>]+>?)?/);
      // If there is some text before the next tag, return it, otherwise return
      // the tag.
      return consume(m[1] ? m[1] : m[2]);
    }

    // Unescape a string 's'.
    function unescape1(e) {
      return ESCAPE[e];
    }
    function unescape(s) {
      while ((m = s.match(/&(amp|lt|gt|lrm|rlm|nbsp);/))) {
        s = s.replace(m[0], unescape1);
      }
      return s;
    }

    function shouldAdd(current, element) {
      return !NEEDS_PARENT[element.localName] ||
             NEEDS_PARENT[element.localName] === current.localName;
    }

    // Create an element for this tag.
    function createElement(type, annotation) {
      var tagName = TAG_NAME[type];
      if (!tagName) {
        return null;
      }
      var element = window.document.createElement(tagName);
      element.localName = tagName;
      var name = TAG_ANNOTATION[type];
      if (name && annotation) {
        element[name] = annotation.trim();
      }
      return element;
    }

    var rootDiv = window.document.createElement("div"),
        current = rootDiv,
        t,
        tagStack = [];

    while ((t = nextToken()) !== null) {
      if (t[0] === '<') {
        if (t[1] === "/") {
          // If the closing tag matches, move back up to the parent node.
          if (tagStack.length &&
              tagStack[tagStack.length - 1] === t.substr(2).replace(">", "")) {
            tagStack.pop();
            current = current.parentNode;
          }
          // Otherwise just ignore the end tag.
          continue;
        }
        var ts = parseTimeStamp(t.substr(1, t.length - 2));
        var node;
        if (ts) {
          // Timestamps are lead nodes as well.
          node = window.document.createProcessingInstruction("timestamp", ts);
          current.appendChild(node);
          continue;
        }
        var m = t.match(/^<([^.\s/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/);
        // If we can't parse the tag, skip to the next tag.
        if (!m) {
          continue;
        }
        // Try to construct an element, and ignore the tag if we couldn't.
        node = createElement(m[1], m[3]);
        if (!node) {
          continue;
        }
        // Determine if the tag should be added based on the context of where it
        // is placed in the cuetext.
        if (!shouldAdd(current, node)) {
          continue;
        }
        // Set the class list (as a list of classes, separated by space).
        if (m[2]) {
          node.className = m[2].substr(1).replace('.', ' ');
        }
        // Append the node to the current node, and enter the scope of the new
        // node.
        tagStack.push(m[1]);
        current.appendChild(node);
        current = node;
        continue;
      }

      // Text nodes are leaf nodes.
      current.appendChild(window.document.createTextNode(unescape(t)));
    }

    return rootDiv;
  }

  // This is a list of all the Unicode characters that have a strong
  // right-to-left category. What this means is that these characters are
  // written right-to-left for sure. It was generated by pulling all the strong
  // right-to-left characters out of the Unicode data table. That table can
  // found at: http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
  var strongRTLChars = [0x05BE, 0x05C0, 0x05C3, 0x05C6, 0x05D0, 0x05D1,
      0x05D2, 0x05D3, 0x05D4, 0x05D5, 0x05D6, 0x05D7, 0x05D8, 0x05D9, 0x05DA,
      0x05DB, 0x05DC, 0x05DD, 0x05DE, 0x05DF, 0x05E0, 0x05E1, 0x05E2, 0x05E3,
      0x05E4, 0x05E5, 0x05E6, 0x05E7, 0x05E8, 0x05E9, 0x05EA, 0x05F0, 0x05F1,
      0x05F2, 0x05F3, 0x05F4, 0x0608, 0x060B, 0x060D, 0x061B, 0x061E, 0x061F,
      0x0620, 0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0626, 0x0627, 0x0628,
      0x0629, 0x062A, 0x062B, 0x062C, 0x062D, 0x062E, 0x062F, 0x0630, 0x0631,
      0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0639, 0x063A,
      0x063B, 0x063C, 0x063D, 0x063E, 0x063F, 0x0640, 0x0641, 0x0642, 0x0643,
      0x0644, 0x0645, 0x0646, 0x0647, 0x0648, 0x0649, 0x064A, 0x066D, 0x066E,
      0x066F, 0x0671, 0x0672, 0x0673, 0x0674, 0x0675, 0x0676, 0x0677, 0x0678,
      0x0679, 0x067A, 0x067B, 0x067C, 0x067D, 0x067E, 0x067F, 0x0680, 0x0681,
      0x0682, 0x0683, 0x0684, 0x0685, 0x0686, 0x0687, 0x0688, 0x0689, 0x068A,
      0x068B, 0x068C, 0x068D, 0x068E, 0x068F, 0x0690, 0x0691, 0x0692, 0x0693,
      0x0694, 0x0695, 0x0696, 0x0697, 0x0698, 0x0699, 0x069A, 0x069B, 0x069C,
      0x069D, 0x069E, 0x069F, 0x06A0, 0x06A1, 0x06A2, 0x06A3, 0x06A4, 0x06A5,
      0x06A6, 0x06A7, 0x06A8, 0x06A9, 0x06AA, 0x06AB, 0x06AC, 0x06AD, 0x06AE,
      0x06AF, 0x06B0, 0x06B1, 0x06B2, 0x06B3, 0x06B4, 0x06B5, 0x06B6, 0x06B7,
      0x06B8, 0x06B9, 0x06BA, 0x06BB, 0x06BC, 0x06BD, 0x06BE, 0x06BF, 0x06C0,
      0x06C1, 0x06C2, 0x06C3, 0x06C4, 0x06C5, 0x06C6, 0x06C7, 0x06C8, 0x06C9,
      0x06CA, 0x06CB, 0x06CC, 0x06CD, 0x06CE, 0x06CF, 0x06D0, 0x06D1, 0x06D2,
      0x06D3, 0x06D4, 0x06D5, 0x06E5, 0x06E6, 0x06EE, 0x06EF, 0x06FA, 0x06FB,
      0x06FC, 0x06FD, 0x06FE, 0x06FF, 0x0700, 0x0701, 0x0702, 0x0703, 0x0704,
      0x0705, 0x0706, 0x0707, 0x0708, 0x0709, 0x070A, 0x070B, 0x070C, 0x070D,
      0x070F, 0x0710, 0x0712, 0x0713, 0x0714, 0x0715, 0x0716, 0x0717, 0x0718,
      0x0719, 0x071A, 0x071B, 0x071C, 0x071D, 0x071E, 0x071F, 0x0720, 0x0721,
      0x0722, 0x0723, 0x0724, 0x0725, 0x0726, 0x0727, 0x0728, 0x0729, 0x072A,
      0x072B, 0x072C, 0x072D, 0x072E, 0x072F, 0x074D, 0x074E, 0x074F, 0x0750,
      0x0751, 0x0752, 0x0753, 0x0754, 0x0755, 0x0756, 0x0757, 0x0758, 0x0759,
      0x075A, 0x075B, 0x075C, 0x075D, 0x075E, 0x075F, 0x0760, 0x0761, 0x0762,
      0x0763, 0x0764, 0x0765, 0x0766, 0x0767, 0x0768, 0x0769, 0x076A, 0x076B,
      0x076C, 0x076D, 0x076E, 0x076F, 0x0770, 0x0771, 0x0772, 0x0773, 0x0774,
      0x0775, 0x0776, 0x0777, 0x0778, 0x0779, 0x077A, 0x077B, 0x077C, 0x077D,
      0x077E, 0x077F, 0x0780, 0x0781, 0x0782, 0x0783, 0x0784, 0x0785, 0x0786,
      0x0787, 0x0788, 0x0789, 0x078A, 0x078B, 0x078C, 0x078D, 0x078E, 0x078F,
      0x0790, 0x0791, 0x0792, 0x0793, 0x0794, 0x0795, 0x0796, 0x0797, 0x0798,
      0x0799, 0x079A, 0x079B, 0x079C, 0x079D, 0x079E, 0x079F, 0x07A0, 0x07A1,
      0x07A2, 0x07A3, 0x07A4, 0x07A5, 0x07B1, 0x07C0, 0x07C1, 0x07C2, 0x07C3,
      0x07C4, 0x07C5, 0x07C6, 0x07C7, 0x07C8, 0x07C9, 0x07CA, 0x07CB, 0x07CC,
      0x07CD, 0x07CE, 0x07CF, 0x07D0, 0x07D1, 0x07D2, 0x07D3, 0x07D4, 0x07D5,
      0x07D6, 0x07D7, 0x07D8, 0x07D9, 0x07DA, 0x07DB, 0x07DC, 0x07DD, 0x07DE,
      0x07DF, 0x07E0, 0x07E1, 0x07E2, 0x07E3, 0x07E4, 0x07E5, 0x07E6, 0x07E7,
      0x07E8, 0x07E9, 0x07EA, 0x07F4, 0x07F5, 0x07FA, 0x0800, 0x0801, 0x0802,
      0x0803, 0x0804, 0x0805, 0x0806, 0x0807, 0x0808, 0x0809, 0x080A, 0x080B,
      0x080C, 0x080D, 0x080E, 0x080F, 0x0810, 0x0811, 0x0812, 0x0813, 0x0814,
      0x0815, 0x081A, 0x0824, 0x0828, 0x0830, 0x0831, 0x0832, 0x0833, 0x0834,
      0x0835, 0x0836, 0x0837, 0x0838, 0x0839, 0x083A, 0x083B, 0x083C, 0x083D,
      0x083E, 0x0840, 0x0841, 0x0842, 0x0843, 0x0844, 0x0845, 0x0846, 0x0847,
      0x0848, 0x0849, 0x084A, 0x084B, 0x084C, 0x084D, 0x084E, 0x084F, 0x0850,
      0x0851, 0x0852, 0x0853, 0x0854, 0x0855, 0x0856, 0x0857, 0x0858, 0x085E,
      0x08A0, 0x08A2, 0x08A3, 0x08A4, 0x08A5, 0x08A6, 0x08A7, 0x08A8, 0x08A9,
      0x08AA, 0x08AB, 0x08AC, 0x200F, 0xFB1D, 0xFB1F, 0xFB20, 0xFB21, 0xFB22,
      0xFB23, 0xFB24, 0xFB25, 0xFB26, 0xFB27, 0xFB28, 0xFB2A, 0xFB2B, 0xFB2C,
      0xFB2D, 0xFB2E, 0xFB2F, 0xFB30, 0xFB31, 0xFB32, 0xFB33, 0xFB34, 0xFB35,
      0xFB36, 0xFB38, 0xFB39, 0xFB3A, 0xFB3B, 0xFB3C, 0xFB3E, 0xFB40, 0xFB41,
      0xFB43, 0xFB44, 0xFB46, 0xFB47, 0xFB48, 0xFB49, 0xFB4A, 0xFB4B, 0xFB4C,
      0xFB4D, 0xFB4E, 0xFB4F, 0xFB50, 0xFB51, 0xFB52, 0xFB53, 0xFB54, 0xFB55,
      0xFB56, 0xFB57, 0xFB58, 0xFB59, 0xFB5A, 0xFB5B, 0xFB5C, 0xFB5D, 0xFB5E,
      0xFB5F, 0xFB60, 0xFB61, 0xFB62, 0xFB63, 0xFB64, 0xFB65, 0xFB66, 0xFB67,
      0xFB68, 0xFB69, 0xFB6A, 0xFB6B, 0xFB6C, 0xFB6D, 0xFB6E, 0xFB6F, 0xFB70,
      0xFB71, 0xFB72, 0xFB73, 0xFB74, 0xFB75, 0xFB76, 0xFB77, 0xFB78, 0xFB79,
      0xFB7A, 0xFB7B, 0xFB7C, 0xFB7D, 0xFB7E, 0xFB7F, 0xFB80, 0xFB81, 0xFB82,
      0xFB83, 0xFB84, 0xFB85, 0xFB86, 0xFB87, 0xFB88, 0xFB89, 0xFB8A, 0xFB8B,
      0xFB8C, 0xFB8D, 0xFB8E, 0xFB8F, 0xFB90, 0xFB91, 0xFB92, 0xFB93, 0xFB94,
      0xFB95, 0xFB96, 0xFB97, 0xFB98, 0xFB99, 0xFB9A, 0xFB9B, 0xFB9C, 0xFB9D,
      0xFB9E, 0xFB9F, 0xFBA0, 0xFBA1, 0xFBA2, 0xFBA3, 0xFBA4, 0xFBA5, 0xFBA6,
      0xFBA7, 0xFBA8, 0xFBA9, 0xFBAA, 0xFBAB, 0xFBAC, 0xFBAD, 0xFBAE, 0xFBAF,
      0xFBB0, 0xFBB1, 0xFBB2, 0xFBB3, 0xFBB4, 0xFBB5, 0xFBB6, 0xFBB7, 0xFBB8,
      0xFBB9, 0xFBBA, 0xFBBB, 0xFBBC, 0xFBBD, 0xFBBE, 0xFBBF, 0xFBC0, 0xFBC1,
      0xFBD3, 0xFBD4, 0xFBD5, 0xFBD6, 0xFBD7, 0xFBD8, 0xFBD9, 0xFBDA, 0xFBDB,
      0xFBDC, 0xFBDD, 0xFBDE, 0xFBDF, 0xFBE0, 0xFBE1, 0xFBE2, 0xFBE3, 0xFBE4,
      0xFBE5, 0xFBE6, 0xFBE7, 0xFBE8, 0xFBE9, 0xFBEA, 0xFBEB, 0xFBEC, 0xFBED,
      0xFBEE, 0xFBEF, 0xFBF0, 0xFBF1, 0xFBF2, 0xFBF3, 0xFBF4, 0xFBF5, 0xFBF6,
      0xFBF7, 0xFBF8, 0xFBF9, 0xFBFA, 0xFBFB, 0xFBFC, 0xFBFD, 0xFBFE, 0xFBFF,
      0xFC00, 0xFC01, 0xFC02, 0xFC03, 0xFC04, 0xFC05, 0xFC06, 0xFC07, 0xFC08,
      0xFC09, 0xFC0A, 0xFC0B, 0xFC0C, 0xFC0D, 0xFC0E, 0xFC0F, 0xFC10, 0xFC11,
      0xFC12, 0xFC13, 0xFC14, 0xFC15, 0xFC16, 0xFC17, 0xFC18, 0xFC19, 0xFC1A,
      0xFC1B, 0xFC1C, 0xFC1D, 0xFC1E, 0xFC1F, 0xFC20, 0xFC21, 0xFC22, 0xFC23,
      0xFC24, 0xFC25, 0xFC26, 0xFC27, 0xFC28, 0xFC29, 0xFC2A, 0xFC2B, 0xFC2C,
      0xFC2D, 0xFC2E, 0xFC2F, 0xFC30, 0xFC31, 0xFC32, 0xFC33, 0xFC34, 0xFC35,
      0xFC36, 0xFC37, 0xFC38, 0xFC39, 0xFC3A, 0xFC3B, 0xFC3C, 0xFC3D, 0xFC3E,
      0xFC3F, 0xFC40, 0xFC41, 0xFC42, 0xFC43, 0xFC44, 0xFC45, 0xFC46, 0xFC47,
      0xFC48, 0xFC49, 0xFC4A, 0xFC4B, 0xFC4C, 0xFC4D, 0xFC4E, 0xFC4F, 0xFC50,
      0xFC51, 0xFC52, 0xFC53, 0xFC54, 0xFC55, 0xFC56, 0xFC57, 0xFC58, 0xFC59,
      0xFC5A, 0xFC5B, 0xFC5C, 0xFC5D, 0xFC5E, 0xFC5F, 0xFC60, 0xFC61, 0xFC62,
      0xFC63, 0xFC64, 0xFC65, 0xFC66, 0xFC67, 0xFC68, 0xFC69, 0xFC6A, 0xFC6B,
      0xFC6C, 0xFC6D, 0xFC6E, 0xFC6F, 0xFC70, 0xFC71, 0xFC72, 0xFC73, 0xFC74,
      0xFC75, 0xFC76, 0xFC77, 0xFC78, 0xFC79, 0xFC7A, 0xFC7B, 0xFC7C, 0xFC7D,
      0xFC7E, 0xFC7F, 0xFC80, 0xFC81, 0xFC82, 0xFC83, 0xFC84, 0xFC85, 0xFC86,
      0xFC87, 0xFC88, 0xFC89, 0xFC8A, 0xFC8B, 0xFC8C, 0xFC8D, 0xFC8E, 0xFC8F,
      0xFC90, 0xFC91, 0xFC92, 0xFC93, 0xFC94, 0xFC95, 0xFC96, 0xFC97, 0xFC98,
      0xFC99, 0xFC9A, 0xFC9B, 0xFC9C, 0xFC9D, 0xFC9E, 0xFC9F, 0xFCA0, 0xFCA1,
      0xFCA2, 0xFCA3, 0xFCA4, 0xFCA5, 0xFCA6, 0xFCA7, 0xFCA8, 0xFCA9, 0xFCAA,
      0xFCAB, 0xFCAC, 0xFCAD, 0xFCAE, 0xFCAF, 0xFCB0, 0xFCB1, 0xFCB2, 0xFCB3,
      0xFCB4, 0xFCB5, 0xFCB6, 0xFCB7, 0xFCB8, 0xFCB9, 0xFCBA, 0xFCBB, 0xFCBC,
      0xFCBD, 0xFCBE, 0xFCBF, 0xFCC0, 0xFCC1, 0xFCC2, 0xFCC3, 0xFCC4, 0xFCC5,
      0xFCC6, 0xFCC7, 0xFCC8, 0xFCC9, 0xFCCA, 0xFCCB, 0xFCCC, 0xFCCD, 0xFCCE,
      0xFCCF, 0xFCD0, 0xFCD1, 0xFCD2, 0xFCD3, 0xFCD4, 0xFCD5, 0xFCD6, 0xFCD7,
      0xFCD8, 0xFCD9, 0xFCDA, 0xFCDB, 0xFCDC, 0xFCDD, 0xFCDE, 0xFCDF, 0xFCE0,
      0xFCE1, 0xFCE2, 0xFCE3, 0xFCE4, 0xFCE5, 0xFCE6, 0xFCE7, 0xFCE8, 0xFCE9,
      0xFCEA, 0xFCEB, 0xFCEC, 0xFCED, 0xFCEE, 0xFCEF, 0xFCF0, 0xFCF1, 0xFCF2,
      0xFCF3, 0xFCF4, 0xFCF5, 0xFCF6, 0xFCF7, 0xFCF8, 0xFCF9, 0xFCFA, 0xFCFB,
      0xFCFC, 0xFCFD, 0xFCFE, 0xFCFF, 0xFD00, 0xFD01, 0xFD02, 0xFD03, 0xFD04,
      0xFD05, 0xFD06, 0xFD07, 0xFD08, 0xFD09, 0xFD0A, 0xFD0B, 0xFD0C, 0xFD0D,
      0xFD0E, 0xFD0F, 0xFD10, 0xFD11, 0xFD12, 0xFD13, 0xFD14, 0xFD15, 0xFD16,
      0xFD17, 0xFD18, 0xFD19, 0xFD1A, 0xFD1B, 0xFD1C, 0xFD1D, 0xFD1E, 0xFD1F,
      0xFD20, 0xFD21, 0xFD22, 0xFD23, 0xFD24, 0xFD25, 0xFD26, 0xFD27, 0xFD28,
      0xFD29, 0xFD2A, 0xFD2B, 0xFD2C, 0xFD2D, 0xFD2E, 0xFD2F, 0xFD30, 0xFD31,
      0xFD32, 0xFD33, 0xFD34, 0xFD35, 0xFD36, 0xFD37, 0xFD38, 0xFD39, 0xFD3A,
      0xFD3B, 0xFD3C, 0xFD3D, 0xFD50, 0xFD51, 0xFD52, 0xFD53, 0xFD54, 0xFD55,
      0xFD56, 0xFD57, 0xFD58, 0xFD59, 0xFD5A, 0xFD5B, 0xFD5C, 0xFD5D, 0xFD5E,
      0xFD5F, 0xFD60, 0xFD61, 0xFD62, 0xFD63, 0xFD64, 0xFD65, 0xFD66, 0xFD67,
      0xFD68, 0xFD69, 0xFD6A, 0xFD6B, 0xFD6C, 0xFD6D, 0xFD6E, 0xFD6F, 0xFD70,
      0xFD71, 0xFD72, 0xFD73, 0xFD74, 0xFD75, 0xFD76, 0xFD77, 0xFD78, 0xFD79,
      0xFD7A, 0xFD7B, 0xFD7C, 0xFD7D, 0xFD7E, 0xFD7F, 0xFD80, 0xFD81, 0xFD82,
      0xFD83, 0xFD84, 0xFD85, 0xFD86, 0xFD87, 0xFD88, 0xFD89, 0xFD8A, 0xFD8B,
      0xFD8C, 0xFD8D, 0xFD8E, 0xFD8F, 0xFD92, 0xFD93, 0xFD94, 0xFD95, 0xFD96,
      0xFD97, 0xFD98, 0xFD99, 0xFD9A, 0xFD9B, 0xFD9C, 0xFD9D, 0xFD9E, 0xFD9F,
      0xFDA0, 0xFDA1, 0xFDA2, 0xFDA3, 0xFDA4, 0xFDA5, 0xFDA6, 0xFDA7, 0xFDA8,
      0xFDA9, 0xFDAA, 0xFDAB, 0xFDAC, 0xFDAD, 0xFDAE, 0xFDAF, 0xFDB0, 0xFDB1,
      0xFDB2, 0xFDB3, 0xFDB4, 0xFDB5, 0xFDB6, 0xFDB7, 0xFDB8, 0xFDB9, 0xFDBA,
      0xFDBB, 0xFDBC, 0xFDBD, 0xFDBE, 0xFDBF, 0xFDC0, 0xFDC1, 0xFDC2, 0xFDC3,
      0xFDC4, 0xFDC5, 0xFDC6, 0xFDC7, 0xFDF0, 0xFDF1, 0xFDF2, 0xFDF3, 0xFDF4,
      0xFDF5, 0xFDF6, 0xFDF7, 0xFDF8, 0xFDF9, 0xFDFA, 0xFDFB, 0xFDFC, 0xFE70,
      0xFE71, 0xFE72, 0xFE73, 0xFE74, 0xFE76, 0xFE77, 0xFE78, 0xFE79, 0xFE7A,
      0xFE7B, 0xFE7C, 0xFE7D, 0xFE7E, 0xFE7F, 0xFE80, 0xFE81, 0xFE82, 0xFE83,
      0xFE84, 0xFE85, 0xFE86, 0xFE87, 0xFE88, 0xFE89, 0xFE8A, 0xFE8B, 0xFE8C,
      0xFE8D, 0xFE8E, 0xFE8F, 0xFE90, 0xFE91, 0xFE92, 0xFE93, 0xFE94, 0xFE95,
      0xFE96, 0xFE97, 0xFE98, 0xFE99, 0xFE9A, 0xFE9B, 0xFE9C, 0xFE9D, 0xFE9E,
      0xFE9F, 0xFEA0, 0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4, 0xFEA5, 0xFEA6, 0xFEA7,
      0xFEA8, 0xFEA9, 0xFEAA, 0xFEAB, 0xFEAC, 0xFEAD, 0xFEAE, 0xFEAF, 0xFEB0,
      0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4, 0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8, 0xFEB9,
      0xFEBA, 0xFEBB, 0xFEBC, 0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0, 0xFEC1, 0xFEC2,
      0xFEC3, 0xFEC4, 0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8, 0xFEC9, 0xFECA, 0xFECB,
      0xFECC, 0xFECD, 0xFECE, 0xFECF, 0xFED0, 0xFED1, 0xFED2, 0xFED3, 0xFED4,
      0xFED5, 0xFED6, 0xFED7, 0xFED8, 0xFED9, 0xFEDA, 0xFEDB, 0xFEDC, 0xFEDD,
      0xFEDE, 0xFEDF, 0xFEE0, 0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4, 0xFEE5, 0xFEE6,
      0xFEE7, 0xFEE8, 0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC, 0xFEED, 0xFEEE, 0xFEEF,
      0xFEF0, 0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4, 0xFEF5, 0xFEF6, 0xFEF7, 0xFEF8,
      0xFEF9, 0xFEFA, 0xFEFB, 0xFEFC, 0x10800, 0x10801, 0x10802, 0x10803,
      0x10804, 0x10805, 0x10808, 0x1080A, 0x1080B, 0x1080C, 0x1080D, 0x1080E,
      0x1080F, 0x10810, 0x10811, 0x10812, 0x10813, 0x10814, 0x10815, 0x10816,
      0x10817, 0x10818, 0x10819, 0x1081A, 0x1081B, 0x1081C, 0x1081D, 0x1081E,
      0x1081F, 0x10820, 0x10821, 0x10822, 0x10823, 0x10824, 0x10825, 0x10826,
      0x10827, 0x10828, 0x10829, 0x1082A, 0x1082B, 0x1082C, 0x1082D, 0x1082E,
      0x1082F, 0x10830, 0x10831, 0x10832, 0x10833, 0x10834, 0x10835, 0x10837,
      0x10838, 0x1083C, 0x1083F, 0x10840, 0x10841, 0x10842, 0x10843, 0x10844,
      0x10845, 0x10846, 0x10847, 0x10848, 0x10849, 0x1084A, 0x1084B, 0x1084C,
      0x1084D, 0x1084E, 0x1084F, 0x10850, 0x10851, 0x10852, 0x10853, 0x10854,
      0x10855, 0x10857, 0x10858, 0x10859, 0x1085A, 0x1085B, 0x1085C, 0x1085D,
      0x1085E, 0x1085F, 0x10900, 0x10901, 0x10902, 0x10903, 0x10904, 0x10905,
      0x10906, 0x10907, 0x10908, 0x10909, 0x1090A, 0x1090B, 0x1090C, 0x1090D,
      0x1090E, 0x1090F, 0x10910, 0x10911, 0x10912, 0x10913, 0x10914, 0x10915,
      0x10916, 0x10917, 0x10918, 0x10919, 0x1091A, 0x1091B, 0x10920, 0x10921,
      0x10922, 0x10923, 0x10924, 0x10925, 0x10926, 0x10927, 0x10928, 0x10929,
      0x1092A, 0x1092B, 0x1092C, 0x1092D, 0x1092E, 0x1092F, 0x10930, 0x10931,
      0x10932, 0x10933, 0x10934, 0x10935, 0x10936, 0x10937, 0x10938, 0x10939,
      0x1093F, 0x10980, 0x10981, 0x10982, 0x10983, 0x10984, 0x10985, 0x10986,
      0x10987, 0x10988, 0x10989, 0x1098A, 0x1098B, 0x1098C, 0x1098D, 0x1098E,
      0x1098F, 0x10990, 0x10991, 0x10992, 0x10993, 0x10994, 0x10995, 0x10996,
      0x10997, 0x10998, 0x10999, 0x1099A, 0x1099B, 0x1099C, 0x1099D, 0x1099E,
      0x1099F, 0x109A0, 0x109A1, 0x109A2, 0x109A3, 0x109A4, 0x109A5, 0x109A6,
      0x109A7, 0x109A8, 0x109A9, 0x109AA, 0x109AB, 0x109AC, 0x109AD, 0x109AE,
      0x109AF, 0x109B0, 0x109B1, 0x109B2, 0x109B3, 0x109B4, 0x109B5, 0x109B6,
      0x109B7, 0x109BE, 0x109BF, 0x10A00, 0x10A10, 0x10A11, 0x10A12, 0x10A13,
      0x10A15, 0x10A16, 0x10A17, 0x10A19, 0x10A1A, 0x10A1B, 0x10A1C, 0x10A1D,
      0x10A1E, 0x10A1F, 0x10A20, 0x10A21, 0x10A22, 0x10A23, 0x10A24, 0x10A25,
      0x10A26, 0x10A27, 0x10A28, 0x10A29, 0x10A2A, 0x10A2B, 0x10A2C, 0x10A2D,
      0x10A2E, 0x10A2F, 0x10A30, 0x10A31, 0x10A32, 0x10A33, 0x10A40, 0x10A41,
      0x10A42, 0x10A43, 0x10A44, 0x10A45, 0x10A46, 0x10A47, 0x10A50, 0x10A51,
      0x10A52, 0x10A53, 0x10A54, 0x10A55, 0x10A56, 0x10A57, 0x10A58, 0x10A60,
      0x10A61, 0x10A62, 0x10A63, 0x10A64, 0x10A65, 0x10A66, 0x10A67, 0x10A68,
      0x10A69, 0x10A6A, 0x10A6B, 0x10A6C, 0x10A6D, 0x10A6E, 0x10A6F, 0x10A70,
      0x10A71, 0x10A72, 0x10A73, 0x10A74, 0x10A75, 0x10A76, 0x10A77, 0x10A78,
      0x10A79, 0x10A7A, 0x10A7B, 0x10A7C, 0x10A7D, 0x10A7E, 0x10A7F, 0x10B00,
      0x10B01, 0x10B02, 0x10B03, 0x10B04, 0x10B05, 0x10B06, 0x10B07, 0x10B08,
      0x10B09, 0x10B0A, 0x10B0B, 0x10B0C, 0x10B0D, 0x10B0E, 0x10B0F, 0x10B10,
      0x10B11, 0x10B12, 0x10B13, 0x10B14, 0x10B15, 0x10B16, 0x10B17, 0x10B18,
      0x10B19, 0x10B1A, 0x10B1B, 0x10B1C, 0x10B1D, 0x10B1E, 0x10B1F, 0x10B20,
      0x10B21, 0x10B22, 0x10B23, 0x10B24, 0x10B25, 0x10B26, 0x10B27, 0x10B28,
      0x10B29, 0x10B2A, 0x10B2B, 0x10B2C, 0x10B2D, 0x10B2E, 0x10B2F, 0x10B30,
      0x10B31, 0x10B32, 0x10B33, 0x10B34, 0x10B35, 0x10B40, 0x10B41, 0x10B42,
      0x10B43, 0x10B44, 0x10B45, 0x10B46, 0x10B47, 0x10B48, 0x10B49, 0x10B4A,
      0x10B4B, 0x10B4C, 0x10B4D, 0x10B4E, 0x10B4F, 0x10B50, 0x10B51, 0x10B52,
      0x10B53, 0x10B54, 0x10B55, 0x10B58, 0x10B59, 0x10B5A, 0x10B5B, 0x10B5C,
      0x10B5D, 0x10B5E, 0x10B5F, 0x10B60, 0x10B61, 0x10B62, 0x10B63, 0x10B64,
      0x10B65, 0x10B66, 0x10B67, 0x10B68, 0x10B69, 0x10B6A, 0x10B6B, 0x10B6C,
      0x10B6D, 0x10B6E, 0x10B6F, 0x10B70, 0x10B71, 0x10B72, 0x10B78, 0x10B79,
      0x10B7A, 0x10B7B, 0x10B7C, 0x10B7D, 0x10B7E, 0x10B7F, 0x10C00, 0x10C01,
      0x10C02, 0x10C03, 0x10C04, 0x10C05, 0x10C06, 0x10C07, 0x10C08, 0x10C09,
      0x10C0A, 0x10C0B, 0x10C0C, 0x10C0D, 0x10C0E, 0x10C0F, 0x10C10, 0x10C11,
      0x10C12, 0x10C13, 0x10C14, 0x10C15, 0x10C16, 0x10C17, 0x10C18, 0x10C19,
      0x10C1A, 0x10C1B, 0x10C1C, 0x10C1D, 0x10C1E, 0x10C1F, 0x10C20, 0x10C21,
      0x10C22, 0x10C23, 0x10C24, 0x10C25, 0x10C26, 0x10C27, 0x10C28, 0x10C29,
      0x10C2A, 0x10C2B, 0x10C2C, 0x10C2D, 0x10C2E, 0x10C2F, 0x10C30, 0x10C31,
      0x10C32, 0x10C33, 0x10C34, 0x10C35, 0x10C36, 0x10C37, 0x10C38, 0x10C39,
      0x10C3A, 0x10C3B, 0x10C3C, 0x10C3D, 0x10C3E, 0x10C3F, 0x10C40, 0x10C41,
      0x10C42, 0x10C43, 0x10C44, 0x10C45, 0x10C46, 0x10C47, 0x10C48, 0x1EE00,
      0x1EE01, 0x1EE02, 0x1EE03, 0x1EE05, 0x1EE06, 0x1EE07, 0x1EE08, 0x1EE09,
      0x1EE0A, 0x1EE0B, 0x1EE0C, 0x1EE0D, 0x1EE0E, 0x1EE0F, 0x1EE10, 0x1EE11,
      0x1EE12, 0x1EE13, 0x1EE14, 0x1EE15, 0x1EE16, 0x1EE17, 0x1EE18, 0x1EE19,
      0x1EE1A, 0x1EE1B, 0x1EE1C, 0x1EE1D, 0x1EE1E, 0x1EE1F, 0x1EE21, 0x1EE22,
      0x1EE24, 0x1EE27, 0x1EE29, 0x1EE2A, 0x1EE2B, 0x1EE2C, 0x1EE2D, 0x1EE2E,
      0x1EE2F, 0x1EE30, 0x1EE31, 0x1EE32, 0x1EE34, 0x1EE35, 0x1EE36, 0x1EE37,
      0x1EE39, 0x1EE3B, 0x1EE42, 0x1EE47, 0x1EE49, 0x1EE4B, 0x1EE4D, 0x1EE4E,
      0x1EE4F, 0x1EE51, 0x1EE52, 0x1EE54, 0x1EE57, 0x1EE59, 0x1EE5B, 0x1EE5D,
      0x1EE5F, 0x1EE61, 0x1EE62, 0x1EE64, 0x1EE67, 0x1EE68, 0x1EE69, 0x1EE6A,
      0x1EE6C, 0x1EE6D, 0x1EE6E, 0x1EE6F, 0x1EE70, 0x1EE71, 0x1EE72, 0x1EE74,
      0x1EE75, 0x1EE76, 0x1EE77, 0x1EE79, 0x1EE7A, 0x1EE7B, 0x1EE7C, 0x1EE7E,
      0x1EE80, 0x1EE81, 0x1EE82, 0x1EE83, 0x1EE84, 0x1EE85, 0x1EE86, 0x1EE87,
      0x1EE88, 0x1EE89, 0x1EE8B, 0x1EE8C, 0x1EE8D, 0x1EE8E, 0x1EE8F, 0x1EE90,
      0x1EE91, 0x1EE92, 0x1EE93, 0x1EE94, 0x1EE95, 0x1EE96, 0x1EE97, 0x1EE98,
      0x1EE99, 0x1EE9A, 0x1EE9B, 0x1EEA1, 0x1EEA2, 0x1EEA3, 0x1EEA5, 0x1EEA6,
      0x1EEA7, 0x1EEA8, 0x1EEA9, 0x1EEAB, 0x1EEAC, 0x1EEAD, 0x1EEAE, 0x1EEAF,
      0x1EEB0, 0x1EEB1, 0x1EEB2, 0x1EEB3, 0x1EEB4, 0x1EEB5, 0x1EEB6, 0x1EEB7,
      0x1EEB8, 0x1EEB9, 0x1EEBA, 0x1EEBB, 0x10FFFD];

  function determineBidi(cueDiv) {
    var nodeStack = [],
        text = "",
        charCode;

    if (!cueDiv || !cueDiv.childNodes) {
      return "ltr";
    }

    function pushNodes(nodeStack, node) {
      for (var i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }

    function nextTextNode(nodeStack) {
      if (!nodeStack || !nodeStack.length) {
        return null;
      }

      var node = nodeStack.pop(),
          text = node.textContent || node.innerText;
      if (text) {
        // TODO: This should match all unicode type B characters (paragraph
        // separator characters). See issue #115.
        var m = text.match(/^.*(\n|\r)/);
        if (m) {
          nodeStack.length = 0;
          return m[0];
        }
        return text;
      }
      if (node.tagName === "ruby") {
        return nextTextNode(nodeStack);
      }
      if (node.childNodes) {
        pushNodes(nodeStack, node);
        return nextTextNode(nodeStack);
      }
    }

    pushNodes(nodeStack, cueDiv);
    while ((text = nextTextNode(nodeStack))) {
      for (var i = 0; i < text.length; i++) {
        charCode = text.charCodeAt(i);
        for (var j = 0; j < strongRTLChars.length; j++) {
          if (strongRTLChars[j] === charCode) {
            return "rtl";
          }
        }
      }
    }
    return "ltr";
  }

  function computeLinePos(cue) {
    if (typeof cue.line === "number" &&
        (cue.snapToLines || (cue.line >= 0 && cue.line <= 100))) {
      return cue.line;
    }
    if (!cue.track || !cue.track.textTrackList ||
        !cue.track.textTrackList.mediaElement) {
      return -1;
    }
    var track = cue.track,
        trackList = track.textTrackList,
        count = 0;
    for (var i = 0; i < trackList.length && trackList[i] !== track; i++) {
      if (trackList[i].mode === "showing") {
        count++;
      }
    }
    return ++count * -1;
  }

  function StyleBox() {
  }

  // Apply styles to a div. If there is no div passed then it defaults to the
  // div on 'this'.
  StyleBox.prototype.applyStyles = function(styles, div) {
    div = div || this.div;
    for (var prop in styles) {
      if (styles.hasOwnProperty(prop)) {
        div.style[prop] = styles[prop];
      }
    }
  };

  StyleBox.prototype.formatStyle = function(val, unit) {
    return val === 0 ? 0 : val + unit;
  };

  // Constructs the computed display state of the cue (a div). Places the div
  // into the overlay which should be a block level element (usually a div).
  function CueStyleBox(window, cue, styleOptions) {
    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);
    var color = "rgba(255, 255, 255, 1)";
    var backgroundColor = "rgba(0, 0, 0, 0.8)";

    if (isIE8) {
      color = "rgb(255, 255, 255)";
      backgroundColor = "rgb(0, 0, 0)";
    }

    StyleBox.call(this);
    this.cue = cue;

    // Parse our cue's text into a DOM tree rooted at 'cueDiv'. This div will
    // have inline positioning and will function as the cue background box.
    this.cueDiv = parseContent(window, cue.text);
    var styles = {
      color: color,
      backgroundColor: backgroundColor,
      position: "relative",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: "inline"
    };

    if (!isIE8) {
      styles.writingMode = cue.vertical === "" ? "horizontal-tb"
                                               : cue.vertical === "lr" ? "vertical-lr"
                                                                       : "vertical-rl";
      styles.unicodeBidi = "plaintext";
    }
    this.applyStyles(styles, this.cueDiv);

    // Create an absolutely positioned div that will be used to position the cue
    // div. Note, all WebVTT cue-setting alignments are equivalent to the CSS
    // mirrors of them except "middle" which is "center" in CSS.
    this.div = window.document.createElement("div");
    styles = {
      textAlign: cue.align === "middle" ? "center" : cue.align,
      font: styleOptions.font,
      whiteSpace: "pre-line",
      position: "absolute"
    };

    if (!isIE8) {
      styles.direction = determineBidi(this.cueDiv);
      styles.writingMode = cue.vertical === "" ? "horizontal-tb"
                                               : cue.vertical === "lr" ? "vertical-lr"
                                                                       : "vertical-rl".
      stylesunicodeBidi =  "plaintext";
    }

    this.applyStyles(styles);

    this.div.appendChild(this.cueDiv);

    // Calculate the distance from the reference edge of the viewport to the text
    // position of the cue box. The reference edge will be resolved later when
    // the box orientation styles are applied.
    var textPos = 0;
    switch (cue.positionAlign) {
    case "start":
      textPos = cue.position;
      break;
    case "middle":
      textPos = cue.position - (cue.size / 2);
      break;
    case "end":
      textPos = cue.position - cue.size;
      break;
    }

    // Horizontal box orientation; textPos is the distance from the left edge of the
    // area to the left edge of the box and cue.size is the distance extending to
    // the right from there.
    if (cue.vertical === "") {
      this.applyStyles({
        left:  this.formatStyle(textPos, "%"),
        width: this.formatStyle(cue.size, "%")
      });
    // Vertical box orientation; textPos is the distance from the top edge of the
    // area to the top edge of the box and cue.size is the height extending
    // downwards from there.
    } else {
      this.applyStyles({
        top: this.formatStyle(textPos, "%"),
        height: this.formatStyle(cue.size, "%")
      });
    }

    this.move = function(box) {
      this.applyStyles({
        top: this.formatStyle(box.top, "px"),
        bottom: this.formatStyle(box.bottom, "px"),
        left: this.formatStyle(box.left, "px"),
        right: this.formatStyle(box.right, "px"),
        height: this.formatStyle(box.height, "px"),
        width: this.formatStyle(box.width, "px")
      });
    };
  }
  CueStyleBox.prototype = _objCreate(StyleBox.prototype);
  CueStyleBox.prototype.constructor = CueStyleBox;

  // Represents the co-ordinates of an Element in a way that we can easily
  // compute things with such as if it overlaps or intersects with another Element.
  // Can initialize it with either a StyleBox or another BoxPosition.
  function BoxPosition(obj) {
    var isIE8 = (/MSIE\s8\.0/).test(navigator.userAgent);

    // Either a BoxPosition was passed in and we need to copy it, or a StyleBox
    // was passed in and we need to copy the results of 'getBoundingClientRect'
    // as the object returned is readonly. All co-ordinate values are in reference
    // to the viewport origin (top left).
    var lh, height, width, top;
    if (obj.div) {
      height = obj.div.offsetHeight;
      width = obj.div.offsetWidth;
      top = obj.div.offsetTop;

      var rects = (rects = obj.div.childNodes) && (rects = rects[0]) &&
                  rects.getClientRects && rects.getClientRects();
      obj = obj.div.getBoundingClientRect();
      // In certain cases the outter div will be slightly larger then the sum of
      // the inner div's lines. This could be due to bold text, etc, on some platforms.
      // In this case we should get the average line height and use that. This will
      // result in the desired behaviour.
      lh = rects ? Math.max((rects[0] && rects[0].height) || 0, obj.height / rects.length)
                 : 0;

    }
    this.left = obj.left;
    this.right = obj.right;
    this.top = obj.top || top;
    this.height = obj.height || height;
    this.bottom = obj.bottom || (top + (obj.height || height));
    this.width = obj.width || width;
    this.lineHeight = lh !== undefined ? lh : obj.lineHeight;

    if (isIE8 && !this.lineHeight) {
      this.lineHeight = 13;
    }
  }

  // Move the box along a particular axis. Optionally pass in an amount to move
  // the box. If no amount is passed then the default is the line height of the
  // box.
  BoxPosition.prototype.move = function(axis, toMove) {
    toMove = toMove !== undefined ? toMove : this.lineHeight;
    switch (axis) {
    case "+x":
      this.left += toMove;
      this.right += toMove;
      break;
    case "-x":
      this.left -= toMove;
      this.right -= toMove;
      break;
    case "+y":
      this.top += toMove;
      this.bottom += toMove;
      break;
    case "-y":
      this.top -= toMove;
      this.bottom -= toMove;
      break;
    }
  };

  // Check if this box overlaps another box, b2.
  BoxPosition.prototype.overlaps = function(b2) {
    return this.left < b2.right &&
           this.right > b2.left &&
           this.top < b2.bottom &&
           this.bottom > b2.top;
  };

  // Check if this box overlaps any other boxes in boxes.
  BoxPosition.prototype.overlapsAny = function(boxes) {
    for (var i = 0; i < boxes.length; i++) {
      if (this.overlaps(boxes[i])) {
        return true;
      }
    }
    return false;
  };

  // Check if this box is within another box.
  BoxPosition.prototype.within = function(container) {
    return this.top >= container.top &&
           this.bottom <= container.bottom &&
           this.left >= container.left &&
           this.right <= container.right;
  };

  // Check if this box is entirely within the container or it is overlapping
  // on the edge opposite of the axis direction passed. For example, if "+x" is
  // passed and the box is overlapping on the left edge of the container, then
  // return true.
  BoxPosition.prototype.overlapsOppositeAxis = function(container, axis) {
    switch (axis) {
    case "+x":
      return this.left < container.left;
    case "-x":
      return this.right > container.right;
    case "+y":
      return this.top < container.top;
    case "-y":
      return this.bottom > container.bottom;
    }
  };

  // Find the percentage of the area that this box is overlapping with another
  // box.
  BoxPosition.prototype.intersectPercentage = function(b2) {
    var x = Math.max(0, Math.min(this.right, b2.right) - Math.max(this.left, b2.left)),
        y = Math.max(0, Math.min(this.bottom, b2.bottom) - Math.max(this.top, b2.top)),
        intersectArea = x * y;
    return intersectArea / (this.height * this.width);
  };

  // Convert the positions from this box to CSS compatible positions using
  // the reference container's positions. This has to be done because this
  // box's positions are in reference to the viewport origin, whereas, CSS
  // values are in referecne to their respective edges.
  BoxPosition.prototype.toCSSCompatValues = function(reference) {
    return {
      top: this.top - reference.top,
      bottom: reference.bottom - this.bottom,
      left: this.left - reference.left,
      right: reference.right - this.right,
      height: this.height,
      width: this.width
    };
  };

  // Get an object that represents the box's position without anything extra.
  // Can pass a StyleBox, HTMLElement, or another BoxPositon.
  BoxPosition.getSimpleBoxPosition = function(obj) {
    var height = obj.div ? obj.div.offsetHeight : obj.tagName ? obj.offsetHeight : 0;
    var width = obj.div ? obj.div.offsetWidth : obj.tagName ? obj.offsetWidth : 0;
    var top = obj.div ? obj.div.offsetTop : obj.tagName ? obj.offsetTop : 0;

    obj = obj.div ? obj.div.getBoundingClientRect() :
                  obj.tagName ? obj.getBoundingClientRect() : obj;
    var ret = {
      left: obj.left,
      right: obj.right,
      top: obj.top || top,
      height: obj.height || height,
      bottom: obj.bottom || (top + (obj.height || height)),
      width: obj.width || width
    };
    return ret;
  };

  // Move a StyleBox to its specified, or next best, position. The containerBox
  // is the box that contains the StyleBox, such as a div. boxPositions are
  // a list of other boxes that the styleBox can't overlap with.
  function moveBoxToLinePosition(window, styleBox, containerBox, boxPositions) {

    // Find the best position for a cue box, b, on the video. The axis parameter
    // is a list of axis, the order of which, it will move the box along. For example:
    // Passing ["+x", "-x"] will move the box first along the x axis in the positive
    // direction. If it doesn't find a good position for it there it will then move
    // it along the x axis in the negative direction.
    function findBestPosition(b, axis) {
      var bestPosition,
          specifiedPosition = new BoxPosition(b),
          percentage = 1; // Highest possible so the first thing we get is better.

      for (var i = 0; i < axis.length; i++) {
        while (b.overlapsOppositeAxis(containerBox, axis[i]) ||
               (b.within(containerBox) && b.overlapsAny(boxPositions))) {
          b.move(axis[i]);
        }
        // We found a spot where we aren't overlapping anything. This is our
        // best position.
        if (b.within(containerBox)) {
          return b;
        }
        var p = b.intersectPercentage(containerBox);
        // If we're outside the container box less then we were on our last try
        // then remember this position as the best position.
        if (percentage > p) {
          bestPosition = new BoxPosition(b);
          percentage = p;
        }
        // Reset the box position to the specified position.
        b = new BoxPosition(specifiedPosition);
      }
      return bestPosition || specifiedPosition;
    }

    var boxPosition = new BoxPosition(styleBox),
        cue = styleBox.cue,
        linePos = computeLinePos(cue),
        axis = [];

    // If we have a line number to align the cue to.
    if (cue.snapToLines) {
      var size;
      switch (cue.vertical) {
      case "":
        axis = [ "+y", "-y" ];
        size = "height";
        break;
      case "rl":
        axis = [ "+x", "-x" ];
        size = "width";
        break;
      case "lr":
        axis = [ "-x", "+x" ];
        size = "width";
        break;
      }

      var step = boxPosition.lineHeight,
          position = step * Math.round(linePos),
          maxPosition = containerBox[size] + step,
          initialAxis = axis[0];

      // If the specified intial position is greater then the max position then
      // clamp the box to the amount of steps it would take for the box to
      // reach the max position.
      if (Math.abs(position) > maxPosition) {
        position = position < 0 ? -1 : 1;
        position *= Math.ceil(maxPosition / step) * step;
      }

      // If computed line position returns negative then line numbers are
      // relative to the bottom of the video instead of the top. Therefore, we
      // need to increase our initial position by the length or width of the
      // video, depending on the writing direction, and reverse our axis directions.
      if (linePos < 0) {
        position += cue.vertical === "" ? containerBox.height : containerBox.width;
        axis = axis.reverse();
      }

      // Move the box to the specified position. This may not be its best
      // position.
      boxPosition.move(initialAxis, position);

    } else {
      // If we have a percentage line value for the cue.
      var calculatedPercentage = (boxPosition.lineHeight / containerBox.height) * 100;

      switch (cue.lineAlign) {
      case "middle":
        linePos -= (calculatedPercentage / 2);
        break;
      case "end":
        linePos -= calculatedPercentage;
        break;
      }

      // Apply initial line position to the cue box.
      switch (cue.vertical) {
      case "":
        styleBox.applyStyles({
          top: styleBox.formatStyle(linePos, "%")
        });
        break;
      case "rl":
        styleBox.applyStyles({
          left: styleBox.formatStyle(linePos, "%")
        });
        break;
      case "lr":
        styleBox.applyStyles({
          right: styleBox.formatStyle(linePos, "%")
        });
        break;
      }

      axis = [ "+y", "-x", "+x", "-y" ];

      // Get the box position again after we've applied the specified positioning
      // to it.
      boxPosition = new BoxPosition(styleBox);
    }

    var bestPosition = findBestPosition(boxPosition, axis);
    styleBox.move(bestPosition.toCSSCompatValues(containerBox));
  }

  function WebVTT() {
    // Nothing
  }

  // Helper to allow strings to be decoded instead of the default binary utf8 data.
  WebVTT.StringDecoder = function() {
    return {
      decode: function(data) {
        if (!data) {
          return "";
        }
        if (typeof data !== "string") {
          throw new Error("Error - expected string data.");
        }
        return decodeURIComponent(encodeURIComponent(data));
      }
    };
  };

  WebVTT.convertCueToDOMTree = function(window, cuetext) {
    if (!window || !cuetext) {
      return null;
    }
    return parseContent(window, cuetext);
  };

  var FONT_SIZE_PERCENT = 0.05;
  var FONT_STYLE = "sans-serif";
  var CUE_BACKGROUND_PADDING = "1.5%";

  // Runs the processing model over the cues and regions passed to it.
  // @param overlay A block level element (usually a div) that the computed cues
  //                and regions will be placed into.
  WebVTT.processCues = function(window, cues, overlay) {
    if (!window || !cues || !overlay) {
      return null;
    }

    // Remove all previous children.
    while (overlay.firstChild) {
      overlay.removeChild(overlay.firstChild);
    }

    var paddedOverlay = window.document.createElement("div");
    paddedOverlay.style.position = "absolute";
    paddedOverlay.style.left = "0";
    paddedOverlay.style.right = "0";
    paddedOverlay.style.top = "0";
    paddedOverlay.style.bottom = "0";
    paddedOverlay.style.margin = CUE_BACKGROUND_PADDING;
    overlay.appendChild(paddedOverlay);

    // Determine if we need to compute the display states of the cues. This could
    // be the case if a cue's state has been changed since the last computation or
    // if it has not been computed yet.
    function shouldCompute(cues) {
      for (var i = 0; i < cues.length; i++) {
        if (cues[i].hasBeenReset || !cues[i].displayState) {
          return true;
        }
      }
      return false;
    }

    // We don't need to recompute the cues' display states. Just reuse them.
    if (!shouldCompute(cues)) {
      for (var i = 0; i < cues.length; i++) {
        paddedOverlay.appendChild(cues[i].displayState);
      }
      return;
    }

    var boxPositions = [],
        containerBox = BoxPosition.getSimpleBoxPosition(paddedOverlay),
        fontSize = Math.round(containerBox.height * FONT_SIZE_PERCENT * 100) / 100;
    var styleOptions = {
      font: fontSize + "px " + FONT_STYLE
    };

    (function() {
      var styleBox, cue;

      for (var i = 0; i < cues.length; i++) {
        cue = cues[i];

        // Compute the intial position and styles of the cue div.
        styleBox = new CueStyleBox(window, cue, styleOptions);
        paddedOverlay.appendChild(styleBox.div);

        // Move the cue div to it's correct line position.
        moveBoxToLinePosition(window, styleBox, containerBox, boxPositions);

        // Remember the computed div so that we don't have to recompute it later
        // if we don't have too.
        cue.displayState = styleBox.div;

        boxPositions.push(BoxPosition.getSimpleBoxPosition(styleBox));
      }
    })();
  };

  WebVTT.Parser = function(window, vttjs, decoder) {
    if (!decoder) {
      decoder = vttjs;
      vttjs = {};
    }
    if (!vttjs) {
      vttjs = {};
    }

    this.window = window;
    this.vttjs = vttjs;
    this.state = "INITIAL";
    this.buffer = "";
    this.decoder = decoder || new TextDecoder("utf8");
    this.regionList = [];
  };

  WebVTT.Parser.prototype = {
    // If the error is a ParsingError then report it to the consumer if
    // possible. If it's not a ParsingError then throw it like normal.
    reportOrThrowError: function(e) {
      if (e instanceof ParsingError) {
        this.onparsingerror && this.onparsingerror(e);
      } else {
        throw e;
      }
    },
    parse: function (data) {
      var self = this;

      // If there is no data then we won't decode it, but will just try to parse
      // whatever is in buffer already. This may occur in circumstances, for
      // example when flush() is called.
      if (data) {
        // Try to decode the data that we received.
        self.buffer += self.decoder.decode(data, {stream: true});
      }

      function collectNextLine() {
        var buffer = self.buffer;
        var pos = 0;
        while (pos < buffer.length && buffer[pos] !== '\r' && buffer[pos] !== '\n') {
          ++pos;
        }
        var line = buffer.substr(0, pos);
        // Advance the buffer early in case we fail below.
        if (buffer[pos] === '\r') {
          ++pos;
        }
        if (buffer[pos] === '\n') {
          ++pos;
        }
        self.buffer = buffer.substr(pos);
        return line;
      }

      // 3.4 WebVTT region and WebVTT region settings syntax
      function parseRegion(input) {
        var settings = new Settings();

        parseOptions(input, function (k, v) {
          switch (k) {
          case "id":
            settings.set(k, v);
            break;
          case "width":
            settings.percent(k, v);
            break;
          case "lines":
            settings.integer(k, v);
            break;
          case "regionanchor":
          case "viewportanchor":
            var xy = v.split(',');
            if (xy.length !== 2) {
              break;
            }
            // We have to make sure both x and y parse, so use a temporary
            // settings object here.
            var anchor = new Settings();
            anchor.percent("x", xy[0]);
            anchor.percent("y", xy[1]);
            if (!anchor.has("x") || !anchor.has("y")) {
              break;
            }
            settings.set(k + "X", anchor.get("x"));
            settings.set(k + "Y", anchor.get("y"));
            break;
          case "scroll":
            settings.alt(k, v, ["up"]);
            break;
          }
        }, /=/, /\s/);

        // Create the region, using default values for any values that were not
        // specified.
        if (settings.has("id")) {
          var region = new (self.vttjs.VTTRegion || self.window.VTTRegion)();
          region.width = settings.get("width", 100);
          region.lines = settings.get("lines", 3);
          region.regionAnchorX = settings.get("regionanchorX", 0);
          region.regionAnchorY = settings.get("regionanchorY", 100);
          region.viewportAnchorX = settings.get("viewportanchorX", 0);
          region.viewportAnchorY = settings.get("viewportanchorY", 100);
          region.scroll = settings.get("scroll", "");
          // Register the region.
          self.onregion && self.onregion(region);
          // Remember the VTTRegion for later in case we parse any VTTCues that
          // reference it.
          self.regionList.push({
            id: settings.get("id"),
            region: region
          });
        }
      }

      // 3.2 WebVTT metadata header syntax
      function parseHeader(input) {
        parseOptions(input, function (k, v) {
          switch (k) {
          case "Region":
            // 3.3 WebVTT region metadata header syntax
            parseRegion(v);
            break;
          }
        }, /:/);
      }

      // 5.1 WebVTT file parsing.
      try {
        var line;
        if (self.state === "INITIAL") {
          // We can't start parsing until we have the first line.
          if (!/\r\n|\n/.test(self.buffer)) {
            return this;
          }

          line = collectNextLine();

          var m = line.match(/^WEBVTT([ \t].*)?$/);
          if (!m || !m[0]) {
            throw new ParsingError(ParsingError.Errors.BadSignature);
          }

          self.state = "HEADER";
        }

        var alreadyCollectedLine = false;
        while (self.buffer) {
          // We can't parse a line until we have the full line.
          if (!/\r\n|\n/.test(self.buffer)) {
            return this;
          }

          if (!alreadyCollectedLine) {
            line = collectNextLine();
          } else {
            alreadyCollectedLine = false;
          }

          switch (self.state) {
          case "HEADER":
            // 13-18 - Allow a header (metadata) under the WEBVTT line.
            if (/:/.test(line)) {
              parseHeader(line);
            } else if (!line) {
              // An empty line terminates the header and starts the body (cues).
              self.state = "ID";
            }
            continue;
          case "NOTE":
            // Ignore NOTE blocks.
            if (!line) {
              self.state = "ID";
            }
            continue;
          case "ID":
            // Check for the start of NOTE blocks.
            if (/^NOTE($|[ \t])/.test(line)) {
              self.state = "NOTE";
              break;
            }
            // 19-29 - Allow any number of line terminators, then initialize new cue values.
            if (!line) {
              continue;
            }
            self.cue = new (self.vttjs.VTTCue || self.window.VTTCue)(0, 0, "");
            self.state = "CUE";
            // 30-39 - Check if self line contains an optional identifier or timing data.
            if (line.indexOf("-->") === -1) {
              self.cue.id = line;
              continue;
            }
            // Process line as start of a cue.
            /*falls through*/
          case "CUE":
            // 40 - Collect cue timings and settings.
            try {
              parseCue(line, self.cue, self.regionList);
            } catch (e) {
              self.reportOrThrowError(e);
              // In case of an error ignore rest of the cue.
              self.cue = null;
              self.state = "BADCUE";
              continue;
            }
            self.state = "CUETEXT";
            continue;
          case "CUETEXT":
            var hasSubstring = line.indexOf("-->") !== -1;
            // 34 - If we have an empty line then report the cue.
            // 35 - If we have the special substring '-->' then report the cue,
            // but do not collect the line as we need to process the current
            // one as a new cue.
            if (!line || hasSubstring && (alreadyCollectedLine = true)) {
              // We are done parsing self cue.
              self.oncue && self.oncue(self.cue);
              self.cue = null;
              self.state = "ID";
              continue;
            }
            if (self.cue.text) {
              self.cue.text += "\n";
            }
            self.cue.text += line;
            continue;
          case "BADCUE": // BADCUE
            // 54-62 - Collect and discard the remaining cue.
            if (!line) {
              self.state = "ID";
            }
            continue;
          }
        }
      } catch (e) {
        self.reportOrThrowError(e);

        // If we are currently parsing a cue, report what we have.
        if (self.state === "CUETEXT" && self.cue && self.oncue) {
          self.oncue(self.cue);
        }
        self.cue = null;
        // Enter BADWEBVTT state if header was not parsed correctly otherwise
        // another exception occurred so enter BADCUE state.
        self.state = self.state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
      }
      return this;
    },
    flush: function () {
      var self = this;
      try {
        // Finish decoding the stream.
        self.buffer += self.decoder.decode();
        // Synthesize the end of the current cue or region.
        if (self.cue || self.state === "HEADER") {
          self.buffer += "\n\n";
          self.parse();
        }
        // If we've flushed, parsed, and we're still on the INITIAL state then
        // that means we don't have enough of the stream to parse the first
        // line.
        if (self.state === "INITIAL") {
          throw new ParsingError(ParsingError.Errors.BadSignature);
        }
      } catch(e) {
        self.reportOrThrowError(e);
      }
      self.onflush && self.onflush();
      return this;
    }
  };

  global.WebVTT = WebVTT;

}(this, (this.vttjs || {})));

(function(window){
  var urlCount = 0,
      NativeMediaSource = window.MediaSource || window.WebKitMediaSource || {},
      nativeUrl = window.URL || {},
      EventEmitter,
      flvCodec = /video\/flv(;\s*codecs=["']vp6,aac["'])?$/,
      objectUrlPrefix = 'blob:vjs-media-source/';

  EventEmitter = function(){};
  EventEmitter.prototype.init = function(){
    this.listeners = [];
  };
  EventEmitter.prototype.addEventListener = function(type, listener){
    if (!this.listeners[type]){
      this.listeners[type] = [];
    }
    this.listeners[type].unshift(listener);
  };
  EventEmitter.prototype.removeEventListener = function(type, listener){
    var listeners = this.listeners[type],
        i = listeners.length;
    while (i--) {
      if (listeners[i] === listener) {
        return listeners.splice(i, 1);
      }
    }
  };
  EventEmitter.prototype.trigger = function(event){
    var listeners = this.listeners[event.type] || [],
        i = listeners.length;
    while (i--) {
      listeners[i](event);
    }
  };

  // extend the media source APIs

  // Media Source
  videojs.MediaSource = function(){
    var self = this;
    videojs.MediaSource.prototype.init.call(this);

    this.sourceBuffers = [];
    this.readyState = 'closed';
    this.listeners = {
      sourceopen: [function(event){
        // find the swf where we will push media data
        self.swfObj = document.getElementById(event.swfId);
        self.readyState = 'open';

        // trigger load events
        if (self.swfObj) {
          self.swfObj.vjs_load();
        }
      }],
      webkitsourceopen: [function(event){
        self.trigger({
          type: 'sourceopen'
        });
      }]
    };
  };
  videojs.MediaSource.prototype = new EventEmitter();

  /**
   * The maximum size in bytes for append operations to the video.js
   * SWF. Calling through to Flash blocks and can be expensive so
   * tuning this parameter may improve playback on slower
   * systems. There are two factors to consider:
   * - Each interaction with the SWF must be quick or you risk dropping
   * video frames. To maintain 60fps for the rest of the page, each append
   * cannot take longer than 16ms. Given the likelihood that the page will
   * be executing more javascript than just playback, you probably want to
   * aim for ~8ms.
   * - Bigger appends significantly increase throughput. The total number of
   * bytes over time delivered to the SWF must exceed the video bitrate or
   * playback will stall.
   *
   * The default is set so that a 4MB/s stream should playback
   * without stuttering.
   */
  videojs.MediaSource.BYTES_PER_SECOND_GOAL = 4 * 1024 * 1024;
  videojs.MediaSource.TICKS_PER_SECOND = 60;

  // create a new source buffer to receive a type of media data
  videojs.MediaSource.prototype.addSourceBuffer = function(type){
    var sourceBuffer;

    // if this is an FLV type, we'll push data to flash
    if (flvCodec.test(type)) {
      // Flash source buffers
      sourceBuffer = new videojs.SourceBuffer(this);
    } else if (this.nativeSource) {
      // native source buffers
      sourceBuffer = this.nativeSource.addSourceBuffer.apply(this.nativeSource, arguments);
    } else {
      throw new Error('NotSupportedError (Video.js)');
    }

    this.sourceBuffers.push(sourceBuffer);
    return sourceBuffer;
  };
  videojs.MediaSource.prototype.endOfStream = function(){
    this.readyState = 'ended';
  };

  // store references to the media sources so they can be connected
  // to a video element (a swf object)
  videojs.mediaSources = {};
  // provide a method for a swf object to notify JS that a media source is now open
  videojs.MediaSource.open = function(msObjectURL, swfId){
    var mediaSource = videojs.mediaSources[msObjectURL];

    if (mediaSource) {
      mediaSource.trigger({
        type: 'sourceopen',
        swfId: swfId
      });
    } else {
      throw new Error('Media Source not found (Video.js)');
    }
  };

  // Source Buffer
  videojs.SourceBuffer = function(source){
    var self = this,

        // byte arrays queued to be appended
        buffer = [],

        // the total number of queued bytes
        bufferSize = 0,
        scheduleTick = function(func) {
          // Chrome doesn't invoke requestAnimationFrame callbacks
          // in background tabs, so use setTimeout.
          window.setTimeout(func,
                            Math.ceil(1000 / videojs.MediaSource.TICKS_PER_SECOND));
        },
        append = function() {
          var chunk, i, length, payload, maxSize,
              binary = '';

          if (!buffer.length) {
            // do nothing if the buffer is empty
            return;
          }

          if (document.hidden) {
            // When the document is hidden, the browser will likely
            // invoke callbacks less frequently than we want. Just
            // append a whole second's worth of data. It doesn't
            // matter if the video janks, since the user can't see it.
            maxSize = videojs.MediaSource.BYTES_PER_SECOND_GOAL;
          } else {
            maxSize = Math.ceil(videojs.MediaSource.BYTES_PER_SECOND_GOAL/
                                videojs.MediaSource.TICKS_PER_SECOND);
          }

          // concatenate appends up to the max append size
          payload = new Uint8Array(Math.min(maxSize, bufferSize));
          i = payload.byteLength;
          while (i) {
            chunk = buffer[0].subarray(0, i);

            payload.set(chunk, payload.byteLength - i);

            // requeue any bytes that won't make it this round
            if (chunk.byteLength < buffer[0].byteLength) {
              buffer[0] = buffer[0].subarray(i);
            } else {
              buffer.shift();
            }

            i -= chunk.byteLength;
          }
          bufferSize -= payload.byteLength;

          // base64 encode the bytes
          for (i = 0, length = payload.byteLength; i < length; i++) {
            binary += String.fromCharCode(payload[i]);
          }
          b64str = window.btoa(binary);

          // bypass normal ExternalInterface calls and pass xml directly
          // IE can be slow by default
          self.source.swfObj.CallFunction('<invoke name="vjs_appendBuffer"' +
                                          'returntype="javascript"><arguments><string>' +
                                          b64str +
                                          '</string></arguments></invoke>');

          // schedule another append if necessary
          if (bufferSize !== 0) {
            scheduleTick(append);
          } else {
            self.updating = false;
            self.trigger({ type: 'updateend' });

            if (self.source.readyState === 'ended') {
              self.source.swfObj.vjs_endOfStream();
            }
          }
        };

    videojs.SourceBuffer.prototype.init.call(this);
    this.source = source;

    // indicates whether the asynchronous continuation of an operation
    // is still being processed
    // see https://w3c.github.io/media-source/#widl-SourceBuffer-updating
    this.updating = false;

    // accept video data and pass to the video (swf) object
    this.appendBuffer = function(uint8Array){
      var error;

      if (this.updating) {
        error = new Error('SourceBuffer.append() cannot be called ' +
                          'while an update is in progress');
        error.name = 'InvalidStateError';
        error.code = 11;
        throw error;
      }
      if (buffer.length === 0) {
        scheduleTick(append);
      }

      this.updating = true;
      this.source.readyState = 'open';
      this.trigger({ type: 'update' });

      buffer.push(uint8Array);
      bufferSize += uint8Array.byteLength;
    };

    // reset the parser and remove any data queued to be sent to the swf
    this.abort = function() {
      buffer = [];
      bufferSize = 0;
      this.source.swfObj.vjs_abort();

      // report any outstanding updates have ended
      if (this.updating) {
        this.updating = false;
        this.trigger({ type: 'updateend' });
      }

    };
  };
  videojs.SourceBuffer.prototype = new EventEmitter();

  // URL
  videojs.URL = {
    createObjectURL: function(object){
      var url = objectUrlPrefix + urlCount;

      urlCount++;

      // setup the mapping back to object
      videojs.mediaSources[url] = object;

      return url;
    }
  };

  // plugin
  videojs.plugin('mediaSource', function(options){
    var player = this;

    player.on('loadstart', function(){
      var url = player.currentSrc(),
          trigger = function(event){
            mediaSource.trigger(event);
          },
          mediaSource;

      if (player.techName === 'Html5' && url.indexOf(objectUrlPrefix) === 0) {
        // use the native media source implementation
        mediaSource = videojs.mediaSources[url];

        if (!mediaSource.nativeUrl) {
          // initialize the native source
          mediaSource.nativeSource = new NativeMediaSource();
          mediaSource.nativeSource.addEventListener('sourceopen', trigger, false);
          mediaSource.nativeSource.addEventListener('webkitsourceopen', trigger, false);
          mediaSource.nativeUrl = nativeUrl.createObjectURL(mediaSource.nativeSource);
        }
        player.src(mediaSource.nativeUrl);
      }
    });
  });

})(this);

(function(window, videojs, document, undefined) {
'use strict';

var
  // a fudge factor to apply to advertised playlist bitrates to account for
  // temporary flucations in client bandwidth
  bandwidthVariance = 1.1,

  // the amount of time to wait between checking the state of the buffer
  bufferCheckInterval = 500,
  keyXhr,
  keyFailed,
  resolveUrl;

// returns true if a key has failed to download within a certain amount of retries
keyFailed = function(key) {
  return key.retries && key.retries >= 2;
};

videojs.Hls = videojs.Flash.extend({
  init: function(player, options, ready) {
    var
      source = options.source,
      settings = player.options();

    player.hls = this;
    delete options.source;
    options.swf = settings.flash.swf;
    videojs.Flash.call(this, player, options, ready);
    options.source = source;
    this.bytesReceived = 0;

    // TODO: After video.js#1347 is pulled in remove these lines
    this.currentTime = videojs.Hls.prototype.currentTime;
    this.setCurrentTime = videojs.Hls.prototype.setCurrentTime;

    // a queue of segments that need to be transmuxed and processed,
    // and then fed to the source buffer
    this.segmentBuffer_ = [];
    // periodically check if new data needs to be downloaded or
    // buffered data should be appended to the source buffer
    this.startCheckingBuffer_();

    videojs.Hls.prototype.src.call(this, options.source && options.source.src);
  }
});

// Add HLS to the standard tech order
videojs.options.techOrder.unshift('hls');

// the desired length of video to maintain in the buffer, in seconds
videojs.Hls.GOAL_BUFFER_LENGTH = 30;

videojs.Hls.prototype.src = function(src) {
  var
    tech = this,
    player = this.player(),
    settings = player.options().hls || {},
    mediaSource,
    oldMediaPlaylist,
    source;

  // do nothing if the src is falsey
  if (!src) {
    return;
  }

  // if there is already a source loaded, clean it up
  if (this.src_) {
    this.resetSrc_();
  }

  this.src_ = src;

  mediaSource = new videojs.MediaSource();
  source = {
    src: videojs.URL.createObjectURL(mediaSource),
    type: "video/flv"
  };
  this.mediaSource = mediaSource;

  this.segmentBuffer_ = [];
  this.segmentParser_ = new videojs.Hls.SegmentParser();

  // if the stream contains ID3 metadata, expose that as a metadata
  // text track
  this.setupMetadataCueTranslation_();

  // load the MediaSource into the player
  this.mediaSource.addEventListener('sourceopen', videojs.bind(this, this.handleSourceOpen));

  // cleanup the old playlist loader, if necessary
  if (this.playlists) {
    this.playlists.dispose();
  }

  // The index of the next segment to be downloaded in the current
  // media playlist. When the current media playlist is live with
  // expiring segments, it may be a different value from the media
  // sequence number for a segment.
  this.mediaIndex = 0;

  this.playlists = new videojs.Hls.PlaylistLoader(this.src_, settings.withCredentials);

  this.playlists.on('loadedmetadata', videojs.bind(this, function() {
    var selectedPlaylist, loaderHandler, oldBitrate, newBitrate, segmentDuration,
        segmentDlTime, setupEvents, threshold;

    setupEvents = function() {
      this.fillBuffer();
      player.trigger('loadedmetadata');
    };

    oldMediaPlaylist = this.playlists.media();

    // the bandwidth estimate for the first segment is based on round
    // trip time for the master playlist. the master playlist is
    // almost always tiny so the round-trip time is dominated by
    // latency and the computed bandwidth is much lower than
    // steady-state. if the the downstream developer has a better way
    // of detecting bandwidth and provided a number, use that instead.
    if (this.bandwidth === undefined) {
      // we're going to have to estimate initial bandwidth
      // ourselves. scale the bandwidth estimate to account for the
      // relatively high round-trip time from the master playlist.
      this.setBandwidth({
        bandwidth: this.playlists.bandwidth * 5
      });
    }

    selectedPlaylist = this.selectPlaylist();
    oldBitrate = oldMediaPlaylist.attributes &&
                 oldMediaPlaylist.attributes.BANDWIDTH || 0;
    newBitrate = selectedPlaylist.attributes &&
                 selectedPlaylist.attributes.BANDWIDTH || 0;
    segmentDuration = oldMediaPlaylist.segments &&
                      oldMediaPlaylist.segments[this.mediaIndex].duration ||
                      oldMediaPlaylist.targetDuration;

    segmentDlTime = (segmentDuration * newBitrate) / this.bandwidth;

    if (!segmentDlTime) {
      segmentDlTime = Infinity;
    }

    // this threshold is to account for having a high latency on the manifest
    // request which is a somewhat small file.
    threshold = 10;

    if (newBitrate > oldBitrate && segmentDlTime <= threshold) {
      this.playlists.media(selectedPlaylist);
      loaderHandler = videojs.bind(this, function() {
        setupEvents.call(this);
        this.playlists.off('loadedplaylist', loaderHandler);
      });
      this.playlists.on('loadedplaylist', loaderHandler);
    } else {
      setupEvents.call(this);
    }
  }));

  this.playlists.on('error', videojs.bind(this, function() {
    player.error(this.playlists.error);
  }));

  this.playlists.on('loadedplaylist', videojs.bind(this, function() {
    var updatedPlaylist = this.playlists.media();

    if (!updatedPlaylist) {
      // do nothing before an initial media playlist has been activated
      return;
    }

    this.updateDuration(this.playlists.media());
    this.mediaIndex = videojs.Hls.translateMediaIndex(this.mediaIndex, oldMediaPlaylist, updatedPlaylist);
    oldMediaPlaylist = updatedPlaylist;

    this.fetchKeys_();
  }));

  this.playlists.on('mediachange', videojs.bind(this, function() {
    // abort outstanding key requests and check if new keys need to be retrieved
    if (keyXhr) {
      this.cancelKeyXhr();
    }

    player.trigger('mediachange');
  }));

  this.player().ready(function() {
    // do nothing if the tech has been disposed already
    // this can occur if someone sets the src in player.ready(), for instance
    if (!tech.el()) {
      return;
    }
    tech.el().vjs_src(source.src);
  });
};

/* Returns the media index for the live point in the current playlist, and updates
   the current time to go along with it.
 */
videojs.Hls.getMediaIndexForLive_ = function(selectedPlaylist) {
  if (!selectedPlaylist.segments) {
    return 0;
  }

  var tailIterator = selectedPlaylist.segments.length,
      tailDuration = 0,
      targetTail = (selectedPlaylist.targetDuration || 10) * 3;

  while (tailDuration < targetTail && tailIterator > 0) {
    tailDuration += selectedPlaylist.segments[tailIterator - 1].duration;
    tailIterator--;
  }

  return tailIterator;
};

videojs.Hls.prototype.handleSourceOpen = function() {
  // construct the video data buffer and set the appropriate MIME type
  var
    player = this.player(),
    sourceBuffer = this.mediaSource.addSourceBuffer('video/flv; codecs="vp6,aac"');

  this.sourceBuffer = sourceBuffer;

  // if autoplay is enabled, begin playback. This is duplicative of
  // code in video.js but is required because play() must be invoked
  // *after* the media source has opened.
  // NOTE: moving this invocation of play() after
  // sourceBuffer.appendBuffer() below caused live streams with
  // autoplay to stall
  if (player.options().autoplay) {
    player.play();
  }

  sourceBuffer.appendBuffer(this.segmentParser_.getFlvHeader());
};

// register event listeners to transform in-band metadata events into
// VTTCues on a text track
videojs.Hls.prototype.setupMetadataCueTranslation_ = function() {
  var
    tech = this,
    metadataStream = tech.segmentParser_.metadataStream,
    textTrack;

  // only expose metadata tracks to video.js versions that support
  // dynamic text tracks (4.12+)
  if (!tech.player().addTextTrack) {
    return;
  }

  // add a metadata cue whenever a metadata event is triggered during
  // segment parsing
  metadataStream.on('data', function(metadata) {
    var i, hexDigit;

    // create the metadata track if this is the first ID3 tag we've
    // seen
    if (!textTrack) {
      textTrack = tech.player().addTextTrack('metadata', 'Timed Metadata');

      // build the dispatch type from the stream descriptor
      // https://html.spec.whatwg.org/multipage/embedded-content.html#steps-to-expose-a-media-resource-specific-text-track
      textTrack.inBandMetadataTrackDispatchType = videojs.Hls.SegmentParser.STREAM_TYPES.metadata.toString(16).toUpperCase();
      for (i = 0; i < metadataStream.descriptor.length; i++) {
        hexDigit = ('00' + metadataStream.descriptor[i].toString(16).toUpperCase()).slice(-2);
        textTrack.inBandMetadataTrackDispatchType += hexDigit;
      }
    }

    // store this event for processing once the muxing has finished
    tech.segmentBuffer_[0].pendingMetadata.push({
      textTrack: textTrack,
      metadata: metadata
    });
  });

  // when seeking, clear out all cues ahead of the earliest position
  // in the new segment. keep earlier cues around so they can still be
  // programmatically inspected even though they've already fired
  tech.on(tech.player(), 'seeking', function() {
    var media, startTime, i;
    if (!textTrack) {
      return;
    }
    media = tech.playlists.media();
    startTime = tech.playlists.expiredPreDiscontinuity_ + tech.playlists.expiredPostDiscontinuity_;
    startTime += videojs.Hls.Playlist.duration(media, media.mediaSequence, media.mediaSequence + tech.mediaIndex);

    i = textTrack.cues.length;
    while (i--) {
      if (textTrack.cues[i].startTime >= startTime) {
        textTrack.removeCue(textTrack.cues[i]);
      }
    }
  });
};

videojs.Hls.prototype.addCuesForMetadata_ = function(segmentInfo) {
  var i, cue, frame, metadata, minPts, segment, segmentOffset, textTrack, time;
  segmentOffset = videojs.Hls.Playlist.duration(segmentInfo.playlist,
                                                segmentInfo.playlist.mediaSequence,
                                                segmentInfo.playlist.mediaSequence + segmentInfo.mediaIndex);
  segment = segmentInfo.playlist.segments[segmentInfo.mediaIndex];
  minPts = Math.min(segment.minVideoPts, segment.minAudioPts);

  while (segmentInfo.pendingMetadata.length) {
    metadata = segmentInfo.pendingMetadata[0].metadata;
    textTrack = segmentInfo.pendingMetadata[0].textTrack;

    // create cue points for all the ID3 frames in this metadata event
    for (i = 0; i < metadata.frames.length; i++) {
      frame = metadata.frames[i];
      time = segmentOffset + ((metadata.pts - minPts) * 0.001);
      cue = new window.VTTCue(time, time, frame.value || frame.url || '');
      cue.frame = frame;
      textTrack.addCue(cue);
    }
    segmentInfo.pendingMetadata.shift();
  }
};

/**
 * Reset the mediaIndex if play() is called after the video has
 * ended.
 */
videojs.Hls.prototype.play = function() {
  if (this.ended()) {
    this.mediaIndex = 0;
  }

  // we may need to seek to begin playing safely for live playlists
  if (this.duration() === Infinity) {

    // if this is the first time we're playing the stream or we're
    // ahead of the latest safe playback position, seek to the live
    // point
    if (!this.player().hasClass('vjs-has-started') ||
        this.currentTime() > this.seekable().end(0)) {
      this.setCurrentTime(this.seekable().end(0));

    } else if (this.currentTime() < this.seekable().start(0)) {
      // if the viewer has paused and we fell out of the live window,
      // seek forward to the earliest available position
      this.setCurrentTime(this.seekable().start(0));
    }
  }

  // delegate back to the Flash implementation
  return videojs.Flash.prototype.play.apply(this, arguments);
};

videojs.Hls.prototype.currentTime = function() {
  if (this.lastSeekedTime_) {
    return this.lastSeekedTime_;
  }
  // currentTime is zero while the tech is initializing
  if (!this.el() || !this.el().vjs_getProperty) {
    return 0;
  }
  return this.el().vjs_getProperty('currentTime');
};

videojs.Hls.prototype.setCurrentTime = function(currentTime) {
  if (!(this.playlists && this.playlists.media())) {
    // return immediately if the metadata is not ready yet
    return 0;
  }

  // it's clearly an edge-case but don't thrown an error if asked to
  // seek within an empty playlist
  if (!this.playlists.media().segments) {
    return 0;
  }

  // clamp seeks to the available seekable time range
  if (currentTime < this.seekable().start(0)) {
    currentTime = this.seekable().start(0);
  } else if (currentTime > this.seekable().end(0)) {
    currentTime = this.seekable().end(0);
  }

  // save the seek target so currentTime can report it correctly
  // while the seek is pending
  this.lastSeekedTime_ = currentTime;

  // determine the requested segment
  this.mediaIndex = this.playlists.getMediaIndexForTime_(currentTime);

  // abort any segments still being decoded
  this.sourceBuffer.abort();

  // cancel outstanding requests and buffer appends
  this.cancelSegmentXhr();

  // abort outstanding key requests, if necessary
  if (keyXhr) {
    keyXhr.aborted = true;
    this.cancelKeyXhr();
  }

  // clear out any buffered segments
  this.segmentBuffer_ = [];

  // begin filling the buffer at the new position
  this.fillBuffer(currentTime * 1000);
};

videojs.Hls.prototype.duration = function() {
  var playlists = this.playlists;
  if (playlists) {
    return videojs.Hls.Playlist.duration(playlists.media());
  }
  return 0;
};

videojs.Hls.prototype.seekable = function() {
  var currentSeekable, startOffset, media;

  if (!this.playlists) {
    return videojs.createTimeRange();
  }
  media = this.playlists.media();
  if (!media) {
    return videojs.createTimeRange();
  }

  // report the seekable range relative to the earliest possible
  // position when the stream was first loaded
  currentSeekable = videojs.Hls.Playlist.seekable(media);
  startOffset = this.playlists.expiredPostDiscontinuity_ - this.playlists.expiredPreDiscontinuity_;
  return videojs.createTimeRange(startOffset,
                                 startOffset + (currentSeekable.end(0) - currentSeekable.start(0)));
};

/**
 * Update the player duration
 */
videojs.Hls.prototype.updateDuration = function(playlist) {
  var player = this.player(),
      oldDuration = player.duration(),
      newDuration = videojs.Hls.Playlist.duration(playlist);

  // if the duration has changed, invalidate the cached value
  if (oldDuration !== newDuration) {
    player.trigger('durationchange');
  }
};

/**
 * Clear all buffers and reset any state relevant to the current
 * source. After this function is called, the tech should be in a
 * state suitable for switching to a different video.
 */
videojs.Hls.prototype.resetSrc_ = function() {
  this.cancelSegmentXhr();
  this.cancelKeyXhr();

  if (this.sourceBuffer) {
    this.sourceBuffer.abort();
  }
};

videojs.Hls.prototype.cancelKeyXhr = function() {
  if (keyXhr) {
    keyXhr.onreadystatechange = null;
    keyXhr.abort();
    keyXhr = null;
  }
};

videojs.Hls.prototype.cancelSegmentXhr = function() {
  if (this.segmentXhr_) {
    // Prevent error handler from running.
    this.segmentXhr_.onreadystatechange = null;
    this.segmentXhr_.abort();
    this.segmentXhr_ = null;
  }
};

/**
 * Abort all outstanding work and cleanup.
 */
videojs.Hls.prototype.dispose = function() {
  this.stopCheckingBuffer_();

  if (this.playlists) {
    this.playlists.dispose();
  }

  this.resetSrc_();

  videojs.Flash.prototype.dispose.call(this);
};

/**
 * Chooses the appropriate media playlist based on the current
 * bandwidth estimate and the player size.
 * @return the highest bitrate playlist less than the currently detected
 * bandwidth, accounting for some amount of bandwidth variance
 */
videojs.Hls.prototype.selectPlaylist = function () {
  var
    player = this.player(),
    effectiveBitrate,
    sortedPlaylists = this.playlists.master.playlists.slice(),
    bandwidthPlaylists = [],
    i = sortedPlaylists.length,
    variant,
    oldvariant,
    bandwidthBestVariant,
    resolutionPlusOne,
    resolutionBestVariant,
    playerWidth,
    playerHeight;

  sortedPlaylists.sort(videojs.Hls.comparePlaylistBandwidth);

  // filter out any variant that has greater effective bitrate
  // than the current estimated bandwidth
  while (i--) {
    variant = sortedPlaylists[i];

    // ignore playlists without bandwidth information
    if (!variant.attributes || !variant.attributes.BANDWIDTH) {
      continue;
    }

    effectiveBitrate = variant.attributes.BANDWIDTH * bandwidthVariance;

    if (effectiveBitrate < player.hls.bandwidth) {
      bandwidthPlaylists.push(variant);

      // since the playlists are sorted in ascending order by
      // bandwidth, the first viable variant is the best
      if (!bandwidthBestVariant) {
        bandwidthBestVariant = variant;
      }
    }
  }

  i = bandwidthPlaylists.length;

  // sort variants by resolution
  bandwidthPlaylists.sort(videojs.Hls.comparePlaylistResolution);

  // forget our old variant from above, or we might choose that in high-bandwidth scenarios
  // (this could be the lowest bitrate rendition as  we go through all of them above)
  variant = null;

  playerWidth = parseInt(getComputedStyle(player.el()).width, 10);
  playerHeight = parseInt(getComputedStyle(player.el()).height, 10);

  // iterate through the bandwidth-filtered playlists and find
  // best rendition by player dimension
  while (i--) {
    oldvariant = variant;
    variant = bandwidthPlaylists[i];

    // ignore playlists without resolution information
    if (!variant.attributes ||
        !variant.attributes.RESOLUTION ||
        !variant.attributes.RESOLUTION.width ||
        !variant.attributes.RESOLUTION.height) {
      continue;
    }


    // since the playlists are sorted, the first variant that has
    // dimensions less than or equal to the player size is the best
    if (variant.attributes.RESOLUTION.width === playerWidth &&
        variant.attributes.RESOLUTION.height === playerHeight) {
      // if we have the exact resolution as the player use it
      resolutionPlusOne = null;
      resolutionBestVariant = variant;
      break;
    } else if (variant.attributes.RESOLUTION.width < playerWidth &&
        variant.attributes.RESOLUTION.height < playerHeight) {
      // if we don't have an exact match, see if we have a good higher quality variant to use
      if (oldvariant && oldvariant.attributes && oldvariant.attributes.RESOLUTION &&
          oldvariant.attributes.RESOLUTION.width && oldvariant.attributes.RESOLUTION.height) {
        resolutionPlusOne = oldvariant;
      }
      resolutionBestVariant = variant;
      break;
    }
  }

  // fallback chain of variants
  return resolutionPlusOne || resolutionBestVariant || bandwidthBestVariant || sortedPlaylists[0];
};

/**
 * Periodically request new segments and append video data.
 */
videojs.Hls.prototype.checkBuffer_ = function() {
  // calling this method directly resets any outstanding buffer checks
  if (this.checkBufferTimeout_) {
    window.clearTimeout(this.checkBufferTimeout_);
    this.checkBufferTimeout_ = null;
  }

  this.fillBuffer();
  this.drainBuffer();

  // wait awhile and try again
  this.checkBufferTimeout_ = window.setTimeout(videojs.bind(this, this.checkBuffer_),
                                               bufferCheckInterval);
};

/**
 * Setup a periodic task to request new segments if necessary and
 * append bytes into the SourceBuffer.
 */
videojs.Hls.prototype.startCheckingBuffer_ = function() {
  // if the player ever stalls, check if there is video data available
  // to append immediately
  this.player().on('waiting', videojs.bind(this, this.drainBuffer));

  this.checkBuffer_();
};

/**
 * Stop the periodic task requesting new segments and feeding the
 * SourceBuffer.
 */
videojs.Hls.prototype.stopCheckingBuffer_ = function() {
  window.clearTimeout(this.checkBufferTimeout_);
  this.checkBufferTimeout_ = null;
  this.player().off('waiting', this.drainBuffer);
};

/**
 * Determines whether there is enough video data currently in the buffer
 * and downloads a new segment if the buffered time is less than the goal.
 * @param offset (optional) {number} the offset into the downloaded segment
 * to seek to, in milliseconds
 */
videojs.Hls.prototype.fillBuffer = function(offset) {
  var
    player = this.player(),
    buffered = player.buffered(),
    bufferedTime = 0,
    segment,
    segmentUri;

  // if preload is set to "none", do not download segments until playback is requested
  if (!player.hasClass('vjs-has-started') &&
      player.options().preload === 'none') {
    return;
  }

  // if a video has not been specified, do nothing
  if (!player.currentSrc() || !this.playlists) {
    return;
  }

  // if there is a request already in flight, do nothing
  if (this.segmentXhr_) {
    return;
  }

  // if no segments are available, do nothing
  if (this.playlists.state === "HAVE_NOTHING" ||
      !this.playlists.media() ||
      !this.playlists.media().segments) {
    return;
  }

  // if this is a live video wait until playback has been requested to
  // being buffering so we don't preload data that will never be
  // played
  if (!this.playlists.media().endList &&
      !this.player().hasClass('vjs-has-started') &&
      offset === undefined) {
    return;
  }

  // if a playlist switch is in progress, wait for it to finish
  if (this.playlists.state === 'SWITCHING_MEDIA') {
    return;
  }

  // if the video has finished downloading, stop trying to buffer
  segment = this.playlists.media().segments[this.mediaIndex];
  if (!segment) {
    return;
  }

  if (buffered) {
    // assuming a single, contiguous buffer region
    bufferedTime = player.buffered().end(0) - player.currentTime();
  }

  // if there is plenty of content in the buffer and we're not
  // seeking, relax for awhile
  if (typeof offset !== 'number' && bufferedTime >= videojs.Hls.GOAL_BUFFER_LENGTH) {
    return;
  }

  // resolve the segment URL relative to the playlist
  segmentUri = this.playlistUriToUrl(segment.uri);

  this.loadSegment(segmentUri, offset);
};

videojs.Hls.prototype.playlistUriToUrl = function(segmentRelativeUrl) {
  var playListUrl;
    // resolve the segment URL relative to the playlist
  if (this.playlists.media().uri === this.src_) {
    playListUrl = resolveUrl(this.src_, segmentRelativeUrl);
  } else {
    playListUrl = resolveUrl(resolveUrl(this.src_, this.playlists.media().uri || ''), segmentRelativeUrl);
  }
  return playListUrl;
};

/*
 * Sets `bandwidth`, `segmentXhrTime`, and appends to the `bytesReceived.
 * Expects an object with:
 *  * `roundTripTime` - the round trip time for the request we're setting the time for
 *  * `bandwidth` - the bandwidth we want to set
 *  * `bytesReceived` - amount of bytes downloaded
 * `bandwidth` is the only required property.
 */
videojs.Hls.prototype.setBandwidth = function(xhr) {
  var tech = this;
  // calculate the download bandwidth
  tech.segmentXhrTime = xhr.roundTripTime;
  tech.bandwidth = xhr.bandwidth;
  tech.bytesReceived += xhr.bytesReceived || 0;

  tech.trigger('bandwidthupdate');
};

videojs.Hls.prototype.loadSegment = function(segmentUri, offset) {
  var
    tech = this,
    player = this.player(),
    settings = player.options().hls || {};

  // request the next segment
  this.segmentXhr_ = videojs.Hls.xhr({
    url: segmentUri,
    responseType: 'arraybuffer',
    withCredentials: settings.withCredentials
  }, function(error, url) {
    var segmentInfo;

    // the segment request is no longer outstanding
    tech.segmentXhr_ = null;

    if (error) {
      // if a segment request times out, we may have better luck with another playlist
      if (error === 'timeout') {
        tech.bandwidth = 1;
        return tech.playlists.media(tech.selectPlaylist());
      }
      // otherwise, try jumping ahead to the next segment
      tech.error = {
        status: this.status,
        message: 'HLS segment request error at URL: ' + url,
        code: (this.status >= 500) ? 4 : 2
      };

      // try moving on to the next segment
      tech.mediaIndex++;
      return;
    }

    // stop processing if the request was aborted
    if (!this.response) {
      return;
    }

    tech.setBandwidth(this);

    // package up all the work to append the segment
    segmentInfo = {
      // the segment's mediaIndex at the time it was received
      mediaIndex: tech.mediaIndex,
      // the segment's playlist
      playlist: tech.playlists.media(),
      // optionally, a time offset to seek to within the segment
      offset: offset,
      // unencrypted bytes of the segment
      bytes: null,
      // when a key is defined for this segment, the encrypted bytes
      encryptedBytes: null,
      // optionally, the decrypter that is unencrypting the segment
      decrypter: null,
      // metadata events discovered during muxing that need to be
      // translated into cue points
      pendingMetadata: []
    };
    if (segmentInfo.playlist.segments[segmentInfo.mediaIndex].key) {
      segmentInfo.encryptedBytes = new Uint8Array(this.response);
    } else {
      segmentInfo.bytes = new Uint8Array(this.response);
    }
    tech.segmentBuffer_.push(segmentInfo);
    player.trigger('progress');
    tech.drainBuffer();

    tech.mediaIndex++;

    // figure out what stream the next segment should be downloaded from
    // with the updated bandwidth information
    tech.playlists.media(tech.selectPlaylist());
  });
};

videojs.Hls.prototype.drainBuffer = function(event) {
  var
    i = 0,
    segmentInfo,
    mediaIndex,
    playlist,
    offset,
    tags,
    bytes,
    segment,
    decrypter,
    segIv,
    ptsTime,
    segmentOffset = 0,
    segmentBuffer = this.segmentBuffer_;

  // if the buffer is empty or the source buffer hasn't been created
  // yet, do nothing
  if (!segmentBuffer.length || !this.sourceBuffer) {
    return;
  }

  // we can't append more data if the source buffer is busy processing
  // what we've already sent
  if (this.sourceBuffer.updating) {
    return;
  }

  segmentInfo = segmentBuffer[0];

  mediaIndex = segmentInfo.mediaIndex;
  playlist = segmentInfo.playlist;
  offset = segmentInfo.offset;
  bytes = segmentInfo.bytes;
  segment = playlist.segments[mediaIndex];

  if (segment.key && !bytes) {

    // this is an encrypted segment
    // if the key download failed, we want to skip this segment
    // but if the key hasn't downloaded yet, we want to try again later
    if (keyFailed(segment.key)) {
      return segmentBuffer.shift();
    } else if (!segment.key.bytes) {

      // trigger a key request if one is not already in-flight
      return this.fetchKeys_();

    } else if (segmentInfo.decrypter) {

      // decryption is in progress, try again later
      return;

    } else {
      // if the media sequence is greater than 2^32, the IV will be incorrect
      // assuming 10s segments, that would be about 1300 years
      segIv = segment.key.iv || new Uint32Array([0, 0, 0, mediaIndex + playlist.mediaSequence]);

      // create a decrypter to incrementally decrypt the segment
      decrypter = new videojs.Hls.Decrypter(segmentInfo.encryptedBytes,
                                            segment.key.bytes,
                                            segIv,
                                            function(err, bytes) {
                                              segmentInfo.bytes = bytes;
                                            });
      segmentInfo.decrypter = decrypter;
      return;
    }
  }

  event = event || {};

  // transmux the segment data from MP2T to FLV
  this.segmentParser_.parseSegmentBinaryData(bytes);
  this.segmentParser_.flushTags();

  tags = [];

  if (this.segmentParser_.tagsAvailable()) {
    // record PTS information for the segment so we can calculate
    // accurate durations and seek reliably
    if (this.segmentParser_.stats.h264Tags()) {
      segment.minVideoPts = this.segmentParser_.stats.minVideoPts();
      segment.maxVideoPts = this.segmentParser_.stats.maxVideoPts();
    }
    if (this.segmentParser_.stats.aacTags()) {
      segment.minAudioPts = this.segmentParser_.stats.minAudioPts();
      segment.maxAudioPts = this.segmentParser_.stats.maxAudioPts();
    }
  }

  while (this.segmentParser_.tagsAvailable()) {
    tags.push(this.segmentParser_.getNextTag());
  }

  this.addCuesForMetadata_(segmentInfo);
  this.updateDuration(this.playlists.media());

  // if we're refilling the buffer after a seek, scan through the muxed
  // FLV tags until we find the one that is closest to the desired
  // playback time
  if (typeof offset === 'number') {
    // determine the offset within this segment we're seeking to
    segmentOffset = this.playlists.expiredPostDiscontinuity_ + this.playlists.expiredPreDiscontinuity_;
    segmentOffset += videojs.Hls.Playlist.duration(playlist,
                                                   playlist.mediaSequence,
                                                   playlist.mediaSequence + mediaIndex);
    segmentOffset = offset - (segmentOffset * 1000);
    ptsTime = segmentOffset + tags[0].pts;

    while (tags[i + 1] && tags[i].pts < ptsTime) {
      i++;
    }

    // tell the SWF the media position of the first tag we'll be delivering
    this.el().vjs_setProperty('currentTime', ((tags[i].pts - ptsTime + offset) * 0.001));

    tags = tags.slice(i);

    this.lastSeekedTime_ = null;
  }

  // when we're crossing a discontinuity, inject metadata to indicate
  // that the decoder should be reset appropriately
  if (segment.discontinuity && tags.length) {
    this.el().vjs_discontinuity();
  }

  (function() {
    var segmentByteLength = 0, j, segment;
    for (i = 0; i < tags.length; i++) {
      segmentByteLength += tags[i].bytes.byteLength;
    }
    segment = new Uint8Array(segmentByteLength);
    for (i = 0, j = 0; i < tags.length; i++) {
      segment.set(tags[i].bytes, j);
      j += tags[i].bytes.byteLength;
    }
    this.sourceBuffer.appendBuffer(segment);
  }).call(this);

  // we're done processing this segment
  segmentBuffer.shift();

  // transition the sourcebuffer to the ended state if we've hit the end of
  // the playlist
  if (this.duration() !== Infinity && mediaIndex + 1 === playlist.segments.length) {
    this.mediaSource.endOfStream();
  }
};

/**
 * Attempt to retrieve keys starting at a particular media
 * segment. This method has no effect if segments are not yet
 * available or a key request is already in progress.
 *
 * @param playlist {object} the media playlist to fetch keys for
 * @param index {number} the media segment index to start from
 */
videojs.Hls.prototype.fetchKeys_ = function() {
  var i, key, tech, player, settings, segment, view, receiveKey;

  // if there is a pending XHR or no segments, don't do anything
  if (keyXhr || !this.segmentBuffer_.length) {
    return;
  }

  tech = this;
  player = this.player();
  settings = player.options().hls || {};

  /**
   * Handle a key XHR response. This function needs to lookup the
   */
  receiveKey = function(key) {
    return function(error) {
      keyXhr = null;

      if (error || !this.response || this.response.byteLength !== 16) {
        key.retries = key.retries || 0;
        key.retries++;
        if (!this.aborted) {
          // try fetching again
          tech.fetchKeys_();
        }
        return;
      }

      view = new DataView(this.response);
      key.bytes = new Uint32Array([
        view.getUint32(0),
        view.getUint32(4),
        view.getUint32(8),
        view.getUint32(12)
      ]);

      // check to see if this allows us to make progress buffering now
      tech.checkBuffer_();
    };
  };

  for (i = 0; i < tech.segmentBuffer_.length; i++) {
    segment = tech.segmentBuffer_[i].playlist.segments[tech.segmentBuffer_[i].mediaIndex];
    key = segment.key;

    // continue looking if this segment is unencrypted
    if (!key) {
      continue;
    }

    // request the key if the retry limit hasn't been reached
    if (!key.bytes && !keyFailed(key)) {
      keyXhr = videojs.Hls.xhr({
        url: this.playlistUriToUrl(key.uri),
        responseType: 'arraybuffer',
        withCredentials: settings.withCredentials
      }, receiveKey(key));
      break;
    }
  }
};

/**
 * Whether the browser has built-in HLS support.
 */
videojs.Hls.supportsNativeHls = (function() {
  var
    video = document.createElement('video'),
    xMpegUrl,
    vndMpeg;

  // native HLS is definitely not supported if HTML5 video isn't
  if (!videojs.Html5.isSupported()) {
    return false;
  }

  xMpegUrl = video.canPlayType('application/x-mpegURL');
  vndMpeg = video.canPlayType('application/vnd.apple.mpegURL');
  return (/probably|maybe/).test(xMpegUrl) ||
    (/probably|maybe/).test(vndMpeg);
})();

videojs.Hls.isSupported = function() {

  // Only use the HLS tech if native HLS isn't available
  return !videojs.Hls.supportsNativeHls &&
    // Flash must be supported for the fallback to work
    videojs.Flash.isSupported() &&
    // Media sources must be available to stream bytes to Flash
    videojs.MediaSource &&
    // Typed arrays are used to repackage the segments
    window.Uint8Array;
};

videojs.Hls.canPlaySource = function(srcObj) {
  var mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i;
  return mpegurlRE.test(srcObj.type);
};

/**
 * Calculate the duration of a playlist from a given start index to a given
 * end index.
 * @param playlist {object} a media playlist object
 * @param startIndex {number} an inclusive lower boundary for the playlist.
 * Defaults to 0.
 * @param endIndex {number} an exclusive upper boundary for the playlist.
 * Defaults to playlist length.
 * @return {number} the duration between the start index and end index.
 */
videojs.Hls.getPlaylistDuration = function(playlist, startIndex, endIndex) {
  videojs.log.warn('videojs.Hls.getPlaylistDuration is deprecated. ' +
                   'Use videojs.Hls.Playlist.duration instead');
  return videojs.Hls.Playlist.duration(playlist, startIndex, endIndex);
};

/**
 * Calculate the total duration for a playlist based on segment metadata.
 * @param playlist {object} a media playlist object
 * @return {number} the currently known duration, in seconds
 */
videojs.Hls.getPlaylistTotalDuration = function(playlist) {
  videojs.log.warn('videojs.Hls.getPlaylistTotalDuration is deprecated. ' +
                   'Use videojs.Hls.Playlist.duration instead');
  return videojs.Hls.Playlist.duration(playlist);
};

/**
 * Determine the media index in one playlist that corresponds to a
 * specified media index in another. This function can be used to
 * calculate a new segment position when a playlist is reloaded or a
 * variant playlist is becoming active.
 * @param mediaIndex {number} the index into the original playlist
 * to translate
 * @param original {object} the playlist to translate the media
 * index from
 * @param update {object} the playlist to translate the media index
 * to
 * @param {number} the corresponding media index in the updated
 * playlist
 */
videojs.Hls.translateMediaIndex = function(mediaIndex, original, update) {
  var translatedMediaIndex;

  // no segments have been loaded from the original playlist
  if (mediaIndex === 0) {
    return 0;
  }

  if (!(update && update.segments)) {
    // let the media index be zero when there are no segments defined
    return 0;
  }

  // translate based on media sequence numbers. syncing up across
  // bitrate switches should be happening here.
  translatedMediaIndex = (mediaIndex + (original.mediaSequence - update.mediaSequence));

  if (translatedMediaIndex > update.segments.length || translatedMediaIndex < 0) {
    // recalculate the live point if the streams are too far out of sync
    return videojs.Hls.getMediaIndexForLive_(update) + 1;
  }

  return translatedMediaIndex;
};

/**
 * Deprecated.
 *
 * @deprecated use player.hls.playlists.getMediaIndexForTime_() instead
 */
videojs.Hls.getMediaIndexByTime = function() {
  videojs.log.warn('getMediaIndexByTime is deprecated. ' +
                   'Use PlaylistLoader.getMediaIndexForTime_ instead.');
  return 0;
};

/**
 * A comparator function to sort two playlist object by bandwidth.
 * @param left {object} a media playlist object
 * @param right {object} a media playlist object
 * @return {number} Greater than zero if the bandwidth attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the bandwidth of right is greater than left and
 * exactly zero if the two are equal.
 */
videojs.Hls.comparePlaylistBandwidth = function(left, right) {
  var leftBandwidth, rightBandwidth;
  if (left.attributes && left.attributes.BANDWIDTH) {
    leftBandwidth = left.attributes.BANDWIDTH;
  }
  leftBandwidth = leftBandwidth || window.Number.MAX_VALUE;
  if (right.attributes && right.attributes.BANDWIDTH) {
    rightBandwidth = right.attributes.BANDWIDTH;
  }
  rightBandwidth = rightBandwidth || window.Number.MAX_VALUE;

  return leftBandwidth - rightBandwidth;
};

/**
 * A comparator function to sort two playlist object by resolution (width).
 * @param left {object} a media playlist object
 * @param right {object} a media playlist object
 * @return {number} Greater than zero if the resolution.width attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the resolution.width of right is greater than left and
 * exactly zero if the two are equal.
 */
videojs.Hls.comparePlaylistResolution = function(left, right) {
  var leftWidth, rightWidth;

  if (left.attributes && left.attributes.RESOLUTION && left.attributes.RESOLUTION.width) {
    leftWidth = left.attributes.RESOLUTION.width;
  }

  leftWidth = leftWidth || window.Number.MAX_VALUE;

  if (right.attributes && right.attributes.RESOLUTION && right.attributes.RESOLUTION.width) {
    rightWidth = right.attributes.RESOLUTION.width;
  }

  rightWidth = rightWidth || window.Number.MAX_VALUE;

  // NOTE - Fallback to bandwidth sort as appropriate in cases where multiple renditions
  // have the same media dimensions/ resolution
  if (leftWidth === rightWidth && left.attributes.BANDWIDTH && right.attributes.BANDWIDTH) {
    return left.attributes.BANDWIDTH - right.attributes.BANDWIDTH;
  } else {
    return leftWidth - rightWidth;
  }
};

/**
 * Constructs a new URI by interpreting a path relative to another
 * URI.
 * @param basePath {string} a relative or absolute URI
 * @param path {string} a path part to combine with the base
 * @return {string} a URI that is equivalent to composing `base`
 * with `path`
 * @see http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
 */
resolveUrl = videojs.Hls.resolveUrl = function(basePath, path) {
  // use the base element to get the browser to handle URI resolution
  var
    oldBase = document.querySelector('base'),
    docHead = document.querySelector('head'),
    a = document.createElement('a'),
    base = oldBase,
    oldHref,
    result;

  // prep the document
  if (oldBase) {
    oldHref = oldBase.href;
  } else {
    base = docHead.appendChild(document.createElement('base'));
  }

  base.href = basePath;
  a.href = path;
  result = a.href;

  // clean up
  if (oldBase) {
    oldBase.href = oldHref;
  } else {
    docHead.removeChild(base);
  }
  return result;
};

})(window, window.videojs, document);

(function(videojs, undefined) {
  var Stream = function() {
    this.init = function() {
      var listeners = {};
      /**
       * Add a listener for a specified event type.
       * @param type {string} the event name
       * @param listener {function} the callback to be invoked when an event of
       * the specified type occurs
       */
      this.on = function(type, listener) {
        if (!listeners[type]) {
          listeners[type] = [];
        }
        listeners[type].push(listener);
      };
      /**
       * Remove a listener for a specified event type.
       * @param type {string} the event name
       * @param listener {function} a function previously registered for this
       * type of event through `on`
       */
      this.off = function(type, listener) {
        var index;
        if (!listeners[type]) {
          return false;
        }
        index = listeners[type].indexOf(listener);
        listeners[type].splice(index, 1);
        return index > -1;
      };
      /**
       * Trigger an event of the specified type on this stream. Any additional
       * arguments to this function are passed as parameters to event listeners.
       * @param type {string} the event name
       */
      this.trigger = function(type) {
        var callbacks, i, length, args;
        callbacks = listeners[type];
        if (!callbacks) {
          return;
        }
        args = Array.prototype.slice.call(arguments, 1);
        length = callbacks.length;
        for (i = 0; i < length; ++i) {
          callbacks[i].apply(this, args);
        }
      };
      /**
       * Destroys the stream and cleans up.
       */
      this.dispose = function() {
        listeners = {};
      };
    };
  };
  /**
   * Forwards all `data` events on this stream to the destination stream. The
   * destination stream should provide a method `push` to receive the data
   * events as they arrive.
   * @param destination {stream} the stream that will receive all `data` events
   * @see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
   */
  Stream.prototype.pipe = function(destination) {
    this.on('data', function(data) {
      destination.push(data);
    });
  };

  videojs.Hls.Stream = Stream;
})(window.videojs);

(function(window) {

window.videojs = window.videojs || {};
window.videojs.Hls = window.videojs.Hls || {};

var hls = window.videojs.Hls;

// (type:uint, extraData:Boolean = false) extends ByteArray
hls.FlvTag = function(type, extraData) {
  var
    // Counter if this is a metadata tag, nal start marker if this is a video
    // tag. unused if this is an audio tag
    adHoc = 0, // :uint

    // checks whether the FLV tag has enough capacity to accept the proposed
    // write and re-allocates the internal buffers if necessary
    prepareWrite = function(flv, count) {
      var
        bytes,
        minLength = flv.position + count;
      if (minLength < flv.bytes.byteLength) {
        // there's enough capacity so do nothing
        return;
      }

      // allocate a new buffer and copy over the data that will not be modified
      bytes = new Uint8Array(minLength * 2);
      bytes.set(flv.bytes.subarray(0, flv.position), 0);
      flv.bytes = bytes;
      flv.view = new DataView(flv.bytes.buffer);
    },

    // commonly used metadata properties
    widthBytes = hls.FlvTag.widthBytes || new Uint8Array('width'.length),
    heightBytes = hls.FlvTag.heightBytes || new Uint8Array('height'.length),
    videocodecidBytes = hls.FlvTag.videocodecidBytes || new Uint8Array('videocodecid'.length),
    i;

  if (!hls.FlvTag.widthBytes) {
    // calculating the bytes of common metadata names ahead of time makes the
    // corresponding writes faster because we don't have to loop over the
    // characters
    // re-test with test/perf.html if you're planning on changing this
    for (i = 0; i < 'width'.length; i++) {
      widthBytes[i] = 'width'.charCodeAt(i);
    }
    for (i = 0; i < 'height'.length; i++) {
      heightBytes[i] = 'height'.charCodeAt(i);
    }
    for (i = 0; i < 'videocodecid'.length; i++) {
      videocodecidBytes[i] = 'videocodecid'.charCodeAt(i);
    }

    hls.FlvTag.widthBytes = widthBytes;
    hls.FlvTag.heightBytes = heightBytes;
    hls.FlvTag.videocodecidBytes = videocodecidBytes;
  }

  this.keyFrame = false; // :Boolean

  switch(type) {
  case hls.FlvTag.VIDEO_TAG:
    this.length = 16;
    break;
  case hls.FlvTag.AUDIO_TAG:
    this.length = 13;
    this.keyFrame = true;
    break;
  case hls.FlvTag.METADATA_TAG:
    this.length = 29;
    this.keyFrame = true;
    break;
  default:
    throw("Error Unknown TagType");
  }

  this.bytes = new Uint8Array(16384);
  this.view = new DataView(this.bytes.buffer);
  this.bytes[0] = type;
  this.position = this.length;
  this.keyFrame = extraData; // Defaults to false

  // presentation timestamp
  this.pts = 0;
  // decoder timestamp
  this.dts = 0;

  // ByteArray#writeBytes(bytes:ByteArray, offset:uint = 0, length:uint = 0)
  this.writeBytes = function(bytes, offset, length) {
    var
      start = offset || 0,
      end;
    length = length || bytes.byteLength;
    end = start + length;

    prepareWrite(this, length);
    this.bytes.set(bytes.subarray(start, end), this.position);

    this.position += length;
    this.length = Math.max(this.length, this.position);
  };

  // ByteArray#writeByte(value:int):void
  this.writeByte = function(byte) {
    prepareWrite(this, 1);
    this.bytes[this.position] = byte;
    this.position++;
    this.length = Math.max(this.length, this.position);
  };

  // ByteArray#writeShort(value:int):void
  this.writeShort = function(short) {
    prepareWrite(this, 2);
    this.view.setUint16(this.position, short);
    this.position += 2;
    this.length = Math.max(this.length, this.position);
  };

  // Negative index into array
  // (pos:uint):int
  this.negIndex = function(pos) {
    return this.bytes[this.length - pos];
  };

  // The functions below ONLY work when this[0] == VIDEO_TAG.
  // We are not going to check for that because we dont want the overhead
  // (nal:ByteArray = null):int
  this.nalUnitSize = function() {
    if (adHoc === 0) {
      return 0;
    }

    return this.length - (adHoc + 4);
  };

  this.startNalUnit = function() {
    // remember position and add 4 bytes
    if (adHoc > 0) {
      throw new Error("Attempted to create new NAL wihout closing the old one");
    }

    // reserve 4 bytes for nal unit size
    adHoc = this.length;
    this.length += 4;
    this.position = this.length;
  };

  // (nal:ByteArray = null):void
  this.endNalUnit = function(nalContainer) {
    var
      nalStart, // :uint
      nalLength; // :uint

    // Rewind to the marker and write the size
    if (this.length === adHoc + 4) {
      // we started a nal unit, but didnt write one, so roll back the 4 byte size value
      this.length -= 4;
    } else if (adHoc > 0) {
      nalStart = adHoc + 4;
      nalLength = this.length - nalStart;

      this.position = adHoc;
      this.view.setUint32(this.position, nalLength);
      this.position = this.length;

      if (nalContainer) {
        // Add the tag to the NAL unit
        nalContainer.push(this.bytes.subarray(nalStart, nalStart + nalLength));
      }
    }

    adHoc = 0;
  };

  /**
   * Write out a 64-bit floating point valued metadata property. This method is
   * called frequently during a typical parse and needs to be fast.
   */
  // (key:String, val:Number):void
  this.writeMetaDataDouble = function(key, val) {
    var i;
    prepareWrite(this, 2 + key.length + 9);

    // write size of property name
    this.view.setUint16(this.position, key.length);
    this.position += 2;

    // this next part looks terrible but it improves parser throughput by
    // 10kB/s in my testing

    // write property name
    if (key === 'width') {
      this.bytes.set(widthBytes, this.position);
      this.position += 5;
    } else if (key === 'height') {
      this.bytes.set(heightBytes, this.position);
      this.position += 6;
    } else if (key === 'videocodecid') {
      this.bytes.set(videocodecidBytes, this.position);
      this.position += 12;
    } else {
      for (i = 0; i < key.length; i++) {
        this.bytes[this.position] = key.charCodeAt(i);
        this.position++;
      }
    }

    // skip null byte
    this.position++;

    // write property value
    this.view.setFloat64(this.position, val);
    this.position += 8;

    // update flv tag length
    this.length = Math.max(this.length, this.position);
    ++adHoc;
  };

  // (key:String, val:Boolean):void
  this.writeMetaDataBoolean = function(key, val) {
    var i;
    prepareWrite(this, 2);
    this.view.setUint16(this.position, key.length);
    this.position += 2;
    for (i = 0; i < key.length; i++) {
      console.assert(key.charCodeAt(i) < 255);
      prepareWrite(this, 1);
      this.bytes[this.position] = key.charCodeAt(i);
      this.position++;
    }
    prepareWrite(this, 2);
    this.view.setUint8(this.position, 0x01);
    this.position++;
    this.view.setUint8(this.position, val ? 0x01 : 0x00);
    this.position++;
    this.length = Math.max(this.length, this.position);
    ++adHoc;
  };

  // ():ByteArray
  this.finalize = function() {
    var
      dtsDelta, // :int
      len; // :int

    switch(this.bytes[0]) {
      // Video Data
    case hls.FlvTag.VIDEO_TAG:
      this.bytes[11] = ((this.keyFrame || extraData) ? 0x10 : 0x20 ) | 0x07; // We only support AVC, 1 = key frame (for AVC, a seekable frame), 2 = inter frame (for AVC, a non-seekable frame)
      this.bytes[12] = extraData ?  0x00 : 0x01;

      dtsDelta = this.pts - this.dts;
      this.bytes[13] = (dtsDelta & 0x00FF0000) >>> 16;
      this.bytes[14] = (dtsDelta & 0x0000FF00) >>>  8;
      this.bytes[15] = (dtsDelta & 0x000000FF) >>>  0;
      break;

    case hls.FlvTag.AUDIO_TAG:
      this.bytes[11] = 0xAF; // 44 kHz, 16-bit stereo
      this.bytes[12] = extraData ? 0x00 : 0x01;
      break;

    case hls.FlvTag.METADATA_TAG:
      this.position = 11;
      this.view.setUint8(this.position, 0x02); // String type
      this.position++;
      this.view.setUint16(this.position, 0x0A); // 10 Bytes
      this.position += 2;
      // set "onMetaData"
      this.bytes.set([0x6f, 0x6e, 0x4d, 0x65,
                      0x74, 0x61, 0x44, 0x61,
                      0x74, 0x61], this.position);
      this.position += 10;
      this.bytes[this.position] = 0x08; // Array type
      this.position++;
      this.view.setUint32(this.position, adHoc);
      this.position = this.length;
      this.bytes.set([0, 0, 9], this.position);
      this.position += 3; // End Data Tag
      this.length = this.position;
      break;
    }

    len = this.length - 11;

    // write the DataSize field
    this.bytes[ 1] = (len & 0x00FF0000) >>> 16;
    this.bytes[ 2] = (len & 0x0000FF00) >>>  8;
    this.bytes[ 3] = (len & 0x000000FF) >>>  0;
    // write the Timestamp
    this.bytes[ 4] = (this.dts & 0x00FF0000) >>> 16;
    this.bytes[ 5] = (this.dts & 0x0000FF00) >>>  8;
    this.bytes[ 6] = (this.dts & 0x000000FF) >>>  0;
    this.bytes[ 7] = (this.dts & 0xFF000000) >>> 24;
    // write the StreamID
    this.bytes[ 8] = 0;
    this.bytes[ 9] = 0;
    this.bytes[10] = 0;

    // Sometimes we're at the end of the view and have one slot to write a
    // uint32, so, prepareWrite of count 4, since, view is uint8
    prepareWrite(this, 4);
    this.view.setUint32(this.length, this.length);
    this.length += 4;
    this.position += 4;

    // trim down the byte buffer to what is actually being used
    this.bytes = this.bytes.subarray(0, this.length);
    this.frameTime = hls.FlvTag.frameTime(this.bytes);
    console.assert(this.bytes.byteLength === this.length);
    return this;
  };
};

hls.FlvTag.AUDIO_TAG = 0x08; // == 8, :uint
hls.FlvTag.VIDEO_TAG = 0x09; // == 9, :uint
hls.FlvTag.METADATA_TAG = 0x12; // == 18, :uint

// (tag:ByteArray):Boolean {
hls.FlvTag.isAudioFrame = function(tag) {
  return hls.FlvTag.AUDIO_TAG === tag[0];
};

// (tag:ByteArray):Boolean {
hls.FlvTag.isVideoFrame = function(tag) {
  return hls.FlvTag.VIDEO_TAG === tag[0];
};

// (tag:ByteArray):Boolean {
hls.FlvTag.isMetaData = function(tag) {
  return hls.FlvTag.METADATA_TAG === tag[0];
};

// (tag:ByteArray):Boolean {
hls.FlvTag.isKeyFrame = function(tag) {
  if (hls.FlvTag.isVideoFrame(tag)) {
    return tag[11] === 0x17;
  }

  if (hls.FlvTag.isAudioFrame(tag)) {
    return true;
  }

  if (hls.FlvTag.isMetaData(tag)) {
    return true;
  }

  return false;
};

// (tag:ByteArray):uint {
hls.FlvTag.frameTime = function(tag) {
  var pts = tag[ 4] << 16; // :uint
  pts |= tag[ 5] <<  8;
  pts |= tag[ 6] <<  0;
  pts |= tag[ 7] << 24;
  return pts;
};

})(this);

(function(window) {

/**
 * Parser for exponential Golomb codes, a variable-bitwidth number encoding
 * scheme used by h264.
 */
window.videojs.Hls.ExpGolomb = function(workingData) {
  var
    // the number of bytes left to examine in workingData
    workingBytesAvailable = workingData.byteLength,

    // the current word being examined
    workingWord = 0, // :uint

    // the number of bits left to examine in the current word
    workingBitsAvailable = 0; // :uint;

  // ():uint
  this.length = function() {
    return (8 * workingBytesAvailable);
  };

  // ():uint
  this.bitsAvailable = function() {
    return (8 * workingBytesAvailable) + workingBitsAvailable;
  };

  // ():void
  this.loadWord = function() {
    var
      position = workingData.byteLength - workingBytesAvailable,
      workingBytes = new Uint8Array(4),
      availableBytes = Math.min(4, workingBytesAvailable);

    if (availableBytes === 0) {
      throw new Error('no bytes available');
    }

    workingBytes.set(workingData.subarray(position,
                                          position + availableBytes));
    workingWord = new DataView(workingBytes.buffer).getUint32(0);

    // track the amount of workingData that has been processed
    workingBitsAvailable = availableBytes * 8;
    workingBytesAvailable -= availableBytes;
  };

  // (count:int):void
  this.skipBits = function(count) {
    var skipBytes; // :int
    if (workingBitsAvailable > count) {
      workingWord          <<= count;
      workingBitsAvailable -= count;
    } else {
      count -= workingBitsAvailable;
      skipBytes = count / 8;

      count -= (skipBytes * 8);
      workingBytesAvailable -= skipBytes;

      this.loadWord();

      workingWord <<= count;
      workingBitsAvailable -= count;
    }
  };

  // (size:int):uint
  this.readBits = function(size) {
    var
      bits = Math.min(workingBitsAvailable, size), // :uint
      valu = workingWord >>> (32 - bits); // :uint

    console.assert(size < 32, 'Cannot read more than 32 bits at a time');

    workingBitsAvailable -= bits;
    if (workingBitsAvailable > 0) {
      workingWord <<= bits;
    } else if (workingBytesAvailable > 0) {
      this.loadWord();
    }

    bits = size - bits;
    if (bits > 0) {
      return valu << bits | this.readBits(bits);
    } else {
      return valu;
    }
  };

  // ():uint
  this.skipLeadingZeros = function() {
    var leadingZeroCount; // :uint
    for (leadingZeroCount = 0 ; leadingZeroCount < workingBitsAvailable ; ++leadingZeroCount) {
      if (0 !== (workingWord & (0x80000000 >>> leadingZeroCount))) {
        // the first bit of working word is 1
        workingWord <<= leadingZeroCount;
        workingBitsAvailable -= leadingZeroCount;
        return leadingZeroCount;
      }
    }

    // we exhausted workingWord and still have not found a 1
    this.loadWord();
    return leadingZeroCount + this.skipLeadingZeros();
  };

  // ():void
  this.skipUnsignedExpGolomb = function() {
    this.skipBits(1 + this.skipLeadingZeros());
  };

  // ():void
  this.skipExpGolomb = function() {
    this.skipBits(1 + this.skipLeadingZeros());
  };

  // ():uint
  this.readUnsignedExpGolomb = function() {
    var clz = this.skipLeadingZeros(); // :uint
    return this.readBits(clz + 1) - 1;
  };

  // ():int
  this.readExpGolomb = function() {
    var valu = this.readUnsignedExpGolomb(); // :int
    if (0x01 & valu) {
      // the number is odd if the low order bit is set
      return (1 + valu) >>> 1; // add 1 to make it even, and divide by 2
    } else {
      return -1 * (valu >>> 1); // divide by two then make it negative
    }
  };

  // Some convenience functions
  // :Boolean
  this.readBoolean = function() {
    return 1 === this.readBits(1);
  };

  // ():int
  this.readUnsignedByte = function() {
    return this.readBits(8);
  };

  this.loadWord();

};
})(this);

(function() {
  var
    H264ExtraData,
    ExpGolomb = window.videojs.Hls.ExpGolomb,
    FlvTag = window.videojs.Hls.FlvTag;

  window.videojs.Hls.H264ExtraData = H264ExtraData = function() {
    this.sps = []; // :Array
    this.pps = []; // :Array
  };

  H264ExtraData.prototype.extraDataExists = function() { // :Boolean
    return this.sps.length > 0;
  };

  // (sizeOfScalingList:int, expGolomb:ExpGolomb):void
  H264ExtraData.prototype.scaling_list = function(sizeOfScalingList, expGolomb) {
    var
      lastScale = 8, // :int
      nextScale = 8, // :int
      j,
      delta_scale; // :int

    for (j = 0; j < sizeOfScalingList; ++j) {
      if (0 !== nextScale) {
        delta_scale = expGolomb.readExpGolomb();
        nextScale = (lastScale + delta_scale + 256) % 256;
        //useDefaultScalingMatrixFlag = ( j = = 0 && nextScale = = 0 )
      }

      lastScale = (nextScale === 0) ? lastScale : nextScale;
      // scalingList[ j ] = ( nextScale == 0 ) ? lastScale : nextScale;
      // lastScale = scalingList[ j ]
    }
  };

  /**
   * RBSP: raw bit-stream payload. The actual encoded video data.
   *
   * SPS: sequence parameter set. Part of the RBSP. Metadata to be applied
   * to a complete video sequence, like width and height.
   */
  H264ExtraData.prototype.getSps0Rbsp = function() { // :ByteArray
    var
      sps = this.sps[0],
      offset = 1,
      start = 1,
      written = 0,
      end = sps.byteLength - 2,
      result = new Uint8Array(sps.byteLength);

    // In order to prevent 0x0000 01 from being interpreted as a
    // NAL start code, occurences of that byte sequence in the
    // RBSP are escaped with an "emulation byte". That turns
    // sequences of 0x0000 01 into 0x0000 0301. When interpreting
    // a NAL payload, they must be filtered back out.
    while (offset < end) {
      if (sps[offset]     === 0x00 &&
          sps[offset + 1] === 0x00 &&
          sps[offset + 2] === 0x03) {
        result.set(sps.subarray(start, offset + 1), written);
        written += offset + 1 - start;
        start = offset + 3;
      }
      offset++;
    }
    result.set(sps.subarray(start), written);
    return result.subarray(0, written + (sps.byteLength - start));
  };

  // (pts:uint):FlvTag
  H264ExtraData.prototype.metaDataTag = function(pts) {
    var
      tag = new FlvTag(FlvTag.METADATA_TAG), // :FlvTag
      expGolomb, // :ExpGolomb
      profile_idc, // :int
      chroma_format_idc, // :int
      imax, // :int
      i, // :int

      pic_order_cnt_type, // :int
      num_ref_frames_in_pic_order_cnt_cycle, // :uint

      pic_width_in_mbs_minus1, // :int
      pic_height_in_map_units_minus1, // :int

      frame_mbs_only_flag, // :int
      frame_cropping_flag, // :Boolean

      frame_crop_left_offset = 0, // :int
      frame_crop_right_offset = 0, // :int
      frame_crop_top_offset = 0, // :int
      frame_crop_bottom_offset = 0, // :int

      width,
      height;

      tag.dts = pts;
      tag.pts = pts;
      expGolomb = new ExpGolomb(this.getSps0Rbsp());

    // :int = expGolomb.readUnsignedByte(); // profile_idc u(8)
    profile_idc = expGolomb.readUnsignedByte();

    // constraint_set[0-5]_flag, u(1), reserved_zero_2bits u(2), level_idc u(8)
    expGolomb.skipBits(16);

    // seq_parameter_set_id
    expGolomb.skipUnsignedExpGolomb();

    if (profile_idc === 100 ||
        profile_idc === 110 ||
        profile_idc === 122 ||
        profile_idc === 244 ||
        profile_idc === 44 ||
        profile_idc === 83 ||
        profile_idc === 86 ||
        profile_idc === 118 ||
        profile_idc === 128) {
      chroma_format_idc = expGolomb.readUnsignedExpGolomb();
      if (3 === chroma_format_idc) {
        expGolomb.skipBits(1); // separate_colour_plane_flag
      }
      expGolomb.skipUnsignedExpGolomb(); // bit_depth_luma_minus8
      expGolomb.skipUnsignedExpGolomb(); // bit_depth_chroma_minus8
      expGolomb.skipBits(1); // qpprime_y_zero_transform_bypass_flag
      if (expGolomb.readBoolean()) { // seq_scaling_matrix_present_flag
        imax = (chroma_format_idc !== 3) ? 8 : 12;
        for (i = 0 ; i < imax ; ++i) {
          if (expGolomb.readBoolean()) { // seq_scaling_list_present_flag[ i ]
            if (i < 6) {
              this.scaling_list(16, expGolomb);
            } else {
              this.scaling_list(64, expGolomb);
            }
          }
        }
      }
    }

    expGolomb.skipUnsignedExpGolomb(); // log2_max_frame_num_minus4
    pic_order_cnt_type = expGolomb.readUnsignedExpGolomb();

    if ( 0 === pic_order_cnt_type ) {
      expGolomb.readUnsignedExpGolomb(); //log2_max_pic_order_cnt_lsb_minus4
    } else if ( 1 === pic_order_cnt_type ) {
      expGolomb.skipBits(1); // delta_pic_order_always_zero_flag
      expGolomb.skipExpGolomb(); // offset_for_non_ref_pic
      expGolomb.skipExpGolomb(); // offset_for_top_to_bottom_field
      num_ref_frames_in_pic_order_cnt_cycle = expGolomb.readUnsignedExpGolomb();
      for(i = 0 ; i < num_ref_frames_in_pic_order_cnt_cycle ; ++i) {
        expGolomb.skipExpGolomb(); // offset_for_ref_frame[ i ]
      }
    }

    expGolomb.skipUnsignedExpGolomb(); // max_num_ref_frames
    expGolomb.skipBits(1); // gaps_in_frame_num_value_allowed_flag
    pic_width_in_mbs_minus1 = expGolomb.readUnsignedExpGolomb();
    pic_height_in_map_units_minus1 = expGolomb.readUnsignedExpGolomb();

    frame_mbs_only_flag = expGolomb.readBits(1);
    if (0 === frame_mbs_only_flag) {
      expGolomb.skipBits(1); // mb_adaptive_frame_field_flag
    }

    expGolomb.skipBits(1); // direct_8x8_inference_flag
    frame_cropping_flag = expGolomb.readBoolean();
    if (frame_cropping_flag) {
      frame_crop_left_offset = expGolomb.readUnsignedExpGolomb();
      frame_crop_right_offset = expGolomb.readUnsignedExpGolomb();
      frame_crop_top_offset = expGolomb.readUnsignedExpGolomb();
      frame_crop_bottom_offset = expGolomb.readUnsignedExpGolomb();
    }

    width = ((pic_width_in_mbs_minus1 + 1) * 16) - frame_crop_left_offset * 2 - frame_crop_right_offset * 2;
    height = ((2 - frame_mbs_only_flag) * (pic_height_in_map_units_minus1 + 1) * 16) - (frame_crop_top_offset * 2) - (frame_crop_bottom_offset * 2);

    tag.writeMetaDataDouble("videocodecid", 7);
    tag.writeMetaDataDouble("width", width);
    tag.writeMetaDataDouble("height", height);
    // tag.writeMetaDataDouble("videodatarate", 0 );
    // tag.writeMetaDataDouble("framerate", 0);

    return tag;
  };

  // (pts:uint):FlvTag
  H264ExtraData.prototype.extraDataTag = function(pts) {
    var
      i,
      tag = new FlvTag(FlvTag.VIDEO_TAG, true);

    tag.dts = pts;
    tag.pts = pts;

    tag.writeByte(0x01);// version
    tag.writeByte(this.sps[0][1]);// profile
    tag.writeByte(this.sps[0][2]);// compatibility
    tag.writeByte(this.sps[0][3]);// level
    tag.writeByte(0xFC | 0x03); // reserved (6 bits), NULA length size - 1 (2 bits)
    tag.writeByte(0xE0 | 0x01 ); // reserved (3 bits), num of SPS (5 bits)
    tag.writeShort( this.sps[0].length ); // data of SPS
    tag.writeBytes( this.sps[0] ); // SPS

    tag.writeByte( this.pps.length ); // num of PPS (will there ever be more that 1 PPS?)
    for (i = 0 ; i < this.pps.length ; ++i) {
      tag.writeShort(this.pps[i].length); // 2 bytes for length of PPS
      tag.writeBytes(this.pps[i]); // data of PPS
    }

    return tag;
  };
})();

(function(window) {
  var
    FlvTag = window.videojs.Hls.FlvTag,
    H264ExtraData = window.videojs.Hls.H264ExtraData,
    H264Stream,
    NALUnitType;

  /**
   * Network Abstraction Layer (NAL) units are the packets of an H264
   * stream. NAL units are divided into types based on their payload
   * data. Each type has a unique numeric identifier.
   *
   *              NAL unit
   * |- NAL header -|------ RBSP ------|
   *
   * NAL unit: Network abstraction layer unit. The combination of a NAL
   * header and an RBSP.
   * NAL header: the encapsulation unit for transport-specific metadata in
   * an h264 stream. Exactly one byte.
   */
  // incomplete, see Table 7.1 of ITU-T H.264 for 12-32
  window.videojs.Hls.NALUnitType = NALUnitType = {
    unspecified: 0,
    slice_layer_without_partitioning_rbsp_non_idr: 1,
    slice_data_partition_a_layer_rbsp: 2,
    slice_data_partition_b_layer_rbsp: 3,
    slice_data_partition_c_layer_rbsp: 4,
    slice_layer_without_partitioning_rbsp_idr: 5,
    sei_rbsp: 6,
    seq_parameter_set_rbsp: 7,
    pic_parameter_set_rbsp: 8,
    access_unit_delimiter_rbsp: 9,
    end_of_seq_rbsp: 10,
    end_of_stream_rbsp: 11
  };

  window.videojs.Hls.H264Stream = H264Stream = function() {
    this._next_pts = 0; // :uint;
    this._next_dts = 0; // :uint;

    this._h264Frame = null; // :FlvTag

    this._oldExtraData = new H264ExtraData(); // :H264ExtraData
    this._newExtraData = new H264ExtraData(); // :H264ExtraData

    this._nalUnitType = -1; // :int

    this._state = 0; // :uint;

    this.tags = [];
  };

  //(pts:uint):void
  H264Stream.prototype.setTimeStampOffset = function() {};

  //(pts:uint, dts:uint, dataAligned:Boolean):void
  H264Stream.prototype.setNextTimeStamp = function(pts, dts, dataAligned) {
    // We could end up with a DTS less than 0 here. We need to deal with that!
    this._next_pts = pts;
    this._next_dts = dts;

    // If data is aligned, flush all internal buffers
    if (dataAligned) {
      this.finishFrame();
    }
  };

  H264Stream.prototype.finishFrame = function() {
    if (this._h264Frame) {
      // Push SPS before EVERY IDR frame for seeking
      if (this._newExtraData.extraDataExists()) {
        this._oldExtraData = this._newExtraData;
        this._newExtraData = new H264ExtraData();
      }

      // Check if keyframe and the length of tags.
      // This makes sure we write metadata on the first frame of a segment.
      if (this._oldExtraData.extraDataExists() &&
          (this._h264Frame.keyFrame || this.tags.length === 0)) {
        // Push extra data on every IDR frame in case we did a stream change + seek
        this.tags.push(this._oldExtraData.metaDataTag(this._h264Frame.pts));
        this.tags.push(this._oldExtraData.extraDataTag(this._h264Frame.pts));
      }

      this._h264Frame.endNalUnit();
      this.tags.push(this._h264Frame);

    }

    this._h264Frame = null;
    this._nalUnitType = -1;
    this._state = 0;
  };

  // (data:ByteArray, o:int, l:int):void
  H264Stream.prototype.writeBytes = function(data, offset, length) {
    var
      nalUnitSize, // :uint
      start, // :uint
      end, // :uint
      t; // :int

    // default argument values
    offset = offset || 0;
    length = length || 0;

    if (length <= 0) {
      // data is empty so there's nothing to write
      return;
    }

    // scan through the bytes until we find the start code (0x000001) for a
    // NAL unit and then begin writing it out
    // strip NAL start codes as we go
    switch (this._state) {
    default:
      /* falls through */
    case 0:
      this._state = 1;
      /* falls through */
    case 1:
      // A NAL unit may be split across two TS packets. Look back a bit to
      // make sure the prefix of the start code wasn't already written out.
      if (data[offset] <= 1) {
        nalUnitSize = this._h264Frame ? this._h264Frame.nalUnitSize() : 0;
        if (nalUnitSize >= 1 && this._h264Frame.negIndex(1) === 0) {
          // ?? ?? 00 | O[01] ?? ??
          if (data[offset] === 1 &&
              nalUnitSize >= 2 &&
              this._h264Frame.negIndex(2) === 0) {
            // ?? 00 00 : 01
            if (3 <= nalUnitSize && 0 === this._h264Frame.negIndex(3)) {
              this._h264Frame.length -= 3; // 00 00 00 : 01
            } else {
              this._h264Frame.length -= 2; // 00 00 : 01
            }

            this._state = 3;
            return this.writeBytes(data, offset + 1, length - 1);
          }

          if (length > 1 && data[offset] === 0 && data[offset + 1] === 1) {
            // ?? 00 | 00 01
            if (nalUnitSize >= 2 && this._h264Frame.negIndex(2) === 0) {
              this._h264Frame.length -= 2; // 00 00 : 00 01
            } else {
              this._h264Frame.length -= 1; // 00 : 00 01
            }

            this._state = 3;
            return this.writeBytes(data, offset + 2, length - 2);
          }

          if (length > 2 &&
              data[offset] === 0 &&
              data[offset + 1] === 0 &&
              data[offset + 2] === 1) {
            // 00 : 00 00 01
            // this._h264Frame.length -= 1;
            this._state = 3;
            return this.writeBytes(data, offset + 3, length - 3);
          }
        }
      }
      // allow fall through if the above fails, we may end up checking a few
      // bytes a second time. But that case will be VERY rare
      this._state = 2;
      /* falls through */
    case 2:
      // Look for start codes in the data from the current offset forward
      start = offset;
      end = start + length;
      for (t = end - 3; offset < t;) {
        if (data[offset + 2] > 1) {
          // if data[offset + 2] is greater than 1, there is no way a start
          // code can begin before offset + 3
          offset += 3;
        } else if (data[offset + 1] !== 0) {
            offset += 2;
        } else if (data[offset] !== 0) {
            offset += 1;
        } else {
          // If we get here we have 00 00 00 or 00 00 01
          if (data[offset + 2] === 1) {
            if (offset > start) {
              this._h264Frame.writeBytes(data, start, offset - start);
            }
            this._state = 3;
            offset += 3;
            return this.writeBytes(data, offset, end - offset);
          }

          if (end - offset >= 4 &&
              data[offset + 2] === 0 &&
              data[offset + 3] === 1) {
            if (offset > start) {
              this._h264Frame.writeBytes(data, start, offset - start);
            }
            this._state = 3;
            offset += 4;
            return this.writeBytes(data, offset, end - offset);
          }

          // We are at the end of the buffer, or we have 3 NULLS followed by
          // something that is not a 1, either way we can step forward by at
          // least 3
          offset += 3;
        }
      }

      // We did not find any start codes. Try again next packet
      this._state = 1;
      if (this._h264Frame) {
        this._h264Frame.writeBytes(data, start, length);
      }
      return;
    case 3:
      // The next byte is the first byte of a NAL Unit

      if (this._h264Frame) {
        // we've come to a new NAL unit so finish up the one we've been
        // working on

        switch (this._nalUnitType) {
        case NALUnitType.seq_parameter_set_rbsp:
          this._h264Frame.endNalUnit(this._newExtraData.sps);
          break;
        case NALUnitType.pic_parameter_set_rbsp:
          this._h264Frame.endNalUnit(this._newExtraData.pps);
          break;
        case NALUnitType.slice_layer_without_partitioning_rbsp_idr:
          this._h264Frame.endNalUnit();
          break;
        default:
          this._h264Frame.endNalUnit();
          break;
        }
      }

      // setup to begin processing the new NAL unit
      this._nalUnitType = data[offset] & 0x1F;
      if (this._h264Frame) {
          if (this._nalUnitType === NALUnitType.access_unit_delimiter_rbsp) {
            // starting a new access unit, flush the previous one
            this.finishFrame();
          } else if (this._nalUnitType === NALUnitType.slice_layer_without_partitioning_rbsp_idr) {
            this._h264Frame.keyFrame = true;
          }
      }

      // finishFrame may render this._h264Frame null, so we must test again
      if (!this._h264Frame) {
        this._h264Frame = new FlvTag(FlvTag.VIDEO_TAG);
        this._h264Frame.pts = this._next_pts;
        this._h264Frame.dts = this._next_dts;
      }

      this._h264Frame.startNalUnit();
      // We know there will not be an overlapping start code, so we can skip
      // that test
      this._state = 2;
      return this.writeBytes(data, offset, length);
    } // switch
  };
})(this);

(function(window) {
var
  FlvTag = window.videojs.Hls.FlvTag,
  adtsSampleingRates = [
    96000, 88200,
    64000, 48000,
    44100, 32000,
    24000, 22050,
    16000, 12000
  ];

window.videojs.Hls.AacStream = function() {
  var
    next_pts, // :uint
    state, // :uint
    pes_length, // :int
    lastMetaPts,

    adtsProtectionAbsent, // :Boolean
    adtsObjectType, // :int
    adtsSampleingIndex, // :int
    adtsChanelConfig, // :int
    adtsFrameSize, // :int
    adtsSampleCount, // :int
    adtsDuration, // :int

    aacFrame, // :FlvTag = null;
    extraData; // :uint;

  this.tags = [];

  // (pts:uint):void
  this.setTimeStampOffset = function(pts) {

    // keep track of the last time a metadata tag was written out
    // set the initial value so metadata will be generated before any
    // payload data
    lastMetaPts = pts - 1000;
  };

  // (pts:uint, pes_size:int, dataAligned:Boolean):void
  this.setNextTimeStamp = function(pts, pes_size, dataAligned) {
    next_pts = pts;
    pes_length = pes_size;

    // If data is aligned, flush all internal buffers
    if (dataAligned) {
      state = 0;
    }
  };

  // (data:ByteArray, o:int = 0, l:int = 0):void
  this.writeBytes = function(data, offset, length) {
    var
      end, // :int
      newExtraData, // :uint
      bytesToCopy; // :int

    // default arguments
    offset = offset || 0;
    length = length || 0;

    // Do not allow more than 'pes_length' bytes to be written
    length = (pes_length < length ? pes_length : length);
    pes_length -= length;
    end = offset + length;
    while (offset < end) {
      switch (state) {
      default:
        state = 0;
        break;
      case 0:
        if (offset >= end) {
          return;
        }
        if (0xFF !== data[offset]) {
          console.assert(false, 'Error no ATDS header found');
          offset += 1;
          state = 0;
          return;
        }

        offset += 1;
        state = 1;
        break;
      case 1:
        if (offset >= end) {
          return;
        }
        if (0xF0 !== (data[offset] & 0xF0)) {
          console.assert(false, 'Error no ATDS header found');
          offset +=1;
          state = 0;
          return;
        }

        adtsProtectionAbsent = !!(data[offset] & 0x01);

        offset += 1;
        state = 2;
        break;
      case 2:
        if (offset >= end) {
          return;
        }
        adtsObjectType = ((data[offset] & 0xC0) >>> 6) + 1;
        adtsSampleingIndex = ((data[offset] & 0x3C) >>> 2);
        adtsChanelConfig = ((data[offset] & 0x01) << 2);

        offset += 1;
        state = 3;
        break;
      case 3:
        if (offset >= end) {
          return;
        }
        adtsChanelConfig |= ((data[offset] & 0xC0) >>> 6);
        adtsFrameSize = ((data[offset] & 0x03) << 11);

        offset += 1;
        state = 4;
        break;
      case 4:
        if (offset >= end) {
          return;
        }
        adtsFrameSize |= (data[offset] << 3);

        offset += 1;
        state = 5;
        break;
      case 5:
        if(offset >= end) {
          return;
        }
        adtsFrameSize |= ((data[offset] & 0xE0) >>> 5);
        adtsFrameSize -= (adtsProtectionAbsent ? 7 : 9);

        offset += 1;
        state = 6;
        break;
      case 6:
        if (offset >= end) {
          return;
        }
        adtsSampleCount = ((data[offset] & 0x03) + 1) * 1024;
        adtsDuration = (adtsSampleCount * 1000) / adtsSampleingRates[adtsSampleingIndex];

        newExtraData = (adtsObjectType << 11) |
                       (adtsSampleingIndex << 7) |
                       (adtsChanelConfig << 3);

        // write out metadata tags every 1 second so that the decoder
        // is re-initialized quickly after seeking into a different
        // audio configuration
        if (newExtraData !== extraData || next_pts - lastMetaPts >= 1000) {
          aacFrame = new FlvTag(FlvTag.METADATA_TAG);
          aacFrame.pts = next_pts;
          aacFrame.dts = next_pts;

          // AAC is always 10
          aacFrame.writeMetaDataDouble("audiocodecid", 10);
          aacFrame.writeMetaDataBoolean("stereo", 2 === adtsChanelConfig);
          aacFrame.writeMetaDataDouble ("audiosamplerate", adtsSampleingRates[adtsSampleingIndex]);
          // Is AAC always 16 bit?
          aacFrame.writeMetaDataDouble ("audiosamplesize", 16);

          this.tags.push(aacFrame);

          extraData = newExtraData;
          aacFrame = new FlvTag(FlvTag.AUDIO_TAG, true);
          // For audio, DTS is always the same as PTS. We want to set the DTS
          // however so we can compare with video DTS to determine approximate
          // packet order
          aacFrame.pts = next_pts;
          aacFrame.dts = aacFrame.pts;

          aacFrame.view.setUint16(aacFrame.position, newExtraData);
          aacFrame.position += 2;
          aacFrame.length = Math.max(aacFrame.length, aacFrame.position);

          this.tags.push(aacFrame);

          lastMetaPts = next_pts;
        }

        // Skip the checksum if there is one
        offset += 1;
        state = 7;
        break;
      case 7:
        if (!adtsProtectionAbsent) {
          if (2 > (end - offset)) {
            return;
          } else {
            offset += 2;
          }
        }

        aacFrame = new FlvTag(FlvTag.AUDIO_TAG);
        aacFrame.pts = next_pts;
        aacFrame.dts = next_pts;
        state = 8;
        break;
      case 8:
        while (adtsFrameSize) {
          if (offset >= end) {
            return;
          }
          bytesToCopy = (end - offset) < adtsFrameSize ? (end - offset) : adtsFrameSize;
          aacFrame.writeBytes(data, offset, bytesToCopy);
          offset += bytesToCopy;
          adtsFrameSize -= bytesToCopy;
        }

        this.tags.push(aacFrame);

        // finished with this frame
        state = 0;
        next_pts += adtsDuration;
      }
    }
  };
};

})(this);

(function(window, videojs, undefined) {
  'use strict';
  var
    // return a percent-encoded representation of the specified byte range
    // @see http://en.wikipedia.org/wiki/Percent-encoding
    percentEncode = function(bytes, start, end) {
      var i, result = '';
      for (i = start; i < end; i++) {
        result += '%' + ('00' + bytes[i].toString(16)).slice(-2);
      }
      return result;
    },
    // return the string representation of the specified byte range,
    // interpreted as UTf-8.
    parseUtf8 = function(bytes, start, end) {
      return window.decodeURIComponent(percentEncode(bytes, start, end));
    },
    // return the string representation of the specified byte range,
    // interpreted as ISO-8859-1.
    parseIso88591 = function(bytes, start, end) {
      return window.unescape(percentEncode(bytes, start, end));
    },
    tagParsers = {
      'TXXX': function(tag) {
        var i;
        if (tag.data[0] !== 3) {
          // ignore frames with unrecognized character encodings
          return;
        }

        for (i = 1; i < tag.data.length; i++) {
          if (tag.data[i] === 0) {
            // parse the text fields
            tag.description = parseUtf8(tag.data, 1, i);
            // do not include the null terminator in the tag value
            tag.value = parseUtf8(tag.data, i + 1, tag.data.length - 1);
            break;
          }
        }
      },
      'WXXX': function(tag) {
        var i;
        if (tag.data[0] !== 3) {
          // ignore frames with unrecognized character encodings
          return;
        }

        for (i = 1; i < tag.data.length; i++) {
          if (tag.data[i] === 0) {
            // parse the description and URL fields
            tag.description = parseUtf8(tag.data, 1, i);
            tag.url = parseUtf8(tag.data, i + 1, tag.data.length);
            break;
          }
        }
      },
      'PRIV': function(tag) {
        var i;

        for (i = 0; i < tag.data.length; i++) {
          if (tag.data[i] === 0) {
            // parse the description and URL fields
            tag.owner = parseIso88591(tag.data, 0, i);
            break;
          }
        }
        tag.privateData = tag.data.subarray(i + 1);
      }
    },
    MetadataStream;

  MetadataStream = function(options) {
    var
      settings = {
        debug: !!(options && options.debug),

        // the bytes of the program-level descriptor field in MP2T
        // see ISO/IEC 13818-1:2013 (E), section 2.6 "Program and
        // program element descriptors"
        descriptor: options && options.descriptor
      },
      // the total size in bytes of the ID3 tag being parsed
      tagSize = 0,
      // tag data that is not complete enough to be parsed
      buffer = [],
      // the total number of bytes currently in the buffer
      bufferSize = 0,
      i;

    MetadataStream.prototype.init.call(this);

    // calculate the text track in-band metadata track dispatch type
    // https://html.spec.whatwg.org/multipage/embedded-content.html#steps-to-expose-a-media-resource-specific-text-track
    this.dispatchType = videojs.Hls.SegmentParser.STREAM_TYPES.metadata.toString(16);
    if (settings.descriptor) {
      for (i = 0; i < settings.descriptor.length; i++) {
        this.dispatchType += ('00' + settings.descriptor[i].toString(16)).slice(-2);
      }
    }

    this.push = function(chunk) {
      var tag, frameStart, frameSize, frame, i;

      // ignore events that don't look like ID3 data
      if (buffer.length === 0 &&
          (chunk.data.length < 10 ||
           chunk.data[0] !== 'I'.charCodeAt(0) ||
           chunk.data[1] !== 'D'.charCodeAt(0) ||
           chunk.data[2] !== '3'.charCodeAt(0))) {
        if (settings.debug) {
          videojs.log('Skipping unrecognized metadata packet');
        }
        return;
      }

      // add this chunk to the data we've collected so far
      buffer.push(chunk);
      bufferSize += chunk.data.byteLength;

      // grab the size of the entire frame from the ID3 header
      if (buffer.length === 1) {
        // the frame size is transmitted as a 28-bit integer in the
        // last four bytes of the ID3 header.
        // The most significant bit of each byte is dropped and the
        // results concatenated to recover the actual value.
        tagSize = (chunk.data[6] << 21) |
                  (chunk.data[7] << 14) |
                  (chunk.data[8] << 7) |
                  (chunk.data[9]);

        // ID3 reports the tag size excluding the header but it's more
        // convenient for our comparisons to include it
        tagSize += 10;
      }

      // if the entire frame has not arrived, wait for more data
      if (bufferSize < tagSize) {
        return;
      }

      // collect the entire frame so it can be parsed
      tag = {
        data: new Uint8Array(tagSize),
        frames: [],
        pts: buffer[0].pts,
        dts: buffer[0].dts
      };
      for (i = 0; i < tagSize;) {
        tag.data.set(buffer[0].data, i);
        i += buffer[0].data.byteLength;
        bufferSize -= buffer[0].data.byteLength;
        buffer.shift();
      }

      // find the start of the first frame and the end of the tag
      frameStart = 10;
      if (tag.data[5] & 0x40) {
        // advance the frame start past the extended header
        frameStart += 4; // header size field
        frameStart += (tag.data[10] << 24) |
                      (tag.data[11] << 16) |
                      (tag.data[12] << 8)  |
                      (tag.data[13]);

        // clip any padding off the end
        tagSize -= (tag.data[16] << 24) |
                   (tag.data[17] << 16) |
                   (tag.data[18] << 8)  |
                   (tag.data[19]);
      }

      // parse one or more ID3 frames
      // http://id3.org/id3v2.3.0#ID3v2_frame_overview
      do {
        // determine the number of bytes in this frame
        frameSize = (tag.data[frameStart + 4] << 24) |
                    (tag.data[frameStart + 5] << 16) |
                    (tag.data[frameStart + 6] <<  8) |
                    (tag.data[frameStart + 7]);
        if (frameSize < 1) {
          return videojs.log('Malformed ID3 frame encountered. Skipping metadata parsing.');
        }

        frame = {
          id: String.fromCharCode(tag.data[frameStart],
                                  tag.data[frameStart + 1],
                                  tag.data[frameStart + 2],
                                  tag.data[frameStart + 3]),
          data: tag.data.subarray(frameStart + 10, frameStart + frameSize + 10)
        };
        if (tagParsers[frame.id]) {
          tagParsers[frame.id](frame);
        }
        tag.frames.push(frame);

        frameStart += 10; // advance past the frame header
        frameStart += frameSize; // advance past the frame body
      } while (frameStart < tagSize);
      this.trigger('data', tag);
    };
  };
  MetadataStream.prototype = new videojs.Hls.Stream();

  videojs.Hls.MetadataStream = MetadataStream;
})(window, window.videojs);

(function(window) {
  var
    videojs = window.videojs,
    FlvTag = videojs.Hls.FlvTag,
    H264Stream = videojs.Hls.H264Stream,
    AacStream = videojs.Hls.AacStream,
    MetadataStream = videojs.Hls.MetadataStream,
    MP2T_PACKET_LENGTH,
    STREAM_TYPES;

  /**
   * An object that incrementally transmuxes MPEG2 Trasport Stream
   * chunks into an FLV.
   */
  videojs.Hls.SegmentParser = function() {
    var
      self = this,
      parseTSPacket,
      streamBuffer = new Uint8Array(MP2T_PACKET_LENGTH),
      streamBufferByteCount = 0,
      h264Stream = new H264Stream(),
      aacStream = new AacStream();

    // expose the stream metadata
    self.stream = {
      // the mapping between transport stream programs and the PIDs
      // that form their elementary streams
      programMapTable: {}
    };

    // allow in-band metadata to be observed
    self.metadataStream = new MetadataStream();

    // For information on the FLV format, see
    // http://download.macromedia.com/f4v/video_file_format_spec_v10_1.pdf.
    // Technically, this function returns the header and a metadata FLV tag
    // if duration is greater than zero
    // duration in seconds
    // @return {object} the bytes of the FLV header as a Uint8Array
    self.getFlvHeader = function(duration, audio, video) { // :ByteArray {
      var
        headBytes = new Uint8Array(3 + 1 + 1 + 4),
        head = new DataView(headBytes.buffer),
        metadata,
        result,
        metadataLength;

      // default arguments
      duration = duration || 0;
      audio = audio === undefined? true : audio;
      video = video === undefined? true : video;

      // signature
      head.setUint8(0, 0x46); // 'F'
      head.setUint8(1, 0x4c); // 'L'
      head.setUint8(2, 0x56); // 'V'

      // version
      head.setUint8(3, 0x01);

      // flags
      head.setUint8(4, (audio ? 0x04 : 0x00) | (video ? 0x01 : 0x00));

      // data offset, should be 9 for FLV v1
      head.setUint32(5, headBytes.byteLength);

      // init the first FLV tag
      if (duration <= 0) {
        // no duration available so just write the first field of the first
        // FLV tag
        result = new Uint8Array(headBytes.byteLength + 4);
        result.set(headBytes);
        result.set([0, 0, 0, 0], headBytes.byteLength);
        return result;
      }

      // write out the duration metadata tag
      metadata = new FlvTag(FlvTag.METADATA_TAG);
      metadata.pts = metadata.dts = 0;
      metadata.writeMetaDataDouble("duration", duration);
      metadataLength = metadata.finalize().length;
      result = new Uint8Array(headBytes.byteLength + metadataLength);
      result.set(headBytes);
      result.set(head.byteLength, metadataLength);

      return result;
    };

    self.flushTags = function() {
      h264Stream.finishFrame();
    };

    /**
     * Returns whether a call to `getNextTag()` will be successful.
     * @return {boolean} whether there is at least one transmuxed FLV
     * tag ready
     */
    self.tagsAvailable = function() { // :int {
      return h264Stream.tags.length + aacStream.tags.length;
    };

    /**
     * Returns the next tag in decoder-timestamp (DTS) order.
     * @returns {object} the next tag to decoded.
     */
    self.getNextTag = function() {
      var tag;

      if (!h264Stream.tags.length) {
        // only audio tags remain
        tag = aacStream.tags.shift();
      } else if (!aacStream.tags.length) {
        // only video tags remain
        tag = h264Stream.tags.shift();
      } else if (aacStream.tags[0].dts < h264Stream.tags[0].dts) {
        // audio should be decoded next
        tag = aacStream.tags.shift();
      } else {
        // video should be decoded next
        tag = h264Stream.tags.shift();
      }

      return tag.finalize();
    };

    self.parseSegmentBinaryData = function(data) { // :ByteArray) {
      var
        dataPosition = 0,
        dataSlice;

      // To avoid an extra copy, we will stash overflow data, and only
      // reconstruct the first packet. The rest of the packets will be
      // parsed directly from data
      if (streamBufferByteCount > 0) {
        if (data.byteLength + streamBufferByteCount < MP2T_PACKET_LENGTH) {
          // the current data is less than a single m2ts packet, so stash it
          // until we receive more

          // ?? this seems to append streamBuffer onto data and then just give up. I'm not sure why that would be interesting.
          videojs.log('data.length + streamBuffer.length < MP2T_PACKET_LENGTH ??');
          streamBuffer.readBytes(data, data.length, streamBuffer.length);
          return;
        } else {
          // we have enough data for an m2ts packet
          // process it immediately
          dataSlice = data.subarray(0, MP2T_PACKET_LENGTH - streamBufferByteCount);
          streamBuffer.set(dataSlice, streamBufferByteCount);

          parseTSPacket(streamBuffer);

          // reset the buffer
          streamBuffer = new Uint8Array(MP2T_PACKET_LENGTH);
          streamBufferByteCount = 0;
        }
      }

      while (true) {
        // Make sure we are TS aligned
        while(dataPosition < data.byteLength  && data[dataPosition] !== 0x47) {
          // If there is no sync byte skip forward until we find one
          // TODO if we find a sync byte, look 188 bytes in the future (if
          // possible). If there is not a sync byte there, keep looking
          dataPosition++;
        }

        // base case: not enough data to parse a m2ts packet
        if (data.byteLength - dataPosition < MP2T_PACKET_LENGTH) {
          if (data.byteLength - dataPosition > 0) {
            // there are bytes remaining, save them for next time
            streamBuffer.set(data.subarray(dataPosition),
                             streamBufferByteCount);
            streamBufferByteCount += data.byteLength - dataPosition;
          }
          return;
        }

        // attempt to parse a m2ts packet
        if (parseTSPacket(data.subarray(dataPosition, dataPosition + MP2T_PACKET_LENGTH))) {
          dataPosition += MP2T_PACKET_LENGTH;
        } else {
          // If there was an error parsing a TS packet. it could be
          // because we are not TS packet aligned. Step one forward by
          // one byte and allow the code above to find the next
          videojs.log('error parsing m2ts packet, attempting to re-align');
          dataPosition++;
        }
      }
    };

    /**
     * Parses a video/mp2t packet and appends the underlying video and
     * audio data onto h264stream and aacStream, respectively.
     * @param data {Uint8Array} the bytes of an MPEG2-TS packet,
     * including the sync byte.
     * @return {boolean} whether a valid packet was encountered
     */
    // TODO add more testing to make sure we dont walk past the end of a TS
    // packet!
    parseTSPacket = function(data) { // :ByteArray):Boolean {
      var
        offset = 0, // :uint
        end = offset + MP2T_PACKET_LENGTH, // :uint

        // Payload Unit Start Indicator
        pusi = !!(data[offset + 1] & 0x40), // mask: 0100 0000

        // packet identifier (PID), a unique identifier for the elementary
        // stream this packet describes
        pid = (data[offset + 1] & 0x1F) << 8 | data[offset + 2], // mask: 0001 1111

        // adaptation_field_control, whether this header is followed by an
        // adaptation field, a payload, or both
        afflag = (data[offset + 3] & 0x30 ) >>> 4,

        patTableId, // :int
        patCurrentNextIndicator, // Boolean
        patSectionLength, // :uint
        programNumber, // :uint
        programPid, // :uint
        patEntriesEnd, // :uint

        pesPacketSize, // :int,
        dataAlignmentIndicator, // :Boolean,
        ptsDtsIndicator, // :int
        pesHeaderLength, // :int

        pts, // :uint
        dts, // :uint

        pmtCurrentNextIndicator, // :Boolean
        pmtProgramDescriptorsLength,
        pmtSectionLength, // :uint

        streamType, // :int
        elementaryPID, // :int
        ESInfolength; // :int

      // Continuity Counter we could use this for sanity check, and
      // corrupt stream detection
      // cc = (data[offset + 3] & 0x0F);

      // move past the header
      offset += 4;

      // if an adaption field is present, its length is specified by
      // the fifth byte of the PES header. The adaptation field is
      // used to specify some forms of timing and control data that we
      // do not currently use.
      if (afflag > 0x01) {
        offset += data[offset] + 1;
      }

      // Handle a Program Association Table (PAT). PATs map PIDs to
      // individual programs. If this transport stream was being used
      // for television broadcast, a program would probably be
      // equivalent to a channel. In HLS, it would be very unusual to
      // create an mp2t stream with multiple programs.
      if (0x0000 === pid) {
        // The PAT may be split into multiple sections and those
        // sections may be split into multiple packets. If a PAT
        // section starts in this packet, PUSI will be true and the
        // first byte of the playload will indicate the offset from
        // the current position to the start of the section.
        if (pusi) {
          offset += 1 + data[offset];
        }
        patTableId = data[offset];

        if (patTableId !== 0x00) {
          videojs.log('the table_id of the PAT should be 0x00 but was' +
                      patTableId.toString(16));
        }

        // the current_next_indicator specifies whether this PAT is
        // currently applicable or is part of the next table to become
        // active
        patCurrentNextIndicator = !!(data[offset + 5] & 0x01);
        if (patCurrentNextIndicator) {
          // section_length specifies the number of bytes following
          // its position to the end of this section
          // section_length = rest of header + (n * entry length) + CRC
          // = 5 + (n * 4) + 4
          patSectionLength =  (data[offset + 1] & 0x0F) << 8 | data[offset + 2];
          // move past the rest of the PSI header to the first program
          // map table entry
          offset += 8;

          // we don't handle streams with more than one program, so
          // raise an exception if we encounter one
          patEntriesEnd = offset + (patSectionLength - 5 - 4);
          for (; offset < patEntriesEnd; offset += 4) {
            programNumber = (data[offset] << 8 | data[offset + 1]);
            programPid = (data[offset + 2] & 0x1F) << 8 | data[offset + 3];
            // network PID program number equals 0
            // this is primarily an artifact of EBU DVB and can be ignored
            if (programNumber === 0) {
              self.stream.networkPid = programPid;
            } else if (self.stream.pmtPid === undefined) {
              // the Program Map Table (PMT) associates the underlying
              // video and audio streams with a unique PID
              self.stream.pmtPid = programPid;
            } else if (self.stream.pmtPid !== programPid) {
              throw new Error("TS has more that 1 program");
            }
          }
        }
      } else if (pid === self.stream.programMapTable[STREAM_TYPES.h264] ||
                 pid === self.stream.programMapTable[STREAM_TYPES.adts] ||
                 pid === self.stream.programMapTable[STREAM_TYPES.metadata]) {
        if (pusi) {
          // comment out for speed
          if (0x00 !== data[offset + 0] || 0x00 !== data[offset + 1] || 0x01 !== data[offset + 2]) {
            // look for PES start code
             throw new Error("PES did not begin with start code");
           }

          // var sid:int  = data[offset+3]; // StreamID
          pesPacketSize = (data[offset + 4] << 8) | data[offset + 5];
          dataAlignmentIndicator = (data[offset + 6] & 0x04) !== 0;
          ptsDtsIndicator = data[offset + 7];
          pesHeaderLength = data[offset + 8]; // TODO sanity check header length
          offset += 9; // Skip past PES header

          // PTS and DTS are normially stored as a 33 bit number.
          // JavaScript does not have a integer type larger than 32 bit
          // BUT, we need to convert from 90ns to 1ms time scale anyway.
          // so what we are going to do instead, is drop the least
          // significant bit (the same as dividing by two) then we can
          // divide by 45 (45 * 2 = 90) to get ms.
          if (ptsDtsIndicator & 0xC0) {
            // the PTS and DTS are not written out directly. For information on
            // how they are encoded, see
            // http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
            pts = (data[offset + 0] & 0x0E) << 28
              | (data[offset + 1] & 0xFF) << 21
              | (data[offset + 2] & 0xFE) << 13
              | (data[offset + 3] & 0xFF) <<  6
              | (data[offset + 4] & 0xFE) >>>  2;
            pts /= 45;
            dts = pts;
            if (ptsDtsIndicator & 0x40) {// DTS
              dts = (data[offset + 5] & 0x0E ) << 28
                | (data[offset + 6] & 0xFF ) << 21
                | (data[offset + 7] & 0xFE ) << 13
                | (data[offset + 8] & 0xFF ) << 6
                | (data[offset + 9] & 0xFE ) >>> 2;
              dts /= 45;
            }
          }

          // Skip past "optional" portion of PTS header
          offset += pesHeaderLength;

          if (pid === self.stream.programMapTable[STREAM_TYPES.h264]) {
            h264Stream.setNextTimeStamp(pts,
                                        dts,
                                        dataAlignmentIndicator);
          } else if (pid === self.stream.programMapTable[STREAM_TYPES.adts]) {
            aacStream.setNextTimeStamp(pts,
                                       pesPacketSize,
                                       dataAlignmentIndicator);
          }
        }

        if (pid === self.stream.programMapTable[STREAM_TYPES.adts]) {
          aacStream.writeBytes(data, offset, end - offset);
        } else if (pid === self.stream.programMapTable[STREAM_TYPES.h264]) {
          h264Stream.writeBytes(data, offset, end - offset);
        } else if (pid === self.stream.programMapTable[STREAM_TYPES.metadata]) {
          self.metadataStream.push({
            pts: pts,
            dts: dts,
            data: data.subarray(offset)
          });
        }
      } else if (self.stream.pmtPid === pid) {
        // similarly to the PAT, jump to the first byte of the section
        if (pusi) {
          offset += 1 + data[offset];
        }
        if (data[offset] !== 0x02) {
          videojs.log('The table_id of a PMT should be 0x02 but was ' +
                      data[offset].toString(16));
        }

        // whether this PMT is currently applicable or is part of the
        // next table to become active
        pmtCurrentNextIndicator = !!(data[offset + 5] & 0x01);
        if (pmtCurrentNextIndicator) {
          // overwrite any existing program map table
          self.stream.programMapTable = {};
          // section_length specifies the number of bytes following
          // its position to the end of this section
          pmtSectionLength  = (data[offset + 1] & 0x0f) << 8 | data[offset + 2];
          // subtract the length of the program info descriptors
          pmtProgramDescriptorsLength = (data[offset + 10] & 0x0f) << 8 | data[offset + 11];
          pmtSectionLength -= pmtProgramDescriptorsLength;
          // skip CRC and PSI data we dont care about
          // rest of header + CRC = 9 + 4
          pmtSectionLength -= 13;

          // capture the PID of PCR packets so we can ignore them if we see any
          self.stream.programMapTable.pcrPid = (data[offset + 8] & 0x1f) << 8 | data[offset + 9];

          // align offset to the first entry in the PMT
          offset += 12 + pmtProgramDescriptorsLength;

          // iterate through the entries
          while (0 < pmtSectionLength) {
            // the type of data carried in the PID this entry describes
            streamType = data[offset + 0];
            // the PID for this entry
            elementaryPID = (data[offset + 1] & 0x1F) << 8 | data[offset + 2];

            if (streamType === STREAM_TYPES.h264 &&
                self.stream.programMapTable[streamType] &&
                self.stream.programMapTable[streamType] !== elementaryPID) {
              throw new Error("Program has more than 1 video stream");
            } else if (streamType === STREAM_TYPES.adts &&
                       self.stream.programMapTable[streamType] &&
                       self.stream.programMapTable[streamType] !== elementaryPID) {
              throw new Error("Program has more than 1 audio Stream");
            }
            // add the stream type entry to the map
            self.stream.programMapTable[streamType] = elementaryPID;

            // TODO add support for MP3 audio

            // the length of the entry descriptor
            ESInfolength = (data[offset + 3] & 0x0F) << 8 | data[offset + 4];
            // capture the stream descriptor for metadata streams
            if (streamType === STREAM_TYPES.metadata) {
              self.metadataStream.descriptor = new Uint8Array(data.subarray(offset + 5, offset + 5 + ESInfolength));
            }
            // move to the first byte after the end of this entry
            offset += 5 + ESInfolength;
            pmtSectionLength -=  5 + ESInfolength;
          }
        }
        // We could test the CRC here to detect corruption with extra CPU cost
      } else if (self.stream.networkPid === pid) {
        // network information specific data (NIT) packet
      } else if (0x0011 === pid) {
        // Service Description Table
      } else if (0x1FFF === pid) {
        // NULL packet
      } else if (self.stream.programMapTable.pcrPid) {
        // program clock reference (PCR) PID for the primary program
        // PTS values are sufficient to synchronize playback for us so
        // we can safely ignore these
      } else {
        videojs.log("Unknown PID parsing TS packet: " + pid);
      }

      return true;
    };

    self.getTags = function() {
      return h264Stream.tags;
    };

    self.stats = {
      h264Tags: function() {
        return h264Stream.tags.length;
      },
      minVideoPts: function() {
        return h264Stream.tags[0].pts;
      },
      maxVideoPts: function() {
        return h264Stream.tags[h264Stream.tags.length - 1].pts;
      },
      aacTags: function() {
        return aacStream.tags.length;
      },
      minAudioPts: function() {
        return aacStream.tags[0].pts;
      },
      maxAudioPts: function() {
        return aacStream.tags[aacStream.tags.length - 1].pts;
      }
    };
  };

  // MPEG2-TS constants
  videojs.Hls.SegmentParser.MP2T_PACKET_LENGTH = MP2T_PACKET_LENGTH = 188;
  videojs.Hls.SegmentParser.STREAM_TYPES = STREAM_TYPES = {
    h264: 0x1b,
    adts: 0x0f,
    metadata: 0x15
  };

})(window);

(function(videojs, parseInt, isFinite, mergeOptions, undefined) {
  var
    noop = function() {},

    // "forgiving" attribute list psuedo-grammar:
    // attributes -> keyvalue (',' keyvalue)*
    // keyvalue   -> key '=' value
    // key        -> [^=]*
    // value      -> '"' [^"]* '"' | [^,]*
    attributeSeparator = (function() {
      var
        key = '[^=]*',
        value = '"[^"]*"|[^,]*',
        keyvalue = '(?:' + key + ')=(?:' + value + ')';

      return new RegExp('(?:^|,)(' + keyvalue + ')');
    })(),
    parseAttributes = function(attributes) {
      var
        // split the string using attributes as the separator
        attrs = attributes.split(attributeSeparator),
        i = attrs.length,
        result = {},
        attr;

      while (i--) {
        // filter out unmatched portions of the string
        if (attrs[i] === '') {
          continue;
        }

        // split the key and value
        attr = /([^=]*)=(.*)/.exec(attrs[i]).slice(1);
        // trim whitespace and remove optional quotes around the value
        attr[0] = attr[0].replace(/^\s+|\s+$/g, '');
        attr[1] = attr[1].replace(/^\s+|\s+$/g, '');
        attr[1] = attr[1].replace(/^['"](.*)['"]$/g, '$1');
        result[attr[0]] = attr[1];
      }
      return result;
    },
    Stream = videojs.Hls.Stream,
    LineStream,
    ParseStream,
    Parser;

  /**
   * A stream that buffers string input and generates a `data` event for each
   * line.
   */
  LineStream = function() {
    var buffer = '';
    LineStream.prototype.init.call(this);

    /**
     * Add new data to be parsed.
     * @param data {string} the text to process
     */
    this.push = function(data) {
      var nextNewline;

      buffer += data;
      nextNewline = buffer.indexOf('\n');

      for (; nextNewline > -1; nextNewline = buffer.indexOf('\n')) {
        this.trigger('data', buffer.substring(0, nextNewline));
        buffer = buffer.substring(nextNewline + 1);
      }
    };
  };
  LineStream.prototype = new Stream();

  /**
   * A line-level M3U8 parser event stream. It expects to receive input one
   * line at a time and performs a context-free parse of its contents. A stream
   * interpretation of a manifest can be useful if the manifest is expected to
   * be too large to fit comfortably into memory or the entirety of the input
   * is not immediately available. Otherwise, it's probably much easier to work
   * with a regular `Parser` object.
   *
   * Produces `data` events with an object that captures the parser's
   * interpretation of the input. That object has a property `tag` that is one
   * of `uri`, `comment`, or `tag`. URIs only have a single additional
   * property, `line`, which captures the entirety of the input without
   * interpretation. Comments similarly have a single additional property
   * `text` which is the input without the leading `#`.
   *
   * Tags always have a property `tagType` which is the lower-cased version of
   * the M3U8 directive without the `#EXT` or `#EXT-X-` prefix. For instance,
   * `#EXT-X-MEDIA-SEQUENCE` becomes `media-sequence` when parsed. Unrecognized
   * tags are given the tag type `unknown` and a single additional property
   * `data` with the remainder of the input.
   */
  ParseStream = function() {
    ParseStream.prototype.init.call(this);
  };
  ParseStream.prototype = new Stream();
  /**
   * Parses an additional line of input.
   * @param line {string} a single line of an M3U8 file to parse
   */
  ParseStream.prototype.push = function(line) {
    var match, event;

    //strip whitespace
    line = line.replace(/^\s+|\s+$/g, '');
    if (line.length === 0) {
      // ignore empty lines
      return;
    }

    // URIs
    if (line[0] !== '#') {
      this.trigger('data', {
        type: 'uri',
        uri: line
      });
      return;
    }

    // Comments
    if (line.indexOf('#EXT') !== 0) {
      this.trigger('data', {
        type: 'comment',
        text: line.slice(1)
      });
      return;
    }

    //strip off any carriage returns here so the regex matching
    //doesn't have to account for them.
    line = line.replace('\r','');

    // Tags
    match = /^#EXTM3U/.exec(line);
    if (match) {
      this.trigger('data', {
        type: 'tag',
        tagType: 'm3u'
      });
      return;
    }
    match = (/^#EXTINF:?([0-9\.]*)?,?(.*)?$/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'inf'
      };
      if (match[1]) {
        event.duration = parseFloat(match[1]);
      }
      if (match[2]) {
        event.title = match[2];
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-TARGETDURATION:?([0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'targetduration'
      };
      if (match[1]) {
        event.duration = parseInt(match[1], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#ZEN-TOTAL-DURATION:?([0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'totalduration'
      };
      if (match[1]) {
        event.duration = parseInt(match[1], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-VERSION:?([0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'version'
      };
      if (match[1]) {
        event.version = parseInt(match[1], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-MEDIA-SEQUENCE:?(\-?[0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'media-sequence'
      };
      if (match[1]) {
        event.number = parseInt(match[1], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-DISCONTINUITY-SEQUENCE:?(\-?[0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'discontinuity-sequence'
      };
      if (match[1]) {
        event.number = parseInt(match[1], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-PLAYLIST-TYPE:?(.*)?$/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'playlist-type'
      };
      if (match[1]) {
        event.playlistType = match[1];
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-BYTERANGE:?([0-9.]*)?@?([0-9.]*)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'byterange'
      };
      if (match[1]) {
        event.length = parseInt(match[1], 10);
      }
      if (match[2]) {
        event.offset = parseInt(match[2], 10);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-ALLOW-CACHE:?(YES|NO)?/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'allow-cache'
      };
      if (match[1]) {
        event.allowed = !(/NO/).test(match[1]);
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-STREAM-INF:?(.*)$/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'stream-inf'
      };
      if (match[1]) {
        event.attributes = parseAttributes(match[1]);

        if (event.attributes.RESOLUTION) {
          (function() {
            var
              split = event.attributes.RESOLUTION.split('x'),
              resolution = {};
            if (split[0]) {
              resolution.width = parseInt(split[0], 10);
            }
            if (split[1]) {
              resolution.height = parseInt(split[1], 10);
            }
            event.attributes.RESOLUTION = resolution;
          })();
        }
        if (event.attributes.BANDWIDTH) {
          event.attributes.BANDWIDTH = parseInt(event.attributes.BANDWIDTH, 10);
        }
        if (event.attributes['PROGRAM-ID']) {
          event.attributes['PROGRAM-ID'] = parseInt(event.attributes['PROGRAM-ID'], 10);
        }
      }
      this.trigger('data', event);
      return;
    }
    match = (/^#EXT-X-ENDLIST/).exec(line);
    if (match) {
      this.trigger('data', {
        type: 'tag',
        tagType: 'endlist'
      });
      return;
    }
    match = (/^#EXT-X-DISCONTINUITY/).exec(line);
    if (match) {
      this.trigger('data', {
        type: 'tag',
        tagType: 'discontinuity'
      });
      return;
    }
    match = (/^#EXT-X-KEY:?(.*)$/).exec(line);
    if (match) {
      event = {
        type: 'tag',
        tagType: 'key'
      };
      if (match[1]) {
        event.attributes = parseAttributes(match[1]);
        // parse the IV string into a Uint32Array
        if (event.attributes.IV) {
          if (event.attributes.IV.substring(0,2) === '0x') {
            event.attributes.IV = event.attributes.IV.substring(2);
          }

          event.attributes.IV = event.attributes.IV.match(/.{8}/g);
          event.attributes.IV[0] = parseInt(event.attributes.IV[0], 16);
          event.attributes.IV[1] = parseInt(event.attributes.IV[1], 16);
          event.attributes.IV[2] = parseInt(event.attributes.IV[2], 16);
          event.attributes.IV[3] = parseInt(event.attributes.IV[3], 16);
          event.attributes.IV = new Uint32Array(event.attributes.IV);
        }
      }
      this.trigger('data', event);
      return;
    }

    // unknown tag type
    this.trigger('data', {
      type: 'tag',
      data: line.slice(4, line.length)
    });
  };

  /**
   * A parser for M3U8 files. The current interpretation of the input is
   * exposed as a property `manifest` on parser objects. It's just two lines to
   * create and parse a manifest once you have the contents available as a string:
   *
   * ```js
   * var parser = new videojs.m3u8.Parser();
   * parser.push(xhr.responseText);
   * ```
   *
   * New input can later be applied to update the manifest object by calling
   * `push` again.
   *
   * The parser attempts to create a usable manifest object even if the
   * underlying input is somewhat nonsensical. It emits `info` and `warning`
   * events during the parse if it encounters input that seems invalid or
   * requires some property of the manifest object to be defaulted.
   */
  Parser = function() {
    var
      self = this,
      uris = [],
      currentUri = {},
      key;
    Parser.prototype.init.call(this);

    this.lineStream = new LineStream();
    this.parseStream = new ParseStream();
    this.lineStream.pipe(this.parseStream);

    // the manifest is empty until the parse stream begins delivering data
    this.manifest = {
      allowCache: true,
      discontinuityStarts: []
    };

    // update the manifest with the m3u8 entry from the parse stream
    this.parseStream.on('data', function(entry) {
      ({
        tag: function() {
          // switch based on the tag type
          (({
            'allow-cache': function() {
              this.manifest.allowCache = entry.allowed;
              if (!('allowed' in entry)) {
                this.trigger('info', {
                  message: 'defaulting allowCache to YES'
                });
                this.manifest.allowCache = true;
              }
            },
            'byterange': function() {
              var byterange = {};
              if ('length' in entry) {
                currentUri.byterange = byterange;
                byterange.length = entry.length;

                if (!('offset' in entry)) {
                  this.trigger('info', {
                    message: 'defaulting offset to zero'
                  });
                  entry.offset = 0;
                }
              }
              if ('offset' in entry) {
                currentUri.byterange = byterange;
                byterange.offset = entry.offset;
              }
            },
            'endlist': function() {
              this.manifest.endList = true;
            },
            'inf': function() {
              if (!('mediaSequence' in this.manifest)) {
                this.manifest.mediaSequence = 0;
                this.trigger('info', {
                  message: 'defaulting media sequence to zero'
                });
              }
              if (!('discontinuitySequence' in this.manifest)) {
                this.manifest.discontinuitySequence = 0;
                this.trigger('info', {
                  message: 'defaulting discontinuity sequence to zero'
                });
              }
              if (entry.duration >= 0) {
                currentUri.duration = entry.duration;
              }

              this.manifest.segments = uris;

            },
            'key': function() {
              if (!entry.attributes) {
                this.trigger('warn', {
                  message: 'ignoring key declaration without attribute list'
                });
                return;
              }
              // clear the active encryption key
              if (entry.attributes.METHOD === 'NONE') {
                key = null;
                return;
              }
              if (!entry.attributes.URI) {
                this.trigger('warn', {
                  message: 'ignoring key declaration without URI'
                });
                return;
              }
              if (!entry.attributes.METHOD) {
                this.trigger('warn', {
                  message: 'defaulting key method to AES-128'
                });
              }

              // setup an encryption key for upcoming segments
              key = {
                method: entry.attributes.METHOD || 'AES-128',
                uri: entry.attributes.URI
              };

              if (entry.attributes.IV !== undefined) {
                key.iv = entry.attributes.IV;
              }
            },
            'media-sequence': function() {
              if (!isFinite(entry.number)) {
                this.trigger('warn', {
                  message: 'ignoring invalid media sequence: ' + entry.number
                });
                return;
              }
              this.manifest.mediaSequence = entry.number;
            },
            'discontinuity-sequence': function() {
              if (!isFinite(entry.number)) {
                this.trigger('warn', {
                  message: 'ignoring invalid discontinuity sequence: ' + entry.number
                });
                return;
              }
              this.manifest.discontinuitySequence = entry.number;
            },
            'playlist-type': function() {
              if (!(/VOD|EVENT/).test(entry.playlistType)) {
                this.trigger('warn', {
                  message: 'ignoring unknown playlist type: ' + entry.playlist
                });
                return;
              }
              this.manifest.playlistType = entry.playlistType;
            },
            'stream-inf': function() {
              this.manifest.playlists = uris;

              if (!entry.attributes) {
                this.trigger('warn', {
                  message: 'ignoring empty stream-inf attributes'
                });
                return;
              }

              if (!currentUri.attributes) {
                currentUri.attributes = {};
              }
              currentUri.attributes = mergeOptions(currentUri.attributes,
                                                   entry.attributes);
            },
            'discontinuity': function() {
              currentUri.discontinuity = true;
              this.manifest.discontinuityStarts.push(uris.length);
            },
            'targetduration': function() {
              if (!isFinite(entry.duration) || entry.duration < 0) {
                this.trigger('warn', {
                  message: 'ignoring invalid target duration: ' + entry.duration
                });
                return;
              }
              this.manifest.targetDuration = entry.duration;
            },
            'totalduration': function() {
              if (!isFinite(entry.duration) || entry.duration < 0) {
                this.trigger('warn', {
                  message: 'ignoring invalid total duration: ' + entry.duration
                });
                return;
              }
              this.manifest.totalDuration = entry.duration;
            }
          })[entry.tagType] || noop).call(self);
        },
        uri: function() {
          currentUri.uri = entry.uri;
          uris.push(currentUri);

          // if no explicit duration was declared, use the target duration
          if (this.manifest.targetDuration &&
              !('duration' in currentUri)) {
            this.trigger('warn', {
              message: 'defaulting segment duration to the target duration'
            });
            currentUri.duration = this.manifest.targetDuration;
          }
          // annotate with encryption information, if necessary
          if (key) {
            currentUri.key = key;
          }

          // prepare for the next URI
          currentUri = {};
        },
        comment: function() {
          // comments are not important for playback
        }
      })[entry.type].call(self);
    });
  };
  Parser.prototype = new Stream();
  /**
   * Parse the input string and update the manifest object.
   * @param chunk {string} a potentially incomplete portion of the manifest
   */
  Parser.prototype.push = function(chunk) {
    this.lineStream.push(chunk);
  };
  /**
   * Flush any remaining input. This can be handy if the last line of an M3U8
   * manifest did not contain a trailing newline but the file has been
   * completely received.
   */
  Parser.prototype.end = function() {
    // flush any buffered input
    this.lineStream.push('\n');
  };

  window.videojs.m3u8 = {
    LineStream: LineStream,
    ParseStream: ParseStream,
    Parser: Parser
  };
})(window.videojs, window.parseInt, window.isFinite, window.videojs.util.mergeOptions);

(function(videojs){
  /**
   * Creates and sends an XMLHttpRequest.
   * TODO - expose video.js core's XHR and use that instead
   *
   * @param options {string | object} if this argument is a string, it
   * is intrepreted as a URL and a simple GET request is
   * inititated. If it is an object, it should contain a `url`
   * property that indicates the URL to request and optionally a
   * `method` which is the type of HTTP request to send.
   * @param callback (optional) {function} a function to call when the
   * request completes. If the request was not successful, the first
   * argument will be falsey.
   * @return {object} the XMLHttpRequest that was initiated.
   */
   videojs.Hls.xhr = function(url, callback) {
    var
      options = {
        method: 'GET',
        timeout: 45 * 1000
      },
      request,
      abortTimeout;

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    if (typeof url === 'object') {
      options = videojs.util.mergeOptions(options, url);
      url = options.url;
    }

    request = new window.XMLHttpRequest();
    request.open(options.method, url);
    request.url = url;
    request.requestTime = new Date().getTime();

    if (options.responseType) {
      request.responseType = options.responseType;
    }
    if (options.withCredentials) {
      request.withCredentials = true;
    }
    if (options.timeout) {
      abortTimeout = window.setTimeout(function() {
        if (request.readyState !== 4) {
          request.timedout = true;
          request.abort();
        }
      }, options.timeout);
    }

    request.onreadystatechange = function() {
      // wait until the request completes
      if (this.readyState !== 4) {
        return;
      }

      // clear outstanding timeouts
      window.clearTimeout(abortTimeout);

      // request timeout
      if (request.timedout) {
        return callback.call(this, 'timeout', url);
      }

      // request aborted or errored
      if (this.status >= 400 || this.status === 0) {
        return callback.call(this, true, url);
      }

      if (this.response) {
        this.responseTime = new Date().getTime();
        this.roundTripTime = this.responseTime - this.requestTime;
        this.bytesReceived = this.response.byteLength || this.response.length;
        this.bandwidth = Math.floor((this.bytesReceived / this.roundTripTime) * 8 * 1000);
      }

      return callback.call(this, false, url);
    };
    request.send(null);
    return request;
  };

})(window.videojs);

(function(window, videojs) {
  'use strict';

  var DEFAULT_TARGET_DURATION = 10;
  var accumulateDuration, ascendingNumeric, duration, intervalDuration, optionalMin, optionalMax, rangeDuration, seekable;

  // Math.min that will return the alternative input if one of its
  // parameters in undefined
  optionalMin = function(left, right) {
    left = isFinite(left) ? left : Infinity;
    right = isFinite(right) ? right : Infinity;
    return Math.min(left, right);
  };

  // Math.max that will return the alternative input if one of its
  // parameters in undefined
  optionalMax = function(left, right) {
    left = isFinite(left) ? left: -Infinity;
    right = isFinite(right) ? right: -Infinity;
    return Math.max(left, right);
  };

  // Array.sort comparator to sort numbers in ascending order
  ascendingNumeric = function(left, right) {
    return left - right;
  };

  /**
   * Returns the media duration for the segments between a start and
   * exclusive end index. The start and end parameters are interpreted
   * as indices into the currently available segments. This method
   * does not calculate durations for segments that have expired.
   * @param playlist {object} a media playlist object
   * @param start {number} an inclusive lower boundary for the
   * segments to examine.
   * @param end {number} an exclusive upper boundary for the segments
   * to examine.
   * @param includeTrailingTime {boolean} if false, the interval between
   * the final segment and the subsequent segment will not be included
   * in the result
   * @return {number} the duration between the start index and end
   * index in seconds.
   */
  accumulateDuration = function(playlist, start, end, includeTrailingTime) {
    var
      ranges = [],
      rangeEnds = (playlist.discontinuityStarts || []).concat(end),
      result = 0,
      i;

    // short circuit if start and end don't specify a non-empty range
    // of segments
    if (start >= end) {
      return 0;
    }

    // create a range object for each discontinuity sequence
    rangeEnds.sort(ascendingNumeric);
    for (i = 0; i < rangeEnds.length; i++) {
      if (rangeEnds[i] > start) {
        ranges.push({ start: start, end: rangeEnds[i] });
        i++;
        break;
      }
    }
    for (; i < rangeEnds.length; i++) {
      // ignore times ranges later than end
      if (rangeEnds[i] >= end) {
        ranges.push({ start: rangeEnds[i - 1], end: end });
        break;
      }
      ranges.push({ start: ranges[ranges.length - 1].end, end: rangeEnds[i] });
    }

    // add up the durations for each of the ranges
    for (i = 0; i < ranges.length; i++) {
      result += rangeDuration(playlist,
                              ranges[i],
                              i === ranges.length - 1 && includeTrailingTime);
    }

    return result;
  };

  /**
   * Returns the duration of the specified range of segments. The
   * range *must not* cross a discontinuity.
   * @param playlist {object} a media playlist object
   * @param range {object} an object that specifies a starting and
   * ending index into the available segments.
   * @param includeTrailingTime {boolean} if false, the interval between
   * the final segment and the subsequent segment will not be included
   * in the result
   * @return {number} the duration of the range in seconds.
   */
  rangeDuration = function(playlist, range, includeTrailingTime) {
    var
      result = 0,
      targetDuration = playlist.targetDuration || DEFAULT_TARGET_DURATION,
      segment,
      left, right;

    // accumulate while searching for the earliest segment with
    // available PTS information
    for (left = range.start; left < range.end; left++) {
      segment = playlist.segments[left];
      if (segment.minVideoPts !== undefined ||
          segment.minAudioPts !== undefined) {
        break;
      }
      result += segment.duration || targetDuration;
    }

    // see if there's enough information to include the trailing time
    if (includeTrailingTime) {
      segment = playlist.segments[range.end];
      if (segment &&
          (segment.minVideoPts !== undefined ||
           segment.minAudioPts !== undefined)) {
        result += 0.001 *
          (optionalMin(segment.minVideoPts, segment.minAudioPts) -
           optionalMin(playlist.segments[left].minVideoPts,
                    playlist.segments[left].minAudioPts));
        return result;
      }
    }

    // do the same thing while finding the latest segment
    for (right = range.end - 1; right >= left; right--) {
      segment = playlist.segments[right];
      if (segment.maxVideoPts !== undefined ||
          segment.maxAudioPts !== undefined) {
        break;
      }
      result += segment.duration || targetDuration;
    }

    // add in the PTS interval in seconds between them
    if (right >= left) {
      result += 0.001 *
        (optionalMax(playlist.segments[right].maxVideoPts,
                  playlist.segments[right].maxAudioPts) -
         optionalMin(playlist.segments[left].minVideoPts,
                  playlist.segments[left].minAudioPts));
    }

    return result;
  };

  /**
   * Calculate the media duration from the segments associated with a
   * playlist. The duration of a subinterval of the available segments
   * may be calculated by specifying a start and end index.
   *
   * @param playlist {object} a media playlist object
   * @param startSequence {number} (optional) an inclusive lower
   * boundary for the playlist.  Defaults to 0.
   * @param endSequence {number} (optional) an exclusive upper boundary
   * for the playlist.  Defaults to playlist length.
   * @param includeTrailingTime {boolean} if false, the interval between
   * the final segment and the subsequent segment will not be included
   * in the result
   * @return {number} the duration between the start index and end
   * index.
   */
  intervalDuration = function(playlist, startSequence, endSequence, includeTrailingTime) {
    var result = 0, targetDuration, expiredSegmentCount;

    if (startSequence === undefined) {
      startSequence = playlist.mediaSequence || 0;
    }
    if (endSequence === undefined) {
      endSequence = startSequence + (playlist.segments || []).length;
    }
    targetDuration = playlist.targetDuration || DEFAULT_TARGET_DURATION;

    // estimate expired segment duration using the target duration
    expiredSegmentCount = optionalMax(playlist.mediaSequence - startSequence, 0);
    result += expiredSegmentCount * targetDuration;

    // accumulate the segment durations into the result
    result += accumulateDuration(playlist,
                                 startSequence + expiredSegmentCount - playlist.mediaSequence,
                                 endSequence - playlist.mediaSequence,
                                 includeTrailingTime);

    return result;
  };

  /**
   * Calculates the duration of a playlist. If a start and end index
   * are specified, the duration will be for the subset of the media
   * timeline between those two indices. The total duration for live
   * playlists is always Infinity.
   * @param playlist {object} a media playlist object
   * @param startSequence {number} (optional) an inclusive lower
   * boundary for the playlist.  Defaults to 0.
   * @param endSequence {number} (optional) an exclusive upper boundary
   * for the playlist.  Defaults to playlist length.
   * @param includeTrailingTime {boolean} (optional) if false, the interval between
   * the final segment and the subsequent segment will not be included
   * in the result
   * @return {number} the duration between the start index and end
   * index.
   */
  duration = function(playlist, startSequence, endSequence, includeTrailingTime) {
    if (!playlist) {
      return 0;
    }

    if (includeTrailingTime === undefined) {
      includeTrailingTime = true;
    }

    // if a slice of the total duration is not requested, use
    // playlist-level duration indicators when they're present
    if (startSequence === undefined && endSequence === undefined) {
      // if present, use the duration specified in the playlist
      if (playlist.totalDuration) {
        return playlist.totalDuration;
      }

      // duration should be Infinity for live playlists
      if (!playlist.endList) {
        return window.Infinity;
      }
    }

    // calculate the total duration based on the segment durations
    return intervalDuration(playlist,
                            startSequence,
                            endSequence,
                            includeTrailingTime);
  };

  /**
   * Calculates the interval of time that is currently seekable in a
   * playlist. The returned time ranges are relative to the earliest
   * moment in the specified playlist that is still available. A full
   * seekable implementation for live streams would need to offset
   * these values by the duration of content that has expired from the
   * stream.
   * @param playlist {object} a media playlist object
   * @return {TimeRanges} the periods of time that are valid targets
   * for seeking
   */
  seekable = function(playlist) {
    var start, end, liveBuffer, targetDuration, segment, pending, i;

    // without segments, there are no seekable ranges
    if (!playlist.segments) {
      return videojs.createTimeRange();
    }
    // when the playlist is complete, the entire duration is seekable
    if (playlist.endList) {
      return videojs.createTimeRange(0, duration(playlist));
    }

    start = 0;
    end = intervalDuration(playlist,
                           playlist.mediaSequence,
                           playlist.mediaSequence + playlist.segments.length);
    targetDuration = playlist.targetDuration || DEFAULT_TARGET_DURATION;

    // live playlists should not expose three segment durations worth
    // of content from the end of the playlist
    // https://tools.ietf.org/html/draft-pantos-http-live-streaming-16#section-6.3.3
    if (!playlist.endList) {
      liveBuffer = targetDuration * 3;
      // walk backward from the last available segment and track how
      // much media time has elapsed until three target durations have
      // been traversed. if a segment is part of the interval being
      // reported, subtract the overlapping portion of its duration
      // from the result.
      for (i = playlist.segments.length - 1; i >= 0 && liveBuffer > 0; i--) {
        segment = playlist.segments[i];
        pending = optionalMin(duration(playlist,
                                       playlist.mediaSequence + i,
                                       playlist.mediaSequence + i + 1),
                           liveBuffer);
        liveBuffer -= pending;
        end -= pending;
      }
    }

    return videojs.createTimeRange(start, end);
  };

  // exports
  videojs.Hls.Playlist = {
    duration: duration,
    seekable: seekable
  };
})(window, window.videojs);

(function(window, videojs) {
  'use strict';
  var
    resolveUrl = videojs.Hls.resolveUrl,
    xhr = videojs.Hls.xhr,
    Playlist = videojs.Hls.Playlist,
    mergeOptions = videojs.util.mergeOptions,

    /**
     * Returns a new master playlist that is the result of merging an
     * updated media playlist into the original version. If the
     * updated media playlist does not match any of the playlist
     * entries in the original master playlist, null is returned.
     * @param master {object} a parsed master M3U8 object
     * @param media {object} a parsed media M3U8 object
     * @return {object} a new object that represents the original
     * master playlist with the updated media playlist merged in, or
     * null if the merge produced no change.
     */
    updateMaster = function(master, media) {
      var
        changed = false,
        result = mergeOptions(master, {}),
        i,
        playlist;

      i = master.playlists.length;
      while (i--) {
        playlist = result.playlists[i];
        if (playlist.uri === media.uri) {
          // consider the playlist unchanged if the number of segments
          // are equal and the media sequence number is unchanged
          if (playlist.segments &&
              media.segments &&
              playlist.segments.length === media.segments.length &&
              playlist.mediaSequence === media.mediaSequence) {
            continue;
          }

          result.playlists[i] = mergeOptions(playlist, media);
          result.playlists[media.uri] = result.playlists[i];

          // if the update could overlap existing segment information,
          // merge the two lists
          if (playlist.segments) {
            result.playlists[i].segments = updateSegments(playlist.segments,
                                                          media.segments,
                                                          media.mediaSequence - playlist.mediaSequence);
          }
          changed = true;
        }
      }
      return changed ? result : null;
    },

    /**
     * Returns a new array of segments that is the result of merging
     * properties from an older list of segments onto an updated
     * list. No properties on the updated playlist will be overridden.
     * @param original {array} the outdated list of segments
     * @param update {array} the updated list of segments
     * @param offset {number} (optional) the index of the first update
     * segment in the original segment list. For non-live playlists,
     * this should always be zero and does not need to be
     * specified. For live playlists, it should be the difference
     * between the media sequence numbers in the original and updated
     * playlists.
     * @return a list of merged segment objects
     */
    updateSegments = function(original, update, offset) {
      var result = update.slice(), length, i;
      offset = offset || 0;
      length = Math.min(original.length, update.length + offset);

      for (i = offset; i < length; i++) {
        result[i - offset] = mergeOptions(original[i], result[i - offset]);
      }
      return result;
    },

    PlaylistLoader = function(srcUrl, withCredentials) {
      var
        loader = this,
        dispose,
        mediaUpdateTimeout,
        request,
        haveMetadata;

      PlaylistLoader.prototype.init.call(this);

      if (!srcUrl) {
        throw new Error('A non-empty playlist URL is required');
      }

      // update the playlist loader's state in response to a new or
      // updated playlist.
      haveMetadata = function(error, xhr, url) {
        var parser, refreshDelay, update;

        loader.setBandwidth(request || xhr);

        // any in-flight request is now finished
        request = null;

        if (error) {
          loader.error = {
            status: xhr.status,
            message: 'HLS playlist request error at URL: ' + url,
            responseText: xhr.responseText,
            code: (xhr.status >= 500) ? 4 : 2
          };
          return loader.trigger('error');
        }

        loader.state = 'HAVE_METADATA';

        parser = new videojs.m3u8.Parser();
        parser.push(xhr.responseText);
        parser.end();
        parser.manifest.uri = url;

        // merge this playlist into the master
        update = updateMaster(loader.master, parser.manifest);
        refreshDelay = (parser.manifest.targetDuration || 10) * 1000;
        if (update) {
          loader.master = update;
          loader.updateMediaPlaylist_(parser.manifest);
        } else {
          // if the playlist is unchanged since the last reload,
          // try again after half the target duration
          refreshDelay /= 2;
        }

        // refresh live playlists after a target duration passes
        if (!loader.media().endList) {
          window.clearTimeout(mediaUpdateTimeout);
          mediaUpdateTimeout = window.setTimeout(function() {
            loader.trigger('mediaupdatetimeout');
          }, refreshDelay);
        }

        loader.trigger('loadedplaylist');
      };

      // initialize the loader state
      loader.state = 'HAVE_NOTHING';

      // the total duration of all segments that expired and have been
      // removed from the current playlist after the last
      // #EXT-X-DISCONTINUITY. In a live playlist without
      // discontinuities, this is the total amount of time that has
      // been removed from the stream since the playlist loader began
      // tracking it.
      loader.expiredPostDiscontinuity_ = 0;

      // the total duration of all segments that expired and have been
      // removed from the current playlist before the last
      // #EXT-X-DISCONTINUITY. The total amount of time that has
      // expired is always the sum of expiredPreDiscontinuity_ and
      // expiredPostDiscontinuity_.
      loader.expiredPreDiscontinuity_ = 0;

      // capture the prototype dispose function
      dispose = this.dispose;

      /**
       * Abort any outstanding work and clean up.
       */
      loader.dispose = function() {
        if (request) {
          request.onreadystatechange = null;
          request.abort();
          request = null;
        }
        window.clearTimeout(mediaUpdateTimeout);
        dispose.call(this);
      };

      /**
       * When called without any arguments, returns the currently
       * active media playlist. When called with a single argument,
       * triggers the playlist loader to asynchronously switch to the
       * specified media playlist. Calling this method while the
       * loader is in the HAVE_NOTHING or HAVE_MASTER states causes an
       * error to be emitted but otherwise has no effect.
       * @param playlist (optional) {object} the parsed media playlist
       * object to switch to
       */
      loader.media = function(playlist) {
        var mediaChange = false;
        // getter
        if (!playlist) {
          return loader.media_;
        }

        // setter
        if (loader.state === 'HAVE_NOTHING' || loader.state === 'HAVE_MASTER') {
          throw new Error('Cannot switch media playlist from ' + loader.state);
        }

        // find the playlist object if the target playlist has been
        // specified by URI
        if (typeof playlist === 'string') {
          if (!loader.master.playlists[playlist]) {
            throw new Error('Unknown playlist URI: ' + playlist);
          }
          playlist = loader.master.playlists[playlist];
        }

        mediaChange = playlist.uri !== loader.media_.uri;

        // switch to fully loaded playlists immediately
        if (loader.master.playlists[playlist.uri].endList) {
          // abort outstanding playlist requests
          if (request) {
            request.onreadystatechange = null;
            request.abort();
            request = null;
          }
          loader.state = 'HAVE_METADATA';
          loader.media_ = playlist;

          // trigger media change if the active media has been updated
          if (mediaChange) {
            loader.trigger('mediachange');
          }
          return;
        }

        // switching to the active playlist is a no-op
        if (!mediaChange) {
          return;
        }

        loader.state = 'SWITCHING_MEDIA';

        // there is already an outstanding playlist request
        if (request) {
          if (resolveUrl(loader.master.uri, playlist.uri) === request.url) {
            // requesting to switch to the same playlist multiple times
            // has no effect after the first
            return;
          }
          request.onreadystatechange = null;
          request.abort();
          request = null;
        }

        // request the new playlist
        request = xhr({
          url: resolveUrl(loader.master.uri, playlist.uri),
          withCredentials: withCredentials
        }, function(error) {
          haveMetadata(error, this, playlist.uri);
          loader.trigger('mediachange');
        });
      };

      loader.setBandwidth = function(xhr) {
        loader.bandwidth = xhr.bandwidth;
      };

      // live playlist staleness timeout
      loader.on('mediaupdatetimeout', function() {
        if (loader.state !== 'HAVE_METADATA') {
          // only refresh the media playlist if no other activity is going on
          return;
        }

        loader.state = 'HAVE_CURRENT_METADATA';
        request = xhr({
          url: resolveUrl(loader.master.uri, loader.media().uri),
          withCredentials: withCredentials
        }, function(error) {
          haveMetadata(error, this, loader.media().uri);
        });
      });

      // request the specified URL
      xhr({
        url: srcUrl,
        withCredentials: withCredentials
      }, function(error) {
        var parser, i;

        if (error) {
          loader.error = {
            status: this.status,
            message: 'HLS playlist request error at URL: ' + srcUrl,
            responseText: this.responseText,
            code: 2 // MEDIA_ERR_NETWORK
          };
          return loader.trigger('error');
        }

        parser = new videojs.m3u8.Parser();
        parser.push(this.responseText);
        parser.end();

        loader.state = 'HAVE_MASTER';

        parser.manifest.uri = srcUrl;

        // loaded a master playlist
        if (parser.manifest.playlists) {
          loader.master = parser.manifest;

          // setup by-URI lookups
          i = loader.master.playlists.length;
          while (i--) {
            loader.master.playlists[loader.master.playlists[i].uri] = loader.master.playlists[i];
          }

          request = xhr({
            url: resolveUrl(srcUrl, parser.manifest.playlists[0].uri),
            withCredentials: withCredentials
          }, function(error) {
            // pass along the URL specified in the master playlist
            haveMetadata(error,
                         this,
                         parser.manifest.playlists[0].uri);
            if (!error) {
              loader.trigger('loadedmetadata');
            }
          });
          return loader.trigger('loadedplaylist');
        }

        // loaded a media playlist
        // infer a master playlist if none was previously requested
        loader.master = {
          uri: window.location.href,
          playlists: [{
            uri: srcUrl
          }]
        };
        loader.master.playlists[srcUrl] = loader.master.playlists[0];
        haveMetadata(null, this, srcUrl);
        return loader.trigger('loadedmetadata');
      });
    };
  PlaylistLoader.prototype = new videojs.Hls.Stream();

  /**
   * Update the PlaylistLoader state to reflect the changes in an
   * update to the current media playlist.
   * @param update {object} the updated media playlist object
   */
  PlaylistLoader.prototype.updateMediaPlaylist_ = function(update) {
    var lastDiscontinuity, expiredCount, i;

    if (this.media_) {
      expiredCount = update.mediaSequence - this.media_.mediaSequence;

      // setup the index for duration calculations so that the newly
      // expired time will be accumulated after the last
      // discontinuity, unless we discover otherwise
      lastDiscontinuity = this.media_.mediaSequence;

      if (this.media_.discontinuitySequence !== update.discontinuitySequence) {
        i = expiredCount;
        while (i--) {
          if (this.media_.segments[i].discontinuity) {
            // a segment that begins a new discontinuity sequence has expired
            lastDiscontinuity = i + this.media_.mediaSequence;
            this.expiredPreDiscontinuity_ += this.expiredPostDiscontinuity_;
            this.expiredPostDiscontinuity_ = 0;
            break;
          }
        }
      }

      // update the expirated durations
      this.expiredPreDiscontinuity_ += Playlist.duration(this.media_,
                                                         this.media_.mediaSequence,
                                                         lastDiscontinuity);
      this.expiredPostDiscontinuity_ += Playlist.duration(this.media_,
                                                         lastDiscontinuity,
                                                         this.media_.mediaSequence + expiredCount);
    }

    this.media_ = this.master.playlists[update.uri];
  };

  /**
   * Determine the index of the segment that contains a specified
   * playback position in the current media playlist. Early versions
   * of the HLS specification require segment durations to be rounded
   * to the nearest integer which means it may not be possible to
   * determine the correct segment for a playback position if that
   * position is within .5 seconds of the segment duration. This
   * function will always return the lower of the two possible indices
   * in those cases.
   *
   * @param time {number} The number of seconds since the earliest
   * possible position to determine the containing segment for
   * @returns {number} The number of the media segment that contains
   * that time position. If the specified playback position is outside
   * the time range of the current set of media segments, the return
   * value will be clamped to the index of the segment containing the
   * closest playback position that is currently available.
   */
  PlaylistLoader.prototype.getMediaIndexForTime_ = function(time) {
    var i;

    if (!this.media_) {
      return 0;
    }

    // when the requested position is earlier than the current set of
    // segments, return the earliest segment index
    time -= this.expiredPreDiscontinuity_ + this.expiredPostDiscontinuity_;
    if (time < 0) {
      return 0;
    }

    for (i = 0; i < this.media_.segments.length; i++) {
      time -= Playlist.duration(this.media_,
                                this.media_.mediaSequence + i,
                                this.media_.mediaSequence + i + 1,
                                false);

      // HLS version 3 and lower round segment durations to the
      // nearest decimal integer. When the correct media index is
      // ambiguous, prefer the higher one.
      if (time <= 0) {
        return i;
      }
    }

    // the playback position is outside the range of available
    // segments so return the last one
    return this.media_.segments.length - 1;
  };

  videojs.Hls.PlaylistLoader = PlaylistLoader;
})(window, window.videojs);

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.window.pkcs7 = {
  unpad: require('./unpad')
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./unpad":2}],2:[function(require,module,exports){
/*
 * pkcs7.unpad
 * https://github.com/brightcove/pkcs7
 *
 * Copyright (c) 2014 Brightcove
 * Licensed under the apache2 license.
 */

'use strict';

/**
 * Returns the subarray of a Uint8Array without PKCS#7 padding.
 * @param padded {Uint8Array} unencrypted bytes that have been padded
 * @return {Uint8Array} the unpadded bytes
 * @see http://tools.ietf.org/html/rfc5652
 */
module.exports = function unpad(padded) {
  return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
};

},{}]},{},[1]);
(function(window, videojs, unpad) {
'use strict';

var AES, AsyncStream, Decrypter, decrypt, ntoh;

/**
 * Convert network-order (big-endian) bytes into their little-endian
 * representation.
 */
ntoh = function(word) {
  return (word << 24) |
    ((word & 0xff00) << 8) |
    ((word & 0xff0000) >> 8) |
    (word >>> 24);
};

/**
 * Schedule out an AES key for both encryption and decryption. This
 * is a low-level class. Use a cipher mode to do bulk encryption.
 *
 * @constructor
 * @param key {Array} The key as an array of 4, 6 or 8 words.
 */
AES = function (key) {
  this._precompute();

  var i, j, tmp,
    encKey, decKey,
    sbox = this._tables[0][4], decTable = this._tables[1],
    keyLen = key.length, rcon = 1;

  if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
    throw new Error("Invalid aes key size");
  }

  encKey = key.slice(0);
  decKey = [];
  this._key = [encKey, decKey];

  // schedule encryption keys
  for (i = keyLen; i < 4 * keyLen + 28; i++) {
    tmp = encKey[i-1];

    // apply sbox
    if (i%keyLen === 0 || (keyLen === 8 && i%keyLen === 4)) {
      tmp = sbox[tmp>>>24]<<24 ^ sbox[tmp>>16&255]<<16 ^ sbox[tmp>>8&255]<<8 ^ sbox[tmp&255];

      // shift rows and add rcon
      if (i%keyLen === 0) {
        tmp = tmp<<8 ^ tmp>>>24 ^ rcon<<24;
        rcon = rcon<<1 ^ (rcon>>7)*283;
      }
    }

    encKey[i] = encKey[i-keyLen] ^ tmp;
  }

  // schedule decryption keys
  for (j = 0; i; j++, i--) {
    tmp = encKey[j&3 ? i : i - 4];
    if (i<=4 || j<4) {
      decKey[j] = tmp;
    } else {
      decKey[j] = decTable[0][sbox[tmp>>>24      ]] ^
                  decTable[1][sbox[tmp>>16  & 255]] ^
                  decTable[2][sbox[tmp>>8   & 255]] ^
                  decTable[3][sbox[tmp      & 255]];
    }
  }
};

AES.prototype = {
  /**
   * The expanded S-box and inverse S-box tables. These will be computed
   * on the client so that we don't have to send them down the wire.
   *
   * There are two tables, _tables[0] is for encryption and
   * _tables[1] is for decryption.
   *
   * The first 4 sub-tables are the expanded S-box with MixColumns. The
   * last (_tables[01][4]) is the S-box itself.
   *
   * @private
   */
  _tables: [[[],[],[],[],[]],[[],[],[],[],[]]],

  /**
   * Expand the S-box tables.
   *
   * @private
   */
  _precompute: function () {
   var encTable = this._tables[0], decTable = this._tables[1],
       sbox = encTable[4], sboxInv = decTable[4],
       i, x, xInv, d=[], th=[], x2, x4, x8, s, tEnc, tDec;

    // Compute double and third tables
   for (i = 0; i < 256; i++) {
     th[( d[i] = i<<1 ^ (i>>7)*283 )^i]=i;
   }

   for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
     // Compute sbox
     s = xInv ^ xInv<<1 ^ xInv<<2 ^ xInv<<3 ^ xInv<<4;
     s = s>>8 ^ s&255 ^ 99;
     sbox[x] = s;
     sboxInv[s] = x;

     // Compute MixColumns
     x8 = d[x4 = d[x2 = d[x]]];
     tDec = x8*0x1010101 ^ x4*0x10001 ^ x2*0x101 ^ x*0x1010100;
     tEnc = d[s]*0x101 ^ s*0x1010100;

     for (i = 0; i < 4; i++) {
       encTable[i][x] = tEnc = tEnc<<24 ^ tEnc>>>8;
       decTable[i][s] = tDec = tDec<<24 ^ tDec>>>8;
     }
   }

   // Compactify. Considerable speedup on Firefox.
   for (i = 0; i < 5; i++) {
     encTable[i] = encTable[i].slice(0);
     decTable[i] = decTable[i].slice(0);
   }
  },

  /**
   * Decrypt 16 bytes, specified as four 32-bit words.
   * @param encrypted0 {number} the first word to decrypt
   * @param encrypted1 {number} the second word to decrypt
   * @param encrypted2 {number} the third word to decrypt
   * @param encrypted3 {number} the fourth word to decrypt
   * @param out {Int32Array} the array to write the decrypted words
   * into
   * @param offset {number} the offset into the output array to start
   * writing results
   * @return {Array} The plaintext.
   */
  decrypt:function (encrypted0, encrypted1, encrypted2, encrypted3, out, offset) {
    var key = this._key[1],
        // state variables a,b,c,d are loaded with pre-whitened data
        a = encrypted0 ^ key[0],
        b = encrypted3 ^ key[1],
        c = encrypted2 ^ key[2],
        d = encrypted1 ^ key[3],
        a2, b2, c2,

        nInnerRounds = key.length / 4 - 2, // key.length === 2 ?
        i,
        kIndex = 4,
        table = this._tables[1],

        // load up the tables
        table0    = table[0],
        table1    = table[1],
        table2    = table[2],
        table3    = table[3],
        sbox  = table[4];

    // Inner rounds. Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 = table0[a>>>24] ^ table1[b>>16 & 255] ^ table2[c>>8 & 255] ^ table3[d & 255] ^ key[kIndex];
      b2 = table0[b>>>24] ^ table1[c>>16 & 255] ^ table2[d>>8 & 255] ^ table3[a & 255] ^ key[kIndex + 1];
      c2 = table0[c>>>24] ^ table1[d>>16 & 255] ^ table2[a>>8 & 255] ^ table3[b & 255] ^ key[kIndex + 2];
      d  = table0[d>>>24] ^ table1[a>>16 & 255] ^ table2[b>>8 & 255] ^ table3[c & 255] ^ key[kIndex + 3];
      kIndex += 4;
      a=a2; b=b2; c=c2;
    }

    // Last round.
    for (i = 0; i < 4; i++) {
      out[(3 & -i) + offset] =
        sbox[a>>>24      ]<<24 ^
        sbox[b>>16  & 255]<<16 ^
        sbox[c>>8   & 255]<<8  ^
        sbox[d      & 255]     ^
        key[kIndex++];
      a2=a; a=b; b=c; c=d; d=a2;
    }
  }
};

/**
 * Decrypt bytes using AES-128 with CBC and PKCS#7 padding.
 * @param encrypted {Uint8Array} the encrypted bytes
 * @param key {Uint32Array} the bytes of the decryption key
 * @param initVector {Uint32Array} the initialization vector (IV) to
 * use for the first round of CBC.
 * @return {Uint8Array} the decrypted bytes
 *
 * @see http://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 * @see http://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29
 * @see https://tools.ietf.org/html/rfc2315
 */
decrypt = function(encrypted, key, initVector) {
  var
    // word-level access to the encrypted bytes
    encrypted32 = new Int32Array(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength >> 2),

    decipher = new AES(Array.prototype.slice.call(key)),

    // byte and word-level access for the decrypted output
    decrypted = new Uint8Array(encrypted.byteLength),
    decrypted32 = new Int32Array(decrypted.buffer),

    // temporary variables for working with the IV, encrypted, and
    // decrypted data
    init0, init1, init2, init3,
    encrypted0, encrypted1, encrypted2, encrypted3,

    // iteration variable
    wordIx;

  // pull out the words of the IV to ensure we don't modify the
  // passed-in reference and easier access
  init0 = initVector[0];
  init1 = initVector[1];
  init2 = initVector[2];
  init3 = initVector[3];

  // decrypt four word sequences, applying cipher-block chaining (CBC)
  // to each decrypted block
  for (wordIx = 0; wordIx < encrypted32.length; wordIx += 4) {
    // convert big-endian (network order) words into little-endian
    // (javascript order)
    encrypted0 = ntoh(encrypted32[wordIx]);
    encrypted1 = ntoh(encrypted32[wordIx + 1]);
    encrypted2 = ntoh(encrypted32[wordIx + 2]);
    encrypted3 = ntoh(encrypted32[wordIx + 3]);

    // decrypt the block
    decipher.decrypt(encrypted0,
                     encrypted1,
                     encrypted2,
                     encrypted3,
                     decrypted32,
                     wordIx);

    // XOR with the IV, and restore network byte-order to obtain the
    // plaintext
    decrypted32[wordIx]     = ntoh(decrypted32[wordIx] ^ init0);
    decrypted32[wordIx + 1] = ntoh(decrypted32[wordIx + 1] ^ init1);
    decrypted32[wordIx + 2] = ntoh(decrypted32[wordIx + 2] ^ init2);
    decrypted32[wordIx + 3] = ntoh(decrypted32[wordIx + 3] ^ init3);

    // setup the IV for the next round
    init0 = encrypted0;
    init1 = encrypted1;
    init2 = encrypted2;
    init3 = encrypted3;
  }

  return decrypted;
};

AsyncStream = function() {
  this.jobs = [];
  this.delay = 1;
  this.timeout_ = null;
};
AsyncStream.prototype = new videojs.Hls.Stream();
AsyncStream.prototype.processJob_ = function() {
  this.jobs.shift()();
  if (this.jobs.length) {
    this.timeout_ = setTimeout(videojs.bind(this, this.processJob_),
                               this.delay);
  } else {
    this.timeout_ = null;
  }
};
AsyncStream.prototype.push = function(job) {
  this.jobs.push(job);
  if (!this.timeout_) {
    this.timeout_ = setTimeout(videojs.bind(this, this.processJob_),
                               this.delay);
  }
};

Decrypter = function(encrypted, key, initVector, done) {
  var
    step = Decrypter.STEP,
    encrypted32 = new Int32Array(encrypted.buffer),
    decrypted = new Uint8Array(encrypted.byteLength),
    i = 0;
  this.asyncStream_ = new AsyncStream();

  // split up the encryption job and do the individual chunks asynchronously
  this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step),
                                            key,
                                            initVector,
                                            decrypted,
                                            i));
  for (i = step; i < encrypted32.length; i += step) {
    initVector = new Uint32Array([
      ntoh(encrypted32[i - 4]),
      ntoh(encrypted32[i - 3]),
      ntoh(encrypted32[i - 2]),
      ntoh(encrypted32[i - 1])
    ]);
    this.asyncStream_.push(this.decryptChunk_(encrypted32.subarray(i, i + step),
                                              key,
                                              initVector,
                                              decrypted));
  }
  // invoke the done() callback when everything is finished
  this.asyncStream_.push(function() {
    // remove pkcs#7 padding from the decrypted bytes
    done(null, unpad(decrypted));
  });
};
Decrypter.prototype = new videojs.Hls.Stream();
Decrypter.prototype.decryptChunk_ = function(encrypted, key, initVector, decrypted) {
  return function() {
    var bytes = decrypt(encrypted,
                        key,
                        initVector);
    decrypted.set(bytes, encrypted.byteOffset);
  };
};
// the maximum number of bytes to process at one time
Decrypter.STEP = 4 * 8000;

// exports
videojs.Hls.decrypt = decrypt;
videojs.Hls.Decrypter = Decrypter;
videojs.Hls.AsyncStream = AsyncStream;

})(window, window.videojs, window.pkcs7.unpad);

(function(window) {
  var module = {
    hexDump: function(data) {
      var
        bytes = Array.prototype.slice.call(data),
        step = 16,
        formatHexString = function(e, i) {
          var value = e.toString(16);
          return "00".substring(0, 2 - value.length) + value + (i % 2 ? ' ' : '');
        },
        formatAsciiString = function(e) {
          if (e >= 0x20 && e < 0x7e) {
            return String.fromCharCode(e);
          }
          return '.';
        },
        result = '',
        hex,
        ascii;
      for (var j = 0; j < bytes.length / step; j++) {
        hex = bytes.slice(j * step, j * step + step).map(formatHexString).join('');
        ascii = bytes.slice(j * step, j * step + step).map(formatAsciiString).join('');
        result += hex + ' ' + ascii + '\n';
      }
      return result;
    },
    tagDump: function(tag) {
      return module.hexDump(tag.bytes);
    }
  };

  window.videojs.Hls.utils = module;
})(this);

function X2JS(a,b,c){function d(a){var b=a.localName;return null==b&&(b=a.baseName),(null==b||""==b)&&(b=a.nodeName),b}function e(a){return a.prefix}function f(a){return"string"==typeof a?a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"):a}function g(a){return a.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#x2F;/g,"/")}function h(f){if(f.nodeType==u.DOCUMENT_NODE){var i,j,k,l=f.firstChild;for(j=0,k=f.childNodes.length;k>j;j+=1)if(f.childNodes[j].nodeType!==u.COMMENT_NODE){l=f.childNodes[j];break}if(c)i=h(l);else{i={};var m=d(l);i[m]=h(l)}return i}if(f.nodeType==u.ELEMENT_NODE){var i=new Object;i.__cnt=0;for(var n=f.childNodes,o=0;o<n.length;o++){var l=n.item(o),m=d(l);if(i.__cnt++,null==i[m])i[m]=h(l),i[m+"_asArray"]=new Array(1),i[m+"_asArray"][0]=i[m];else{if(null!=i[m]&&!(i[m]instanceof Array)){var p=i[m];i[m]=new Array,i[m][0]=p,i[m+"_asArray"]=i[m]}for(var q=0;null!=i[m][q];)q++;i[m][q]=h(l)}}for(var r=0;r<f.attributes.length;r++){var s=f.attributes.item(r);i.__cnt++;for(var v=s.value,w=0,x=a.length;x>w;w++){var y=a[w];y.test.call(this,s)&&(v=y.converter.call(this,s.value))}i[b+s.name]=v}var z=e(f);return null!=z&&""!=z&&(i.__cnt++,i.__prefix=z),1==i.__cnt&&null!=i["#text"]&&(i=i["#text"]),null!=i["#text"]&&(i.__text=i["#text"],t&&(i.__text=g(i.__text)),delete i["#text"],delete i["#text_asArray"]),null!=i["#cdata-section"]&&(i.__cdata=i["#cdata-section"],delete i["#cdata-section"],delete i["#cdata-section_asArray"]),(null!=i.__text||null!=i.__cdata)&&(i.toString=function(){return(null!=this.__text?this.__text:"")+(null!=this.__cdata?this.__cdata:"")}),i}return f.nodeType==u.TEXT_NODE||f.nodeType==u.CDATA_SECTION_NODE?f.nodeValue:f.nodeType==u.COMMENT_NODE?null:void 0}function i(a,b,c,d){var e="<"+(null!=a&&null!=a.__prefix?a.__prefix+":":"")+b;if(null!=c)for(var f=0;f<c.length;f++){var g=c[f],h=a[g];e+=" "+g.substr(1)+"='"+h+"'"}return e+=d?"/>":">"}function j(a,b){return"</"+(null!=a.__prefix?a.__prefix+":":"")+b+">"}function k(a,b){return-1!==a.indexOf(b,a.length-b.length)}function l(a,b){return k(b.toString(),"_asArray")||0==b.toString().indexOf("_")||a[b]instanceof Function?!0:!1}function m(a){var b=0;if(a instanceof Object)for(var c in a)l(a,c)||b++;return b}function n(a){var b=[];if(a instanceof Object)for(var c in a)-1==c.toString().indexOf("__")&&0==c.toString().indexOf("_")&&b.push(c);return b}function o(a){var b="";return null!=a.__cdata&&(b+="<![CDATA["+a.__cdata+"]]>"),null!=a.__text&&(b+=t?f(a.__text):a.__text),b}function p(a){var b="";return a instanceof Object?b+=o(a):null!=a&&(b+=t?f(a):a),b}function q(a,b,c){var d="";if(0==a.length)d+=i(a,b,c,!0);else for(var e=0;e<a.length;e++)d+=i(a[e],b,n(a[e]),!1),d+=r(a[e]),d+=j(a[e],b);return d}function r(a){var b="",c=m(a);if(c>0)for(var d in a)if(!l(a,d)){var e=a[d],f=n(e);if(null==e||void 0==e)b+=i(e,d,f,!0);else if(e instanceof Object)if(e instanceof Array)b+=q(e,d,f);else{var g=m(e);g>0||null!=e.__text||null!=e.__cdata?(b+=i(e,d,f,!1),b+=r(e),b+=j(e,d)):b+=i(e,d,f,!0)}else b+=i(e,d,f,!1),b+=p(e),b+=j(e,d)}return b+=p(a)}(null===b||void 0===b)&&(b="_"),(null===c||void 0===c)&&(c=!1);var s="1.0.11",t=!1,u={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};this.parseXmlString=function(a){var b;if(window.DOMParser){var c=new window.DOMParser;b=c.parseFromString(a,"text/xml")}else 0==a.indexOf("<?")&&(a=a.substr(a.indexOf("?>")+2)),b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a);return b},this.xml2json=function(a){return h(a)},this.xml_str2json=function(a){var b=this.parseXmlString(a);return this.xml2json(b)},this.json2xml_str=function(a){return r(a)},this.json2xml=function(a){var b=this.json2xml_str(a);return this.parseXmlString(b)},this.getVersion=function(){return s},this.escapeMode=function(a){t=a}}function ObjectIron(a){var b;for(b=[],i=0,len=a.length;i<len;i+=1)b.push(a[i].isRoot?"root":a[i].name);var c=function(a,b){var c;if(null!==a&&null!==b)for(c in a)a.hasOwnProperty(c)&&(b.hasOwnProperty(c)||(b[c]=a[c]))},d=function(a,b,d){var e,f,g,h,i;if(null!==a&&0!==a.length)for(e=0,f=a.length;f>e;e+=1)g=a[e],b.hasOwnProperty(g.name)&&(d.hasOwnProperty(g.name)?g.merge&&(h=b[g.name],i=d[g.name],"object"==typeof h&&"object"==typeof i?c(h,i):d[g.name]=null!=g.mergeFunction?g.mergeFunction(h,i):h+i):d[g.name]=b[g.name])},e=function(a,b){var c,f,g,h,i,j,k,l=a;if(null!==l.children&&0!==l.children.length)for(c=0,f=l.children.length;f>c;c+=1)if(j=l.children[c],b.hasOwnProperty(j.name))if(j.isArray)for(i=b[j.name+"_asArray"],g=0,h=i.length;h>g;g+=1)k=i[g],d(l.properties,b,k),e(j,k);else k=b[j.name],d(l.properties,b,k),e(j,k)},f=function(c){var d,g,h,i,j,k,l;if(null===c)return c;if("object"!=typeof c)return c;for(d=0,g=b.length;g>d;d+=1)"root"===b[d]&&(j=a[d],k=c,e(j,k));for(i in c)if(c.hasOwnProperty(i)){if(h=b.indexOf(i),-1!==h)if(j=a[h],j.isArray)for(l=c[i+"_asArray"],d=0,g=l.length;g>d;d+=1)k=l[d],e(j,k);else k=c[i],e(j,k);f(c[i])}return c};return{run:f}}function intTobitArray(a,b){for(var c=[],d=0;b>d;d++)c.push((a&Math.pow(2,d))>0);return c}if(function(a){"use strict";var b={VERSION:"0.5.3"};b.System=function(){this._mappings={},this._outlets={},this._handlers={},this.strictInjections=!0,this.autoMapOutlets=!1,this.postInjectionHook="setup"},b.System.prototype={_createAndSetupInstance:function(a,b){var c=new b;return this.injectInto(c,a),c},_retrieveFromCacheOrCreate:function(a,b){"undefined"==typeof b&&(b=!1);var c;if(!this._mappings.hasOwnProperty(a))throw new Error(1e3);var d=this._mappings[a];return!b&&d.isSingleton?(null==d.object&&(d.object=this._createAndSetupInstance(a,d.clazz)),c=d.object):c=d.clazz?this._createAndSetupInstance(a,d.clazz):d.object,c},mapOutlet:function(a,b,c){if("undefined"==typeof a)throw new Error(1010);return b=b||"global",c=c||a,this._outlets.hasOwnProperty(b)||(this._outlets[b]={}),this._outlets[b][c]=a,this},getObject:function(a){if("undefined"==typeof a)throw new Error(1020);return this._retrieveFromCacheOrCreate(a)},mapValue:function(a,b){if("undefined"==typeof a)throw new Error(1030);return this._mappings[a]={clazz:null,object:b,isSingleton:!0},this.autoMapOutlets&&this.mapOutlet(a),this.hasMapping(a)&&this.injectInto(b,a),this},hasMapping:function(a){if("undefined"==typeof a)throw new Error(1040);return this._mappings.hasOwnProperty(a)},mapClass:function(a,b){if("undefined"==typeof a)throw new Error(1050);if("undefined"==typeof b)throw new Error(1051);return this._mappings[a]={clazz:b,object:null,isSingleton:!1},this.autoMapOutlets&&this.mapOutlet(a),this},mapSingleton:function(a,b){if("undefined"==typeof a)throw new Error(1060);if("undefined"==typeof b)throw new Error(1061);return this._mappings[a]={clazz:b,object:null,isSingleton:!0},this.autoMapOutlets&&this.mapOutlet(a),this},instantiate:function(a){if("undefined"==typeof a)throw new Error(1070);return this._retrieveFromCacheOrCreate(a,!0)},injectInto:function(a,b){if("undefined"==typeof a)throw new Error(1080);if("object"==typeof a){var c=[];this._outlets.hasOwnProperty("global")&&c.push(this._outlets.global),"undefined"!=typeof b&&this._outlets.hasOwnProperty(b)&&c.push(this._outlets[b]);for(var d in c){var e=c[d];for(var f in e){var g=e[f];(!this.strictInjections||f in a)&&(a[f]=this.getObject(g))}}"setup"in a&&a.setup.call(a)}return this},unmap:function(a){if("undefined"==typeof a)throw new Error(1090);return delete this._mappings[a],this},unmapOutlet:function(a,b){if("undefined"==typeof a)throw new Error(1100);if("undefined"==typeof b)throw new Error(1101);return delete this._outlets[a][b],this},mapHandler:function(a,b,c,d,e){if("undefined"==typeof a)throw new Error(1110);return b=b||"global",c=c||a,"undefined"==typeof d&&(d=!1),"undefined"==typeof e&&(e=!1),this._handlers.hasOwnProperty(a)||(this._handlers[a]={}),this._handlers[a].hasOwnProperty(b)||(this._handlers[a][b]=[]),this._handlers[a][b].push({handler:c,oneShot:d,passEvent:e}),this},unmapHandler:function(a,b,c){if("undefined"==typeof a)throw new Error(1120);if(b=b||"global",c=c||a,this._handlers.hasOwnProperty(a)&&this._handlers[a].hasOwnProperty(b)){var d=this._handlers[a][b];for(var e in d){var f=d[e];if(f.handler===c){d.splice(e,1);break}}}return this},notify:function(a){if("undefined"==typeof a)throw new Error(1130);var b=Array.prototype.slice.call(arguments),c=b.slice(1);if(this._handlers.hasOwnProperty(a)){var d=this._handlers[a];for(var e in d){var f,g=d[e];"global"!==e&&(f=this.getObject(e));var h,i,j=[];for(h=0,i=g.length;i>h;h++){var k,l=g[h];k=f&&"string"==typeof l.handler?f[l.handler]:l.handler,l.oneShot&&j.unshift(h),l.passEvent?k.apply(f,b):k.apply(f,c)}for(h=0,i=j.length;i>h;h++)g.splice(j[h],1)}}return this}},a.dijon=b}(this),"undefined"==typeof utils)var utils={};"undefined"==typeof utils.Math&&(utils.Math={}),utils.Math.to64BitNumber=function(a,b){var c,d,e;return c=new goog.math.Long(0,b),d=new goog.math.Long(a,0),e=c.add(d),e.toNumber()},goog={},goog.math={},goog.math.Long=function(a,b){this.low_=0|a,this.high_=0|b},goog.math.Long.IntCache_={},goog.math.Long.fromInt=function(a){if(a>=-128&&128>a){var b=goog.math.Long.IntCache_[a];if(b)return b}var c=new goog.math.Long(0|a,0>a?-1:0);return a>=-128&&128>a&&(goog.math.Long.IntCache_[a]=c),c},goog.math.Long.fromNumber=function(a){return isNaN(a)||!isFinite(a)?goog.math.Long.ZERO:a<=-goog.math.Long.TWO_PWR_63_DBL_?goog.math.Long.MIN_VALUE:a+1>=goog.math.Long.TWO_PWR_63_DBL_?goog.math.Long.MAX_VALUE:0>a?goog.math.Long.fromNumber(-a).negate():new goog.math.Long(a%goog.math.Long.TWO_PWR_32_DBL_|0,a/goog.math.Long.TWO_PWR_32_DBL_|0)},goog.math.Long.fromBits=function(a,b){return new goog.math.Long(a,b)},goog.math.Long.fromString=function(a,b){if(0==a.length)throw Error("number format error: empty string");var c=b||10;if(2>c||c>36)throw Error("radix out of range: "+c);if("-"==a.charAt(0))return goog.math.Long.fromString(a.substring(1),c).negate();if(a.indexOf("-")>=0)throw Error('number format error: interior "-" character: '+a);for(var d=goog.math.Long.fromNumber(Math.pow(c,8)),e=goog.math.Long.ZERO,f=0;f<a.length;f+=8){var g=Math.min(8,a.length-f),h=parseInt(a.substring(f,f+g),c);if(8>g){var i=goog.math.Long.fromNumber(Math.pow(c,g));e=e.multiply(i).add(goog.math.Long.fromNumber(h))}else e=e.multiply(d),e=e.add(goog.math.Long.fromNumber(h))}return e},goog.math.Long.TWO_PWR_16_DBL_=65536,goog.math.Long.TWO_PWR_24_DBL_=1<<24,goog.math.Long.TWO_PWR_32_DBL_=goog.math.Long.TWO_PWR_16_DBL_*goog.math.Long.TWO_PWR_16_DBL_,goog.math.Long.TWO_PWR_31_DBL_=goog.math.Long.TWO_PWR_32_DBL_/2,goog.math.Long.TWO_PWR_48_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_16_DBL_,goog.math.Long.TWO_PWR_64_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_32_DBL_,goog.math.Long.TWO_PWR_63_DBL_=goog.math.Long.TWO_PWR_64_DBL_/2,goog.math.Long.ZERO=goog.math.Long.fromInt(0),goog.math.Long.ONE=goog.math.Long.fromInt(1),goog.math.Long.NEG_ONE=goog.math.Long.fromInt(-1),goog.math.Long.MAX_VALUE=goog.math.Long.fromBits(-1,2147483647),goog.math.Long.MIN_VALUE=goog.math.Long.fromBits(0,-2147483648),goog.math.Long.TWO_PWR_24_=goog.math.Long.fromInt(1<<24),goog.math.Long.prototype.toInt=function(){return this.low_},goog.math.Long.prototype.toNumber=function(){return this.high_*goog.math.Long.TWO_PWR_32_DBL_+this.getLowBitsUnsigned()},goog.math.Long.prototype.toString=function(a){var b=a||10;if(2>b||b>36)throw Error("radix out of range: "+b);if(this.isZero())return"0";if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){var c=goog.math.Long.fromNumber(b),d=this.div(c),e=d.multiply(c).subtract(this);return d.toString(b)+e.toInt().toString(b)}return"-"+this.negate().toString(b)}for(var f=goog.math.Long.fromNumber(Math.pow(b,6)),e=this,g="";;){var h=e.div(f),i=e.subtract(h.multiply(f)).toInt(),j=i.toString(b);if(e=h,e.isZero())return j+g;for(;j.length<6;)j="0"+j;g=""+j+g}},goog.math.Long.prototype.getHighBits=function(){return this.high_},goog.math.Long.prototype.getLowBits=function(){return this.low_},goog.math.Long.prototype.getLowBitsUnsigned=function(){return this.low_>=0?this.low_:goog.math.Long.TWO_PWR_32_DBL_+this.low_},goog.math.Long.prototype.getNumBitsAbs=function(){if(this.isNegative())return this.equals(goog.math.Long.MIN_VALUE)?64:this.negate().getNumBitsAbs();for(var a=0!=this.high_?this.high_:this.low_,b=31;b>0&&0==(a&1<<b);b--);return 0!=this.high_?b+33:b+1},goog.math.Long.prototype.isZero=function(){return 0==this.high_&&0==this.low_},goog.math.Long.prototype.isNegative=function(){return this.high_<0},goog.math.Long.prototype.isOdd=function(){return 1==(1&this.low_)},goog.math.Long.prototype.equals=function(a){return this.high_==a.high_&&this.low_==a.low_},goog.math.Long.prototype.notEquals=function(a){return this.high_!=a.high_||this.low_!=a.low_},goog.math.Long.prototype.lessThan=function(a){return this.compare(a)<0},goog.math.Long.prototype.lessThanOrEqual=function(a){return this.compare(a)<=0},goog.math.Long.prototype.greaterThan=function(a){return this.compare(a)>0},goog.math.Long.prototype.greaterThanOrEqual=function(a){return this.compare(a)>=0},goog.math.Long.prototype.compare=function(a){if(this.equals(a))return 0;var b=this.isNegative(),c=a.isNegative();return b&&!c?-1:!b&&c?1:this.subtract(a).isNegative()?-1:1},goog.math.Long.prototype.negate=function(){return this.equals(goog.math.Long.MIN_VALUE)?goog.math.Long.MIN_VALUE:this.not().add(goog.math.Long.ONE)},goog.math.Long.prototype.add=function(a){var b=this.high_>>>16,c=65535&this.high_,d=this.low_>>>16,e=65535&this.low_,f=a.high_>>>16,g=65535&a.high_,h=a.low_>>>16,i=65535&a.low_,j=0,k=0,l=0,m=0;return m+=e+i,l+=m>>>16,m&=65535,l+=d+h,k+=l>>>16,l&=65535,k+=c+g,j+=k>>>16,k&=65535,j+=b+f,j&=65535,goog.math.Long.fromBits(l<<16|m,j<<16|k)},goog.math.Long.prototype.subtract=function(a){return this.add(a.negate())},goog.math.Long.prototype.multiply=function(a){if(this.isZero())return goog.math.Long.ZERO;if(a.isZero())return goog.math.Long.ZERO;if(this.equals(goog.math.Long.MIN_VALUE))return a.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO;if(a.equals(goog.math.Long.MIN_VALUE))return this.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO;if(this.isNegative())return a.isNegative()?this.negate().multiply(a.negate()):this.negate().multiply(a).negate();if(a.isNegative())return this.multiply(a.negate()).negate();if(this.lessThan(goog.math.Long.TWO_PWR_24_)&&a.lessThan(goog.math.Long.TWO_PWR_24_))return goog.math.Long.fromNumber(this.toNumber()*a.toNumber());var b=this.high_>>>16,c=65535&this.high_,d=this.low_>>>16,e=65535&this.low_,f=a.high_>>>16,g=65535&a.high_,h=a.low_>>>16,i=65535&a.low_,j=0,k=0,l=0,m=0;return m+=e*i,l+=m>>>16,m&=65535,l+=d*i,k+=l>>>16,l&=65535,l+=e*h,k+=l>>>16,l&=65535,k+=c*i,j+=k>>>16,k&=65535,k+=d*h,j+=k>>>16,k&=65535,k+=e*g,j+=k>>>16,k&=65535,j+=b*i+c*h+d*g+e*f,j&=65535,goog.math.Long.fromBits(l<<16|m,j<<16|k)},goog.math.Long.prototype.div=function(a){if(a.isZero())throw Error("division by zero");if(this.isZero())return goog.math.Long.ZERO;if(this.equals(goog.math.Long.MIN_VALUE)){if(a.equals(goog.math.Long.ONE)||a.equals(goog.math.Long.NEG_ONE))return goog.math.Long.MIN_VALUE;if(a.equals(goog.math.Long.MIN_VALUE))return goog.math.Long.ONE;var b=this.shiftRight(1),c=b.div(a).shiftLeft(1);if(c.equals(goog.math.Long.ZERO))return a.isNegative()?goog.math.Long.ONE:goog.math.Long.NEG_ONE;var d=this.subtract(a.multiply(c)),e=c.add(d.div(a));return e}if(a.equals(goog.math.Long.MIN_VALUE))return goog.math.Long.ZERO;if(this.isNegative())return a.isNegative()?this.negate().div(a.negate()):this.negate().div(a).negate();if(a.isNegative())return this.div(a.negate()).negate();for(var f=goog.math.Long.ZERO,d=this;d.greaterThanOrEqual(a);){for(var c=Math.max(1,Math.floor(d.toNumber()/a.toNumber())),g=Math.ceil(Math.log(c)/Math.LN2),h=48>=g?1:Math.pow(2,g-48),i=goog.math.Long.fromNumber(c),j=i.multiply(a);j.isNegative()||j.greaterThan(d);)c-=h,i=goog.math.Long.fromNumber(c),j=i.multiply(a);i.isZero()&&(i=goog.math.Long.ONE),f=f.add(i),d=d.subtract(j)}return f},goog.math.Long.prototype.modulo=function(a){return this.subtract(this.div(a).multiply(a))},goog.math.Long.prototype.not=function(){return goog.math.Long.fromBits(~this.low_,~this.high_)},goog.math.Long.prototype.and=function(a){return goog.math.Long.fromBits(this.low_&a.low_,this.high_&a.high_)},goog.math.Long.prototype.or=function(a){return goog.math.Long.fromBits(this.low_|a.low_,this.high_|a.high_)},goog.math.Long.prototype.xor=function(a){return goog.math.Long.fromBits(this.low_^a.low_,this.high_^a.high_)},goog.math.Long.prototype.shiftLeft=function(a){if(a&=63,0==a)return this;var b=this.low_;if(32>a){var c=this.high_;return goog.math.Long.fromBits(b<<a,c<<a|b>>>32-a)}return goog.math.Long.fromBits(0,b<<a-32)},goog.math.Long.prototype.shiftRight=function(a){if(a&=63,0==a)return this;var b=this.high_;if(32>a){var c=this.low_;return goog.math.Long.fromBits(c>>>a|b<<32-a,b>>a)}return goog.math.Long.fromBits(b>>a-32,b>=0?0:-1)},goog.math.Long.prototype.shiftRightUnsigned=function(a){if(a&=63,0==a)return this;var b=this.high_;if(32>a){var c=this.low_;return goog.math.Long.fromBits(c>>>a|b<<32-a,b>>>a)}return 32==a?goog.math.Long.fromBits(b,0):goog.math.Long.fromBits(b>>>a-32,0)};var UTF8={};UTF8.encode=function(a){for(var b=[],c=0;c<a.length;++c){var d=a.charCodeAt(c);128>d?b.push(d):2048>d?(b.push(192|d>>6),b.push(128|63&d)):65536>d?(b.push(224|d>>12),b.push(128|63&d>>6),b.push(128|63&d)):(b.push(240|d>>18),b.push(128|63&d>>12),b.push(128|63&d>>6),b.push(128|63&d))}return b},UTF8.decode=function(a){for(var b=[],c=0;c<a.length;){var d=a[c++];128>d||(224>d?(d=(31&d)<<6,d|=63&a[c++]):240>d?(d=(15&d)<<12,d|=(63&a[c++])<<6,d|=63&a[c++]):(d=(7&d)<<18,d|=(63&a[c++])<<12,d|=(63&a[c++])<<6,d|=63&a[c++])),b.push(String.fromCharCode(d))}return b.join("")};var BASE64={};if(function(b){var c=function(a){for(var c=0,d=[],e=0|a.length/3;0<e--;){var f=(a[c]<<16)+(a[c+1]<<8)+a[c+2];c+=3,d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push(b.charAt(63&f>>6)),d.push(b.charAt(63&f))}if(2==a.length-c){var f=(a[c]<<16)+(a[c+1]<<8);d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push(b.charAt(63&f>>6)),d.push("=")}else if(1==a.length-c){var f=a[c]<<16;d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push("==")}return d.join("")},d=function(){for(var a=[],c=0;c<b.length;++c)a[b.charCodeAt(c)]=c;return a["=".charCodeAt(0)]=0,a}(),e=function(a){for(var b=0,c=[],e=0|a.length/4;0<e--;){var f=(d[a.charCodeAt(b)]<<18)+(d[a.charCodeAt(b+1)]<<12)+(d[a.charCodeAt(b+2)]<<6)+d[a.charCodeAt(b+3)];c.push(255&f>>16),c.push(255&f>>8),c.push(255&f),b+=4}return c&&("="==a.charAt(b-2)?(c.pop(),c.pop()):"="==a.charAt(b-1)&&c.pop()),c},f={};f.encode=function(a){for(var b=[],c=0;c<a.length;++c)b.push(a.charCodeAt(c));return b},f.decode=function(){for(var b=0;b<s.length;++b)a[b]=String.fromCharCode(a[b]);return a.join("")},BASE64.decodeArray=function(a){var b=e(a);return new Uint8Array(b)},BASE64.encodeASCII=function(a){var b=f.encode(a);return c(b)},BASE64.decodeASCII=function(a){var b=e(a);return f.decode(b)},BASE64.encode=function(a){var b=UTF8.encode(a);return c(b)},BASE64.decode=function(a){var b=e(a);return UTF8.decode(b)}}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),void 0===btoa)var btoa=BASE64.encode;if(void 0===atob)var atob=BASE64.decode;MediaPlayer=function(a){"use strict";var b,c,d,e,f,g,h,i,j,k,l,m="1.4.0",n="http://time.akamai.com/?iso",o="urn:mpeg:dash:utc:http-xsdate:2014",p=0,q=null,r=null,s=!1,t=!1,u=!0,v=!1,w=MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED,x=!0,y=[],z=4,A=!1,B=function(){return!!d&&!!e},C=function(){if(!s)throw"MediaPlayer not initialized!";if(!this.capabilities.supportsMediaSource())return void this.errHandler.capabilityError("mediasource");if(!d||!e)throw"Missing view or source.";t=!0,this.debug.log("Playback initiated!"),f=b.getObject("streamController"),h.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,f),h.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,f),h.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY,f),h.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,f),h.setLiveDelayAttributes(z,A),f.initialize(u,q,r),l.checkInitialBitrate(),"string"==typeof e?f.load(e):f.loadWithManifest(e),f.setUTCTimingSources(y,x),b.mapValue("scheduleWhilePaused",v),b.mapOutlet("scheduleWhilePaused","stream"),b.mapOutlet("scheduleWhilePaused","scheduleController"),b.mapValue("numOfParallelRequestAllowed",p),b.mapOutlet("numOfParallelRequestAllowed","scheduleController"),b.mapValue("bufferMax",w),b.mapOutlet("bufferMax","bufferController"),g.initialize()},D=function(){B()&&C.call(this)},E=function(){var a=j.getReadOnlyMetricsFor("video")||j.getReadOnlyMetricsFor("audio");return i.getCurrentDVRInfo(a)},F=function(){return E.call(this).manifestInfo.DVRWindowSize},G=function(a){var b=E.call(this),c=b.range.start+a;return c>b.range.end&&(c=b.range.end),c},H=function(a){this.getVideoModel().getElement().currentTime=this.getDVRSeekOffset(a)},I=function(){var a=E.call(this);return null===a?0:this.duration()-(a.range.end-a.time)},J=function(){var a,b=E.call(this);return null===b?0:(a=b.range.end-b.range.start,a<b.manifestInfo.DVRWindowSize?a:b.manifestInfo.DVRWindowSize)},K=function(a){var b,c,d=E.call(this);return null===d?0:(b=d.manifestInfo.availableFrom.getTime()/1e3,c=a+(b+d.range.start))},L=function(){return K.call(this,this.time())},M=function(){return K.call(this,this.duration())},N=function(a,b,c){var d=new Date(1e3*a),e=d.toLocaleDateString(b),f=d.toLocaleTimeString(b,{hour12:c});return f+" "+e},O=function(a){a=Math.max(a,0);var b=Math.floor(a/3600),c=Math.floor(a%3600/60),d=Math.floor(a%3600%60);return(0===b?"":10>b?"0"+b.toString()+":":b.toString()+":")+(10>c?"0"+c.toString():c.toString())+":"+(10>d?"0"+d.toString():d.toString())},P=function(a,b,c){b&&void 0!==a&&null!==a&&(c?g.setRules(a,b):g.addRules(a,b))},Q=function(){t&&f&&(h.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,f),h.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,f),h.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY,f),h.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,f),f.reset(),c.reset(),g.reset(),h.reset(),f=null,t=!1)},R=dijon.System.prototype.getObject;return dijon.System.prototype.getObject=function(a){var b=R.call(this,a);return"object"!=typeof b||b.getName||(b.getName=function(){return a},b.setMediaType=function(a){b.mediaType=a},b.getMediaType=function(){return b.mediaType}),b},b=new dijon.System,b.mapValue("system",b),b.mapOutlet("system"),b.injectInto(a),{notifier:void 0,debug:void 0,eventBus:void 0,capabilities:void 0,adapter:void 0,errHandler:void 0,uriQueryFragModel:void 0,videoElementExt:void 0,setup:function(){i=b.getObject("metricsExt"),c=b.getObject("abrController"),g=b.getObject("rulesController"),j=b.getObject("metricsModel"),l=b.getObject("DOMStorage"),h=b.getObject("playbackController"),this.restoreDefaultUTCTimingSources()},addEventListener:function(a,b,c){a=a.toLowerCase(),this.eventBus.addEventListener(a,b,c)},removeEventListener:function(a,b,c){a=a.toLowerCase(),this.eventBus.removeEventListener(a,b,c)},getVersion:function(){return m},startup:function(){s||(b.injectInto(this),s=!0)},getDebug:function(){return this.debug},getVideoModel:function(){return k},setLiveDelayFragmentCount:function(a){z=a},useSuggestedPresentationDelay:function(a){A=a},enableLastBitrateCaching:function(a,b){l.enableLastBitrateCaching(a,b)},setNumOfParallelRequestAllowed:function(a){p=a},setMaxAllowedBitrateFor:function(a,b){c.setMaxAllowedBitrateFor(a,b)},getMaxAllowedBitrateFor:function(a){return c.getMaxAllowedBitrateFor(a)},setAutoPlay:function(a){u=a},getAutoPlay:function(){return u},setScheduleWhilePaused:function(a){v=a},getScheduleWhilePaused:function(){return v},setBufferMax:function(a){w=a},getBufferMax:function(){return w},getMetricsExt:function(){return i},getMetricsFor:function(a){return j.getReadOnlyMetricsFor(a)},getQualityFor:function(a){return c.getQualityFor(a,f.getActiveStreamInfo())},setQualityFor:function(a,b){c.setPlaybackQuality(a,f.getActiveStreamInfo(),b)},getBitrateInfoListFor:function(a){var b=f.getActiveStreamInfo(),c=f.getStreamById(b.id);return c.getBitrateListFor(a)},setInitialBitrateFor:function(a,b){c.setInitialBitrateFor(a,b)},getInitialBitrateFor:function(a){return c.getInitialBitrateFor(a)},getAutoSwitchQuality:function(){return c.getAutoSwitchBitrate()},setAutoSwitchQuality:function(a){c.setAutoSwitchBitrate(a)},setSchedulingRules:function(a){P.call(this,g.SCHEDULING_RULE,a,!0)},addSchedulingRules:function(a){P.call(this,g.SCHEDULING_RULE,a,!1)},setABRRules:function(a){P.call(this,g.ABR_RULE,a,!0)},addABRRules:function(a){P.call(this,g.ABR_RULE,a,!1)},createProtection:function(){return b.getObject("protectionController")},retrieveManifest:function(a,c){!function(a){var d=b.getObject("manifestLoader"),e=b.getObject("uriQueryFragModel"),f={};f[MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED]=function(a){a.error?c(null,a.error):c(a.data.manifest),d.unsubscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this)},d.subscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,f),d.load(e.parseURI(a))}(a)},addUTCTimingSource:function(a,b){this.removeUTCTimingSource(a,b);var c=new Dash.vo.UTCTiming;c.schemeIdUri=a,c.value=b,y.push(c)},removeUTCTimingSource:function(a,b){y.forEach(function(c,d){c.schemeIdUri===a&&c.value===b&&y.splice(d,1)})},clearDefaultUTCTimingSources:function(){y=[]},restoreDefaultUTCTimingSources:function(){this.addUTCTimingSource(o,n)},enableManifestDateHeaderTimeSource:function(a){x=a},attachView:function(a){if(!s)throw"MediaPlayer not initialized!";d=a,k=null,d&&(k=b.getObject("videoModel"),k.setElement(d)),Q.call(this),B.call(this)&&D.call(this)},attachSource:function(a,b,c){if(!s)throw"MediaPlayer not initialized!";"string"==typeof a?(this.uriQueryFragModel.reset(),e=this.uriQueryFragModel.parseURI(a)):e=a,q=b,r=c,Q.call(this),B.call(this)&&D.call(this)},reset:function(){this.attachSource(null),this.attachView(null),q=null,r=null},play:C,isReady:B,seek:H,time:I,duration:J,timeAsUTC:L,durationAsUTC:M,getDVRWindowSize:F,getDVRSeekOffset:G,formatUTC:N,convertToTimeCode:O}},MediaPlayer.prototype={constructor:MediaPlayer},MediaPlayer.dependencies={},MediaPlayer.dependencies.protection={},MediaPlayer.dependencies.protection.servers={},MediaPlayer.utils={},MediaPlayer.models={},MediaPlayer.vo={},MediaPlayer.vo.metrics={},MediaPlayer.vo.protection={},MediaPlayer.rules={},MediaPlayer.di={},MediaPlayer.events={METRICS_CHANGED:"metricschanged",METRIC_CHANGED:"metricchanged",METRIC_UPDATED:"metricupdated",METRIC_ADDED:"metricadded",MANIFEST_LOADED:"manifestloaded",STREAM_SWITCH_STARTED:"streamswitchstarted",STREAM_SWITCH_COMPLETED:"streamswitchcompleted",STREAM_INITIALIZED:"streaminitialized",TEXT_TRACK_ADDED:"texttrackadded",BUFFER_LOADED:"bufferloaded",BUFFER_EMPTY:"bufferstalled",ERROR:"error",LOG:"log"},MediaPlayer.di.Context=function(){"use strict";var a=function(){var a=document.createElement("video");if(MediaPlayer.models.ProtectionModel_21Jan2015.detect(a))this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_21Jan2015);else if(MediaPlayer.models.ProtectionModel_3Feb2014.detect(a))this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_3Feb2014);else if(MediaPlayer.models.ProtectionModel_01b.detect(a))this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_01b);else{var b=this.system.getObject("debug");b.log("No supported version of EME detected on this user agent!"),b.log("Attempts to play encrypted content will fail!")}};return{system:void 0,setup:function(){this.system.autoMapOutlets=!0,this.system.mapSingleton("debug",MediaPlayer.utils.Debug),this.system.mapSingleton("eventBus",MediaPlayer.utils.EventBus),this.system.mapSingleton("capabilities",MediaPlayer.utils.Capabilities),this.system.mapSingleton("DOMStorage",MediaPlayer.utils.DOMStorage),this.system.mapClass("customTimeRanges",MediaPlayer.utils.CustomTimeRanges),this.system.mapSingleton("virtualBuffer",MediaPlayer.utils.VirtualBuffer),this.system.mapSingleton("textTrackExtensions",MediaPlayer.utils.TextTrackExtensions),this.system.mapSingleton("vttParser",MediaPlayer.utils.VTTParser),this.system.mapSingleton("ttmlParser",MediaPlayer.utils.TTMLParser),this.system.mapSingleton("videoModel",MediaPlayer.models.VideoModel),this.system.mapSingleton("manifestModel",MediaPlayer.models.ManifestModel),this.system.mapSingleton("metricsModel",MediaPlayer.models.MetricsModel),this.system.mapSingleton("uriQueryFragModel",MediaPlayer.models.URIQueryAndFragmentModel),this.system.mapSingleton("ksPlayReady",MediaPlayer.dependencies.protection.KeySystem_PlayReady),this.system.mapSingleton("ksWidevine",MediaPlayer.dependencies.protection.KeySystem_Widevine),this.system.mapSingleton("ksClearKey",MediaPlayer.dependencies.protection.KeySystem_ClearKey),this.system.mapSingleton("serverPlayReady",MediaPlayer.dependencies.protection.servers.PlayReady),this.system.mapSingleton("serverWidevine",MediaPlayer.dependencies.protection.servers.Widevine),this.system.mapSingleton("serverClearKey",MediaPlayer.dependencies.protection.servers.ClearKey),this.system.mapSingleton("serverDRMToday",MediaPlayer.dependencies.protection.servers.DRMToday),this.system.mapSingleton("requestModifierExt",MediaPlayer.dependencies.RequestModifierExtensions),this.system.mapSingleton("textSourceBuffer",MediaPlayer.dependencies.TextSourceBuffer),this.system.mapSingleton("mediaSourceExt",MediaPlayer.dependencies.MediaSourceExtensions),this.system.mapSingleton("sourceBufferExt",MediaPlayer.dependencies.SourceBufferExtensions),this.system.mapSingleton("abrController",MediaPlayer.dependencies.AbrController),this.system.mapSingleton("errHandler",MediaPlayer.dependencies.ErrorHandler),this.system.mapSingleton("videoExt",MediaPlayer.dependencies.VideoModelExtensions),this.system.mapSingleton("protectionExt",MediaPlayer.dependencies.ProtectionExtensions),this.system.mapClass("protectionController",MediaPlayer.dependencies.ProtectionController),this.system.mapSingleton("playbackController",MediaPlayer.dependencies.PlaybackController),a.call(this),this.system.mapSingleton("liveEdgeFinder",MediaPlayer.dependencies.LiveEdgeFinder),this.system.mapClass("metrics",MediaPlayer.models.MetricsList),this.system.mapClass("insufficientBufferRule",MediaPlayer.rules.InsufficientBufferRule),this.system.mapClass("bufferOccupancyRule",MediaPlayer.rules.BufferOccupancyRule),this.system.mapClass("throughputRule",MediaPlayer.rules.ThroughputRule),this.system.mapSingleton("abrRulesCollection",MediaPlayer.rules.ABRRulesCollection),this.system.mapSingleton("rulesController",MediaPlayer.rules.RulesController),this.system.mapClass("bufferLevelRule",MediaPlayer.rules.BufferLevelRule),this.system.mapClass("pendingRequestsRule",MediaPlayer.rules.PendingRequestsRule),this.system.mapClass("playbackTimeRule",MediaPlayer.rules.PlaybackTimeRule),this.system.mapClass("sameTimeRequestRule",MediaPlayer.rules.SameTimeRequestRule),this.system.mapClass("abandonRequestRule",MediaPlayer.rules.AbandonRequestsRule),this.system.mapSingleton("scheduleRulesCollection",MediaPlayer.rules.ScheduleRulesCollection),this.system.mapClass("liveEdgeBinarySearchRule",MediaPlayer.rules.LiveEdgeBinarySearchRule),this.system.mapClass("liveEdgeWithTimeSynchronizationRule",MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule),this.system.mapSingleton("synchronizationRulesCollection",MediaPlayer.rules.SynchronizationRulesCollection),this.system.mapSingleton("xlinkController",MediaPlayer.dependencies.XlinkController),
this.system.mapSingleton("xlinkLoader",MediaPlayer.dependencies.XlinkLoader),this.system.mapClass("streamProcessor",MediaPlayer.dependencies.StreamProcessor),this.system.mapClass("eventController",MediaPlayer.dependencies.EventController),this.system.mapClass("textController",MediaPlayer.dependencies.TextController),this.system.mapClass("bufferController",MediaPlayer.dependencies.BufferController),this.system.mapClass("manifestLoader",MediaPlayer.dependencies.ManifestLoader),this.system.mapSingleton("manifestUpdater",MediaPlayer.dependencies.ManifestUpdater),this.system.mapClass("fragmentController",MediaPlayer.dependencies.FragmentController),this.system.mapClass("fragmentLoader",MediaPlayer.dependencies.FragmentLoader),this.system.mapClass("fragmentModel",MediaPlayer.dependencies.FragmentModel),this.system.mapSingleton("streamController",MediaPlayer.dependencies.StreamController),this.system.mapClass("stream",MediaPlayer.dependencies.Stream),this.system.mapClass("scheduleController",MediaPlayer.dependencies.ScheduleController),this.system.mapSingleton("timeSyncController",MediaPlayer.dependencies.TimeSyncController),this.system.mapSingleton("notifier",MediaPlayer.dependencies.Notifier)}}},Dash=function(){"use strict";return{modules:{},dependencies:{},vo:{},di:{}}}(),Dash.di.DashContext=function(){"use strict";return{system:void 0,setup:function(){Dash.di.DashContext.prototype.setup.call(this),this.system.mapClass("parser",Dash.dependencies.DashParser),this.system.mapClass("indexHandler",Dash.dependencies.DashHandler),this.system.mapSingleton("baseURLExt",Dash.dependencies.BaseURLExtensions),this.system.mapClass("fragmentExt",Dash.dependencies.FragmentExtensions),this.system.mapClass("trackController",Dash.dependencies.RepresentationController),this.system.mapSingleton("manifestExt",Dash.dependencies.DashManifestExtensions),this.system.mapSingleton("metricsExt",Dash.dependencies.DashMetricsExtensions),this.system.mapSingleton("timelineConverter",Dash.dependencies.TimelineConverter),this.system.mapSingleton("adapter",Dash.dependencies.DashAdapter)}}},Dash.di.DashContext.prototype=new MediaPlayer.di.Context,Dash.di.DashContext.prototype.constructor=Dash.di.DashContext,Dash.dependencies.DashAdapter=function(){"use strict";var a=[],b={},c=function(a,b){return b.getRepresentationForQuality(a.quality)},d=function(a){return b[a.streamInfo.id][a.index]},e=function(b){var c,d=a.length,e=0;for(e;d>e;e+=1)if(c=a[e],b.id===c.id)return c;return null},f=function(a,b){var c=new MediaPlayer.vo.TrackInfo,d=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index],e=this.manifestExt.getRepresentationFor(b.index,d);return c.id=b.id,c.quality=b.index,c.bandwidth=this.manifestExt.getBandwidth(e),c.DVRWindow=b.segmentAvailabilityRange,c.fragmentDuration=b.segmentDuration||(b.segments&&b.segments.length>0?b.segments[0].duration:0/0),c.MSETimeOffset=b.MSETimeOffset,c.useCalculatedLiveEdgeTime=b.useCalculatedLiveEdgeTime,c.mediaInfo=g.call(this,a,b.adaptation),c},g=function(a,b){var c=new MediaPlayer.vo.MediaInfo,d=this,e=b.period.mpd.manifest.Period_asArray[b.period.index].AdaptationSet_asArray[b.index];return c.id=b.id,c.index=b.index,c.type=b.type,c.streamInfo=h.call(this,a,b.period),c.trackCount=this.manifestExt.getRepresentationCount(e),c.lang=this.manifestExt.getLanguageForAdaptation(e),c.codec=this.manifestExt.getCodec(e),c.mimeType=this.manifestExt.getMimeType(e),c.contentProtection=this.manifestExt.getContentProtectionData(e),c.bitrateList=this.manifestExt.getBitrateListForAdaptation(e),c.contentProtection&&c.contentProtection.forEach(function(a){a.KID=d.manifestExt.getKID(a)}),c.isText=this.manifestExt.getIsTextTrack(c.mimeType),c},h=function(a,b){var c=new MediaPlayer.vo.StreamInfo,d=1;return c.id=b.id,c.index=b.index,c.start=b.start,c.duration=b.duration,c.manifestInfo=i.call(this,a,b.mpd),c.isLast=1===a.Period_asArray.length||Math.abs(c.start+c.duration-c.manifestInfo.duration)<d,c},i=function(a,b){var c=new MediaPlayer.vo.ManifestInfo;return c.DVRWindowSize=b.timeShiftBufferDepth,c.loadedTime=b.manifest.loadedTime,c.availableFrom=b.availabilityStartTime,c.minBufferTime=b.manifest.minBufferTime,c.maxFragmentDuration=b.maxSegmentDuration,c.duration=this.manifestExt.getDuration(a),c.isDynamic=this.manifestExt.getIsDynamic(a),c},j=function(a,c,d){var f,h=e(c),i=h.id,j=this.manifestExt.getAdaptationForType(a,c.index,d);return j?(f=this.manifestExt.getIndexForAdaptation(j,a,c.index),b[i]=b[i]||this.manifestExt.getAdaptationsForPeriod(a,h),g.call(this,a,b[i][f])):null},k=function(c){var d,e,f,g=[];if(!c)return null;for(d=this.manifestExt.getMpd(c),a=this.manifestExt.getRegularPeriods(c,d),d.checkTime=this.manifestExt.getCheckTime(c,a[0]),b={},e=a.length,f=0;e>f;f+=1)g.push(h.call(this,c,a[f]));return g},l=function(a){var b=this.manifestExt.getMpd(a);return i.call(this,a,b)},m=function(a,b){var c=a.trackController.getRepresentationForQuality(b);return a.indexHandler.getInitRequest(c)},n=function(a,b){var d=c(b,a.trackController);return a.indexHandler.getNextSegmentRequest(d)},o=function(a,b,d,e){var f=c(b,a.trackController);return a.indexHandler.getSegmentRequestForTime(f,d,e)},p=function(a,b,d){var e=c(b,a.trackController);return a.indexHandler.generateSegmentRequestForTime(e,d)},q=function(a){return a.indexHandler.getCurrentTime()},r=function(a,b){return a.indexHandler.setCurrentTime(b)},s=function(a,b){var c,f,g=e(b.getStreamInfo()),h=b.getMediaInfo(),i=d(h),j=b.getType();c=h.id,f=c?this.manifestExt.getAdaptationForId(c,a,g.index):this.manifestExt.getAdaptationForIndex(h.index,a,g.index),b.trackController.updateData(f,i,j)},t=function(a,b,c){var d=b.getRepresentationForQuality(c);return d?f.call(this,a,d):null},u=function(a,b){var c=b.getCurrentRepresentation();return c?f.call(this,a,c):null},v=function(a,b,c){var d=new Dash.vo.Event,e=a[0],f=a[1],g=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=c*g+h;return b[e]?(d.eventStream=b[e],d.eventStream.value=f,d.eventStream.timescale=g,d.duration=i,d.id=j,d.presentationTime=l,d.messageData=k,d.presentationTimeDelta=h,d):null},w=function(a,b,f){var g=[];return b instanceof MediaPlayer.vo.StreamInfo?g=this.manifestExt.getEventsForPeriod(a,e(b)):b instanceof MediaPlayer.vo.MediaInfo?g=this.manifestExt.getEventStreamForAdaptationSet(a,d(b)):b instanceof MediaPlayer.vo.TrackInfo&&(g=this.manifestExt.getEventStreamForRepresentation(a,c(b,f.trackController))),g};return{system:void 0,manifestExt:void 0,timelineConverter:void 0,metricsList:{TCP_CONNECTION:"TcpConnection",HTTP_REQUEST:"HttpRequest",HTTP_REQUEST_TRACE:"HttpRequestTrace",TRACK_SWITCH:"RepresentationSwitch",BUFFER_LEVEL:"BufferLevel",BUFFER_STATE:"BufferState",DVR_INFO:"DVRInfo",DROPPED_FRAMES:"DroppedFrames",SCHEDULING_INFO:"SchedulingInfo",MANIFEST_UPDATE:"ManifestUpdate",MANIFEST_UPDATE_STREAM_INFO:"ManifestUpdatePeriodInfo",MANIFEST_UPDATE_TRACK_INFO:"ManifestUpdateRepresentationInfo",PLAY_LIST:"PlayList",PLAY_LIST_TRACE:"PlayListTrace"},convertDataToTrack:f,convertDataToMedia:g,convertDataToStream:h,getDataForTrack:c,getDataForMedia:d,getDataForStream:e,getStreamsInfo:k,getManifestInfo:l,getMediaInfoForType:j,getCurrentTrackInfo:u,getTrackInfoForQuality:t,updateData:s,getInitRequest:m,getNextFragmentRequest:n,getFragmentRequestForTime:o,generateFragmentRequestForTime:p,getIndexHandlerTime:q,setIndexHandlerTime:r,getEventsFor:w,getEvent:v,reset:function(){a=[],b={}}}},Dash.dependencies.DashAdapter.prototype={constructor:Dash.dependencies.DashAdapter},Dash.create=function(a,b,c){if("undefined"==typeof a||"VIDEO"!=a.nodeName)return null;var d,e=a.id||a.name||"video element";if(c=c||new Dash.di.DashContext,b=b||[].slice.call(a.querySelectorAll("source")).filter(function(a){return a.type==Dash.supportedManifestMimeTypes.mimeType})[0],void 0===b&&a.src)b=document.createElement("source"),b.src=a.src;else if(void 0===b&&!a.src)return null;return d=new MediaPlayer(c),d.startup(),d.attachView(a),d.setAutoPlay(a.autoplay),d.attachSource(b.src),d.getDebug().log("Converted "+e+" to dash.js player and added content: "+b.src),d},Dash.createAll=function(a,b,c){var d=[];a=a||".dashjs-player",b=b||document,c=c||new Dash.di.DashContext;for(var e=b.querySelectorAll(a),f=0;f<e.length;f++){var g=Dash.create(e[f],void 0,c);d.push(g)}return d},Dash.supportedManifestMimeTypes={mimeType:"application/dash+xml"},Dash.dependencies.DashHandler=function(){"use strict";var a,b,c,d=-1,e=0,f=new RegExp("^(?:(?:[a-z]+:)?/)?/","i"),g=function(a,b){for(;a.length<b;)a="0"+a;return a},h=function(a,b,c){for(var d,e,f,h,i,j,k=b.length,l="%0",m=l.length;;){if(d=a.indexOf("$"+b),0>d)return a;if(e=a.indexOf("$",d+k),0>e)return a;if(f=a.indexOf(l,d+k),f>d&&e>f)switch(h=a.charAt(e-1),i=parseInt(a.substring(f+m,e-1),10),h){case"d":case"i":case"u":j=g(c.toString(),i);break;case"x":j=g(c.toString(16),i);break;case"X":j=g(c.toString(16),i).toUpperCase();break;case"o":j=g(c.toString(8),i);break;default:return this.log("Unsupported/invalid IEEE 1003.1 format identifier string in URL"),a}else j=c;a=a.substring(0,d)+j+a.substring(e+1)}},i=function(a){return a.split("$").join("$")},j=function(a,b){if(null===b||-1===a.indexOf("$RepresentationID$"))return a;var c=b.toString();return a.split("$RepresentationID$").join(c)},k=function(a,b){return a.representation.startNumber+b},l=function(a,b){var c,d=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].BaseURL;return c=a===d?a:f.test(a)?a:d+a},m=function(a,c){var d,e,f=this,g=new MediaPlayer.vo.FragmentRequest;return d=a.adaptation.period,g.mediaType=c,g.type="Initialization Segment",g.url=l(a.initialization,a),g.range=a.range,e=d.start,g.availabilityStartTime=f.timelineConverter.calcAvailabilityStartTimeFromPresentationTime(e,a.adaptation.period.mpd,b),g.availabilityEndTime=f.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(e+d.duration,d.mpd,b),g.quality=a.index,g},n=function(a){var b,d=this;return a?b=m.call(d,a,c):null},o=function(a){var c,e,f,g=a.adaptation.period,h=!1;return 0>d?h=!1:b||d<a.availableSegmentsNumber?(e=B(d,a),e&&(f=e.presentationStartTime-g.start,c=a.adaptation.period.duration,this.log(a.segmentInfoType+": "+f+" / "+c),h=f>=c)):h=!0,h},p=function(a,c){var d,e,f,g,h=this;return e=a.segmentDuration,isNaN(e)&&(e=a.adaptation.period.duration),f=a.adaptation.period.start+c*e,g=f+e,d=new Dash.vo.Segment,d.representation=a,d.duration=e,d.presentationStartTime=f,d.mediaStartTime=h.timelineConverter.calcMediaTimeFromPresentationTime(d.presentationStartTime,a),d.availabilityStartTime=h.timelineConverter.calcAvailabilityStartTimeFromPresentationTime(d.presentationStartTime,a.adaptation.period.mpd,b),d.availabilityEndTime=h.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(g,a.adaptation.period.mpd,b),d.wallStartTime=h.timelineConverter.calcWallTimeForSegment(d,b),d.replacementNumber=k(d,c),d.availabilityIdx=c,d},q=function(b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q=this,r=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].SegmentTemplate,s=r.SegmentTimeline,v=b.availableSegmentsNumber>0,w=10,x=[],y=0,z=0,A=-1,B=function(a){return u.call(q,b,y,a.d,p,r.media,a.mediaRange,A)};for(p=b.timescale,c=s.S_asArray,k=t.call(q,b),k?(n=k.start,o=k.end):m=q.timelineConverter.calcMediaTimeFromPresentationTime(a||0,b),e=0,f=c.length;f>e;e+=1)if(d=c[e],h=0,d.hasOwnProperty("r")&&(h=d.r),d.hasOwnProperty("t")&&(y=d.t,z=y/p),0>h&&(j=c[e+1],j&&j.hasOwnProperty("t")?i=j.t/p:(i=q.timelineConverter.calcMediaTimeFromPresentationTime(b.segmentAvailabilityRange.end,b),b.segmentDuration=d.d/p),h=Math.ceil((i-z)/(d.d/p))-1),l){if(v)break;A+=h+1}else for(g=0;h>=g;g+=1){if(A+=1,k){if(A>o){if(l=!0,v)break;continue}A>=n&&x.push(B.call(q,d))}else{if(x.length>w){if(l=!0,v)break;continue}z>=m-d.d/p&&x.push(B.call(q,d))}y+=d.d,z=y/p}return v||(b.availableSegmentsNumber=A+1),x},r=function(a){var c,d,e,f,g,i=[],j=this,k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].SegmentTemplate,l=a.segmentDuration,m=a.segmentAvailabilityRange,n=null,o=null;for(g=a.startNumber,c=isNaN(l)&&!b?{start:g,end:g}:s.call(j,a),e=c.start,f=c.end,d=e;f>=d;d+=1)n=p.call(j,a,d),n.replacementTime=(g+d-1)*a.segmentDuration,o=k.media,o=h(o,"Number",n.replacementNumber),o=h(o,"Time",n.replacementTime),n.media=o,i.push(n),n=null;return a.availableSegmentsNumber=isNaN(l)?1:Math.ceil((m.end-m.start)/l),i},s=function(c){var e,f,g,h=this,i=c.segmentDuration,j=c.adaptation.period.mpd.manifest.minBufferTime,k=c.segmentAvailabilityRange,l={start:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,k.start),end:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,k.end)},m=0/0,n=null,o=c.segments,p=2*i,q=Math.max(2*j,10*i);return l||(l=h.timelineConverter.calcSegmentAvailabilityRange(c,b)),l.start=Math.max(l.start,0),b&&!h.timelineConverter.isTimeSyncCompleted()?(e=Math.floor(l.start/i),f=Math.floor(l.end/i),g={start:e,end:f}):(o&&o.length>0?(n=B(d,c),m=n?h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,n.presentationStartTime):d>0?d*i:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,a||o[0].presentationStartTime)):m=d>0?d*i:b?l.end:l.start,e=Math.floor(Math.max(m-p,l.start)/i),f=Math.floor(Math.min(e+q/i,l.end/i)),g={start:e,end:f})},t=function(){var c,e,f,g=2,h=10,i=0,j=Number.POSITIVE_INFINITY;return b&&!this.timelineConverter.isTimeSyncCompleted()?f={start:i,end:j}:!b&&a||0>d?null:(c=Math.max(d-g,i),e=Math.min(d+h,j),f={start:c,end:e})},u=function(a,c,d,e,f,g,i){var j,l,m,n=this,o=c/e,p=Math.min(d/e,a.adaptation.period.mpd.maxSegmentDuration);return j=n.timelineConverter.calcPresentationTimeFromMediaTime(o,a),l=j+p,m=new Dash.vo.Segment,m.representation=a,m.duration=p,m.mediaStartTime=o,m.presentationStartTime=j,m.availabilityStartTime=a.adaptation.period.mpd.manifest.loadedTime,m.availabilityEndTime=n.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(l,a.adaptation.period.mpd,b),m.wallStartTime=n.timelineConverter.calcWallTimeForSegment(m,b),m.replacementTime=c,m.replacementNumber=k(m,i),f=h(f,"Number",m.replacementNumber),f=h(f,"Time",m.replacementTime),m.media=f,m.mediaRange=g,m.availabilityIdx=i,m},v=function(a){var b,c,d,e,f,g,h,i=this,j=[],k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].SegmentList,l=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].BaseURL,m=k.SegmentURL_asArray.length;for(h=a.startNumber,e=s.call(i,a),f=Math.max(e.start,0),g=Math.min(e.end,k.SegmentURL_asArray.length-1),b=f;g>=b;b+=1)d=k.SegmentURL_asArray[b],c=p.call(i,a,b),c.replacementTime=(h+b-1)*a.segmentDuration,c.media=d.media?d.media:l,c.mediaRange=d.mediaRange,c.index=d.index,c.indexRange=d.indexRange,j.push(c),c=null;return a.availableSegmentsNumber=m,j},w=function(a){var b,c=this,d=a.segmentInfoType;return"SegmentBase"!==d&&"BaseURL"!==d&&C.call(c,a)?("SegmentTimeline"===d?b=q.call(c,a):"SegmentTemplate"===d?b=r.call(c,a):"SegmentList"===d&&(b=v.call(c,a)),x.call(c,a,b)):b=a.segments,b},x=function(a,c){var d,e,f,g;a.segments=c,d=c.length-1,b&&isNaN(this.timelineConverter.getExpectedLiveEdge())&&(g=c[d],e=g.presentationStartTime,f=this.metricsModel.getMetricsFor("stream"),this.timelineConverter.setExpectedLiveEdge(e),this.metricsModel.updateManifestUpdateInfo(this.metricsExt.getCurrentManifestUpdate(f),{presentationStartTime:e}))},y=function(a){var b=this;if(!a)throw new Error("no representation");return a.segments=null,w.call(b,a),a},z=function(a,e){var f,g=this,h=a.initialization,i="BaseURL"!==a.segmentInfoType&&"SegmentBase"!==a.segmentInfoType;return a.segmentDuration||a.segments||y.call(g,a),a.segmentAvailabilityRange=null,a.segmentAvailabilityRange=g.timelineConverter.calcSegmentAvailabilityRange(a,b),a.segmentAvailabilityRange.end<a.segmentAvailabilityRange.start&&!a.useCalculatedLiveEdgeTime?(f=new MediaPlayer.vo.Error(Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE,"no segments are available yet",{availabilityDelay:Math.abs(a.segmentAvailabilityRange.end)}),void g.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:a},f)):(e||(d=-1),a.segmentDuration&&y.call(g,a),h||g.baseURLExt.loadInitialization(a),i||g.baseURLExt.loadSegments(a,c,a.indexRange),void(h&&i&&g.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:a})))},A=function(a,b,c){var d,e,f,g,h,i=b.segments,j=i?i.length:null,k=-1;if(i&&j>0)for(h=0;j>h;h+=1)if(e=i[h],f=e.presentationStartTime,g=e.duration,d=void 0===c||null===c?g/2:c,a+d>=f&&f+g>a-d){k=e.availabilityIdx;break}return k},B=function(a,b){if(!b||!b.segments)return null;var c,d,e=b.segments.length;for(d=0;e>d;d+=1)if(c=b.segments[d],c.availabilityIdx===a)return c;return null},C=function(a){var b,c,e=!1,f=a.segments;return f&&0!==f.length?(c=f[0].availabilityIdx,b=f[f.length-1].availabilityIdx,e=c>d||d>b):e=!0,e},D=function(a){if(null===a||void 0===a)return null;var b,d=new MediaPlayer.vo.FragmentRequest,e=a.representation,f=e.adaptation.period.mpd.manifest.Period_asArray[e.adaptation.period.index].AdaptationSet_asArray[e.adaptation.index].Representation_asArray[e.index].bandwidth;return b=l(a.media,e),b=h(b,"Number",a.replacementNumber),b=h(b,"Time",a.replacementTime),b=h(b,"Bandwidth",f),b=j(b,e.id),b=i(b),d.mediaType=c,d.type="Media Segment",d.url=b,d.range=a.mediaRange,d.startTime=a.presentationStartTime,d.duration=a.duration,d.timescale=e.timescale,d.availabilityStartTime=a.availabilityStartTime,d.availabilityEndTime=a.availabilityEndTime,d.wallStartTime=a.wallStartTime,d.quality=e.index,d.index=a.availabilityIdx,d},E=function(b,e,f){var g,h,i,j=d,k=f?f.keepIdx:!1,l=f?f.timeThreshold:null,m=f&&f.ignoreIsFinished?!0:!1,n=this;return b?(a=e,n.log("Getting the request for time: "+e),d=A.call(n,e,b,l),w.call(n,b),0>d&&(d=A.call(n,e,b,l)),n.log("Index for time "+e+" is "+d),i=m?!1:o.call(n,b),i?(g=new MediaPlayer.vo.FragmentRequest,g.action=g.ACTION_COMPLETE,g.index=d,g.mediaType=c,n.log("Signal complete."),n.log(g)):(h=B(d,b),g=D.call(n,h)),k&&(d=j),g):null},F=function(a,b){var c=(a.segmentAvailabilityRange.end-a.segmentAvailabilityRange.start)/2;return a.segments=null,a.segmentAvailabilityRange={start:b-c,end:b+c},E.call(this,a,b,{keepIdx:!1,ignoreIsFinished:!0})},G=function(b){var e,f,g,h,i=this;if(!b)return null;if(-1===d)throw"You must call getSegmentRequestForTime first.";return a=null,d+=1,h=d,g=o.call(i,b),g?(e=new MediaPlayer.vo.FragmentRequest,e.action=e.ACTION_COMPLETE,e.index=h,e.mediaType=c,i.log("Signal complete.")):(w.call(i,b),f=B(h,b),e=D.call(i,f)),e},H=function(a){var b=a.data.representation;b.segments&&this.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:b})},I=function(a){if(!a.error&&c===a.data.mediaType){var b,d,e,f,g=this,h=a.data.segments,i=a.data.representation,j=[],k=0;for(b=0,d=h.length;d>b;b+=1)e=h[b],f=u.call(g,i,e.startTime,e.duration,e.timescale,e.media,e.mediaRange,k),j.push(f),f=null,k+=1;i.segmentAvailabilityRange={start:j[0].presentationStartTime,end:j[d-1].presentationStartTime},i.availableSegmentsNumber=d,x.call(g,i,j),i.initialization&&this.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:i})}};return{log:void 0,baseURLExt:void 0,timelineConverter:void 0,metricsModel:void 0,metricsExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED]=H,this[Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED]=I},initialize:function(a){this.subscribe(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,a.trackController),c=a.getType(),this.setMediaType(c),b=a.isDynamic(),this.streamProcessor=a},getType:function(){return c},setType:function(a){c=a},getIsDynamic:function(){return b},setIsDynamic:function(a){b=a},setCurrentTime:function(a){e=a},getCurrentTime:function(){return e},reset:function(){e=0,a=void 0,d=-1,b=void 0,this.unsubscribe(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,this.streamProcessor.trackController)},getInitRequest:n,getSegmentRequestForTime:E,getNextSegmentRequest:G,generateSegmentRequestForTime:F,updateRepresentation:z}},Dash.dependencies.DashHandler.prototype={constructor:Dash.dependencies.DashHandler},Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE=1,Dash.dependencies.DashHandler.eventList={ENAME_REPRESENTATION_UPDATED:"representationUpdated"},Dash.dependencies.DashParser=function(){"use strict";var a=31536e3,b=2592e3,c=86400,d=3600,e=60,f=60,g=1e3,h=/^([-])?P(([\d.]*)Y)?(([\d.]*)M)?(([\d.]*)D)?T?(([\d.]*)H)?(([\d.]*)M)?(([\d.]*)S)?/,i=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/,j=/^[-+]?[0-9]+[.]?[0-9]*([eE][-+]?[0-9]+)?$/,k=[{type:"duration",test:function(a){for(var b=["minBufferTime","mediaPresentationDuration","minimumUpdatePeriod","timeShiftBufferDepth","maxSegmentDuration","maxSubsegmentDuration","suggestedPresentationDelay","start","starttime","duration"],c=b.length,d=0;c>d;d++)if(a.nodeName===b[d])return h.test(a.value);return!1},converter:function(f){var g=h.exec(f),i=parseFloat(g[2]||0)*a+parseFloat(g[4]||0)*b+parseFloat(g[6]||0)*c+parseFloat(g[8]||0)*d+parseFloat(g[10]||0)*e+parseFloat(g[12]||0);return void 0!==g[1]&&(i=-i),i}},{type:"datetime",test:function(a){return i.test(a.value)},converter:function(a){var b,c=i.exec(a);if(b=Date.UTC(parseInt(c[1],10),parseInt(c[2],10)-1,parseInt(c[3],10),parseInt(c[4],10),parseInt(c[5],10),c[6]&&parseInt(c[6],10)||0,c[7]&&parseFloat(c[7])*g||0),c[9]&&c[10]){var d=parseInt(c[9],10)*f+parseInt(c[10],10);b+=("+"===c[8]?-1:1)*d*e*g}return new Date(b)}},{type:"numeric",test:function(a){return j.test(a.value)},converter:function(a){return parseFloat(a)}}],l=function(){var a,b,c,d;return d=[{name:"profiles",merge:!1},{name:"width",merge:!1},{name:"height",merge:!1},{name:"sar",merge:!1},{name:"frameRate",merge:!1},{name:"audioSamplingRate",merge:!1},{name:"mimeType",merge:!1},{name:"segmentProfiles",merge:!1},{name:"codecs",merge:!1},{name:"maximumSAPPeriod",merge:!1},{name:"startsWithSap",merge:!1},{name:"maxPlayoutRate",merge:!1},{name:"codingDependency",merge:!1},{name:"scanType",merge:!1},{name:"FramePacking",merge:!0},{name:"AudioChannelConfiguration",merge:!0},{name:"ContentProtection",merge:!0}],a={},a.name="AdaptationSet",a.isRoot=!1,a.isArray=!0,a.parent=null,a.children=[],a.properties=d,b={},b.name="Representation",b.isRoot=!1,b.isArray=!0,b.parent=a,b.children=[],b.properties=d,a.children.push(b),c={},c.name="SubRepresentation",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=d,b.children.push(c),a},m=function(){var a,b,c,d;return d=[{name:"SegmentBase",merge:!0},{name:"SegmentTemplate",merge:!0},{name:"SegmentList",merge:!0}],a={},a.name="Period",a.isRoot=!1,a.isArray=!0,a.parent=null,a.children=[],a.properties=d,b={},b.name="AdaptationSet",b.isRoot=!1,b.isArray=!0,b.parent=a,b.children=[],b.properties=d,a.children.push(b),c={},c.name="Representation",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=d,b.children.push(c),a},n=function(){var a,b,c,d,e;return e=[{name:"BaseURL",merge:!0,mergeFunction:function(a,b){var c;return c=0===b.indexOf("http://")?b:a+b}}],a={},a.name="mpd",a.isRoot=!0,a.isArray=!0,a.parent=null,a.children=[],a.properties=e,b={},b.name="Period",b.isRoot=!1,b.isArray=!0,b.parent=null,b.children=[],b.properties=e,a.children.push(b),c={},c.name="AdaptationSet",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=e,b.children.push(c),d={},d.name="Representation",d.isRoot=!1,d.isArray=!0,d.parent=c,d.children=[],d.properties=e,c.children.push(d),a},o=function(){var a=[];return a.push(l()),a.push(m()),a.push(n()),a},p=function(a,b){var c,d=new X2JS(k,"",!0),e=new ObjectIron(o()),f=new Date,g=null,h=null;try{c=d.xml_str2json(a),g=new Date,c.hasOwnProperty("BaseURL")?(c.BaseURL=c.BaseURL_asArray[0],0!==c.BaseURL.toString().indexOf("http")&&(c.BaseURL=b+c.BaseURL)):c.BaseURL=b,c.hasOwnProperty("Location")&&(c.Location=c.Location_asArray[0]),e.run(c),h=new Date,this.xlinkController.setMatchers(k),this.xlinkController.setIron(e),this.log("Parsing complete: ( xml2json: "+(g.getTime()-f.getTime())+"ms, objectiron: "+(h.getTime()-g.getTime())+"ms, total: "+(h.getTime()-f.getTime())/1e3+"s)")}catch(i){return this.errHandler.manifestError("parsing the manifest failed","parse",a),null}return c};return{log:void 0,errHandler:void 0,xlinkController:void 0,parse:p}},Dash.dependencies.DashParser.prototype={constructor:Dash.dependencies.DashParser},Dash.dependencies.TimelineConverter=function(){"use strict";var a=0,b=!1,c=0/0,d=function(b,c,d,e){var f=0/0;return f=e?d&&c.timeShiftBufferDepth!=Number.POSITIVE_INFINITY?new Date(c.availabilityStartTime.getTime()+1e3*(b+c.timeShiftBufferDepth)):c.availabilityEndTime:d?new Date(c.availabilityStartTime.getTime()+1e3*(b-a)):c.availabilityStartTime},e=function(a,b,c){return d.call(this,a,b,c)},f=function(a,b,c){return d.call(this,a,b,c,!0)},g=function(b,c){return(b.getTime()-c.mpd.availabilityStartTime.getTime()+1e3*a)/1e3},h=function(a,b){var c=b.adaptation.period.start,d=b.presentationTimeOffset;return a+(c-d)},i=function(a,b){var c=b.adaptation.period.start,d=b.presentationTimeOffset;return a-c+d},j=function(a,b){var c,d,e;return b&&(c=a.representation.adaptation.period.mpd.suggestedPresentationDelay,d=a.presentationStartTime+c,e=new Date(a.availabilityStartTime.getTime()+1e3*d)),e},k=function(a,c){var d,e,f=a.adaptation.period.start,h=f+a.adaptation.period.duration,i={start:f,end:h},j=a.segmentDuration||(a.segments&&a.segments.length?a.segments[a.segments.length-1].duration:0);return c?!b&&a.segmentAvailabilityRange?a.segmentAvailabilityRange:(d=a.adaptation.period.mpd.checkTime,e=g(new Date,a.adaptation.period),f=Math.max(e-a.adaptation.period.mpd.timeShiftBufferDepth,0),h=(isNaN(d)?e:Math.min(d,e))-j,i={start:f,end:h}):i},l=function(a,b){var c=a.adaptation.period.start;return b-c},m=function(a,b){var c=a.adaptation.period.start;return b+c},n=function(d){b||d.error||(a+=d.data.liveEdge-(c+d.data.searchTime),b=!0)},o=function(c){b||c.error||(a=c.data.offset/1e3,b=!0)},p=function(a){var b=a.presentationTimeOffset,c=a.adaptation.period.start;return c-b},q=function(){a=0,b=!1,c=0/0};return{setup:function(){this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=n,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=o},calcAvailabilityStartTimeFromPresentationTime:e,calcAvailabilityEndTimeFromPresentationTime:f,calcPresentationTimeFromWallTime:g,calcPresentationTimeFromMediaTime:h,calcPeriodRelativeTimeFromMpdRelativeTime:l,calcMpdRelativeTimeFromPeriodRelativeTime:m,calcMediaTimeFromPresentationTime:i,calcSegmentAvailabilityRange:k,calcWallTimeForSegment:j,calcMSETimeOffset:p,reset:q,isTimeSyncCompleted:function(){return b},setTimeSyncCompleted:function(a){b=a},getClientTimeOffset:function(){return a},getExpectedLiveEdge:function(){return c},setExpectedLiveEdge:function(a){c=a}}},Dash.dependencies.TimelineConverter.prototype={constructor:Dash.dependencies.TimelineConverter},Dash.dependencies.RepresentationController=function(){"use strict";var a,b=null,c=-1,d=!0,e=[],f=function(c,f,g){var h,j=this,k=null,m=j.streamProcessor.getStreamInfo(),n=j.abrController.getTopQualityIndexFor(g,m.id);if(d=!0,j.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED),e=l.call(j,f),null===b?(k=j.abrController.getInitialBitrateFor(g,m),h=j.abrController.getQualityForBitrate(j.streamProcessor.getMediaInfo(),k)):h=j.abrController.getQualityFor(g,m),h>n&&(h=n),a=i.call(j,h),b=c,"video"!==g&&"audio"!==g&&"fragmentedText"!==g)return d=!1,void j.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a});for(var o=0;o<e.length;o+=1)j.indexHandler.updateRepresentation(e[o],!0)},g=function(){var a=new Date,b=this.getCurrentRepresentation(),c=this.streamProcessor.playbackController.getTime();this.metricsModel.addTrackSwitch(b.adaptation.type,a,c,b.id)},h=function(){var b=this.streamProcessor,c=this.timelineConverter.calcSegmentAvailabilityRange(a,b.isDynamic());this.metricsModel.addDVRInfo(b.getType(),b.playbackController.getTime(),b.getStreamInfo().manifestInfo,c)},i=function(a){return e[a]},j=function(a){return e.indexOf(a)},k=function(){for(var a=0,b=e.length;b>a;a+=1){var c=e[a].segmentInfoType;if(null===e[a].segmentAvailabilityRange||null===e[a].initialization||("SegmentBase"===c||"BaseURL"===c)&&!e[a].segments)return!1}return!0},l=function(a){var d,e=this,f=e.manifestModel.getValue();return c=e.manifestExt.getIndexForAdaptation(b,f,a.period.index),d=e.manifestExt.getRepresentationsForAdaptation(f,a)},m=function(a){for(var b,c=this,d=0,f=e.length;f>d;d+=1)b=e[d],b.segmentAvailabilityRange=c.timelineConverter.calcSegmentAvailabilityRange(b,a)},n=function(b){var c=this,f=1e3*(b+3*a.segmentDuration),g=function(){if(!this.isUpdating()){d=!0,c.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED);for(var a=0;a<e.length;a+=1)c.indexHandler.updateRepresentation(e[a],!0)}};d=!1,setTimeout(g.bind(this),f)},o=function(c){if(this.isUpdating()){var e,f,i,l=this,m=c.data.representation,o=l.metricsModel.getMetricsFor("stream"),p=l.metricsModel.getMetricsFor(this.getCurrentRepresentation().adaptation.type),q=l.metricsExt.getCurrentManifestUpdate(o),r=!1;if(c.error&&c.error.code===Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE)return h.call(this),n.call(this,c.error.data.availabilityDelay),f=new MediaPlayer.vo.Error(Dash.dependencies.RepresentationController.SEGMENTS_UPDATE_FAILED_ERROR_CODE,"Segments update failed",null),void this.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a},f);if(q){for(var s=0;s<q.trackInfo.length;s+=1)if(e=q.trackInfo[s],e.index===m.index&&e.mediaType===l.streamProcessor.getType()){r=!0;break}r||l.metricsModel.addManifestUpdateTrackInfo(q,m.id,m.index,m.adaptation.period.index,l.streamProcessor.getType(),m.presentationTimeOffset,m.startNumber,m.segmentInfoType)}k()&&(d=!1,l.abrController.setPlaybackQuality(l.streamProcessor.getType(),l.streamProcessor.getStreamInfo(),j.call(this,a)),l.metricsModel.updateManifestUpdateInfo(q,{latency:a.segmentAvailabilityRange.end-l.streamProcessor.playbackController.getTime()}),i=l.metricsExt.getCurrentRepresentationSwitch(p),i||g.call(l),this.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a}))}},p=function(a){m.call(this,a.data.isDynamic)},q=function(b){if(!b.error){m.call(this,!0),this.indexHandler.updateRepresentation(a,!1);var c=this.manifestModel.getValue(),d=a.adaptation.period,e=this.streamController.getActiveStreamInfo();e.isLast&&(d.mpd.checkTime=this.manifestExt.getCheckTime(c,d),d.duration=this.manifestExt.getEndTimeForLastPeriod(this.manifestModel.getValue(),d)-d.start,e.duration=d.duration)}},r=function(){h.call(this)},s=function(b){var c=this;b.data.mediaType===c.streamProcessor.getType()&&c.streamProcessor.getStreamInfo().id===b.data.streamInfo.id&&(a=c.getRepresentationForQuality(b.data.newQuality),t.call(c,b.data.mediaType,a.bandwidth),g.call(c))},t=function(a,b){!this.DOMStorage.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)||"video"!==a&&"audio"!==a||localStorage.setItem(MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+a.toUpperCase()+"_BITRATE_KEY"],JSON.stringify({
bitrate:b/1e3,timestamp:(new Date).getTime()}))};return{system:void 0,log:void 0,manifestExt:void 0,manifestModel:void 0,metricsModel:void 0,metricsExt:void 0,abrController:void 0,streamController:void 0,timelineConverter:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,DOMStorage:void 0,setup:function(){this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=s,this[Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED]=o,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=p,this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=q,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED]=r},initialize:function(a){this.streamProcessor=a,this.indexHandler=a.indexHandler},getData:function(){return b},getDataIndex:function(){return c},isUpdating:function(){return d},updateData:f,getRepresentationForQuality:i,getCurrentRepresentation:function(){return a}}},Dash.dependencies.RepresentationController.prototype={constructor:Dash.dependencies.RepresentationController},Dash.dependencies.RepresentationController.SEGMENTS_UPDATE_FAILED_ERROR_CODE=1,Dash.dependencies.RepresentationController.eventList={ENAME_DATA_UPDATE_COMPLETED:"dataUpdateCompleted",ENAME_DATA_UPDATE_STARTED:"dataUpdateStarted"},Dash.dependencies.BaseURLExtensions=function(){"use strict";var a=function(a,b){for(var c,d,e,f,g,h,i,j,k,l,m=new DataView(a),n={},o=0;"sidx"!==j&&o<m.byteLength;){for(k=m.getUint32(o),o+=4,j="",f=0;4>f;f+=1)l=m.getInt8(o),j+=String.fromCharCode(l),o+=1;"moof"!==j&&"traf"!==j&&"sidx"!==j?o+=k-8:"sidx"===j&&(o-=8)}if(e=m.getUint32(o,!1)+o,e>a.byteLength)throw"sidx terminates after array buffer";for(n.version=m.getUint8(o+8),o+=12,n.timescale=m.getUint32(o+4,!1),o+=8,0===n.version?(n.earliest_presentation_time=m.getUint32(o,!1),n.first_offset=m.getUint32(o+4,!1),o+=8):(n.earliest_presentation_time=utils.Math.to64BitNumber(m.getUint32(o+4,!1),m.getUint32(o,!1)),n.first_offset=(m.getUint32(o+8,!1)<<32)+m.getUint32(o+12,!1),o+=16),n.first_offset+=e+(b||0),n.reference_count=m.getUint16(o+2,!1),o+=4,n.references=[],c=n.first_offset,d=n.earliest_presentation_time,f=0;f<n.reference_count;f+=1)h=m.getUint32(o,!1),g=h>>>31,h=2147483647&h,i=m.getUint32(o+4,!1),o+=12,n.references.push({size:h,type:g,offset:c,duration:i,time:d,timescale:n.timescale}),c+=h,d+=i;if(o!==e)throw"Error: final pos "+o+" differs from SIDX end "+e;return n},b=function(b,c,d){var e,f,g,h,i,j,k,l;for(e=a.call(this,b,d),f=e.references,g=[],i=0,j=f.length;j>i;i+=1)h=new Dash.vo.Segment,h.duration=f[i].duration,h.media=c,h.startTime=f[i].time,h.timescale=f[i].timescale,k=f[i].offset,l=f[i].offset+f[i].size-1,h.mediaRange=k+"-"+l,g.push(h);return this.log("Parsed SIDX box: "+g.length+" segments."),g},c=function(a,b,d){var e,f,h,i,j,k,l,m,n=new DataView(a),o=0,p="",q=0,r=!1,s=this;for(s.log("Searching for initialization.");"moov"!==p&&o<n.byteLength;){for(q=n.getUint32(o),o+=4,p="",j=0;4>j;j+=1)k=n.getInt8(o),p+=String.fromCharCode(k),o+=1;"ftyp"===p&&(e=o-8),"moov"===p&&(f=o-8),"moov"!==p&&(o+=q-8)}"moov"!==p?(s.log("Loading more bytes to find initialization."),b.range.start=0,b.range.end=b.bytesLoaded+b.bytesToLoad,l=new XMLHttpRequest,l.onloadend=function(){r||d.call(s,null,new Error("Error loading initialization."))},l.onload=function(){r=!0,b.bytesLoaded=b.range.end,c.call(s,l.response,function(a){d.call(s,a)})},l.onerror=function(){d.call(s,null,new Error("Error loading initialization."))},g.call(s,l,b)):(h=void 0===e?f:e,i=f+q-1,m=h+"-"+i,s.log("Found the initialization.  Range: "+m),d.call(s,m))},d=function(a){var b=new XMLHttpRequest,d=!0,e=this,f=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].BaseURL,h={url:f,range:{},searching:!1,bytesLoaded:0,bytesToLoad:1500,request:b};e.log("Start searching for initialization."),h.range.start=0,h.range.end=h.bytesToLoad,b.onload=function(){b.status<200||b.status>299||(d=!1,h.bytesLoaded=h.range.end,c.call(e,b.response,h,function(b){a.range=b,a.initialization=f,e.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,{representation:a})}))},b.onloadend=b.onerror=function(){d&&(d=!1,e.errHandler.downloadError("initialization",h.url,b),e.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,{representation:a}))},g.call(e,b,h),e.log("Perform init search: "+h.url)},e=function(a,c,d,h){var i,j,k,l,m,n,o,p,q,r=new DataView(a),s=new XMLHttpRequest,t=0,u="",v=0,w=!0,x=!1,y=this;for(y.log("Searching for SIDX box."),y.log(c.bytesLoaded+" bytes loaded.");"sidx"!==u&&t<r.byteLength;){for(v=r.getUint32(t),t+=4,u="",n=0;4>n;n+=1)o=r.getInt8(t),u+=String.fromCharCode(o),t+=1;"sidx"!==u&&(t+=v-8)}if(j=r.byteLength-t,"sidx"!==u)h.call(y);else if(v-8>j)y.log("Found SIDX but we don't have all of it."),c.range.start=0,c.range.end=c.bytesLoaded+(v-j),s.onload=function(){s.status<200||s.status>299||(w=!1,c.bytesLoaded=c.range.end,e.call(y,s.response,c,d,h))},s.onloadend=s.onerror=function(){w&&(w=!1,y.errHandler.downloadError("SIDX",c.url,s),h.call(y))},g.call(y,s,c);else if(c.range.start=t-8,c.range.end=c.range.start+v,y.log("Found the SIDX box.  Start: "+c.range.start+" | End: "+c.range.end),k=new ArrayBuffer(c.range.end-c.range.start),m=new Uint8Array(k),l=new Uint8Array(a,c.range.start,c.range.end-c.range.start),m.set(l),p=this.parseSIDX.call(this,k,c.range.start),q=p.references,null!==q&&void 0!==q&&q.length>0&&(x=1===q[0].type),x){y.log("Initiate multiple SIDX load.");var z,A,B,C,D,E=[],F=0,G=function(a){a?(E=E.concat(a),F+=1,F>=A&&h.call(y,E)):h.call(y)};for(z=0,A=q.length;A>z;z+=1)B=q[z].offset,C=q[z].offset+q[z].size-1,D=B+"-"+C,f.call(y,d,null,D,G)}else y.log("Parsing segments from SIDX."),i=b.call(y,k,c.url,c.range.start),h.call(y,i)},f=function(a,c,d,f){var h,i,j=new XMLHttpRequest,k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].BaseURL,l=!0,m=this,n={url:k,range:{},searching:!1,bytesLoaded:0,bytesToLoad:1500,request:j};null===d?(m.log("No known range for SIDX request."),n.searching=!0,n.range.start=0,n.range.end=n.bytesToLoad):(i=d.split("-"),n.range.start=parseFloat(i[0]),n.range.end=parseFloat(i[1])),j.onload=function(){j.status<200||j.status>299||(l=!1,n.searching?(n.bytesLoaded=n.range.end,e.call(m,j.response,n,a,function(b){b&&f.call(m,b,a,c)})):(h=b.call(m,j.response,n.url,n.range.start),f.call(m,h,a,c)))},j.onloadend=j.onerror=function(){l&&(l=!1,m.errHandler.downloadError("SIDX",n.url,j),f.call(m,null,a,c))},g.call(m,j,n),m.log("Perform SIDX load: "+n.url)},g=function(a,b){a.open("GET",this.requestModifierExt.modifyRequestURL(b.url)),a.responseType="arraybuffer",a.setRequestHeader("Range","bytes="+b.range.start+"-"+b.range.end),a=this.requestModifierExt.modifyRequestHeader(a),a.send(null)},h=function(a,b,c){var d=this;a?d.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,{segments:a,representation:b,mediaType:c}):d.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,{segments:null,representation:b,mediaType:c},new MediaPlayer.vo.Error(null,"error loading segments",null))};return{log:void 0,errHandler:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,loadSegments:function(a,b,c){f.call(this,a,b,c,h.bind(this))},loadInitialization:d,parseSegments:b,parseSIDX:a,findSIDX:e}},Dash.dependencies.BaseURLExtensions.prototype={constructor:Dash.dependencies.BaseURLExtensions},Dash.dependencies.BaseURLExtensions.eventList={ENAME_INITIALIZATION_LOADED:"initializationLoaded",ENAME_SEGMENTS_LOADED:"segmentsLoaded"},Dash.dependencies.DashManifestExtensions=function(){"use strict";this.timelineConverter=void 0},Dash.dependencies.DashManifestExtensions.prototype={constructor:Dash.dependencies.DashManifestExtensions,getIsTypeOf:function(a,b){"use strict";var c,d,e,f=a.ContentComponent_asArray,g=new RegExp("text"!==b?b:"(vtt|ttml)"),h=!1,i=!1;if(a.Representation_asArray.length>0&&a.Representation_asArray[0].hasOwnProperty("codecs")&&"stpp"==a.Representation_asArray[0].codecs)return"fragmentedText"==b;if(f)for(c=0,d=f.length;d>c;c+=1)f[c].contentType===b&&(h=!0,i=!0);if(a.hasOwnProperty("mimeType")&&(h=g.test(a.mimeType),i=!0),!i)for(c=0,d=a.Representation_asArray.length;!i&&d>c;)e=a.Representation_asArray[c],e.hasOwnProperty("mimeType")&&(h=g.test(e.mimeType),i=!0),c+=1;return h},getIsAudio:function(a){"use strict";return this.getIsTypeOf(a,"audio")},getIsVideo:function(a){"use strict";return this.getIsTypeOf(a,"video")},getIsFragmentedText:function(a){"use strict";return this.getIsTypeOf(a,"fragmentedText")},getIsText:function(a){"use strict";return this.getIsTypeOf(a,"text")},getIsTextTrack:function(a){return"text/vtt"===a||"application/ttml+xml"===a},getLanguageForAdaptation:function(a){var b="";return a.hasOwnProperty("lang")&&(b=a.lang),b},getIsMain:function(){"use strict";return!1},processAdaptation:function(a){"use strict";return void 0!==a.Representation_asArray&&null!==a.Representation_asArray&&a.Representation_asArray.sort(function(a,b){return a.bandwidth-b.bandwidth}),a},getAdaptationForId:function(a,b,c){"use strict";var d,e,f=b.Period_asArray[c].AdaptationSet_asArray;for(d=0,e=f.length;e>d;d+=1)if(f[d].hasOwnProperty("id")&&f[d].id===a)return f[d];return null},getAdaptationForIndex:function(a,b,c){"use strict";var d=b.Period_asArray[c].AdaptationSet_asArray;return d[a]},getIndexForAdaptation:function(a,b,c){"use strict";var d,e,f=b.Period_asArray[c].AdaptationSet_asArray;for(d=0,e=f.length;e>d;d+=1)if(f[d]===a)return d;return-1},getAdaptationsForType:function(a,b,c){"use strict";var d,e,f=this,g=a.Period_asArray[b].AdaptationSet_asArray,h=[];for(d=0,e=g.length;e>d;d+=1)this.getIsTypeOf(g[d],c)&&h.push(f.processAdaptation(g[d]));return h},getAdaptationForType:function(a,b,c){"use strict";var d,e,f,g=this;if(f=this.getAdaptationsForType(a,b,c),!f||0===f.length)return null;for(d=0,e=f.length;e>d;d+=1)if(g.getIsMain(f[d]))return f[d];return f[0]},getCodec:function(a){"use strict";var b=a.Representation_asArray[0];return b.mimeType+';codecs="'+b.codecs+'"'},getMimeType:function(a){"use strict";return a.Representation_asArray[0].mimeType},getKID:function(a){"use strict";return a&&a.hasOwnProperty("cenc:default_KID")?a["cenc:default_KID"]:null},getContentProtectionData:function(a){"use strict";return a&&a.hasOwnProperty("ContentProtection_asArray")&&0!==a.ContentProtection_asArray.length?a.ContentProtection_asArray:null},getIsDynamic:function(a){"use strict";var b=!1,c="dynamic";return a.hasOwnProperty("type")&&(b=a.type===c),b},getIsDVR:function(a){"use strict";var b,c,d=this.getIsDynamic(a);return b=!isNaN(a.timeShiftBufferDepth),c=d&&b},getIsOnDemand:function(a){"use strict";var b=!1;return a.profiles&&a.profiles.length>0&&(b=-1!==a.profiles.indexOf("urn:mpeg:dash:profile:isoff-on-demand:2011")),b},getDuration:function(a){var b;return b=a.hasOwnProperty("mediaPresentationDuration")?a.mediaPresentationDuration:Number.MAX_VALUE},getBandwidth:function(a){"use strict";return a.bandwidth},getRefreshDelay:function(a){"use strict";var b=0/0,c=2;return a.hasOwnProperty("minimumUpdatePeriod")&&(b=Math.max(parseFloat(a.minimumUpdatePeriod),c)),b},getRepresentationCount:function(a){"use strict";return a.Representation_asArray.length},getBitrateListForAdaptation:function(a){if(!a||!a.Representation_asArray||!a.Representation_asArray.length)return null;for(var b=this.processAdaptation(a),c=b.Representation_asArray,d=c.length,e=[],f=0;d>f;f+=1)e.push(c[f].bandwidth);return e},getRepresentationFor:function(a,b){"use strict";return b.Representation_asArray[a]},getRepresentationsForAdaptation:function(a,b){for(var c,d,e,f,g,h=this,i=h.processAdaptation(a.Period_asArray[b.period.index].AdaptationSet_asArray[b.index]),j=[],k=0;k<i.Representation_asArray.length;k+=1)f=i.Representation_asArray[k],c=new Dash.vo.Representation,c.index=k,c.adaptation=b,f.hasOwnProperty("id")&&(c.id=f.id),f.hasOwnProperty("bandwidth")&&(c.bandwidth=f.bandwidth),f.hasOwnProperty("maxPlayoutRate")&&(c.maxPlayoutRate=f.maxPlayoutRate),f.hasOwnProperty("SegmentBase")?(e=f.SegmentBase,c.segmentInfoType="SegmentBase"):f.hasOwnProperty("SegmentList")?(e=f.SegmentList,c.segmentInfoType="SegmentList",c.useCalculatedLiveEdgeTime=!0):f.hasOwnProperty("SegmentTemplate")?(e=f.SegmentTemplate,e.hasOwnProperty("SegmentTimeline")?(c.segmentInfoType="SegmentTimeline",g=e.SegmentTimeline.S_asArray[e.SegmentTimeline.S_asArray.length-1],(!g.hasOwnProperty("r")||g.r>=0)&&(c.useCalculatedLiveEdgeTime=!0)):c.segmentInfoType="SegmentTemplate",e.hasOwnProperty("initialization")&&(c.initialization=e.initialization.split("$Bandwidth$").join(f.bandwidth).split("$RepresentationID$").join(f.id))):(e=f.BaseURL,c.segmentInfoType="BaseURL"),e.hasOwnProperty("Initialization")?(d=e.Initialization,d.hasOwnProperty("sourceURL")?c.initialization=d.sourceURL:d.hasOwnProperty("range")&&(c.initialization=f.BaseURL,c.range=d.range)):f.hasOwnProperty("mimeType")&&h.getIsTextTrack(f.mimeType)&&(c.initialization=f.BaseURL,c.range=0),e.hasOwnProperty("timescale")&&(c.timescale=e.timescale),e.hasOwnProperty("duration")&&(c.segmentDuration=e.duration/c.timescale),e.hasOwnProperty("startNumber")&&(c.startNumber=e.startNumber),e.hasOwnProperty("indexRange")&&(c.indexRange=e.indexRange),e.hasOwnProperty("presentationTimeOffset")&&(c.presentationTimeOffset=e.presentationTimeOffset/c.timescale),c.MSETimeOffset=h.timelineConverter.calcMSETimeOffset(c),j.push(c);return j},getAdaptationsForPeriod:function(a,b){for(var c,d,e=a.Period_asArray[b.index],f=[],g=0;g<e.AdaptationSet_asArray.length;g+=1)d=e.AdaptationSet_asArray[g],c=new Dash.vo.AdaptationSet,d.hasOwnProperty("id")&&(c.id=d.id),c.index=g,c.period=b,c.type=this.getIsAudio(d)?"audio":this.getIsVideo(d)?"video":this.getIsFragmentedText(d)?"fragmentedText":"text",f.push(c);return f},getRegularPeriods:function(a,b){var c,d,e=this,f=[],g=e.getIsDynamic(a),h=null,i=null,j=null,k=null;for(c=0,d=a.Period_asArray.length;d>c;c+=1)i=a.Period_asArray[c],i.hasOwnProperty("start")?(k=new Dash.vo.Period,k.start=i.start):null!==h&&i.hasOwnProperty("duration")&&null!==j?(k=new Dash.vo.Period,k.start=j.start+j.duration,k.duration=i.duration):0!==c||g||(k=new Dash.vo.Period,k.start=0),null!==j&&isNaN(j.duration)&&(j.duration=k.start-j.start),null!==k&&i.hasOwnProperty("id")&&(k.id=i.id),null!==k&&i.hasOwnProperty("duration")&&(k.duration=i.duration),null!==k&&(k.index=c,k.mpd=b,f.push(k),h=i,j=k),i=null,k=null;return 0===f.length?f:(null!==j&&isNaN(j.duration)&&(j.duration=e.getEndTimeForLastPeriod(a,j)-j.start),f)},getMpd:function(a){var b=new Dash.vo.Mpd;return b.manifest=a,b.availabilityStartTime=new Date(a.hasOwnProperty("availabilityStartTime")?a.availabilityStartTime.getTime():a.loadedTime.getTime()),a.hasOwnProperty("availabilityEndTime")&&(b.availabilityEndTime=new Date(a.availabilityEndTime.getTime())),a.hasOwnProperty("suggestedPresentationDelay")&&(b.suggestedPresentationDelay=a.suggestedPresentationDelay),a.hasOwnProperty("timeShiftBufferDepth")&&(b.timeShiftBufferDepth=a.timeShiftBufferDepth),a.hasOwnProperty("maxSegmentDuration")&&(b.maxSegmentDuration=a.maxSegmentDuration),b},getFetchTime:function(a,b){return this.timelineConverter.calcPresentationTimeFromWallTime(a.loadedTime,b)},getCheckTime:function(a,b){var c,d=this,e=0/0;return a.hasOwnProperty("minimumUpdatePeriod")&&(c=d.getFetchTime(a,b),e=c+a.minimumUpdatePeriod),e},getEndTimeForLastPeriod:function(a,b){var c,d=this.getCheckTime(a,b);if(a.mediaPresentationDuration)c=a.mediaPresentationDuration;else{if(isNaN(d))throw new Error("Must have @mediaPresentationDuration or @minimumUpdatePeriod on MPD or an explicit @duration on the last period.");c=d}return c},getEventsForPeriod:function(a,b){var c=a.Period_asArray,d=c[b.index].EventStream_asArray,e=[];if(d)for(var f=0;f<d.length;f+=1){var g=new Dash.vo.EventStream;if(g.period=b,g.timescale=1,!d[f].hasOwnProperty("schemeIdUri"))throw"Invalid EventStream. SchemeIdUri has to be set";g.schemeIdUri=d[f].schemeIdUri,d[f].hasOwnProperty("timescale")&&(g.timescale=d[f].timescale),d[f].hasOwnProperty("value")&&(g.value=d[f].value);for(var h=0;h<d[f].Event_asArray.length;h+=1){var i=new Dash.vo.Event;i.presentationTime=0,i.eventStream=g,d[f].Event_asArray[h].hasOwnProperty("presentationTime")&&(i.presentationTime=d[f].Event_asArray[h].presentationTime),d[f].Event_asArray[h].hasOwnProperty("duration")&&(i.duration=d[f].Event_asArray[h].duration),d[f].Event_asArray[h].hasOwnProperty("id")&&(i.id=d[f].Event_asArray[h].id),e.push(i)}}return e},getEventStreams:function(a,b){var c=[];if(!a)return c;for(var d=0;d<a.length;d++){var e=new Dash.vo.EventStream;if(e.timescale=1,e.representation=b,!a[d].hasOwnProperty("schemeIdUri"))throw"Invalid EventStream. SchemeIdUri has to be set";e.schemeIdUri=a[d].schemeIdUri,a[d].hasOwnProperty("timescale")&&(e.timescale=a[d].timescale),a[d].hasOwnProperty("value")&&(e.value=a[d].value),c.push(e)}return c},getEventStreamForAdaptationSet:function(a,b){var c=a.Period_asArray[b.period.index].AdaptationSet_asArray[b.index].InbandEventStream_asArray;return this.getEventStreams(c,null)},getEventStreamForRepresentation:function(a,b){var c=a.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].InbandEventStream_asArray;return this.getEventStreams(c,b)},getUTCTimingSources:function(a){"use strict";var b=this,c=b.getIsDynamic(a),d=a.hasOwnProperty("availabilityStartTime"),e=a.UTCTiming_asArray,f=[];return(c||d)&&e&&e.forEach(function(a){var b=new Dash.vo.UTCTiming;a.hasOwnProperty("schemeIdUri")&&(b.schemeIdUri=a.schemeIdUri,a.hasOwnProperty("value")&&(b.value=a.value.toString(),f.push(b)))}),f}},Dash.dependencies.DashMetricsExtensions=function(){"use strict";var a=function(a,b){var c,d,e,f,g,h;for(d=a.AdaptationSet_asArray,g=0;g<d.length;g+=1)for(c=d[g],f=c.Representation_asArray,h=0;h<f.length;h+=1)if(e=f[h],b===e.id)return h;return-1},b=function(a,b){var c,d,e,f,g,h;for(d=a.AdaptationSet_asArray,g=0;g<d.length;g+=1)for(c=d[g],f=c.Representation_asArray,h=0;h<f.length;h+=1)if(e=f[h],b===e.id)return e;return null},c=function(a,b){return this.manifestExt.getIsTypeOf(a,b)},d=function(a,b){var d,e,f,g;if(!a||!b)return-1;for(e=a.AdaptationSet_asArray,g=0;g<e.length;g+=1)if(d=e[g],f=d.Representation_asArray,c.call(this,d,b))return f.length;return-1},e=function(a,c){var d,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[c];return d=b.call(e,g,a),null===d?null:d.bandwidth},f=function(b,c){var d,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[c];return d=a.call(e,g,b)},g=function(a,b){var c,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[b];return c=d.call(this,g,a)},h=function(a,b){var c=this.system.getObject("abrController"),d=0;return c&&(d=c.getTopQualityIndexFor(a,b)),d},i=function(a){if(null===a)return null;var b,c,d,e=a.RepSwitchList;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},j=function(a){if(null===a)return null;var b,c,d,e=a.BufferLevel;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},k=function(a){if(null===a)return null;var b,c,d=a.PlayList;return null===d||d.length<=0?null:(b=d[d.length-1].trace,null===b||b.length<=0?null:c=b[b.length-1].playbackspeed)},l=function(a){if(null===a)return null;var b,c,d=a.HttpList,e=null;if(null===d||d.length<=0)return null;for(b=d.length,c=b-1;c>=0;){if(d[c].responsecode){e=d[c];break}c-=1}return e},m=function(a){return null===a?[]:a.HttpList?a.HttpList:[]},n=function(a){if(null===a)return null;var b,c,d,e=a.DroppedFrames;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},o=function(a){if(null===a)return null;var b,c,d,e=a.SchedulingInfo;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},p=function(a){if(null===a)return null;var b,c,d,e=a.ManifestUpdate;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},q=function(a){if(null===a)return null;var b,c,d=a.DVRInfo;return null===d||d.length<=0?null:(b=d.length-1,c=d[b])},r=function(a,b){if(null===a)return null;var c,d=m(a),e=d[d.length-1];return"MPD"===e.type&&(c=t(e.responseHeaders)),void 0===c[b]?null:c[b]},s=function(a,b){if(null===a)return null;var c,d=l(a);return null===d||null===d.responseHeaders?null:(c=t(d.responseHeaders),void 0===c[b]?null:c[b])},t=function(a){var b={};if(!a)return b;for(var c=a.split("\r\n"),d=0,e=c.length;e>d;d++){var f=c[d],g=f.indexOf(": ");g>0&&(b[f.substring(0,g)]=f.substring(g+2))}return b};return{manifestModel:void 0,manifestExt:void 0,system:void 0,getBandwidthForRepresentation:e,getIndexForRepresentation:f,getMaxIndexForBufferType:g,getMaxAllowedIndexForBufferType:h,getCurrentRepresentationSwitch:i,getCurrentBufferLevel:j,getCurrentPlaybackRate:k,getCurrentHttpRequest:l,getHttpRequests:m,getCurrentDroppedFrames:n,getCurrentSchedulingInfo:o,getCurrentDVRInfo:q,getCurrentManifestUpdate:p,getLatestFragmentRequestHeaderValueByID:s,getLatestMPDRequestHeaderValueByID:r}},Dash.dependencies.DashMetricsExtensions.prototype={constructor:Dash.dependencies.DashMetricsExtensions},Dash.dependencies.FragmentExtensions=function(){"use strict";var a=0,b=1,c=3,d=4,e=5,f=0,g=2,h=8,i=9,j=10,k=11,l=function(a){for(var b,c,d,e,f,g,h=new DataView(a),i=0;"tfdt"!==e&&i<h.byteLength;){for(d=h.getUint32(i),i+=4,e="",f=0;4>f;f+=1)g=h.getInt8(i),e+=String.fromCharCode(g),i+=1;"moof"!==e&&"traf"!==e&&"tfdt"!==e&&(i+=d-8)}if(i===h.byteLength)throw"Error finding live offset.";return c=h.getUint8(i),0===c?(i+=4,b=h.getUint32(i,!1)):(i+=d-16,b=utils.Math.to64BitNumber(h.getUint32(i+4,!1),h.getUint32(i,!1))),{version:c,base_media_decode_time:b}},m=function(a){for(var b,c,d,e,f,g,h,i=new DataView(a),j=0;"sidx"!==f&&j<i.byteLength;){for(g=i.getUint32(j),j+=4,f="",e=0;4>e;e+=1)h=i.getInt8(j),f+=String.fromCharCode(h),j+=1;"moof"!==f&&"traf"!==f&&"sidx"!==f?j+=g-8:"sidx"===f&&(j-=8)}return b=i.getUint8(j+8),j+=12,c=i.getUint32(j+4,!1),j+=8,d=0===b?i.getUint32(j,!1):utils.Math.to64BitNumber(i.getUint32(j+4,!1),i.getUint32(j,!1)),{earliestPresentationTime:d,timescale:c}},n=function(f){for(var g,h,i,j,k,l,m,n=new DataView(f),o=0;"tfhd"!==h&&o<n.byteLength;){for(g=n.getUint32(o),o+=4,h="",l=0;4>l;l+=1)m=n.getInt8(o),h+=String.fromCharCode(m),o+=1;"moof"!==h&&"traf"!==h&&"tfhd"!==h&&(o+=g-8)}if(o===n.byteLength)throw"Error finding live offset.";return k={baseDataOffset:0,descriptionIndex:0,sampleDuration:0,sampleSize:0,defaultSampleFlags:0},o+=1,o+=2,i=n.getUint8(o),o+=1,j=intTobitArray(i,8),o+=4,j[a]&&(k.baseDataOffset=utils.Math.to64BitNumber(n.getUint32(o+4,!1),n.getUint32(o,!1)),o+=8),j[b]&&(k.descriptionIndex=n.getUint32(o),o+=4),j[c]&&(k.sampleDuration=n.getUint32(o),o+=4),j[d]&&(k.sampleSize=n.getUint32(o),o+=4),j[e]&&(k.defaultSampleFlags=n.getUint32(o),o+=4),k},o=function(a){for(var b,c,d,e,f,g=new DataView(a),h=0;"mdhd"!==d&&h<g.byteLength;){for(c=g.getUint32(h),h+=4,d="",e=0;4>e;e+=1)f=g.getInt8(h),d+=String.fromCharCode(f),h+=1;"moov"!==d&&"trak"!==d&&"mdia"!==d&&"mdhd"!==d&&(h+=c-8)}if(h===g.byteLength)throw"Error finding live offset.";return b=g.getUint8(h),h+=12,1==b&&(h+=8),g.getUint32(h,!1)},p=function(a){var b,c,d,e,m,o,p,q,r,s,t,u,v,w,x,y,z=new DataView(a),A=0;for(w=n(a),x=l(a);"trun"!==c&&A<z.byteLength;){for(b=z.getUint32(A),A+=4,c="",t=0;4>t;t+=1)u=z.getInt8(A),c+=String.fromCharCode(u),A+=1;"moof"!==c&&"traf"!==c&&"trun"!==c&&(A+=b-8),"moof"==c&&(v=A-8)}if(A===z.byteLength)throw"Error finding live offset.";for(A+=1,A+=1,r=z.getUint16(A),A+=2,s=intTobitArray(r,16),m=z.getUint32(A),A+=4,p=x.base_media_decode_time,s[f]?(y=z.getUint32(A)+w.baseDataOffset,A+=4):y=w.baseDataOffset,s[g]&&(A+=4),q=[],t=0;m>t;t++)s[h]?(d=z.getUint32(A),A+=4):d=w.sampleDuration,s[i]?(o=z.getUint32(A),A+=4):o=w.sampleSize,s[j]&&(A+=4),s[k]?(e=z.getUint32(A),A+=4):e=0,q.push({dts:p,cts:p+e,duration:d,offset:v+y,size:o}),y+=o,p+=d;return q},q=function(a){var b,c=this,d=new XMLHttpRequest,e=a,f=!1,g="Error loading fragment: "+e,h=new MediaPlayer.vo.Error(null,g,null);d.onloadend=function(){f||(g="Error loading fragment: "+e,c.notify(Dash.dependencies.FragmentExtensions.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,{fragment:null},h))},d.onload=function(){f=!0,b=l(d.response),c.notify(Dash.dependencies.FragmentExtensions.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,{fragment:b})},d.onerror=function(){g="Error loading fragment: "+e,c.notify(Dash.dependencies.FragmentExtensions.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,{fragment:null},h)},d.responseType="arraybuffer",d.open("GET",e),d.send(null)};return{log:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,loadFragment:q,parseTFDT:l,parseSIDX:m,getSamplesInfo:p,getMediaTimescaleFromMoov:o}},Dash.dependencies.FragmentExtensions.prototype={constructor:Dash.dependencies.FragmentExtensions},Dash.dependencies.FragmentExtensions.eventList={ENAME_FRAGMENT_LOADING_COMPLETED:"fragmentLoadingCompleted"},Dash.vo.AdaptationSet=function(){"use strict";this.period=null,this.index=-1,this.type=null},Dash.vo.AdaptationSet.prototype={constructor:Dash.vo.AdaptationSet},Dash.vo.Event=function(){"use strict";this.duration=0/0,this.presentationTime=0/0,this.id=0/0,this.messageData="",this.eventStream=null,this.presentationTimeDelta=0/0},Dash.vo.Event.prototype={constructor:Dash.vo.Event},Dash.vo.EventStream=function(){"use strict";this.adaptionSet=null,this.representation=null,this.period=null,this.timescale=1,this.value="",this.schemeIdUri=""},Dash.vo.EventStream.prototype={constructor:Dash.vo.EventStream},Dash.vo.Mpd=function(){"use strict";this.manifest=null,this.suggestedPresentationDelay=0,this.availabilityStartTime=null,this.availabilityEndTime=Number.POSITIVE_INFINITY,this.timeShiftBufferDepth=Number.POSITIVE_INFINITY,this.maxSegmentDuration=Number.POSITIVE_INFINITY,this.checkTime=0/0,this.clientServerTimeShift=0,this.isClientServerTimeSyncCompleted=!1},Dash.vo.Mpd.prototype={constructor:Dash.vo.Mpd},Dash.vo.Period=function(){"use strict";this.id=null,this.index=-1,this.duration=0/0,this.start=0/0,this.mpd=null},Dash.vo.Period.prototype={constructor:Dash.vo.Period},Dash.vo.Representation=function(){"use strict";this.id=null,this.index=-1,this.adaptation=null,this.segmentInfoType=null,this.initialization=null,this.segmentDuration=0/0,this.timescale=1,this.startNumber=1,this.indexRange=null,this.range=null,this.presentationTimeOffset=0,this.MSETimeOffset=0/0,this.segmentAvailabilityRange=null,this.availableSegmentsNumber=0,this.bandwidth=0/0,this.maxPlayoutRate=0/0},Dash.vo.Representation.prototype={constructor:Dash.vo.Representation},Dash.vo.Segment=function(){"use strict";this.indexRange=null,this.index=null,this.mediaRange=null,this.media=null,this.duration=0/0,this.replacementTime=null,this.replacementNumber=0/0,this.mediaStartTime=0/0,this.presentationStartTime=0/0,this.availabilityStartTime=0/0,this.availabilityEndTime=0/0,this.availabilityIdx=0/0,this.wallStartTime=0/0,this.representation=null},Dash.vo.Segment.prototype={constructor:Dash.vo.Segment},Dash.vo.UTCTiming=function(){"use strict";this.schemeIdUri="",this.value=""},Dash.vo.UTCTiming.prototype={constructor:Dash.vo.UTCTiming},MediaPlayer.dependencies.ErrorHandler=function(){"use strict";var a=MediaPlayer.events.ERROR;return{eventBus:void 0,capabilityError:function(b){this.eventBus.dispatchEvent({type:a,error:"capability",event:b})},downloadError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"download",event:{id:b,url:c,request:d}})},manifestError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"manifestError",event:{message:b,id:c,manifest:d}})},closedCaptionsError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"cc",event:{message:b,id:c,cc:d}})},mediaSourceError:function(b){this.eventBus.dispatchEvent({type:a,error:"mediasource",event:b})},mediaKeySessionError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_session",event:b})},mediaKeyMessageError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_message",event:b})},mediaKeySystemSelectionError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_system_selection",event:b})}}},MediaPlayer.dependencies.ErrorHandler.prototype={constructor:MediaPlayer.dependencies.ErrorHandler},MediaPlayer.dependencies.FragmentLoader=function(){"use strict";var a=3,b=500,c=[],d=function(a,e){var f=new XMLHttpRequest,g=null,h=!0,i=!0,j=null,k=this,l=function(a,b){i=!1;var c,d,e=new Date,h=f.response;a.firstByteDate||(a.firstByteDate=a.requestStartDate),a.requestEndDate=e,c=a.firstByteDate.getTime()-a.requestStartDate.getTime(),d=a.requestEndDate.getTime()-a.firstByteDate.getTime(),k.log((b?"loaded ":"failed ")+a.mediaType+":"+a.type+":"+a.startTime+" ("+f.status+", "+c+"ms, "+d+"ms)"),g.tresponse=a.firstByteDate,g.tfinish=a.requestEndDate,g.responsecode=f.status,g.responseHeaders=f.getAllResponseHeaders(),k.metricsModel.appendHttpTrace(g,e,e.getTime()-j.getTime(),[h?h.byteLength:0]),j=e};c.push(f),a.requestStartDate=new Date,g=k.metricsModel.addHttpRequest(a.mediaType,null,a.type,a.url,null,a.range,a.requestStartDate,null,null,null,null,a.duration,null),k.metricsModel.appendHttpTrace(g,a.requestStartDate,a.requestStartDate.getTime()-a.requestStartDate.getTime(),[0]),j=a.requestStartDate,f.open("GET",k.requestModifierExt.modifyRequestURL(a.url),!0),f.responseType="arraybuffer",f=k.requestModifierExt.modifyRequestHeader(f),a.range&&f.setRequestHeader("Range","bytes="+a.range),f.onprogress=function(b){var c=new Date;h&&(h=!1,(!b.lengthComputable||b.lengthComputable&&b.total!=b.loaded)&&(a.firstByteDate=c,g.tresponse=c)),b.lengthComputable&&(a.bytesLoaded=b.loaded,a.bytesTotal=b.total),k.metricsModel.appendHttpTrace(g,c,c.getTime()-j.getTime(),[f.response?f.response.byteLength:0]),j=c,k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,{request:a})},f.onload=function(){f.status<200||f.status>299||(l(a,!0),k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:a,response:f.response}))},f.onloadend=f.onerror=function(){-1!==c.indexOf(f)&&(c.splice(c.indexOf(f),1),i&&(l(a,!1),e>0?(k.log("Failed loading fragment: "+a.mediaType+":"+a.type+":"+a.startTime+", retry in "+b+"ms attempts: "+e),e--,setTimeout(function(){d.call(k,a,e)},b)):(k.log("Failed loading fragment: "+a.mediaType+":"+a.type+":"+a.startTime+" no retry attempts left"),k.errHandler.downloadError("content",a.url,f),k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:a,bytes:null},new MediaPlayer.vo.Error(null,"failed loading fragment",null)))))},f.send()},e=function(a){var b=this,c=new XMLHttpRequest,d=!1;c.open("HEAD",a.url,!0),c.onload=function(){c.status<200||c.status>299||(d=!0,b.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!0}))},c.onloadend=c.onerror=function(){d||b.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!1})},c.send()};return{metricsModel:void 0,errHandler:void 0,log:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,load:function(b){b?d.call(this,b,a):this.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:b,bytes:null},new MediaPlayer.vo.Error(null,"request is null",null))},checkForExistence:function(a){return a?void e.call(this,a):void this.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!1})},abort:function(){var a,b,d=c.length;for(a=0;d>a;a+=1)b=c[a],c[a]=null,b.abort(),b=null;c=[]}}},MediaPlayer.dependencies.FragmentLoader.prototype={constructor:MediaPlayer.dependencies.FragmentLoader},MediaPlayer.dependencies.FragmentLoader.eventList={ENAME_LOADING_COMPLETED:"loadingCompleted",ENAME_LOADING_PROGRESS:"loadingProgress",ENAME_CHECK_FOR_EXISTENCE_COMPLETED:"checkForExistenceCompleted"
},MediaPlayer.dependencies.LiveEdgeFinder=function(){"use strict";var a,b=!1,c=0/0,d=null,e=MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES,f=function(a){var b=((new Date).getTime()-c)/1e3;d=a.value,this.notify(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,{liveEdge:d,searchTime:b},null===d?new MediaPlayer.vo.Error(MediaPlayer.dependencies.LiveEdgeFinder.LIVE_EDGE_NOT_FOUND_ERROR_CODE,"live edge has not been found",null):null)},g=function(d){var g=this;!g.streamProcessor.isDynamic()||b||d.error||(a=g.synchronizationRulesCollection.getRules(e),b=!0,c=(new Date).getTime(),g.rulesController.applyRules(a,g.streamProcessor,f.bind(g),null,function(a,b){return b}))},h=function(a){e=a.error?MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES:MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES};return{system:void 0,synchronizationRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=g,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=h},initialize:function(a){this.streamProcessor=a,this.fragmentLoader=a.fragmentLoader},abortSearch:function(){b=!1,c=0/0},getLiveEdge:function(){return d},reset:function(){this.abortSearch(),d=null}}},MediaPlayer.dependencies.LiveEdgeFinder.prototype={constructor:MediaPlayer.dependencies.LiveEdgeFinder},MediaPlayer.dependencies.LiveEdgeFinder.eventList={ENAME_LIVE_EDGE_SEARCH_COMPLETED:"liveEdgeFound"},MediaPlayer.dependencies.LiveEdgeFinder.LIVE_EDGE_NOT_FOUND_ERROR_CODE=1,MediaPlayer.dependencies.ManifestLoader=function(){"use strict";var a=3,b=500,c=function(a){var b="";return-1!==a.indexOf("/")&&(-1!==a.indexOf("?")&&(a=a.substring(0,a.indexOf("?"))),b=a.substring(0,a.lastIndexOf("/")+1)),b},d=function(a,e){var f,g,h,i=c(a),j=new XMLHttpRequest,k=new Date,l=null,m=!0,n=this;g=function(){j.status<200||j.status>299||(m=!1,l=new Date,n.metricsModel.addHttpRequest("stream",null,"MPD",a,null,null,k,l,null,j.status,null,null,j.getAllResponseHeaders()),j.responseURL&&(i=c(j.responseURL),a=j.responseURL),f=n.parser.parse(j.responseText,i),f?(f.url=a,f.loadedTime=l,n.metricsModel.addManifestUpdate("stream",f.type,k,l,f.availabilityStartTime),n.xlinkController.resolveManifestOnLoad(f)):n.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,{manifest:null},new MediaPlayer.vo.Error(null,"Failed loading manifest: "+a,null)))},h=function(){m&&(m=!1,n.metricsModel.addHttpRequest("stream",null,"MPD",a,null,null,k,new Date,j.status,null,null,j.getAllResponseHeaders()),e>0?(n.log("Failed loading manifest: "+a+", retry in "+b+"ms attempts: "+e),e--,setTimeout(function(){d.call(n,a,e)},b)):(n.log("Failed loading manifest: "+a+" no retry attempts left"),n.errHandler.downloadError("manifest",a,j),n.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,null,new Error("Failed loading manifest: "+a+" no retry attempts left"))))};try{j.onload=g,j.onloadend=h,j.onerror=h,j.open("GET",n.requestModifierExt.modifyRequestURL(a),!0),j.send()}catch(o){j.onerror()}},e=function(a){this.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,{manifest:a.data.manifest})};return{log:void 0,parser:void 0,errHandler:void 0,metricsModel:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,xlinkController:void 0,load:function(b){d.call(this,b,a)},setup:function(){e=e.bind(this),this.xlinkController.subscribe(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,this,e)}}},MediaPlayer.dependencies.ManifestLoader.prototype={constructor:MediaPlayer.dependencies.ManifestLoader},MediaPlayer.dependencies.ManifestLoader.eventList={ENAME_MANIFEST_LOADED:"manifestLoaded"},MediaPlayer.dependencies.ManifestUpdater=function(){"use strict";var a,b=0/0,c=null,d=!0,e=!1,f=function(){null!==c&&(clearInterval(c),c=null)},g=function(){f.call(this),isNaN(b)||(this.log("Refresh manifest in "+b+" seconds."),c=setTimeout(i.bind(this),Math.min(1e3*b,Math.pow(2,31)-1),this))},h=function(a){var c,e;this.manifestModel.setValue(a),this.log("Manifest has been refreshed."),c=this.manifestExt.getRefreshDelay(a),e=((new Date).getTime()-a.loadedTime.getTime())/1e3,b=Math.max(c-e,0),this.notify(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,{manifest:a}),d||g.call(this)},i=function(){var b,c,f=this;d||e||(e=!0,b=f.manifestModel.getValue(),c=b.url,b.hasOwnProperty("Location")&&(c=b.Location),a.load(c))},j=function(a){a.error||h.call(this,a.data.manifest)},k=function(){d=!1,g.call(this)},l=function(){d=!0,f.call(this)},m=function(){e=!1};return{log:void 0,system:void 0,subscribe:void 0,unsubscribe:void 0,notify:void 0,manifestModel:void 0,manifestExt:void 0,setup:function(){this[MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED]=m,this[MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED]=j,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED]=k,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED]=l},initialize:function(b){e=!1,d=!0,a=b,a.subscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this)},setManifest:function(a){h.call(this,a)},getManifestLoader:function(){return a},reset:function(){d=!0,e=!1,f.call(this),a.unsubscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this),b=0/0}}},MediaPlayer.dependencies.ManifestUpdater.prototype={constructor:MediaPlayer.dependencies.ManifestUpdater},MediaPlayer.dependencies.ManifestUpdater.eventList={ENAME_MANIFEST_UPDATED:"manifestUpdated"},MediaPlayer.dependencies.Notifier=function(){"use strict";var a,b="observableId",c=0,d=function(){return this[b]||(c+=1,this[b]="_id_"+c),this[b]};return{system:void 0,setup:function(){a=this.system,a.mapValue("notify",this.notify),a.mapValue("subscribe",this.subscribe),a.mapValue("unsubscribe",this.unsubscribe)},notify:function(){var b=arguments[0]+d.call(this),c=new MediaPlayer.vo.Event;c.sender=this,c.type=arguments[0],c.data=arguments[1],c.error=arguments[2],c.timestamp=(new Date).getTime(),a.notify.call(a,b,c)},subscribe:function(b,c,e,f){if(!e&&c[b]&&(e=c[b]=c[b].bind(c)),!c)throw"observer object cannot be null or undefined";if(!e)throw"event handler cannot be null or undefined";b+=d.call(this),a.mapHandler(b,void 0,e,f)},unsubscribe:function(b,c,e){e=e||c[b],b+=d.call(this),a.unmapHandler(b,void 0,e)}}},MediaPlayer.dependencies.Notifier.prototype={constructor:MediaPlayer.dependencies.Notifier},MediaPlayer.dependencies.Stream=function(){"use strict";var a,b=[],c=!1,d=!1,e=null,f={},g=!1,h=!1,i=!1,j=null,k=function(a){this.errHandler.mediaKeySessionError(a.data),this.log(a.data),this.reset()},l=function(a,c){var d,f,g=this,h=null,i=g.manifestModel.getValue(),k=function(a){return a.codec},l=g.adapter.getMediaInfoForType(i,e,a);if("text"===a&&(k=function(a){return h=a.mimeType}),null!==l){var m,n=k.call(g,l);if("text"!==a&&"fragmentedText"!==a)if(d=n,g.log(a+" codec: "+d),m=l.contentProtection,m&&!g.capabilities.supportsEncryptedMedia())g.errHandler.capabilityError("encryptedmedia");else if(!g.capabilities.supportsCodec(g.videoModel.getElement(),d)){var o=a+"Codec ("+d+") is not supported.";return g.errHandler.manifestError(o,"codec",i),void g.log(o)}f=g.system.getObject("streamProcessor"),b.push(f),f.initialize(h||a,g.fragmentController,c,g,j),g.abrController.updateTopQualityIndex(l),f.updateMediaInfo(i,l)}else g.log("No "+a+" data.")},m=function(a){var c,f=this,h=f.manifestModel.getValue();if(j=f.system.getObject("eventController"),c=f.adapter.getEventsFor(h,e),j.addInlineEvents(c),g=!0,l.call(f,"video",a),l.call(f,"audio",a),l.call(f,"text",a),l.call(f,"fragmentedText",a),p.call(f),d=!0,g=!1,0===b.length){var i="No streams to play.";f.errHandler.manifestError(i,"nostreams",h),f.log(i)}else f.liveEdgeFinder.initialize(b[0]),f.liveEdgeFinder.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,f.playbackController);n.call(this)},n=function(){var i=this,j=b.length,k=!!f.audio||!!f.video,l=k?new MediaPlayer.vo.Error(MediaPlayer.dependencies.Stream.DATA_UPDATE_FAILED_ERROR_CODE,"Data update failed",null):null,m=0;for(m;j>m;m+=1)if(b[m].isUpdating()||g)return;h=!0,i.eventBus.dispatchEvent({type:MediaPlayer.events.STREAM_INITIALIZED,data:{streamInfo:e}}),i.notify(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,{streamInfo:e},l),d&&!c&&(a.init(i.manifestModel.getValue(),o.call(this,"audio"),o.call(this,"video")),c=!0)},o=function(a){for(var c=b.length,d=null,e=0;c>e;e+=1)if(d=b[e],d.getType()===a)return d.getMediaInfo();return null},p=function(){for(var a=0,c=b.length;c>a;a+=1)b[a].createBuffer()},q=function(){var a=s(),b=a.length,c=0;for(c;b>c;c+=1)if(!a[c].isBufferingCompleted())return;this.notify(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,{streamInfo:e})},r=function(a){var b=a.sender.streamProcessor.getType();f[b]=a.error,n.call(this)},s=function(){var a,c,d=[],e=0,f=b.length;for(e;f>e;e+=1)c=b[e],a=c.getType(),("audio"===a||"video"===a)&&d.push(c);return d},t=function(a){var d,f,i,k=this,l=b.length,m=k.manifestModel.getValue(),o=0;for(c=!1,e=a,k.log("Manifest updated... set new data on buffers."),j&&(f=k.adapter.getEventsFor(m,e),j.addInlineEvents(f)),g=!0,h=!1,o;l>o;o+=1)i=b[o],d=k.adapter.getMediaInfoForType(m,e,i.getType()),this.abrController.updateTopQualityIndex(d),i.updateMediaInfo(m,d);g=!1,n.call(k)};return{system:void 0,eventBus:void 0,manifestModel:void 0,sourceBufferExt:void 0,adapter:void 0,videoModel:void 0,fragmentController:void 0,playbackController:void 0,capabilities:void 0,log:void 0,errHandler:void 0,liveEdgeFinder:void 0,abrController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED]=q,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=r,this[MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR]=k.bind(this)},initialize:function(b,c,d){e=b,this.capabilities.supportsEncryptedMedia()&&(c||(c=this.system.getObject("protectionController"),i=!0),a=c,a.subscribe(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,this),a.setMediaElement(this.videoModel.getElement()),d&&a.setProtectionData(d))},activate:function(a){c?p.call(this):m.call(this,a)},deactivate:function(){var a=b.length,e=0;for(e;a>e;e+=1)b[e].reset();b=[],c=!1,d=!1,this.resetEventController()},reset:function(e){this.playbackController.pause();var k,l=b.length,m=0;for(m;l>m;m+=1)k=b[m],k.reset(e),k=null;j&&j.reset(),b=[],g=!1,h=!1,this.fragmentController&&this.fragmentController.reset(),this.fragmentController=void 0,this.liveEdgeFinder.abortSearch(),this.liveEdgeFinder.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.playbackController),a&&(a.unsubscribe(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,this),i&&(a.teardown(),a=null,i=!1)),d=!1,c=!1,f={}},getDuration:function(){return e.duration},getStartTime:function(){return e.start},getStreamIndex:function(){return e.index},getId:function(){return e.id},getStreamInfo:function(){return e},hasMedia:function(a){return null!==o.call(this,a)},getBitrateListFor:function(a){var b=o.call(this,a);return this.abrController.getBitrateList(b)},startEventController:function(){j.start()},resetEventController:function(){j.reset()},isActivated:function(){return c},isInitialized:function(){return h},updateData:t}},MediaPlayer.dependencies.Stream.prototype={constructor:MediaPlayer.dependencies.Stream},MediaPlayer.dependencies.Stream.DATA_UPDATE_FAILED_ERROR_CODE=1,MediaPlayer.dependencies.Stream.eventList={ENAME_STREAM_UPDATED:"streamUpdated",ENAME_STREAM_BUFFERING_COMPLETED:"streamBufferingCompleted"},MediaPlayer.dependencies.StreamProcessor=function(){"use strict";var a,b=null,c=null,d=null,e=null,f=function(a){var b=this,c="video"===a||"audio"===a||"fragmentedText"===a?"bufferController":"textController";return b.system.getObject(c)};return{system:void 0,videoModel:void 0,indexHandler:void 0,liveEdgeFinder:void 0,timelineConverter:void 0,abrController:void 0,playbackController:void 0,baseURLExt:void 0,adapter:void 0,manifestModel:void 0,initialize:function(c,g,h,i,j){var k,l=this,m=l.system.getObject("trackController"),n=l.system.getObject("scheduleController"),o=l.liveEdgeFinder,p=l.abrController,q=l.indexHandler,r=l.baseURLExt,s=l.playbackController,t=this.system.getObject("fragmentLoader"),u=f.call(l,c);b=i,d=c,e=j,a=b.getStreamInfo().manifestInfo.isDynamic,l.bufferController=u,l.scheduleController=n,l.trackController=m,l.fragmentController=g,l.fragmentLoader=t,m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,u),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED,u),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,b),"video"===d||"audio"===d||"fragmentedText"===d?(p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,u),p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,m),p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,n),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.timelineConverter),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,m),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,n),b.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,s),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED,u),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,n),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,n),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,u),g.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,n.scheduleRulesCollection.bufferLevelRule),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,s),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,m),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED,b),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,n),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,n.scheduleRulesCollection.bufferLevelRule),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,n.scheduleRulesCollection.bufferLevelRule),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,s),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,u),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,u),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,u),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,u),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,n.scheduleRulesCollection.playbackTimeRule),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,p.abrRulesCollection.insufficientBufferRule),a&&s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,m),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,u),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,n),r.subscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,q),r.subscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,q)):u.subscribe(MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,n),q.initialize(this),q.setCurrentTime(s.getStreamStartTime(this.getStreamInfo())),u.initialize(d,h,l),n.initialize(d,this),p.initialize(d,this),k=this.getFragmentModel(),k.setLoader(t),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,g),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,g),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,g),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,n),t.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,k),t.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,p),("video"===d||"audio"===d||"fragmentedText"===d)&&(u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,k),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,k),u.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,k)),m.initialize(this)},isUpdating:function(){return this.trackController.isUpdating()},getType:function(){return d},getABRController:function(){return this.abrController},getFragmentLoader:function(){return this.fragmentLoader},getFragmentModel:function(){return this.scheduleController.getFragmentModel()},getStreamInfo:function(){return b.getStreamInfo()},updateMediaInfo:function(a,b){b===c||b&&c&&b.type!==c.type||(c=b),this.adapter.updateData(a,this)},getMediaInfo:function(){return c},getScheduleController:function(){return this.scheduleController},getEventController:function(){return e},start:function(){this.scheduleController.start()},stop:function(){this.scheduleController.stop()},getCurrentTrack:function(){return this.adapter.getCurrentTrackInfo(this.manifestModel.getValue(),this.trackController)},getTrackForQuality:function(a){return this.adapter.getTrackInfoForQuality(this.manifestModel.getValue(),this.trackController,a)},isBufferingCompleted:function(){return this.bufferController.isBufferingCompleted()},createBuffer:function(){return this.bufferController.getBuffer()||this.bufferController.createBuffer(c)},isDynamic:function(){return a},reset:function(f){var g=this,h=g.bufferController,i=g.trackController,j=g.scheduleController,k=g.liveEdgeFinder,l=g.fragmentController,m=g.abrController,n=g.playbackController,o=this.indexHandler,p=this.baseURLExt,q=this.getFragmentModel(),r=this.fragmentLoader;m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,h),m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,i),m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,j),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.timelineConverter),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,j),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,i),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED,j),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,h),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,j),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,b),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,n),b.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,n),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,i),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED,b),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,n),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,i),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,j.scheduleRulesCollection.playbackTimeRule),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,m.abrRulesCollection.insufficientBufferRule),p.unsubscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,o),p.unsubscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,o),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,q),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,q),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,q),q.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,l),q.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,l),q.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,l),q.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,j),r.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,q),r.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,m),q.reset(),o.reset(),this.bufferController.reset(f),this.scheduleController.reset(),this.bufferController=null,this.scheduleController=null,this.trackController=null,this.videoModel=null,this.fragmentController=null,a=void 0,b=null,c=null,d=null,e=null}}},MediaPlayer.dependencies.StreamProcessor.prototype={constructor:MediaPlayer.dependencies.StreamProcessor},MediaPlayer.utils.TTMLParser=function(){"use strict";var a,b=3600,c=60,d=/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])((\.[0-9][0-9][0-9])|(:[0-9][0-9]))$/,e=function(e){var f,g,h,i=d.test(e);if(!i)return 0/0;if(f=e.split(":"),g=parseFloat(f[0])*b+parseFloat(f[1])*c+parseFloat(f[2]),f[3]){if(h=a.tt.frameRate,!h||isNaN(h))return 0/0;g+=parseFloat(f[3])/h}return g},f=function(){var b=!1,c=a.hasOwnProperty("tt"),d=c?a.tt.hasOwnProperty("head"):!1,e=d?a.tt.head.hasOwnProperty("layout"):!1,f=d?a.tt.head.hasOwnProperty("styling"):!1,g=c?a.tt.hasOwnProperty("body"):!1;return c&&d&&e&&f&&g&&(b=!0),b},g=function(a,b){var c=Object.keys(a).filter(function(c){return"xmlns"===c.split(":")[0]&&a[c]===b}).map(function(a){return a.split(":")[1]});return 1!=c.length?null:c[0]},h=function(b){var c,d,h,i,j,k,l,m,n,o=[],p=new X2JS([],"",!1);if(a=p.xml_str2json(b),!f())throw c="TTML document has incorrect structure";if(k=g(a.tt,"http://www.w3.org/ns/ttml#parameter"),a.tt.hasOwnProperty(k+":frameRate")&&(a.tt.frameRate=parseInt(a.tt[k+":frameRate"],10)),d=a.tt.body.div_asArray?a.tt.body.div_asArray[0].p_asArray:a.tt.body.p_asArray,!d||0===d.length)throw c="TTML document does not contain any cues";for(m=0;m<d.length;m+=1){if(h=d[m],i=e(h.begin),j=e(h.end),isNaN(i)||isNaN(j))throw c="TTML document has incorrect timing value";if(void 0!==h["smpte:backgroundImage"]){var q=a.tt.head.metadata.image_asArray;for(n=0;n<q.length;n+=1)"#"+q[n]["xml:id"]==h["smpte:backgroundImage"]&&o.push({start:i,end:j,id:q[n]["xml:id"],data:"data:image/"+q[n].imagetype.toLowerCase()+";base64, "+q[n].__text,type:"image"})}else l=h.span_asArray?h.span_asArray[0].__text:h.__text,o.push({start:i,end:j,data:l,type:"text"})}return o};return{parse:h}},MediaPlayer.dependencies.TextSourceBuffer=function(){var a,b;return{system:void 0,videoModel:void 0,eventBus:void 0,errHandler:void 0,initialize:function(c,d){b=c,a=d.streamProcessor.getCurrentTrack().mediaInfo,this.buffered=this.system.getObject("customTimeRanges"),this.initializationSegmentReceived=!1,this.timescale=9e4},append:function(c,d){var e,f,g,h,i,j,k=this;if("fragmentedText"==b){var l;if(this.initializationSegmentReceived)for(l=k.system.getObject("fragmentExt"),h=l.getSamplesInfo(c.buffer),i=0;i<h.length;i++){this.firstSubtitleStart||(this.firstSubtitleStart=h[0].cts-d.start*this.timescale),h[i].cts-=this.firstSubtitleStart,this.buffered.add(h[i].cts/this.timescale,(h[i].cts+h[i].duration)/this.timescale),j=window.UTF8.decode(new Uint8Array(c.buffer.slice(h[i].offset,h[i].offset+h[i].size)));var m=this.system.getObject("ttmlParser");try{e=m.parse(j),this.textTrackExtensions.addCaptions(this.firstSubtitleStart/this.timescale,e)}catch(n){}}else this.initializationSegmentReceived=!0,f=a.id,g=a.lang,this.textTrackExtensions=k.getTextTrackExtensions(),this.textTrackExtensions.addTextTrack(k.videoModel.getElement(),e,f,g,!0),k.eventBus.dispatchEvent({type:MediaPlayer.events.TEXT_TRACK_ADDED}),l=k.system.getObject("fragmentExt"),this.timescale=l.getMediaTimescaleFromMoov(c.buffer)}else{j=window.UTF8.decode(c);try{e=k.getParser().parse(j),f=a.id,g=a.lang,k.getTextTrackExtensions().addTextTrack(k.videoModel.getElement(),e,f,g,!0),k.eventBus.dispatchEvent({type:MediaPlayer.events.TEXT_TRACK_ADDED})}catch(n){k.errHandler.closedCaptionsError(n,"parse",j)}}},abort:function(){this.getTextTrackExtensions().deleteCues(this.videoModel.getElement())},getParser:function(){var a;return"text/vtt"===b?a=this.system.getObject("vttParser"):"application/ttml+xml"===b&&(a=this.system.getObject("ttmlParser")),a},getTextTrackExtensions:function(){return this.system.getObject("textTrackExtensions")},addEventListener:function(a,b,c){this.eventBus.addEventListener(a,b,c)},removeEventListener:function(a,b,c){this.eventBus.removeEventListener(a,b,c)}}},MediaPlayer.dependencies.TextSourceBuffer.prototype={constructor:MediaPlayer.dependencies.TextSourceBuffer},MediaPlayer.dependencies.TimeSyncController=function(){"use strict";var a,b=5e3,c=0,d=!1,e=!1,f=function(a){d=a},g=function(){return d},h=function(a){e=a},i=function(a){c=a},j=function(){return c},k=function(a){var b,c,d=60,e=60,f=1e3,g=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+\-])([0-9]{2})([0-9]{2}))?/,h=g.exec(a);return b=Date.UTC(parseInt(h[1],10),parseInt(h[2],10)-1,parseInt(h[3],10),parseInt(h[4],10),parseInt(h[5],10),h[6]&&(parseInt(h[6],10)||0),h[7]&&parseFloat(h[7])*f||0),h[9]&&h[10]&&(c=parseInt(h[9],10)*e+parseInt(h[10],10),b+=("+"===h[8]?-1:1)*c*d*f),new Date(b).getTime()},l=function(a){var b=Date.parse(a);return isNaN(b)&&(b=k(a)),b},m=function(a){return Date.parse(a)},n=function(a){return Date.parse(a)},o=function(a,b,c){c()},p=function(a,b,c){var d=l(a);return isNaN(d)?void c():void b(d)},q=function(a,c,d,e,f){var g,h,i=!1,j=new XMLHttpRequest,k=f?"HEAD":"GET",l=c.match(/\S+/g);c=l.shift(),g=function(){i||(i=!0,l.length?q(a,l.join(" "),d,e,f):e())},h=function(){var b,c;200===j.status&&(b=f?j.getResponseHeader("Date"):j.response,c=a(b),isNaN(c)||(d(c),i=!0))},j.open(k,c),j.timeout=b||0,j.onload=h,j.onloadend=g,j.send()},r=function(a,b,c){q.call(this,n,a,b,c,!0)},s={"urn:mpeg:dash:utc:http-head:2014":r,"urn:mpeg:dash:utc:http-xsdate:2014":q.bind(null,l),"urn:mpeg:dash:utc:http-iso:2014":q.bind(null,m),"urn:mpeg:dash:utc:direct:2014":p,"urn:mpeg:dash:utc:http-head:2012":r,"urn:mpeg:dash:utc:http-xsdate:2012":q.bind(null,l),"urn:mpeg:dash:utc:http-iso:2012":q.bind(null,m),"urn:mpeg:dash:utc:direct:2012":p,"urn:mpeg:dash:utc:http-ntp:2014":o,"urn:mpeg:dash:utc:ntp:2014":o,"urn:mpeg:dash:utc:sntp:2014":o},t=function(){var a=this.metricsModel.getReadOnlyMetricsFor("stream"),b=this.metricsExt.getLatestMPDRequestHeaderValueByID(a,"Date"),d=null!==b?new Date(b).getTime():Number.NaN;isNaN(d)?u.call(this,!0):(i(d-(new Date).getTime()),u.call(this,!1,d/1e3,c))},u=function(a,b,c){f(!1),this.notify(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,{time:b,offset:c},a?new MediaPlayer.vo.Error(MediaPlayer.dependencies.TimeSyncController.TIME_SYNC_FAILED_ERROR_CODE):null)},v=function(b,c){var d=this,e=c||0,g=b[e],h=function(b,c){var e=!b||!c;e&&a?t.call(d):u.call(d,e,b,c)};f(!0),g?s.hasOwnProperty(g.schemeIdUri)?s[g.schemeIdUri](g.value,function(a){var b=(new Date).getTime(),c=a-b;i(c),d.log("Local time:      "+new Date(b)),d.log("Server time:     "+new Date(a)),d.log("Difference (ms): "+c),
h.call(d,a,c)},function(){v.call(d,b,e+1)}):v.call(d,b,e+1):(i(0),h.call(d))};return{log:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,metricsModel:void 0,metricsExt:void 0,getOffsetToDeviceTimeMs:function(){return j()},initialize:function(b,c){a=c,g()||(v.call(this,b),h(!0))},reset:function(){h(!1),f(!1)}}},MediaPlayer.dependencies.TimeSyncController.prototype={constructor:MediaPlayer.dependencies.TimeSyncController},MediaPlayer.dependencies.TimeSyncController.eventList={ENAME_TIME_SYNCHRONIZATION_COMPLETED:"timeSynchronizationComplete"},MediaPlayer.dependencies.TimeSyncController.TIME_SYNC_FAILED_ERROR_CODE=1,MediaPlayer.utils.VTTParser=function(){"use strict";var a=/(?:\r\n|\r|\n)/gm,b=/-->/,c=/(^[\s]+|[\s]+$)/g,d=/\s\b/g,e=function(a){var b=a.split(":"),c=b.length-1;return a=60*parseInt(b[c-1],10)+parseFloat(b[c]),2===c&&(a+=3600*parseInt(b[0],10)),a},f=function(a){var c=a.split(b),e=c[1].split(d);return e.shift(),c[1]=e[0],e.shift(),{cuePoints:c,styles:g(e)}},g=function(a){var b={};return a.forEach(function(a){if(a.split(/:/).length>1){var c=a.split(/:/)[1];c&&-1!=c.search(/%/)&&(c=parseInt(c.replace(/%/,""))),(a.match(/align/)||a.match(/A/))&&(b.align=c),(a.match(/line/)||a.match(/L/))&&(b.line=c),(a.match(/position/)||a.match(/P/))&&(b.position=c),(a.match(/size/)||a.match(/S/))&&(b.size=c)}}),b},h=function(a,c){for(var d,e=c,f="",g="";""!==a[e]&&e<a.length;)e++;if(d=e-c,d>1)for(var h=0;d>h;h++){if(g=a[c+h],g.match(b)){f="";break}f+=g,h!==d-1&&(f+="\n")}else g=a[c],g.match(b)||(f=g);return decodeURI(f)};return{log:void 0,parse:function(d){var g,i,j=[];d=d.split(a),g=d.length,i=-1;for(var k=0;g>k;k++){var l=d[k];if(l.length>0&&"WEBVTT"!==l&&l.match(b)){var m=f(l),n=m.cuePoints,o=m.styles,p=h(d,k+1),q=e(n[0].replace(c,"")),r=e(n[1].replace(c,""));!Number.isNaN(q)&&!Number.isNaN(r)&&q>=i&&r>q?""!==p?(i=q,j.push({start:q,end:r,data:p,styles:o})):this.log("Skipping cue due to empty/malformed cue text"):this.log("Skipping cue due to incorrect cue timing")}}return j}}},MediaPlayer.dependencies.XlinkLoader=function(){"use strict";var a=1,b=500,c="urn:mpeg:dash:resolve-to-zero:2013",d=function(a,c,e,f){var g,h,i,j=new XMLHttpRequest,k=this,l=null,m=!0,n=new Date;h=function(){j.status<200||j.status>299||(m=!1,k.metricsModel.addHttpRequest("stream",null,"XLink",a,null,null,n,l,null,j.status,null,null,j.getAllResponseHeaders()),i=j.responseText,c.resolved=!0,i?(c.resolvedContent=i,k.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e})):(c.resolvedContent=null,k.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e},new MediaPlayer.vo.Error(null,"Failed loading Xlink element: "+a,null))))},g=function(){m&&(m=!1,k.metricsModel.addHttpRequest("stream",null,"xlink",a,null,null,n,new Date,j.status,null,null,j.getAllResponseHeaders()),f>0?(console.log("Failed loading xLink content: "+a+", retry in "+b+"ms attempts: "+f),f--,setTimeout(function(){d.call(k,a,c,e,f)},b)):(console.log("Failed loading Xlink content: "+a+" no retry attempts left"),k.errHandler.downloadError("xlink",a,j),c.resolvedContent=null,k.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e},new Error("Failed loading xlink Element: "+a+" no retry attempts left"))))};try{j.onload=h,j.onloadend=g,j.onerror=g,j.open("GET",k.requestModifierExt.modifyRequestURL(a),!0),j.send()}catch(o){console.log("Error"),j.onerror()}};return{errHandler:void 0,metricsModel:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,load:function(b,e,f){b===c?(e.resolvedContent=null,e.resolved=!0,this.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:e,resolveObject:f})):d.call(this,b,e,f,a)}}},MediaPlayer.dependencies.XlinkLoader.prototype={constructor:MediaPlayer.dependencies.XlinkLoader},MediaPlayer.dependencies.XlinkLoader.eventList={ENAME_XLINKELEMENT_LOADED:"xlinkElementLoaded"},MediaPlayer.dependencies.AbrController=function(){"use strict";var a,b=!0,c={},d={},e={},f={},g={},h={},i=function(a,b){var c;return d[b]=d[b]||{},d[b].hasOwnProperty(a)||(d[b][a]=0),c=d[b][a]},j=function(a,b,c){d[b]=d[b]||{},d[b][a]=c},k=function(a,b){var c;return e[b]=e[b]||{},e[b].hasOwnProperty(a)||(e[b][a]=0),c=e[b][a]},l=function(a,b,c){e[b]=e[b]||{},e[b][a]=c},m=function(a,b,d){c[b]=c[b]||{},c[b][a]=d},n=function(a){return f[a]},o=function(a,b){f[a]=b},p=function(a){return f.hasOwnProperty("max")&&f.max.hasOwnProperty(a)?f.max[a]:0/0},q=function(a,b){f.max=f.max||{},f.max[a]=b},r=function(a,b){var d;return c[b]=c[b]||{},c[b].hasOwnProperty(a)||(c[b][a]=0),d=s.call(this,c[b][a],a)},s=function(a,b){var c=p(b);if(isNaN(c))return a;var d=this.getQualityForBitrate(g[b].getMediaInfo(),c);return Math.min(a,d)},t=function(b){if(0===MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD){var c=this,d=b.data.request.mediaType,e=c.abrRulesCollection.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.ABANDON_FRAGMENT_RULES),f=g[d].getScheduleController(),h=f.getFragmentModel(),i=function(b){function e(b){a=setTimeout(function(){c.setAbandonmentStateFor(b,MediaPlayer.dependencies.AbrController.ALLOW_LOAD)},MediaPlayer.dependencies.AbrController.ABANDON_TIMEOUT)}if(b.confidence===MediaPlayer.rules.SwitchRequest.prototype.STRONG){var g=h.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}),i=b.value,j=c.getQualityFor(d,c.streamController.getActiveStreamInfo());j>i&&(h.abortRequests(),c.setAbandonmentStateFor(d,MediaPlayer.dependencies.AbrController.ABANDON_LOAD),c.setPlaybackQuality(d,c.streamController.getActiveStreamInfo(),i),f.replaceCanceledRequests(g),e(d))}};c.rulesController.applyRules(e,g[d],i,b,function(a,b){return b})}};return{log:void 0,abrRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,streamController:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS]=t},initialize:function(a,b){g[a]=b,h[a]=h[a]||{},h[a].state=MediaPlayer.dependencies.AbrController.ALLOW_LOAD},getAutoSwitchBitrate:function(){return b},setAutoSwitchBitrate:function(a){b=a},getPlaybackQuality:function(a){var c,d,e,f,g=this,m=a.getType(),n=a.getStreamInfo().id,o=function(b){var e=r.call(g,m,n);c=b.value,f=b.confidence,0>c&&(c=0),c>e&&(c=e),d=i(m,n),c===d||h[m].state===MediaPlayer.dependencies.AbrController.ABANDON_LOAD&&c>d||(j(m,n,c),l(m,n,f),g.notify(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,{mediaType:m,streamInfo:a.getStreamInfo(),oldQuality:d,newQuality:c}))};c=i(m,n),f=k(m,n),b&&(e=g.abrRulesCollection.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES),g.rulesController.applyRules(e,a,o.bind(g),c,function(a,b){return a=a===MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE?0:a,Math.max(a,b)}))},setPlaybackQuality:function(a,b,c){var d=b.id,e=i(a,d),f=null!==c&&!isNaN(c)&&c%1===0;if(!f)throw"argument is not an integer";c!==e&&c>=0&&c<=r.call(this,a,d)&&(j(a,b.id,c),this.notify(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,{mediaType:a,streamInfo:b,oldQuality:e,newQuality:c}))},setAbandonmentStateFor:function(a,b){h[a].state=b},getAbandonmentStateFor:function(a){return h[a].state},getQualityFor:function(a,b){return i(a,b.id)},getConfidenceFor:function(a,b){return k(a,b.id)},setInitialBitrateFor:function(a,b){o(a,b)},getInitialBitrateFor:function(a){return n(a)},setMaxAllowedBitrateFor:function(a,b){q(a,b)},getMaxAllowedBitrateFor:function(a){return p(a)},getQualityForBitrate:function(a,b){for(var c,d=this.getBitrateList(a),e=d.length,f=0;e>f;f+=1)if(c=d[f],1e3*b<=c.bitrate)return Math.max(f-1,0);return e-1},getBitrateList:function(a){if(!a||!a.bitrateList)return null;for(var b,c=a.bitrateList,d=a.type,e=[],f=0,g=c.length;g>f;f+=1)b=new MediaPlayer.vo.BitrateInfo,b.mediaType=d,b.qualityIndex=f,b.bitrate=c[f],e.push(b);return e},updateTopQualityIndex:function(a){var b,c=a.type,d=a.streamInfo.id;return b=a.trackCount-1,m(c,d,b),b},isPlayingAtTopQuality:function(a){var b,c=this,d=a.id,e=c.getQualityFor("audio",a),f=c.getQualityFor("video",a);return b=e===r.call(this,"audio",d)&&f===r.call(this,"video",d)},getTopQualityIndexFor:r,reset:function(){b=!0,c={},d={},e={},g={},h={},clearTimeout(a),a=null}}},MediaPlayer.dependencies.AbrController.prototype={constructor:MediaPlayer.dependencies.AbrController},MediaPlayer.dependencies.AbrController.eventList={ENAME_QUALITY_CHANGED:"qualityChanged"},MediaPlayer.dependencies.AbrController.DEFAULT_VIDEO_BITRATE=1e3,MediaPlayer.dependencies.AbrController.DEFAULT_AUDIO_BITRATE=100,MediaPlayer.dependencies.AbrController.ABANDON_LOAD="abandonload",MediaPlayer.dependencies.AbrController.ALLOW_LOAD="allowload",MediaPlayer.dependencies.AbrController.ABANDON_TIMEOUT=1e4,MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY=.9,MediaPlayer.dependencies.BufferController=function(){"use strict";var a,b,c,d,e=.5,f=0,g=-1,h=!1,i=0,j=0,k=Number.POSITIVE_INFINITY,l=-1,m=-1,n=null,o=null,p=!1,q=!1,r=!1,s=function(c){if(!c||!a||!this.streamProcessor)return null;var d=null;try{d=this.sourceBufferExt.createSourceBuffer(a,c),d&&d.hasOwnProperty("initialize")&&d.initialize(b,this)}catch(e){this.errHandler.mediaSourceError("Error creating "+b+" source buffer.")}return this.setBuffer(d),M.call(this,this.streamProcessor.getTrackForQuality(f).MSETimeOffset),d},t=function(){var a=this.streamProcessor.getStreamInfo().id,b=this.streamController.getActiveStreamInfo().id;return a===b},u=function(){var a=this.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}),c=Q.call(this),d=this.virtualBuffer.getChunks({streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,quality:g});return g>f&&(v(d,g)||v(a,g))?!1:g!==f},v=function(a,b){var c=0,d=a.length;for(c;d>c;c+=1)if(a[c].quality===b)return!0;return!1},w=function(a){var b,c=this;a.data.fragmentModel===c.streamProcessor.getFragmentModel()&&(c.log("Initialization finished loading"),b=a.data.chunk,this.virtualBuffer.append(b),b.quality===f&&u.call(c)&&$.call(c))},x=function(a){if(a.data.fragmentModel===this.streamProcessor.getFragmentModel()){var b,c=a.data.chunk,d=c.bytes,e=c.quality,f=c.index,g=this.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,quality:e,index:f})[0],h=this.streamProcessor.getTrackForQuality(e),i=this.manifestModel.getValue(),j=this.adapter.getEventsFor(i,h.mediaInfo,this.streamProcessor),k=this.adapter.getEventsFor(i,h,this.streamProcessor);(j.length>0||k.length>0)&&(b=B.call(this,d,g,j,k),this.streamProcessor.getEventController().addInbandEvents(b)),c.bytes=C.call(this,d),this.virtualBuffer.append(c),O.call(this)}},y=function(a){q=!0,d=a;var b=this,c=a.quality,e=isNaN(a.index);return c!==f&&e||c!==g&&!e?void S.call(b,c,a.index):void b.sourceBufferExt.append(n,a)},z=function(b){if(n===b.data.buffer){this.isBufferingCompleted()&&this.streamProcessor.getStreamInfo().isLast&&this.mediaSourceExt.signalEndOfStream(a);var c,e=this;if(b.error)return b.error.code===MediaPlayer.dependencies.SourceBufferExtensions.QUOTA_EXCEEDED_ERROR_CODE&&(e.virtualBuffer.append(d),k=.8*e.sourceBufferExt.getTotalBufferedTime(n),e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,{criticalBufferLevel:k}),G.call(e)),void(q=!1);if(A.call(e),F.call(e)||(e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,{criticalBufferLevel:k}),G.call(e)),c=e.sourceBufferExt.getAllRanges(n),c&&c.length>0){var f,g;for(f=0,g=c.length;g>f;f+=1)e.log("Buffered Range: "+c.start(f)+" - "+c.end(f))}e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,{quality:d.quality,index:d.index,bufferedRanges:c}),R.call(e,d.quality,d.index)}},A=function(){var a=this,b=a.playbackController.getTime();return i=a.sourceBufferExt.getBufferLength(n,b),a.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,{bufferLevel:i}),D.call(a),J.call(a),e>i&&L.call(a,!1),!0},B=function(a,b,c,d){var e,f,g,h,i=[],j=0,k=Math.pow(256,2),l=Math.pow(256,3),m=Math.max(isNaN(b.startTime)?0:b.startTime,0),n=[];r=!1,h=c.concat(d);for(var o=0;o<h.length;o++)n[h[o].schemeIdUri]=h[o];for(;j<a.length&&(e=String.fromCharCode(a[j+4],a[j+5],a[j+6],a[j+7]),f=a[j]*l+a[j+1]*k+256*a[j+2]+1*a[j+3],"moov"!=e&&"moof"!=e);){if("emsg"==e){r=!0;for(var p=["","",0,0,0,0,""],q=0,s=j+12;f+j>s;)0===q||1==q||6==q?(0!==a[s]?p[q]+=String.fromCharCode(a[s]):q+=1,s+=1):(p[q]=a[s]*l+a[s+1]*k+256*a[s+2]+1*a[s+3],s+=4,q+=1);g=this.adapter.getEvent(p,n,m),g&&i.push(g)}j+=f}return i},C=function(a){if(!r)return a;for(var b,c,d=a.length,e=0,f=0,g=Math.pow(256,2),h=Math.pow(256,3),i=new Uint8Array(a.length);d>e;){if(b=String.fromCharCode(a[e+4],a[e+5],a[e+6],a[e+7]),c=a[e]*h+a[e+1]*g+256*a[e+2]+1*a[e+3],"emsg"!=b)for(var j=e;e+c>j;j++)i[f]=a[j],f+=1;e+=c}return i.subarray(0,f)},D=function(){var a=E.call(this),b=2*c,d=i-a;d>=b&&!p?(p=!0,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN)):b/2>d&&p&&(this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED),p=!1,O.call(this))},E=function(){var a=this.metricsModel.getReadOnlyMetricsFor("video"),b=this.metricsExt.getCurrentBufferLevel(a),c=this.metricsModel.getReadOnlyMetricsFor("audio"),d=this.metricsExt.getCurrentBufferLevel(c),e=null;return e=null===b||null===d?null!==d?d.level:null!==b?b.level:null:Math.min(d.level,b.level)},F=function(){var a=this,b=a.sourceBufferExt.getTotalBufferedTime(n);return k>b},G=function(){var b,c,d,e,f,g=this;n&&(b=g.playbackController.getTime(),f=g.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,time:b})[0],d=f&&!isNaN(f.startTime)?f.startTime:Math.floor(b),e=g.sourceBufferExt.getBufferRange(n,b),null===e&&n.buffered.length>0&&(d=n.buffered.end(n.buffered.length-1)),c=n.buffered.start(0),g.sourceBufferExt.remove(n,c,d,a))},H=function(a){n===a.data.buffer&&(A.call(this),this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,{from:a.data.from,to:a.data.to,hasEnoughSpaceToAppend:F.call(this)}),F.call(this)||setTimeout(G.bind(this),1e3*c))},I=function(){var a=l===m-1;a&&!h&&(h=!0,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED))},J=function(){var a=this.playbackController.getTimeToStreamEnd();e>i&&a>c||c>=a&&!h?L.call(this,!1):L.call(this,!0)},K=function(){return o?MediaPlayer.dependencies.BufferController.BUFFER_LOADED:MediaPlayer.dependencies.BufferController.BUFFER_EMPTY},L=function(a){if(o!==a){o=a;var c=K(),d=c===MediaPlayer.dependencies.BufferController.BUFFER_LOADED?MediaPlayer.events.BUFFER_LOADED:MediaPlayer.events.BUFFER_EMPTY;P.call(this),this.eventBus.dispatchEvent({type:d,data:{bufferType:b}}),this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,{hasSufficientBuffer:a}),this.log(o?"Got enough buffer to start.":"Waiting for more buffer before starting playback.")}},M=function(a){n&&n.timestampOffset!==a&&!isNaN(a)&&(n.timestampOffset=a)},N=function(){if(n){var a=this,b=this.streamProcessor.getScheduleController().getFragmentToLoadCount(),c=this.streamProcessor.getCurrentTrack().fragmentDuration;A.call(a),j=b>0?b*c+i:j,P.call(this),O.call(a)}},O=function(){u.call(this)?$.call(this):V.call(this)},P=function(){if(t.call(this)){this.metricsModel.addBufferState(b,K(),j);var a,c=i;a=this.virtualBuffer.getTotalBufferLevel(this.streamProcessor.getMediaInfo()),a&&(c+=a),this.metricsModel.addBufferLevel(b,new Date,c)}},Q=function(){return this.streamProcessor.getStreamInfo().id},R=function(a,b){q=!1,isNaN(b)?T.call(this,a):U.call(this,b),O.call(this)},S=function(a,b){q=!1,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,{quality:a,index:b}),O.call(this)},T=function(a){g=a},U=function(a){l=Math.max(a,l),I.call(this)},V=function(){var a,c=Q.call(this);!n||p||q||u.call(this)||!F.call(this)||(a=this.virtualBuffer.extract({streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,limit:1})[0],a&&y.call(this,a))},W=function(a){if(!a.error){var b,d=this;M.call(d,a.data.currentRepresentation.MSETimeOffset),b=d.streamProcessor.getStreamInfo().manifestInfo.minBufferTime,c!==b&&(d.setMinBufferTime(b),d.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_MIN_BUFFER_TIME_UPDATED,{minBufferTime:b}))}},X=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&(m=a.data.request.index,I.call(b))},Y=function(a){if(b===a.data.mediaType&&this.streamProcessor.getStreamInfo().id===a.data.streamInfo.id){var c=this,d=a.data.newQuality;f!==d&&(M.call(c,c.streamProcessor.getTrackForQuality(d).MSETimeOffset),f=d,u.call(c)&&$.call(c))}},Z=function(){P.call(this)},$=function(){var a=this,c=Q.call(a),d={streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE,quality:f},e=a.virtualBuffer.getChunks(d)[0];if(e){if(q||!n)return;y.call(a,e)}else a.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,{requiredQuality:f})},_=function(){O.call(this)},aa=function(){J.call(this)};return{sourceBufferExt:void 0,eventBus:void 0,bufferMax:void 0,manifestModel:void 0,errHandler:void 0,mediaSourceExt:void 0,metricsModel:void 0,metricsExt:void 0,streamController:void 0,playbackController:void 0,adapter:void 0,log:void 0,abrController:void 0,system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,virtualBuffer:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=W,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED]=w,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED]=x,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=X,this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=Y,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS]=N,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=N,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED]=N,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED]=aa,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=_,z=z.bind(this),H=H.bind(this),Z=Z.bind(this),this.sourceBufferExt.subscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,this,z),this.sourceBufferExt.subscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,this,H),this.virtualBuffer.subscribe(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,this,Z)},initialize:function(a,c,d){var e=this;b=a,e.setMediaType(b),e.setMediaSource(c),e.streamProcessor=d,e.fragmentController=d.fragmentController,e.scheduleController=d.scheduleController,f=e.abrController.getQualityFor(b,d.getStreamInfo())},createBuffer:s,getStreamProcessor:function(){return this.streamProcessor},setStreamProcessor:function(a){this.streamProcessor=a},getBuffer:function(){return n},setBuffer:function(a){n=a},getBufferLevel:function(){return i},getMinBufferTime:function(){return c},setMinBufferTime:function(a){c=a},getCriticalBufferLevel:function(){return k},setMediaSource:function(b){a=b},isBufferingCompleted:function(){return h},reset:function(b){var e=this;k=Number.POSITIVE_INFINITY,o=null,c=null,g=-1,m=-1,l=-1,f=0,e.sourceBufferExt.unsubscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,e,z),e.sourceBufferExt.unsubscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,e,H),d=null,this.virtualBuffer.unsubscribe(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,e,Z),p=!1,q=!1,b||(e.sourceBufferExt.abort(a,n),e.sourceBufferExt.removeSourceBuffer(a,n)),n=null}}},MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED="required",MediaPlayer.dependencies.BufferController.BUFFER_SIZE_MIN="min",MediaPlayer.dependencies.BufferController.BUFFER_SIZE_INFINITY="infinity",MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME=12,MediaPlayer.dependencies.BufferController.LOW_BUFFER_THRESHOLD=4,MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY=30,MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY_LONG_FORM=300,MediaPlayer.dependencies.BufferController.LONG_FORM_CONTENT_DURATION_THRESHOLD=600,MediaPlayer.dependencies.BufferController.RICH_BUFFER_THRESHOLD=20,MediaPlayer.dependencies.BufferController.BUFFER_LOADED="bufferLoaded",MediaPlayer.dependencies.BufferController.BUFFER_EMPTY="bufferStalled",MediaPlayer.dependencies.BufferController.prototype={constructor:MediaPlayer.dependencies.BufferController},MediaPlayer.dependencies.BufferController.eventList={ENAME_BUFFER_LEVEL_STATE_CHANGED:"bufferLevelStateChanged",ENAME_BUFFER_LEVEL_UPDATED:"bufferLevelUpdated",ENAME_QUOTA_EXCEEDED:"quotaExceeded",ENAME_BYTES_APPENDED:"bytesAppended",ENAME_BYTES_REJECTED:"bytesRejected",ENAME_BUFFERING_COMPLETED:"bufferingCompleted",ENAME_BUFFER_CLEARED:"bufferCleared",ENAME_INIT_REQUESTED:"initRequested",ENAME_BUFFER_LEVEL_OUTRUN:"bufferLevelOutrun",ENAME_BUFFER_LEVEL_BALANCED:"bufferLevelBalanced",ENAME_MIN_BUFFER_TIME_UPDATED:"minBufferTimeUpdated"},MediaPlayer.dependencies.EventController=function(){"use strict";var a={},b={},c={},d=null,e=100,f=e/1e3,g="urn:mpeg:dash:event:2012",h=1,i=function(){j(),a=null,b=null,c=null},j=function(){null!==d&&(clearInterval(d),d=null)},k=function(){var a=this;a.log("Start Event Controller"),isNaN(e)||(d=setInterval(n.bind(this),e))},l=function(b){var c=this;if(a={},b)for(var d=0;d<b.length;d++){var e=b[d];a[e.id]=e,c.log("Add inline event with id "+e.id)}c.log("Added "+b.length+" inline events")},m=function(a){for(var c=this,d=0;d<a.length;d++){var e=a[d];e.id in b?c.log("Repeated event with id "+e.id):(b[e.id]=e,c.log("Add inband event with id "+e.id))}},n=function(){o.call(this,b),o.call(this,a),p.call(this)},o=function(a){var b,d=this,e=this.videoModel.getCurrentTime();if(a)for(var i=Object.keys(a),j=0;j<i.length;j++){var k=i[j],l=a[k];void 0!==l&&(b=l.presentationTime/l.eventStream.timescale,(0===b||e>=b&&b+f>e)&&(d.log("Start Event "+k+" at "+e),l.duration>0&&(c[k]=l),l.eventStream.schemeIdUri==g&&l.eventStream.value==h&&q.call(this),delete a[k]))}},p=function(){var a=this;if(c)for(var b=this.videoModel.getCurrentTime(),d=Object.keys(c),e=0;e<d.length;e++){var f=d[e],g=c[f];null!==g&&(g.duration+g.presentationTime)/g.eventStream.timescale<b&&(a.log("Remove Event "+f+" at time "+b),g=null,delete c[f])}},q=function(){var a=this.manifestModel.getValue(),b=a.url;a.hasOwnProperty("Location")&&(b=a.Location),this.log("Refresh manifest @ "+b),this.manifestUpdater.getManifestLoader().load(b)};return{manifestModel:void 0,manifestUpdater:void 0,log:void 0,system:void 0,videoModel:void 0,addInlineEvents:l,addInbandEvents:m,reset:i,clear:j,start:k}},MediaPlayer.dependencies.EventController.prototype={constructor:MediaPlayer.dependencies.EventController},MediaPlayer.dependencies.FragmentController=function(){"use strict";var a=[],b=!1,c=function(b){for(var c=a.length,d=0;c>d;d++)if(a[d].getContext()==b)return a[d];return null},d=function(b,c){var d=this,e=a[0].getContext().streamProcessor,f=e.getStreamInfo().id,g=d.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES);-1!==g.indexOf(this.scheduleRulesCollection.sameTimeRequestRule)&&this.scheduleRulesCollection.sameTimeRequestRule.setFragmentModels(a,f),d.rulesController.applyRules(g,e,c,b,function(a,b){return b})},e=function(a,b,c){var d=new MediaPlayer.vo.DataChunk;return d.streamId=c,d.mediaType=b.mediaType,d.segmentType=b.type,d.start=b.startTime,d.duration=b.duration,d.end=d.start+d.duration,d.bytes=a,d.index=b.index,d.quality=b.quality,d},f=function(a){var b=this,c=a.data.request;b.isInitializationRequest(c)?b.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADING_START,{request:c,fragmentModel:a.sender}):b.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,{request:c,fragmentModel:a.sender})},g=function(a){var b,c=this,d=a.data.request,f=c.process(a.data.response),g=a.sender.getContext().streamProcessor.getStreamInfo().id,h=this.isInitializationRequest(d),i=h?MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED:MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED;return null===f?void c.log("No "+d.mediaType+" bytes to push."):(b=e.call(this,f,d,g),c.notify(i,{chunk:b,fragmentModel:a.sender}),void k.call(this))},h=function(a){this.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,{request:a.data.request,fragmentModel:a.sender})},i=function(){k.call(this)},j=function(c){var d,e,f,g,h,i=c.value;for(g=0;g<i.length;g+=1)if(e=i[g])for(h=0;h<a.length;h+=1)f=a[h],d=f.getContext().streamProcessor.getType(),e.mediaType===d&&(e instanceof MediaPlayer.vo.FragmentRequest||(e=f.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:e.startTime})[0]),f.executeRequest(e));b=!1},k=function(a){b||(b=!0,d.call(this,a,j.bind(this)))};return{system:void 0,log:void 0,scheduleRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED]=f,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED]=g,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED]=h,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=i,this.scheduleRulesCollection.sameTimeRequestRule&&this.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,this.scheduleRulesCollection.sameTimeRequestRule)},process:function(a){var b=null;return null!==a&&void 0!==a&&a.byteLength>0&&(b=new Uint8Array(a)),b},getModel:function(b){if(!b)return null;var d=c(b);return d||(d=this.system.getObject("fragmentModel"),d.setContext(b),a.push(d)),d},detachModel:function(b){var c=a.indexOf(b);c>-1&&a.splice(c,1)},isInitializationRequest:function(a){return a&&a.type&&a.type===MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE},prepareFragmentForLoading:function(a,b){a&&b&&a.addRequest(b)&&k.call(this,b)},executePendingRequests:function(){k.call(this)},reset:function(){a=[],this.scheduleRulesCollection.sameTimeRequestRule&&this.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,this.scheduleRulesCollection.sameTimeRequestRule)}}},MediaPlayer.dependencies.FragmentController.prototype={constructor:MediaPlayer.dependencies.FragmentController},MediaPlayer.dependencies.FragmentController.eventList={ENAME_STREAM_COMPLETED:"streamCompleted",ENAME_INIT_FRAGMENT_LOADING_START:"initFragmentLoadingStart",ENAME_MEDIA_FRAGMENT_LOADING_START:"mediaFragmentLoadingStart",ENAME_INIT_FRAGMENT_LOADED:"initFragmentLoaded",ENAME_MEDIA_FRAGMENT_LOADED:"mediaFragmentLoaded"},MediaPlayer.dependencies.PlaybackController=function(){"use strict";var a,b,c,d,e=1e3,f=0,g=0/0,h=null,i={},j={},k=0/0,l=function(a){var b,d=parseInt(this.uriQueryFragModel.getURIFragmentData().s);return c?(!isNaN(d)&&d>1262304e3&&(b=d-a.manifestInfo.availableFrom.getTime()/1e3,(b>g||b<g-a.manifestInfo.DVRWindowSize)&&(b=null)),b=b||g):b=!isNaN(d)&&d<a.duration&&d>=0?d:a.start,b},m=function(b){var c,d=this,e=d.metricsModel.getReadOnlyMetricsFor("video")||d.metricsModel.getReadOnlyMetricsFor("audio"),f=d.metricsExt.getCurrentDVRInfo(e),g=f?f.range:null;return g?b>=g.start&&b<=g.end?b:c=Math.max(g.end-2*a.manifestInfo.minBufferTime,g.start):0/0},n=function(){if(null===h){var a=this,b=function(){G.call(a)};h=setInterval(b,e)}},o=function(){clearInterval(h),h=null},p=function(){if(!j[a.id]&&!this.isSeeking()){var b=l.call(this,a);this.log("Starting playback at offset: "+b),this.seek(b)}},q=function(){if(!this.isPaused()&&c&&0!==b.getElement().readyState){var a=this.getTime(),d=m.call(this,a),e=!isNaN(d)&&d!==a;e&&this.seek(d)}},r=function(b){if(!b.error){var c=this.adapter.convertDataToTrack(this.manifestModel.getValue(),b.data.currentRepresentation),d=c.mediaInfo.streamInfo;a.id===d.id&&(a=c.mediaInfo.streamInfo,q.call(this))}},s=function(a){a.error||0===b.getElement().readyState||p.call(this)},t=function(){b&&(b.unlisten("play",v),b.unlisten("playing",w),b.unlisten("pause",x),b.unlisten("error",F),b.unlisten("seeking",y),b.unlisten("seeked",z),b.unlisten("timeupdate",A),b.unlisten("progress",B),b.unlisten("ratechange",C),b.unlisten("loadedmetadata",D),b.unlisten("ended",E))},u=function(){this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY)},v=function(){this.log("<video> play"),q.call(this),n.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,{startTime:this.getTime()})},w=function(){this.log("<video> playing"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PLAYING,{playingTime:this.getTime()})},x=function(){this.log("<video> pause"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED)},y=function(){this.log("<video> seek"),n.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,{seekTime:this.getTime()})},z=function(){this.log("<video> seeked"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKED)},A=function(){var a=this.getTime();a!==f&&(f=a,this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,{timeToEnd:this.getTimeToStreamEnd()}))},B=function(){var c,d,e,f=b.getElement().buffered;f.length&&(c=f.length-1,d=f.end(c),e=l.call(this,a)+a.duration-d),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,{bufferedRanges:b.getElement().buffered,remainingUnbufferedDuration:e})},C=function(){this.log("<video> ratechange: ",this.getPlaybackRate()),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED)},D=function(){this.log("<video> loadedmetadata"),(!c||this.timelineConverter.isTimeSyncCompleted())&&p.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_METADATA_LOADED),n.call(this)},E=function(){this.log("<video> ended"),o.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED)},F=function(a){this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,{error:a.srcElement.error})},G=function(){this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,{isDynamic:c,time:new Date})},H=function(b){var c,d=b.data.bufferedRanges,e=a.id,f=this.getTime(),g=b.sender.streamProcessor.getType(),h=this.system.getObject("streamController").getStreamById(a.id),k=i[e];0===b.data.index&&(j[e]=j[e]||{},j[e][g]=!0,j.ready=!(h.hasMedia("audio")&&!j[e].audio||h.hasMedia("video")&&!j[e].video)),d&&d.length&&(c=Math.max(d.start(0),a.start),i[e]=void 0===i[e]?c:Math.max(i[e],c),k===i[e]&&f===k||!j.ready||f>i[e]||this.seek(i[e]))},I=function(c){var d=c.sender.streamProcessor.getType(),e=c.sender.streamProcessor.getStreamInfo();e.id===a.id&&b.setStallState(d,!c.data.hasSufficientBuffer)},J=function(){b.listen("canplay",u),b.listen("play",v),b.listen("playing",w),b.listen("pause",x),b.listen("error",F),b.listen("seeking",y),
b.listen("seeked",z),b.listen("timeupdate",A),b.listen("progress",B),b.listen("ratechange",C),b.listen("loadedmetadata",D),b.listen("ended",E)};return{system:void 0,log:void 0,timelineConverter:void 0,uriQueryFragModel:void 0,metricsModel:void 0,metricsExt:void 0,manifestModel:void 0,manifestExt:void 0,videoModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,adapter:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=r,this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=s,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED]=H,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED]=I,u=u.bind(this),v=v.bind(this),w=w.bind(this),x=x.bind(this),F=F.bind(this),y=y.bind(this),z=z.bind(this),A=A.bind(this),B=B.bind(this),C=C.bind(this),D=D.bind(this),E=E.bind(this)},initialize:function(d){b=this.videoModel,a=d,i={},t.call(this),J.call(this),c=a.manifestInfo.isDynamic,g=d.start},getStreamStartTime:l,getTimeToStreamEnd:function(){var c=b.getCurrentTime();return l.call(this,a)+a.duration-c},getStreamId:function(){return a.id},getStreamDuration:function(){return a.duration},getTime:function(){return b.getCurrentTime()},getPlaybackRate:function(){return b.getPlaybackRate()},getPlayedRanges:function(){return b.getElement().played},setLiveStartTime:function(a){g=a},getLiveStartTime:function(){return g},setLiveDelayAttributes:function(a,b){k=a,d=b},getLiveDelay:function(b){var c,e=this.manifestExt.getMpd(this.manifestModel.getValue());return c=d&&e.hasOwnProperty("suggestedPresentationDelay")?e.suggestedPresentationDelay:isNaN(b)?2*a.manifestInfo.minBufferTime:b*k},start:function(){b.play()},isPaused:function(){return b.isPaused()},pause:function(){b&&b.pause()},isSeeking:function(){return b.getElement().seeking},seek:function(a){b&&a!==this.getTime()&&(this.log("Do seek: "+a),b.setCurrentTime(a))},reset:function(){o.call(this),t.call(this),b=null,a=null,f=0,g=0/0,i={},j={},c=void 0,d=void 0,k=0/0}}},MediaPlayer.dependencies.PlaybackController.prototype={constructor:MediaPlayer.dependencies.PlaybackController},MediaPlayer.dependencies.PlaybackController.eventList={ENAME_CAN_PLAY:"canPlay",ENAME_PLAYBACK_STARTED:"playbackStarted",ENAME_PLAYBACK_PLAYING:"playbackPlaying",ENAME_PLAYBACK_STOPPED:"playbackStopped",ENAME_PLAYBACK_PAUSED:"playbackPaused",ENAME_PLAYBACK_ENDED:"playbackEnded",ENAME_PLAYBACK_SEEKING:"playbackSeeking",ENAME_PLAYBACK_SEEKED:"playbackSeeked",ENAME_PLAYBACK_TIME_UPDATED:"playbackTimeUpdated",ENAME_PLAYBACK_PROGRESS:"playbackProgress",ENAME_PLAYBACK_RATE_CHANGED:"playbackRateChanged",ENAME_PLAYBACK_METADATA_LOADED:"playbackMetaDataLoaded",ENAME_PLAYBACK_ERROR:"playbackError",ENAME_WALLCLOCK_TIME_UPDATED:"wallclockTimeUpdated"},MediaPlayer.dependencies.ProtectionController=function(){"use strict";var a,b,c,d=null,e=[],f=[],g=function(a){var b=null,d=a.systemString;return c&&(b=d in c?c[d]:null),b},h=function(a){if(a.error)this.log(a.error);else{var b=a.data;f.push(b.sessionToken),this.protectionExt.requestLicense(this.keySystem,g(this.keySystem),b.message,b.defaultURL,b.sessionToken)}},i=function(a){var b,c=a.error?a.data:a.data.requestData;for(b=0;b<f.length;b++)if(f[b]===c){f.splice(b,1),a.error?this.log("DRM: License request failed! -- "+a.error):(this.log("DRM: License request successful.  Session ID = "+a.data.requestData.getSessionID()),this.updateKeySession(c,a.data.message));break}},j=function(){this.keySystem||(this.keySystem=this.protectionModel.keySystem,this.protectionExt.subscribe(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,this));for(var a=0;a<e.length;a++)this.createKeySession(e[a]);e=[]},k=function(c){if("cenc"!==c.data.initDataType)return void this.log("DRM:  Only 'cenc' initData is supported!  Ignoring initData of type: "+c.data.initDataType);var d=c.data.initData;if(ArrayBuffer.isView(d)&&(d=d.buffer),this.keySystem)this.createKeySession(d);else if(void 0===this.keySystem){this.keySystem=null,e.push(d);try{this.protectionExt.autoSelectKeySystem(this.protectionExt.getSupportedKeySystems(d),this,b,a)}catch(f){this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: Unable to select a key system from needkey initData. -- "+f.message)}}else e.push(d)},l=function(a){a.error?this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: KeySystem Access Denied! -- "+a.error):this.log("KeySystem Access Granted")},m=function(a){a.error?this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: Failed to update license server certificate. -- "+a.error):this.log("DRM: License server certificate successfully updated.")},n=function(a){a.error?this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: Failed to create key session. -- "+a.error):this.log("DRM: Session created.  SessionID = "+a.data.getSessionID())},o=function(){this.log("DRM: Key added.")},p=function(a){this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: MediaKeyError - sessionId: "+a.data.sessionToken.getSessionID()+".  "+a.data.error)},q=function(a){a.error?this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM Failed to close key session. -- "+a.error):this.log("DRM: Session closed.  SessionID = "+a.data)},r=function(a){a.error?this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"DRM: Failed to remove key session. -- "+a.error):this.log("DRM: Session removed.  SessionID = "+a.data)};return{system:void 0,log:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:void 0,sessionType:"temporary",setup:function(){this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE]=h.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED]=j.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE]=l.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY]=k.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED]=m.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED]=o.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR]=p.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED]=n.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED]=q.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED]=r.bind(this),this[MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE]=i.bind(this),d=this.protectionExt.getKeySystems(),this.protectionModel=this.system.getObject("protectionModel"),this.protectionModel.init()},init:function(c,d,e){this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,this);var f,g;d||e||(f=this.system.getObject("adapter"),g=f.getStreamsInfo(c)[0]),a=d||(g?f.getMediaInfoForType(c,g,"audio"):null),b=e||(g?f.getMediaInfoForType(c,g,"video"):null);var h=b?b:a,i=this,j=function(){i.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,i),i.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,i),i.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,i)},k=this.protectionExt.getSupportedKeySystemsFromContentProtection(h.contentProtection);if(k&&k.length>0){var l={};l[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE]=function(a){a.error&&(i.log("DRM: Could not select key system from ContentProtection elements!  Falling back to needkey mechanism..."),j(),i.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,l))},l[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED]=function(a){if(a.error)i.log("DRM: Could not select key system from ContentProtection elements!  Falling back to needkey mechanism..."),j();else{i.keySystem=i.protectionModel.keySystem,i.protectionExt.subscribe(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,i);for(var b=0;b<k.length;b++)if(i.keySystem===k[b].ks){i.createKeySession(k[b].initData);break}}},this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,l,void 0,!0),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,l,void 0,!0),this.protectionExt.autoSelectKeySystem(k,this,b,a)}else j()},teardown:function(){this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,this),this.keySystem&&this.protectionExt.unsubscribe(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,this),this.keySystem=void 0,this.protectionModel.teardown(),this.protectionModel=void 0},requestKeySystemAccess:function(a){this.protectionModel.requestKeySystemAccess(a)},selectKeySystem:function(a){if(this.keySystem)throw new Error("DRM: KeySystem already selected!");this.protectionModel.selectKeySystem(a)},createKeySession:function(a){var b=MediaPlayer.dependencies.protection.CommonEncryption.getPSSHForKeySystem(this.keySystem,a);if(b)try{this.protectionModel.createKeySession(b,this.sessionType)}catch(c){this.notify(MediaPlayer.dependencies.ProtectionController.eventList.ENAME_PROTECTION_ERROR,"Error creating key session! "+c.message)}else this.log("Selected key system is "+this.keySystem.systemString+".  needkey/encrypted event contains no initData corresponding to that key system!")},updateKeySession:function(a,b){this.protectionModel.updateKeySession(a,b)},loadKeySession:function(a){this.protectionModel.loadKeySession(a)},removeKeySession:function(a){this.protectionModel.removeKeySession(a)},closeKeySession:function(a){this.protectionModel.closeKeySession(a)},setServerCertificate:function(a){this.protectionModel.setServerCertificate(a)},setMediaElement:function(a){this.protectionModel.setMediaElement(a)},setSessionType:function(a){this.sessionType=a},setProtectionData:function(a){c=a}}},MediaPlayer.dependencies.ProtectionController.eventList={ENAME_PROTECTION_ERROR:"protectionError"},MediaPlayer.dependencies.ProtectionController.prototype={constructor:MediaPlayer.dependencies.ProtectionController},MediaPlayer.dependencies.ScheduleController=function(){"use strict";var a,b,c,d,e,f=0,g=!0,h=null,i=!1,j=null,k=null,l=!0,m=function(a,b){var c=0,d=null;l===!1&&(d=k.start,c=a.getTime()-d.getTime(),k.duration=c,k.stopreason=b,l=!0)},n=function(){b&&(i=!1,g&&(g=!1),this.log("start"),w.call(this))},o=function(){g&&(r.call(this,e.quality),K.call(this,MediaPlayer.vo.metrics.PlayList.INITIAL_PLAY_START_REASON)),n.call(this)},p=function(a){i||(i=!0,this.log("stop"),a&&c.cancelPendingRequests(),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON))},q=function(a){var b=this,c=b.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES);b.rulesController.applyRules(c,b.streamProcessor,a,null,function(a,b){return b})},r=function(a){var b,d=this;return b=d.adapter.getInitRequest(d.streamProcessor,a),null!==b&&d.fragmentController.prepareFragmentForLoading(c,b),b},s=function(a){var b=this,c=b.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES);b.rulesController.applyRules(c,b.streamProcessor,a,f,function(a,b){return a=a===MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE?0:a,Math.max(a,b)})},t=function(a){var b,d,f,g=a.length,h=.1;for(f=0;g>f;f+=1)b=a[f],d=b.startTime+b.duration/2+h,b=this.adapter.getFragmentRequestForTime(this.streamProcessor,e,d,{timeThreshold:0,ignoreIsFinished:!0}),this.fragmentController.prepareFragmentForLoading(c,b)},u=function(a){var b=this;return f=a.value,0>=f?void b.fragmentController.executePendingRequests():void q.call(b,v.bind(b))},v=function(a){var b=a.value;null===b||b instanceof MediaPlayer.vo.FragmentRequest||(b=this.adapter.getFragmentRequestForTime(this.streamProcessor,e,b.startTime)),b?(f--,this.fragmentController.prepareFragmentForLoading(c,b)):this.fragmentController.executePendingRequests()},w=function(){var a=(new Date).getTime(),b=h?a-h>c.getLoadingTime():!0;this.abrController.getPlaybackQuality(this.streamProcessor),!b||i||this.playbackController.isPaused()&&this.playbackController.getPlayedRanges().length>0&&(!this.scheduleWhilePaused||d)||(h=a,s.call(this,u.bind(this)))},x=function(a){a.error||(e=this.adapter.convertDataToTrack(this.manifestModel.getValue(),a.data.currentRepresentation))},y=function(a){a.error||(e=this.streamProcessor.getCurrentTrack(),d&&null===this.liveEdgeFinder.getLiveEdge()||(b=!0),b&&o.call(this))},z=function(a){a.data.fragmentModel===this.streamProcessor.getFragmentModel()&&(this.log("Stream is complete"),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.END_OF_CONTENT_STOP_REASON))},A=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&w.call(b)},B=function(a){a.error&&p.call(this)},C=function(){L.call(this)},D=function(){p.call(this,!1)},E=function(a){r.call(this,a.data.requiredQuality)},F=function(a){c.removeExecutedRequestsBeforeTime(a.data.to),a.data.hasEnoughSpaceToAppend&&n.call(this)},G=function(a){var b=this;a.data.hasSufficientBuffer||b.playbackController.isSeeking()||(b.log("Stalling Buffer"),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.REBUFFERING_REASON))},H=function(){w.call(this)},I=function(){p.call(this,!1)},J=function(b){if(a===b.data.mediaType&&this.streamProcessor.getStreamInfo().id===b.data.streamInfo.id){var d,f=this;if(d=c.cancelPendingRequests(b.data.oldQuality),e=f.streamProcessor.getTrackForQuality(b.data.newQuality),null===e||void 0===e)throw"Unexpected error!";t.call(f,d),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.REPRESENTATION_SWITCH_STOP_REASON)}},K=function(b){var c=new Date,d=this.playbackController.getTime();m(c,MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON),j=this.metricsModel.addPlayList(a,c,d,b)},L=function(){var a=this,b=a.playbackController.getTime(),c=a.playbackController.getPlaybackRate(),d=new Date;l===!0&&e&&j&&(l=!1,k=a.metricsModel.appendPlayListTrace(j,e.id,null,d,b,null,c,null))},M=function(a){var b=this,d=r.call(b,a.data.CCIndex);c.executeRequest(d)},N=function(){n.call(this)},O=function(a){g||c.cancelPendingRequests();var b=this.metricsModel.getMetricsFor("stream"),d=this.metricsExt.getCurrentManifestUpdate(b);this.log("seek: "+a.data.seekTime),K.call(this,MediaPlayer.vo.metrics.PlayList.SEEK_START_REASON),this.metricsModel.updateManifestUpdateInfo(d,{latency:e.DVRWindow.end-this.playbackController.getTime()})},P=function(){L.call(this)},Q=function(){w.call(this)},R=function(a){if(!a.error){var c,d,f=this,g=a.data.liveEdge,h=e.mediaInfo.streamInfo.manifestInfo,i=g-Math.min(f.playbackController.getLiveDelay(e.fragmentDuration),h.DVRWindowSize/2),j=f.metricsModel.getMetricsFor("stream"),k=f.metricsExt.getCurrentManifestUpdate(j),l=f.playbackController.getLiveStartTime();c=f.adapter.getFragmentRequestForTime(f.streamProcessor,e,i,{ignoreIsFinished:!0}),d=c.startTime,(isNaN(l)||d>l)&&f.playbackController.setLiveStartTime(d),f.metricsModel.updateManifestUpdateInfo(k,{currentTime:d,presentationStartTime:g,latency:g-d,clientTimeOffset:f.timelineConverter.getClientTimeOffset()}),b=!0,e&&o.call(f)}};return{log:void 0,system:void 0,metricsModel:void 0,manifestModel:void 0,metricsExt:void 0,scheduleWhilePaused:void 0,timelineConverter:void 0,abrController:void 0,playbackController:void 0,adapter:void 0,scheduleRulesCollection:void 0,rulesController:void 0,numOfParallelRequestAllowed:void 0,setup:function(){this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=R,this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=J,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED]=D,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=x,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=y,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START]=A,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED]=B,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=z,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED]=F,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED]=C,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED]=G,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED]=H,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED]=E,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED]=I,this[MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED]=M,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED]=N,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=O,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED]=P,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=Q},initialize:function(b,e){var f=this;a=b,f.setMediaType(a),f.streamProcessor=e,f.fragmentController=e.fragmentController,f.liveEdgeFinder=e.liveEdgeFinder,f.bufferController=e.bufferController,d=e.isDynamic(),c=this.fragmentController.getModel(this),MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD=f.numOfParallelRequestAllowed,f.scheduleRulesCollection.bufferLevelRule&&f.scheduleRulesCollection.bufferLevelRule.setScheduleController(f),f.scheduleRulesCollection.pendingRequestsRule&&f.scheduleRulesCollection.pendingRequestsRule.setScheduleController(f),f.scheduleRulesCollection.playbackTimeRule&&f.scheduleRulesCollection.playbackTimeRule.setScheduleController(f)},getFragmentModel:function(){return c},getFragmentToLoadCount:function(){return f},replaceCanceledRequests:t,reset:function(){var a=this;p.call(a,!0),a.bufferController.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,a.scheduleRulesCollection.bufferLevelRule),a.bufferController.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,a.scheduleRulesCollection.bufferLevelRule),c.abortRequests(),a.fragmentController.detachModel(c),f=0},start:n,stop:p}},MediaPlayer.dependencies.ScheduleController.prototype={constructor:MediaPlayer.dependencies.ScheduleController},MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD=0,MediaPlayer.dependencies.StreamController=function(){"use strict";var a,b,c,d,e,f,g=[],h=.2,i=!0,j=!1,k=!1,l=!1,m=!1,n=function(a){a.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this.liveEdgeFinder),a.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,this)},o=function(a){a.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this.liveEdgeFinder),a.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,this)},p=function(a,b,c){this.eventBus.dispatchEvent({type:a,data:{fromStreamInfo:b?b.getStreamInfo():null,toStreamInfo:c.getStreamInfo()}})},q=function(){a.isActivated()&&j&&0===a.getStreamInfo().index&&(a.startEventController(),i&&this.playbackController.start())},r=function(){j=!0,q.call(this)},s=function(a){var b=a.data.error.code,c="";if(-1!==b){switch(b){case 1:c="MEDIA_ERR_ABORTED";break;case 2:c="MEDIA_ERR_NETWORK";break;case 3:c="MEDIA_ERR_DECODE";break;case 4:c="MEDIA_ERR_SRC_NOT_SUPPORTED";break;case 5:c="MEDIA_ERR_ENCRYPTED"}m=!0,this.log("Video Element Error: "+c),this.log(a.error),this.errHandler.mediaSourceError(c),this.reset()}},t=function(a){var b=this,c=b.videoExt.getPlaybackQuality(b.videoModel.getElement());c&&b.metricsModel.addDroppedFrames("video",c),b.playbackController.isSeeking()||a.data.timeToEnd<h&&this.mediaSourceExt.signalEndOfStream(d)},u=function(){z.call(this,a,x())},v=function(b){var c=y(b.data.seekTime);c&&c!==a&&z.call(this,a,c,b.data.seekTime)},w=function(a){var b=x(),c=a.data.streamInfo.isLast;d&&c&&this.mediaSourceExt.signalEndOfStream(d),b&&b.activate(d)},x=function(){var b=a.getStreamInfo().start,c=a.getStreamInfo().duration;return g.filter(function(a){return a.getStreamInfo().start===b+c})[0]},y=function(a){var b=0,c=null,d=g.length;d>0&&(b+=g[0].getStartTime());for(var e=0;d>e;e++)if(c=g[e],b+=c.getDuration(),b>a)return c;return null},z=function(b,c,d){if(!k&&b&&c&&b!==c){p.call(this,MediaPlayer.events.STREAM_SWITCH_STARTED,b,c),k=!0;var e=this,f=function(){void 0!==d&&e.playbackController.seek(d),e.playbackController.start(),a.startEventController(),k=!1,p.call(e,MediaPlayer.events.STREAM_SWITCH_COMPLETED,b,c)};setTimeout(function(){o.call(e,b),b.deactivate(),a=c,n.call(e,c),e.playbackController.initialize(a.getStreamInfo()),A.call(e,f)},0)}},A=function(b){var c,e=this,f=function(g){e.log("MediaSource is open!"),e.log(g),window.URL.revokeObjectURL(c),d.removeEventListener("sourceopen",f),d.removeEventListener("webkitsourceopen",f),B.call(e),a.activate(d),b&&b()};d?e.mediaSourceExt.detachMediaSource(e.videoModel):d=e.mediaSourceExt.createMediaSource(),d.addEventListener("sourceopen",f,!1),d.addEventListener("webkitsourceopen",f,!1),c=e.mediaSourceExt.attachMediaSource(d,e.videoModel)},B=function(){var b,c,e=this;b=a.getStreamInfo().manifestInfo.duration,c=e.mediaSourceExt.setDuration(d,b),e.log("Duration successfully set to: "+c)},C=function(){var e,f,h,i,j,k,m,o=this,q=o.manifestModel.getValue(),r=o.metricsModel.getMetricsFor("stream"),s=o.metricsExt.getCurrentManifestUpdate(r),t=[];if(q){k=o.adapter.getStreamsInfo(q);try{if(0===k.length)throw new Error("There are no streams");for(o.metricsModel.updateManifestUpdateInfo(s,{currentTime:o.videoModel.getCurrentTime(),buffered:o.videoModel.getElement().buffered,presentationStartTime:k[0].start,clientTimeOffset:o.timelineConverter.getClientTimeOffset()}),l=!0,i=0,f=k.length;f>i;i+=1){for(e=k[i],j=0,h=g.length;h>j;j+=1)g[j].getId()===e.id&&(m=g[j],t.push(m),m.updateData(e));m||(m=o.system.getObject("stream"),m.initialize(e,b,c),m.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,o),t.push(m),a&&m.updateData(e)),o.metricsModel.addManifestUpdateStreamInfo(s,e.id,e.index,e.start,e.duration),m=null}g=t,a||(a=g[0],p.call(o,MediaPlayer.events.STREAM_SWITCH_STARTED,null,a),o.playbackController.initialize(a.getStreamInfo()),n.call(o,a),p.call(o,MediaPlayer.events.STREAM_SWITCH_COMPLETED,null,a)),d||A.call(this),l=!1,D.call(o)}catch(u){o.errHandler.manifestError(u.message,"nostreamscomposed",q),o.reset()}}},D=function(){if(!l){var a=this,b=g.length,c=0;for(q.call(this),c;b>c;c+=1)if(!g[c].isInitialized())return;a.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED)}},E=function(){D.call(this)},F=function(){C.call(this)},G=function(a){if(a.error)this.reset();else{this.log("Manifest has loaded.");var b=this.manifestExt.getUTCTimingSources(a.data.manifest),c=b.concat(e);this.timeSyncController.initialize(c,f)}};return{system:void 0,videoModel:void 0,manifestUpdater:void 0,manifestLoader:void 0,manifestModel:void 0,manifestExt:void 0,adapter:void 0,playbackController:void 0,log:void 0,metricsModel:void 0,metricsExt:void 0,videoExt:void 0,liveEdgeFinder:void 0,mediaSourceExt:void 0,timelineConverter:void 0,protectionExt:void 0,timeSyncController:void 0,virtualBuffer:void 0,errHandler:void 0,eventBus:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED]=G,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=E,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED]=w,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=v,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED]=t,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED]=u,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=F,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY]=r,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR]=s},getAutoPlay:function(){return i},getActiveStreamInfo:function(){return a?a.getStreamInfo():null},isStreamActive:function(b){return a.getId()===b.id},setUTCTimingSources:function(a,b){e=a,f=b},getStreamById:function(a){return g.filter(function(b){return b.getId()===a})[0]},initialize:function(a,d,e){i=a,b=d,c=e,this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.timelineConverter),this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.liveEdgeFinder),this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,this.manifestUpdater),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED,this.manifestUpdater),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED,this),this.subscribe(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED,this.manifestUpdater),this.manifestUpdater.subscribe(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,this),this.manifestUpdater.initialize(this.manifestLoader)},load:function(a){this.manifestLoader.load(a)},loadWithManifest:function(a){this.manifestUpdater.setManifest(a)},reset:function(){a&&o.call(this,a),this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.timelineConverter),this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.liveEdgeFinder),this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this),this.timeSyncController.reset();for(var e=0,f=g.length;f>e;e++){var h=g[e];h.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this),h.reset(m)}g=[],this.unsubscribe(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED,this),this.manifestUpdater.unsubscribe(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,this),this.manifestUpdater.reset(),this.metricsModel.clearAllCurrentMetrics(),this.manifestModel.setValue(null),this.timelineConverter.reset(),this.liveEdgeFinder.reset(),this.adapter.reset(),this.virtualBuffer.reset(),k=!1,l=!1,a=null,j=!1,m=!1,b=null,c=null,d&&(this.mediaSourceExt.detachMediaSource(this.videoModel),d=null)}}},MediaPlayer.dependencies.StreamController.prototype={constructor:MediaPlayer.dependencies.StreamController},MediaPlayer.dependencies.StreamController.eventList={ENAME_STREAMS_COMPOSED:"streamsComposed"},MediaPlayer.dependencies.TextController=function(){var a=!1,b=null,c=null,d=null,e=function(){this.notify(MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,{CCIndex:0})},f=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&a.data.chunk.bytes&&b.sourceBufferExt.append(c,a.data.chunk)};return{sourceBufferExt:void 0,log:void 0,system:void 0,errHandler:void 0,videoModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=e,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED]=f},initialize:function(a,b,c){var e=this;d=a,e.setMediaSource(b),e.trackController=c.trackController,e.streamProcessor=c},createBuffer:function(e){try{c=this.sourceBufferExt.createSourceBuffer(b,e),a||(c.hasOwnProperty("initialize")&&c.initialize(d,this),a=!0)}catch(f){this.errHandler.mediaSourceError("Error creating "+d+" source buffer.")}return c},getBuffer:function(){return c},setBuffer:function(a){c=a},setMediaSource:function(a){b=a},reset:function(a){a||(this.sourceBufferExt.abort(b,c),this.sourceBufferExt.removeSourceBuffer(b,c))}}},MediaPlayer.dependencies.TextController.prototype={constructor:MediaPlayer.dependencies.TextController},MediaPlayer.dependencies.TextController.eventList={ENAME_CLOSED_CAPTIONING_REQUESTED:"closedCaptioningRequested"},MediaPlayer.dependencies.XlinkController=function(){"use strict";var a,b,c,d,e="onLoad",f="onActuate",g="Period",h="AdaptationSet",i="EventStream",j="urn:mpeg:dash:resolve-to-zero:2013",k=function(b){var f,h=this;d=new X2JS(a,"",!0),c=b,f=o(c.Period_asArray,c,g,e),l.call(h,f,g,e)},l=function(a,b,c){var d,e,f,g=this,h={};for(h.elements=a,h.type=b,h.resolveType=c,0===h.elements.length&&n.call(g,h),f=0;f<h.elements.length;f+=1)d=h.elements[f],e=-1!==d.url.indexOf("http://")?d.url:d.originalContent.BaseURL+d.url,g.xlinkLoader.load(e,d,h)},m=function(a){var b,c,e,f="<response>",g="</response>",h="";b=a.data.element,c=a.data.resolveObject,b.resolvedContent&&(e=b.resolvedContent.indexOf(">")+1,h=b.resolvedContent.substr(0,e)+f+b.resolvedContent.substr(e)+g,b.resolvedContent=d.xml_str2json(h)),r.call(this,c)&&n.call(this,c)},n=function(a){var b,d,j=[];if(p.call(this,a),a.resolveType===f&&this.notify(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,{
manifest:c}),a.resolveType===e)switch(a.type){case g:for(b=0;b<c[g+"_asArray"].length;b++)d=c[g+"_asArray"][b],d.hasOwnProperty(h+"_asArray")&&(j=j.concat(o.call(this,d[h+"_asArray"],d,h,e))),d.hasOwnProperty(i+"_asArray")&&(j=j.concat(o.call(this,d[i+"_asArray"],d,i,e)));l.call(this,j,h,e);break;case h:this.notify(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,{manifest:c})}},o=function(a,b,c,d){var e,f,g,h=[];for(f=a.length-1;f>=0;f-=1)e=a[f],e.hasOwnProperty("xlink:href")&&e["xlink:href"]===j&&a.splice(f,1);for(f=0;f<a.length;f++)e=a[f],e.hasOwnProperty("xlink:href")&&e.hasOwnProperty("xlink:actuate")&&e["xlink:actuate"]===d&&(g=q(e["xlink:href"],b,c,f,d,e),h.push(g));return h},p=function(a){var d,e,f,g,h,i,j=[];for(g=a.elements.length-1;g>=0;g--){if(d=a.elements[g],e=d.type+"_asArray",!d.resolvedContent||s())delete d.originalContent["xlink:actuate"],delete d.originalContent["xlink:href"],j.push(d.originalContent);else if(d.resolvedContent)for(h=0;h<d.resolvedContent[e].length;h++)f=d.resolvedContent[e][h],j.push(f);for(d.parentElement[e].splice(d.index,1),i=0;i<j.length;i++)d.parentElement[e].splice(d.index+i,0,j[i]);j=[]}a.elements.length>0&&b.run(c)},q=function(a,b,c,d,e,f){return{url:a,parentElement:b,type:c,index:d,resolveType:e,originalContent:f,resolvedContent:null,resolved:!1}},r=function(a){var b,c;for(b=0;b<a.elements.length;b++)if(c=a.elements[b],c.resolved===!1)return!1;return!0},s=function(){return!1};return{xlinkLoader:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){m=m.bind(this),this.xlinkLoader.subscribe(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,this,m)},resolveManifestOnLoad:function(a){k.call(this,a)},setMatchers:function(b){a=b},setIron:function(a){b=a}}},MediaPlayer.dependencies.XlinkController.prototype={constructor:MediaPlayer.dependencies.XlinkController},MediaPlayer.dependencies.XlinkController.eventList={ENAME_XLINK_ALLELEMENTSLOADED:"xlinkAllElementsLoaded",ENAME_XLINK_READY:"xlinkReady"},MediaPlayer.dependencies.MediaSourceExtensions=function(){"use strict"},MediaPlayer.dependencies.MediaSourceExtensions.prototype={constructor:MediaPlayer.dependencies.MediaSourceExtensions,createMediaSource:function(){"use strict";var a="WebKitMediaSource"in window,b="MediaSource"in window;return b?new MediaSource:a?new WebKitMediaSource:null},attachMediaSource:function(a,b){"use strict";var c=window.URL.createObjectURL(a);return b.setSource(c),c},detachMediaSource:function(a){"use strict";a.setSource("")},setDuration:function(a,b){"use strict";return a.duration!=b&&(a.duration=b),a.duration},signalEndOfStream:function(a){"use strict";var b=a.sourceBuffers,c=b.length,d=0;if("open"===a.readyState){for(d;c>d;d+=1)if(b[d].updating)return;a.endOfStream()}}},MediaPlayer.dependencies.ProtectionExtensions=function(){"use strict";this.system=void 0,this.log=void 0,this.keySystems=[],this.notify=void 0,this.subscribe=void 0,this.unsubscribe=void 0,this.clearkeyKeySystem=void 0},MediaPlayer.dependencies.ProtectionExtensions.prototype={constructor:MediaPlayer.dependencies.ProtectionExtensions,setup:function(){var a;a=this.system.getObject("ksPlayReady"),this.keySystems.push(a),a=this.system.getObject("ksWidevine"),this.keySystems.push(a),a=this.system.getObject("ksClearKey"),this.keySystems.push(a),this.clearkeyKeySystem=a},getKeySystems:function(){return this.keySystems},getKeySystemBySystemString:function(a){for(var b=0;b<this.keySystems.length;b++)if(this.keySystems[b].systemString===a)return this.keySystems[b];return null},isClearKey:function(a){return a===this.clearkeyKeySystem},initDataEquals:function(a,b){if(a.byteLength===b.byteLength){for(var c=0;c<a.byteLength;c++)if(a[c]!==b[c])return!1;return!0}return!1},getSupportedKeySystemsFromContentProtection:function(a){var b,c,d,e,f=[];if(a)for(d=0;d<this.keySystems.length;++d)for(c=this.keySystems[d],e=0;e<a.length;++e)if(b=a[e],b.schemeIdUri.toLowerCase()===c.schemeIdURI){var g=c.getInitData(b);g&&f.push({ks:this.keySystems[d],initData:g})}return f},getSupportedKeySystems:function(a){var b,c=[],d=MediaPlayer.dependencies.protection.CommonEncryption.parsePSSHList(a);for(b=0;b<this.keySystems.length;++b)this.keySystems[b].uuid in d&&c.push({ks:this.keySystems[b],initData:d[this.keySystems[b].uuid]});return c},autoSelectKeySystem:function(a,b,c,d){if(0===a.length)throw new Error("DRM system for this content not supported by the player!");var e=[],f=[];c&&f.push(new MediaPlayer.vo.protection.MediaCapability(c.codec)),d&&e.push(new MediaPlayer.vo.protection.MediaCapability(d.codec));for(var g=new MediaPlayer.vo.protection.KeySystemConfiguration(e,f),h=[],i=0;i<a.length;i++)h.push({ks:a[i].ks,configs:[g]});var j=this;!function(a){var b={};b[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE]=function(b){if(a.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,this),b.error)j.log(b.error);else{var c=b.data;j.log("KeySystem Access Granted ("+c.keySystem.systemString+")!"),a.selectKeySystem(c)}},a.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,b),a.requestKeySystemAccess(h)}(b)},requestLicense:function(a,b,c,d,e){var f=null;if(b&&b.hasOwnProperty("drmtoday"))f=this.system.getObject("serverDRMToday");else if("com.widevine.alpha"===a.systemString)f=this.system.getObject("serverWidevine");else if("com.microsoft.playready"===a.systemString)f=this.system.getObject("serverPlayReady");else{if("org.w3.clearkey"!==a.systemString)return void this.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,new Error("DRM: Unknown key system! -- "+a.keySystemStr));f=this.system.getObject("serverClearKey")}if("org.w3.clearkey"===a.systemString)try{var g=f.getClearKeysFromProtectionData(b,c);if(g){var h=new MediaPlayer.vo.protection.LicenseRequestComplete(g,e);return void this.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,h)}}catch(i){return void this.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,i.message)}var j=new XMLHttpRequest,k=b&&b.laURL&&""!==b.laURL?b.laURL:d,l=this;if(k=f.getServerURLFromMessage(k,c),!k)return void this.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,new Error("DRM: No license server URL specified!"));j.open(f.getHTTPMethod(),k,!0),j.responseType=f.getResponseType(a.systemString),j.onload=function(){if(200==this.status){var b=new MediaPlayer.vo.protection.LicenseRequestComplete(f.getLicenseMessage(this.response,a.systemString),e);l.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,b)}else l.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,new Error("DRM: "+a.systemString+' update, XHR status is "'+this.statusText+'" ('+this.status+"), expected to be 200. readyState is "+this.readyState)+".  Response is "+(this.response?f.getErrorResponse(this.response,a.systemString):"NONE"))},j.onabort=function(){l.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,new Error("DRM: "+a.systemString+' update, XHR aborted. status is "'+this.statusText+'" ('+this.status+"), readyState is "+this.readyState))},j.onerror=function(){l.notify(MediaPlayer.dependencies.protection.KeySystem.eventList.ENAME_LICENSE_REQUEST_COMPLETE,e,new Error("DRM: "+a.systemString+' update, XHR error. status is "'+this.statusText+'" ('+this.status+"), readyState is "+this.readyState))};var m=function(a){var b;if(a)for(b in a)"authorization"===b.toLowerCase()&&(j.withCredentials=!0),j.setRequestHeader(b,a[b])};b&&m(b.httpRequestHeaders),m(a.getRequestHeadersFromMessage(c)),b&&b.withCredentials&&(j.withCredentials=!0),j.send(a.getLicenseRequestFromMessage(c))}},MediaPlayer.dependencies.RequestModifierExtensions=function(){"use strict";return{modifyRequestURL:function(a){return a},modifyRequestHeader:function(a){return a}}},MediaPlayer.dependencies.SourceBufferExtensions=function(){"use strict";this.system=void 0,this.notify=void 0,this.subscribe=void 0,this.unsubscribe=void 0},MediaPlayer.dependencies.SourceBufferExtensions.prototype={constructor:MediaPlayer.dependencies.SourceBufferExtensions,createSourceBuffer:function(a,b){"use strict";var c=this,d=b.codec,e=null;try{e=a.addSourceBuffer(d)}catch(f){if(!b.isText&&-1==d.indexOf('codecs="stpp"'))throw f;e=c.system.getObject("textSourceBuffer")}return e},removeSourceBuffer:function(a,b){"use strict";try{a.removeSourceBuffer(b)}catch(c){}},getBufferRange:function(a,b,c){"use strict";var d,e,f=null,g=0,h=0,i=null,j=null,k=0,l=c||.15;try{f=a.buffered}catch(m){return null}if(null!==f&&void 0!==f){for(e=0,d=f.length;d>e;e+=1)if(g=f.start(e),h=f.end(e),null===i)k=Math.abs(g-b),b>=g&&h>b?(i=g,j=h):l>=k&&(i=g,j=h);else{if(k=g-j,!(l>=k))break;j=h}if(null!==i)return{start:i,end:j}}return null},getAllRanges:function(a){var b=null;try{return b=a.buffered}catch(c){return null}},getTotalBufferedTime:function(a){var b,c,d=this.getAllRanges(a),e=0;if(!d)return e;for(c=0,b=d.length;b>c;c+=1)e+=d.end(c)-d.start(c);return e},getBufferLength:function(a,b,c){"use strict";var d,e,f=this;return d=f.getBufferRange(a,b,c),e=null===d?0:d.end-b},waitForUpdateEnd:function(a,b){"use strict";var c,d=50,e=function(){a.updating||(clearInterval(c),b())},f=function(){a.updating||(a.removeEventListener("updateend",f,!1),b())};if(!a.updating)return void b();if("function"==typeof a.addEventListener)try{a.addEventListener("updateend",f,!1)}catch(g){c=setInterval(e,d)}else c=setInterval(e,d)},append:function(a,b){var c=this,d=b.bytes,e="append"in a?"append":"appendBuffer"in a?"appendBuffer":null;if(e)try{c.waitForUpdateEnd(a,function(){a[e](d,b),c.waitForUpdateEnd(a,function(){c.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,{buffer:a,bytes:d})})})}catch(f){c.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,{buffer:a,bytes:d},new MediaPlayer.vo.Error(f.code,f.message,null))}},remove:function(a,b,c,d){var e=this;try{e.waitForUpdateEnd(a,function(){b>=0&&c>b&&"ended"!==d.readyState&&a.remove(b,c),e.waitForUpdateEnd(a,function(){e.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,{buffer:a,from:b,to:c})})})}catch(f){e.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,{buffer:a,from:b,to:c},new MediaPlayer.vo.Error(f.code,f.message,null))}},abort:function(a,b){"use strict";try{"open"===a.readyState&&b.abort()}catch(c){}}},MediaPlayer.dependencies.SourceBufferExtensions.QUOTA_EXCEEDED_ERROR_CODE=22,MediaPlayer.dependencies.SourceBufferExtensions.eventList={ENAME_SOURCEBUFFER_REMOVE_COMPLETED:"sourceBufferRemoveCompleted",ENAME_SOURCEBUFFER_APPEND_COMPLETED:"sourceBufferAppendCompleted"},MediaPlayer.utils.TextTrackExtensions=function(){"use strict";var a;return{setup:function(){a=window.VTTCue||window.TextTrackCue},addTextTrack:function(a,b,c,d,e){return this.track=a.addTextTrack("captions",c,d),this.track["default"]=e,this.track.mode="showing",this.video=a,this.addCaptions(0,b),this.track},addCaptions:function(b,c){for(var d in c){var e,f=c[d],g=this.video;"image"==f.type?(e=new a(f.start-b,f.end-b,""),e.image=f.data,e.id=f.id,e.size=0,e.type="image",e.onenter=function(){var a=new Image;a.id="ttmlImage_"+this.id,a.src=this.image,a.className="cue-image",g.parentNode.appendChild(a)},e.onexit=function(){var a,b=g.parentNode.childNodes;for(a=0;a<b.length;a++)b[a].id=="ttmlImage_"+this.id&&g.parentNode.removeChild(b[a])}):(e=new a(f.start-b,f.end-b,f.data),f.styles&&(void 0!==f.styles.align&&e.hasOwnProperty("align")&&(e.align=f.styles.align),void 0!==f.styles.line&&e.hasOwnProperty("line")&&(e.line=f.styles.line),void 0!==f.styles.position&&e.hasOwnProperty("position")&&(e.position=f.styles.position),void 0!==f.styles.size&&e.hasOwnProperty("size")&&(e.size=f.styles.size))),this.track.addCue(e)}},deleteCues:function(a){for(var b=0,c=!1;!c;){if(null!==a.textTracks[b].cues){c=!0;break}b++}var d=a.textTracks[b],e=d.cues,f=e.length-1;for(b=f;b>=0;b--)d.removeCue(e[b]);d.mode="disabled",d["default"]=!1}}},MediaPlayer.dependencies.VideoModelExtensions=function(){"use strict";return{getPlaybackQuality:function(a){var b="webkitDroppedFrameCount"in a,c="getVideoPlaybackQuality"in a,d=null;return c?d=a.getVideoPlaybackQuality():b&&(d={droppedVideoFrames:a.webkitDroppedFrameCount,creationTime:new Date}),d}}},MediaPlayer.dependencies.VideoModelExtensions.prototype={constructor:MediaPlayer.dependencies.VideoModelExtensions},MediaPlayer.dependencies.FragmentModel=function(){"use strict";var a=null,b=[],c=[],d=[],e=[],f=!1,g=function(a){var b=this;b.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,{request:a}),b.fragmentLoader.load(a)},h=function(a,b){var c=a.indexOf(b);-1!==c&&a.splice(c,1)},i=function(a,b,c){var d,e=a.length-1,f=0/0,g=0/0,h=null;for(d=e;d>=0;d-=1)if(h=a[d],f=h.startTime,g=f+h.duration,c=c||h.duration/2,!isNaN(f)&&!isNaN(g)&&b+c>=f&&g>b-c||isNaN(f)&&isNaN(b))return h;return null},j=function(a,b){return b?b.hasOwnProperty("time")?[i.call(this,a,b.time,b.threshold)]:a.filter(function(a){for(var c in b)if("state"!==c&&b.hasOwnProperty(c)&&a[c]!=b[c])return!1;return!0}):a},k=function(a){var f;switch(a){case MediaPlayer.dependencies.FragmentModel.states.PENDING:f=c;break;case MediaPlayer.dependencies.FragmentModel.states.LOADING:f=d;break;case MediaPlayer.dependencies.FragmentModel.states.EXECUTED:f=b;break;case MediaPlayer.dependencies.FragmentModel.states.REJECTED:f=e;break;default:f=[]}return f},l=function(a,b){if(a){var c=a.mediaType,d=new Date,e=a.type,f=a.startTime,g=a.availabilityStartTime,h=a.duration,i=a.quality,j=a.range;this.metricsModel.addSchedulingInfo(c,d,e,f,g,h,i,j,b)}},m=function(a){var c=a.data.request,e=a.data.response,f=a.error;d.splice(d.indexOf(c),1),e&&!f&&b.push(c),l.call(this,c,f?MediaPlayer.dependencies.FragmentModel.states.FAILED:MediaPlayer.dependencies.FragmentModel.states.EXECUTED),this.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,{request:c,response:e},f)},n=function(a){var c=this.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,quality:a.data.quality,index:a.data.index})[0];c&&(h.call(this,b,c),isNaN(a.data.index)||(e.push(c),l.call(this,c,MediaPlayer.dependencies.FragmentModel.states.REJECTED)))},o=function(){f=!0},p=function(){f=!1};return{system:void 0,log:void 0,metricsModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN]=o,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=p,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED]=n,this[MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED]=m},setLoader:function(a){this.fragmentLoader=a},setContext:function(b){a=b},getContext:function(){return a},getIsPostponed:function(){return f},addRequest:function(a){return!a||this.isFragmentLoadedOrPending(a)?!1:(c.push(a),l.call(this,a,MediaPlayer.dependencies.FragmentModel.states.PENDING),!0)},isFragmentLoadedOrPending:function(a){var e=function(a,b){return"complete"===a.action&&a.action===b.action},f=function(a,b){return a.url===b.url&&a.startTime===b.startTime},g=function(a,b){return isNaN(a.index)&&isNaN(b.index)&&a.quality===b.quality},h=function(b){var c,d,h=!1,i=b.length;for(d=0;i>d;d+=1)if(c=b[d],f(a,c)||g(a,c)||e(a,c)){h=!0;break}return h};return h(c)||h(d)||h(b)},getRequests:function(a){var b,c=[],d=[],e=1;if(!a||!a.state)return c;a.state instanceof Array?(e=a.state.length,b=a.state):b=[a.state];for(var f=0;e>f;f+=1)c=k.call(this,b[f]),d=d.concat(j.call(this,c,a));return d},getLoadingTime:function(){var a,c,d=0;for(c=b.length-1;c>=0;c-=1)if(a=b[c],a.requestEndDate instanceof Date&&a.firstByteDate instanceof Date){d=a.requestEndDate.getTime()-a.firstByteDate.getTime();break}return d},removeExecutedRequest:function(a){h.call(this,b,a)},removeRejectedRequest:function(a){h.call(this,e,a)},removeExecutedRequestsBeforeTime:function(a){var c,d=b.length-1,e=0/0,f=null;for(c=d;c>=0;c-=1)f=b[c],e=f.startTime,!isNaN(e)&&a>e&&h.call(this,b,f)},cancelPendingRequests:function(a){var b=this,d=c,e=d;return c=[],void 0!==a&&(c=d.filter(function(b){return b.quality===a?!1:(e.splice(e.indexOf(b),1),!0)})),e.forEach(function(a){l.call(b,a,MediaPlayer.dependencies.FragmentModel.states.CANCELED)}),e},abortRequests:function(){var a=[];for(this.fragmentLoader.abort();d.length>0;)a.push(d[0]),h.call(this,d,d[0]);return d=[],a},executeRequest:function(a){var e=this,f=c.indexOf(a);if(a&&-1!==f)switch(c.splice(f,1),a.action){case"complete":b.push(a),l.call(e,a,MediaPlayer.dependencies.FragmentModel.states.EXECUTED),e.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,{request:a});break;case"download":d.push(a),l.call(e,a,MediaPlayer.dependencies.FragmentModel.states.LOADING),g.call(e,a);break;default:this.log("Unknown request action.")}},reset:function(){this.abortRequests(),this.cancelPendingRequests(),a=null,b=[],c=[],d=[],e=[],f=!1}}},MediaPlayer.dependencies.FragmentModel.prototype={constructor:MediaPlayer.dependencies.FragmentModel},MediaPlayer.dependencies.FragmentModel.eventList={ENAME_STREAM_COMPLETED:"streamCompleted",ENAME_FRAGMENT_LOADING_STARTED:"fragmentLoadingStarted",ENAME_FRAGMENT_LOADING_COMPLETED:"fragmentLoadingCompleted"},MediaPlayer.dependencies.FragmentModel.states={PENDING:"pending",LOADING:"loading",EXECUTED:"executed",REJECTED:"rejected",CANCELED:"canceled",FAILED:"failed"},MediaPlayer.models.ManifestModel=function(){"use strict";var a;return{system:void 0,eventBus:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,getValue:function(){return a},setValue:function(b){a=b,this.eventBus.dispatchEvent({type:MediaPlayer.events.MANIFEST_LOADED,data:b}),this.notify(MediaPlayer.models.ManifestModel.eventList.ENAME_MANIFEST_UPDATED,{manifest:b})}}},MediaPlayer.models.ManifestModel.prototype={constructor:MediaPlayer.models.ManifestModel},MediaPlayer.models.ManifestModel.eventList={ENAME_MANIFEST_UPDATED:"manifestUpdated"},MediaPlayer.models.MetricsModel=function(){"use strict";return{system:void 0,eventBus:void 0,adapter:void 0,streamMetrics:{},metricsChanged:function(){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRICS_CHANGED,data:{}})},metricChanged:function(a){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_CHANGED,data:{stream:a}}),this.metricsChanged()},metricUpdated:function(a,b,c){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_UPDATED,data:{stream:a,metric:b,value:c}}),this.metricChanged(a)},metricAdded:function(a,b,c){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_ADDED,data:{stream:a,metric:b,value:c}}),this.metricChanged(a)},clearCurrentMetricsForType:function(a){delete this.streamMetrics[a],this.metricChanged(a)},clearAllCurrentMetrics:function(){var a=this;this.streamMetrics={},this.metricsChanged.call(a)},getReadOnlyMetricsFor:function(a){return this.streamMetrics.hasOwnProperty(a)?this.streamMetrics[a]:null},getMetricsFor:function(a){var b;return this.streamMetrics.hasOwnProperty(a)?b=this.streamMetrics[a]:(b=this.system.getObject("metrics"),this.streamMetrics[a]=b),b},addTcpConnection:function(a,b,c,d,e,f){var g=new MediaPlayer.vo.metrics.TCPConnection;return g.tcpid=b,g.dest=c,g.topen=d,g.tclose=e,g.tconnect=f,this.getMetricsFor(a).TcpList.push(g),this.metricAdded(a,this.adapter.metricsList.TCP_CONNECTION,g),g},addHttpRequest:function(a,b,c,d,e,f,g,h,i,j,k,l,m){var n=new MediaPlayer.vo.metrics.HTTPRequest;return n.stream=a,n.tcpid=b,n.type=c,n.url=d,n.actualurl=e,n.range=f,n.trequest=g,n.tresponse=h,n.tfinish=i,n.responsecode=j,n.interval=k,n.mediaduration=l,n.responseHeaders=m,this.getMetricsFor(a).HttpList.push(n),this.metricAdded(a,this.adapter.metricsList.HTTP_REQUEST,n),n},appendHttpTrace:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.HTTPRequest.Trace;return e.s=b,e.d=c,e.b=d,a.trace.push(e),this.metricUpdated(a.stream,this.adapter.metricsList.HTTP_REQUEST_TRACE,a),e},addTrackSwitch:function(a,b,c,d,e){var f=new MediaPlayer.vo.metrics.TrackSwitch;return f.t=b,f.mt=c,f.to=d,f.lto=e,this.getMetricsFor(a).RepSwitchList.push(f),this.metricAdded(a,this.adapter.metricsList.TRACK_SWITCH,f),f},addBufferLevel:function(a,b,c){var d=new MediaPlayer.vo.metrics.BufferLevel;return d.t=b,d.level=c,this.getMetricsFor(a).BufferLevel.push(d),this.metricAdded(a,this.adapter.metricsList.BUFFER_LEVEL,d),d},addBufferState:function(a,b,c){var d=new MediaPlayer.vo.metrics.BufferState;return d.target=c,d.state=b,this.getMetricsFor(a).BufferState.push(d),this.metricAdded(a,this.adapter.metricsList.BUFFER_STATE,d),d},addDVRInfo:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.DVRInfo;return e.time=b,e.range=d,e.manifestInfo=c,this.getMetricsFor(a).DVRInfo.push(e),this.metricAdded(a,this.adapter.metricsList.DVR_INFO,e),e},addDroppedFrames:function(a,b){var c=new MediaPlayer.vo.metrics.DroppedFrames,d=this.getMetricsFor(a).DroppedFrames;return c.time=b.creationTime,c.droppedFrames=b.droppedVideoFrames,d.length>0&&d[d.length-1]==c?d[d.length-1]:(d.push(c),this.metricAdded(a,this.adapter.metricsList.DROPPED_FRAMES,c),c)},addSchedulingInfo:function(a,b,c,d,e,f,g,h,i){var j=new MediaPlayer.vo.metrics.SchedulingInfo;return j.mediaType=a,j.t=b,j.type=c,j.startTime=d,j.availabilityStartTime=e,j.duration=f,j.quality=g,j.range=h,j.state=i,this.getMetricsFor(a).SchedulingInfo.push(j),this.metricAdded(a,this.adapter.metricsList.SCHEDULING_INFO,j),j},addManifestUpdate:function(a,b,c,d,e,f,g,h,i,j){var k=new MediaPlayer.vo.metrics.ManifestUpdate,l=this.getMetricsFor("stream");return k.mediaType=a,k.type=b,k.requestTime=c,k.fetchTime=d,k.availabilityStartTime=e,k.presentationStartTime=f,k.clientTimeOffset=g,k.currentTime=h,k.buffered=i,k.latency=j,l.ManifestUpdate.push(k),this.metricAdded(a,this.adapter.metricsList.MANIFEST_UPDATE,k),k},updateManifestUpdateInfo:function(a,b){if(a){for(var c in b)a[c]=b[c];this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE,a)}},addManifestUpdateStreamInfo:function(a,b,c,d,e){if(a){var f=new MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo;return f.id=b,f.index=c,f.start=d,f.duration=e,a.streamInfo.push(f),this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE_STREAM_INFO,a),f}return null},addManifestUpdateTrackInfo:function(a,b,c,d,e,f,g,h){if(a){var i=new MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo;return i.id=b,i.index=c,i.streamIndex=d,i.mediaType=e,i.startNumber=g,i.fragmentInfoType=h,i.presentationTimeOffset=f,a.trackInfo.push(i),this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE_TRACK_INFO,a),i}return null},addPlayList:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.PlayList;return e.stream=a,e.start=b,e.mstart=c,e.starttype=d,this.getMetricsFor(a).PlayList.push(e),this.metricAdded(a,this.adapter.metricsList.PLAY_LIST,e),e},appendPlayListTrace:function(a,b,c,d,e,f,g,h){var i=new MediaPlayer.vo.metrics.PlayList.Trace;return i.representationid=b,i.subreplevel=c,i.start=d,i.mstart=e,i.duration=f,i.playbackspeed=g,i.stopreason=h,a.trace.push(i),this.metricUpdated(a.stream,this.adapter.metricsList.PLAY_LIST_TRACE,a),i}}},MediaPlayer.models.MetricsModel.prototype={constructor:MediaPlayer.models.MetricsModel},MediaPlayer.models.ProtectionModel={},MediaPlayer.models.ProtectionModel.eventList={ENAME_NEED_KEY:"needkey",ENAME_KEY_SYSTEM_ACCESS_COMPLETE:"keySystemAccessComplete",ENAME_KEY_SYSTEM_SELECTED:"keySystemSelected",ENAME_VIDEO_ELEMENT_SELECTED:"videoElementSelected",ENAME_SERVER_CERTIFICATE_UPDATED:"serverCertificateUpdated",ENAME_KEY_MESSAGE:"keyMessage",ENAME_KEY_ADDED:"keyAdded",ENAME_KEY_ERROR:"keyError",ENAME_KEY_SESSION_CREATED:"keySessionCreated",ENAME_KEY_SESSION_REMOVED:"keySessionRemoved",ENAME_KEY_SESSION_CLOSED:"keySessionClosed",ENAME_KEY_STATUSES_CHANGED:"keyStatusesChanged"},MediaPlayer.models.ProtectionModel_01b=function(){var a,b=null,c=null,d=[],e=[],f=function(){var b=this;return{handleEvent:function(f){var g=null;switch(f.type){case c.needkey:b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(f.initData,"cenc"));break;case c.keyerror:if(g=h(e,f.sessionId),g||(g=h(d,f.sessionId)),g){var i="";switch(f.errorCode.code){case 1:i+="MEDIA_KEYERR_UNKNOWN - An unspecified error occurred. This value is used for errors that don't match any of the other codes.";break;case 2:i+="MEDIA_KEYERR_CLIENT - The Key System could not be installed or updated.";break;case 3:i+="MEDIA_KEYERR_SERVICE - The message passed into update indicated an error from the license service.";break;case 4:i+="MEDIA_KEYERR_OUTPUT - There is no available output device with the required characteristics for the content protection system.";break;case 5:i+="MEDIA_KEYERR_HARDWARECHANGE - A hardware configuration change caused a content protection error.";break;case 6:i+="MEDIA_KEYERR_DOMAIN - An error occurred in a multi-device domain licensing configuration. The most common error is a failure to join the domain."}i+="  System Code = "+f.systemCode,b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(g,i))}else b.log("No session token found for key error");break;case c.keyadded:g=h(e,f.sessionId),g||(g=h(d,f.sessionId)),g?b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,g):b.log("No session token found for key added");break;case c.keymessage:a=null!==f.sessionId&&void 0!==f.sessionId,a?(g=h(e,f.sessionId),!g&&d.length>0&&(g=d.shift(),e.push(g),g.sessionID=f.sessionId)):d.length>0&&(g=d.shift(),e.push(g),0!==d.length&&b.errHandler.mediaKeyMessageError("Multiple key sessions were creates with a user-agent that does not support sessionIDs!! Unpredictable behavior ahead!")),g?(g.keyMessage=f.message,b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(g,f.message,f.defaultURL))):b.log("No session token found for key message")}}}},g=null,h=function(a,b){if(b&&a){for(var c=a.length,d=0;c>d;d++)if(a[d].sessionID==b)return a[d];return null}return null},i=function(){b.removeEventListener(c.keyerror,g),b.removeEventListener(c.needkey,g),b.removeEventListener(c.keymessage,g),b.removeEventListener(c.keyadded,g)};return{system:void 0,log:void 0,errHandler:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:null,setup:function(){g=f.call(this)},init:function(){var a=document.createElement("video");c=MediaPlayer.models.ProtectionModel_01b.detect(a)},teardown:function(){b&&i();for(var a=0;a<e.length;a++)this.closeKeySession(e[a])},requestKeySystemAccess:function(a){var c=b;c||(c=document.createElement("video"));for(var d=!1,e=0;e<a.length;e++)for(var f=a[e].ks.systemString,g=a[e].configs,h=null,i=null,j=0;j<g.length;j++){var k=g[j].videoCapabilities;if(k&&0!==k.length){i=[];for(var l=0;l<k.length;l++)""!==c.canPlayType(k[l].contentType,f)&&i.push(k[l])}if(!(!h&&!i||h&&0===h.length||i&&0===i.length)){d=!0;var m=new MediaPlayer.vo.protection.KeySystemConfiguration(h,i),n=this.protectionExt.getKeySystemBySystemString(f),o=new MediaPlayer.vo.protection.KeySystemAccess(n,m);this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,o);break}}d||this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied! -- No valid audio/video content configurations detected!")},selectKeySystem:function(a){this.keySystem=a.keySystem,this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)},setMediaElement:function(a){b&&i(),b=a,b.addEventListener(c.keyerror,g),b.addEventListener(c.needkey,g),b.addEventListener(c.keymessage,g),b.addEventListener(c.keyadded,g),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_VIDEO_ELEMENT_SELECTED)},createKeySession:function(f){if(!this.keySystem)throw new Error("Can not create sessions until you have selected a key system");var g;for(g=0;g<e.length;g++)if(this.protectionExt.initDataEquals(f,e[g].initData))return;for(g=0;g<d.length;g++)if(this.protectionExt.initDataEquals(f,d[g].initData))return;if(a||0===e.length){var h={prototype:(new MediaPlayer.models.SessionToken).prototype,sessionID:null,initData:f,getSessionID:function(){return this.sessionID}};return d.push(h),b[c.generateKeyRequest](this.keySystem.systemString,new Uint8Array(f)),h}throw new Error("Multiple sessions not allowed!")},updateKeySession:function(a,d){var e=a.sessionID;if(this.protectionExt.isClearKey(this.keySystem))for(var f=0;f<d.keyPairs.length;f++)b[c.addKey](this.keySystem.systemString,d.keyPairs[f].key,d.keyPairs[f].keyID,e);else b[c.addKey](this.keySystem.systemString,d,a.initData,e)},closeKeySession:function(a){b[c.cancelKeyRequest](this.keySystem.systemString,a.sessionID)},setServerCertificate:function(){},loadKeySession:function(){},removeKeySession:function(){}}},MediaPlayer.models.ProtectionModel_01b.prototype={constructor:MediaPlayer.models.ProtectionModel_01b},MediaPlayer.models.ProtectionModel_01b.APIs=[{generateKeyRequest:"generateKeyRequest",addKey:"addKey",cancelKeyRequest:"cancelKeyRequest",needkey:"needkey",keyerror:"keyerror",keyadded:"keyadded",keymessage:"keymessage"},{generateKeyRequest:"webkitGenerateKeyRequest",addKey:"webkitAddKey",cancelKeyRequest:"webkitCancelKeyRequest",needkey:"webkitneedkey",keyerror:"webkitkeyerror",keyadded:"webkitkeyadded",keymessage:"webkitkeymessage"}],MediaPlayer.models.ProtectionModel_01b.detect=function(a){for(var b=MediaPlayer.models.ProtectionModel_01b.APIs,c=0;c<b.length;c++){var d=b[c];if("function"==typeof a[d.generateKeyRequest]&&"function"==typeof a[d.addKey]&&"function"==typeof a[d.cancelKeyRequest])return d}return null},MediaPlayer.models.ProtectionModel_21Jan2015=function(){var a=null,b=null,c=[],d=function(a,b){var c=this;!function(b){var e=a[b].ks,f=a[b].configs;navigator.requestMediaKeySystemAccess(e.systemString,f).then(function(a){var b="function"==typeof a.getConfiguration?a.getConfiguration():null,d=new MediaPlayer.vo.protection.KeySystemAccess(e,b);d.mksa=a,c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,d)})["catch"](function(){++b<a.length?d.call(c,a,b):c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied!")})}(b)},e=function(){var a=this;return{handleEvent:function(b){switch(b.type){case"encrypted":a.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(b.initData,b.initDataType))}}}},f=null,g=function(a){for(var b=0;b<c.length;b++)if(c[b]===a){c.splice(b,1);break}},h=function(a,b){var d=this,e={prototype:(new MediaPlayer.models.SessionToken).prototype,session:a,initData:b,handleEvent:function(a){switch(a.type){case"keystatuseschange":d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_STATUSES_CHANGED,this);break;case"message":d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(this,a.message,void 0,a.messageType))}},getSessionID:function(){return this.session.sessionId},getExpirationTime:function(){return this.session.expiration},getKeyStatuses:function(){return this.session.keyStatuses}};return a.addEventListener("keystatuseschange",e),a.addEventListener("message",e),a.closed.then(function(){g(e),d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,e.getSessionID())}),c.push(e),e};return{system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,
protectionExt:void 0,keySystem:null,setup:function(){f=e.call(this)},init:function(){},teardown:function(){a&&(a.removeEventListener("encrypted",f),a.setMediaKeys(null));for(var b=0;b<c.length;b++)this.closeKeySession(c[b])},requestKeySystemAccess:function(a){d.call(this,a,0)},selectKeySystem:function(c){var d=this;c.mksa.createMediaKeys().then(function(e){d.keySystem=c.keySystem,b=e,a&&a.setMediaKeys(b),d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)})["catch"](function(){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,null,"Error selecting keys system ("+c.keySystem.systemString+")! Could not create MediaKeys -- TODO")})},setMediaElement:function(c){a&&a.removeEventListener("encrypted",f),a=c,a.addEventListener("encrypted",f),b&&a.setMediaKeys(b)},setServerCertificate:function(a){if(!this.keySystem||!b)throw new Error("Can not set server certificate until you have selected a key system");var c=this;b.setServerCertificate(a).then(function(){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED)})["catch"](function(a){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,null,"Error updating server certificate -- "+a.name)})},createKeySession:function(a,d){if(!this.keySystem||!b)throw new Error("Can not create sessions until you have selected a key system");for(var e=0;e<c.length;e++)if(this.protectionExt.initDataEquals(a,c[e].initData))return;var f=b.createSession(d),i=h.call(this,f,a),j=this;f.generateRequest("cenc",a).then(function(){j.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,i)})["catch"](function(a){g(i),j.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Error generating key request -- "+a.name)})},updateKeySession:function(a,b){var c=a.session,d=this;this.protectionExt.isClearKey(this.keySystem)&&(b=b.toJWK()),c.update(b)["catch"](function(b){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(a,"Error sending update() message! "+b.name))})},loadKeySession:function(a){if(!this.keySystem||!b)throw new Error("Can not load sessions until you have selected a key system");var c=b.createSession(),d=this;c.load(a).then(function(b){if(b){var e=h.call(this,c);d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,e)}else d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Could not load session! Invalid Session ID ("+a+")")})["catch"](function(b){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Could not load session ("+a+")! "+b.name)})},removeKeySession:function(a){var b=a.session,c=this;b.remove().then(function(){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,a.getSessionID())})["catch"](function(b){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,null,"Error removing session ("+a.getSessionID()+"). "+b.name)})},closeKeySession:function(a){var b=a.session;b.removeEventListener("keystatuseschange",a),b.removeEventListener("message",a);var c=this;b.close()["catch"](function(b){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,null,"Error closing session ("+a.getSessionID()+") "+b.name)})}}},MediaPlayer.models.ProtectionModel_21Jan2015.detect=function(a){return void 0===a.onencrypted||void 0===a.mediaKeys?!1:void 0===navigator.requestMediaKeySystemAccess||"function"!=typeof navigator.requestMediaKeySystemAccess?!1:!0},MediaPlayer.models.ProtectionModel_21Jan2015.prototype={constructor:MediaPlayer.models.ProtectionModel_21Jan2015},MediaPlayer.models.ProtectionModel_3Feb2014=function(){var a=null,b=null,c=null,d=null,e=[],f=function(){var a=this;return{handleEvent:function(b){switch(b.type){case d.needkey:a.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(b.initData,"cenc"))}}}},g=null,h=function(){var c=function(){a[d.setMediaKeys](b),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_VIDEO_ELEMENT_SELECTED)};a.readyState>=1?c.call(this):a.addEventListener("loadedmetadata",c.bind(this))},i=function(a,b){var c=this;return{prototype:(new MediaPlayer.models.SessionToken).prototype,session:a,initData:b,handleEvent:function(a){switch(a.type){case d.error:var b="KeyError";c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(this,b));break;case d.message:c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(this,a.message,a.destinationURL));break;case d.ready:c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this);break;case d.close:c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this.getSessionID())}},getSessionID:function(){return this.session.sessionId}}};return{system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:null,setup:function(){g=f.call(this)},init:function(){var a=document.createElement("video");d=MediaPlayer.models.ProtectionModel_3Feb2014.detect(a)},teardown:function(){a&&a.removeEventListener(d.needkey,g);for(var b=0;b<e.length;b++)this.closeKeySession(e[b])},requestKeySystemAccess:function(a){for(var b=!1,c=0;c<a.length;c++)for(var e=a[c].ks.systemString,f=a[c].configs,g=null,h=null,i=0;i<f.length;i++){var j=f[i].audioCapabilities,k=f[i].videoCapabilities;if(j&&0!==j.length){g=[];for(var l=0;l<j.length;l++)window[d.MediaKeys].isTypeSupported(e,j[l].contentType)&&g.push(j[l])}if(k&&0!==k.length){h=[];for(var m=0;m<k.length;m++)window[d.MediaKeys].isTypeSupported(e,k[m].contentType)&&h.push(k[m])}if(!(!g&&!h||g&&0===g.length||h&&0===h.length)){b=!0;var n=new MediaPlayer.vo.protection.KeySystemConfiguration(g,h),o=this.protectionExt.getKeySystemBySystemString(e),p=new MediaPlayer.vo.protection.KeySystemAccess(o,n);this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,p);break}}b||this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied! -- No valid audio/video content configurations detected!")},selectKeySystem:function(e){try{b=e.mediaKeys=new window[d.MediaKeys](e.keySystem.systemString),this.keySystem=e.keySystem,c=e,a&&h.call(this),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)}catch(f){this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,null,"Error selecting keys system ("+this.keySystem.systemString+")! Could not create MediaKeys -- TODO")}},setMediaElement:function(c){a&&a.removeEventListener(d.needkey,g),a=c,a.addEventListener(d.needkey,g),b&&h.call(this)},createKeySession:function(a){if(!this.keySystem||!b||!c)throw new Error("Can not create sessions until you have selected a key system");for(var f=0;f<e.length;f++)if(this.protectionExt.initDataEquals(a,e[f].initData))return;var g=c.ksConfiguration.videoCapabilities[0].contentType,h=b.createSession(g,new Uint8Array(a)),j=i.call(this,h,a);h.addEventListener(d.error,j),h.addEventListener(d.message,j),h.addEventListener(d.ready,j),h.addEventListener(d.close,j),e.push(j),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,j)},updateKeySession:function(a,b){var c=a.session;c.update(this.protectionExt.isClearKey(this.keySystem)?new Uint8Array(b.toJWK()):b)},closeKeySession:function(a){var b=a.session;b.removeEventListener(d.error,a),b.removeEventListener(d.message,a),b.removeEventListener(d.ready,a),b.removeEventListener(d.close,a);for(var c=0;c<e.length;c++)if(e[c]===a){e.splice(c,1);break}b[d.release]()},setServerCertificate:function(){},loadKeySession:function(){},removeKeySession:function(){}}},MediaPlayer.models.ProtectionModel_3Feb2014.APIs=[{setMediaKeys:"setMediaKeys",MediaKeys:"MediaKeys",release:"close",needkey:"needkey",error:"keyerror",message:"keymessage",ready:"keyadded",close:"keyclose"},{setMediaKeys:"msSetMediaKeys",MediaKeys:"MSMediaKeys",release:"close",needkey:"msneedkey",error:"mskeyerror",message:"mskeymessage",ready:"mskeyadded",close:"mskeyclose"}],MediaPlayer.models.ProtectionModel_3Feb2014.detect=function(a){for(var b=MediaPlayer.models.ProtectionModel_3Feb2014.APIs,c=0;c<b.length;c++){var d=b[c];if("function"==typeof a[d.setMediaKeys]&&"function"==typeof window[d.MediaKeys])return d}return null},MediaPlayer.models.ProtectionModel_3Feb2014.prototype={constructor:MediaPlayer.models.ProtectionModel_3Feb2014},MediaPlayer.models.URIQueryAndFragmentModel=function(){"use strict";var a=new MediaPlayer.vo.URIFragmentData,b=[],c=function(c){function d(a,b,c,d){var e=d[0].split(/[=]/);return d.push({key:e[0],value:e[1]}),d.shift(),d}function e(a,c,d){return c>0&&(j&&0===b.length?b=d[c].split(/[&]/):k&&(g=d[c].split(/[&]/))),d}if(!c)return null;var f,g=[],h=new RegExp(/[?]/),i=new RegExp(/[#]/),j=h.test(c),k=i.test(c);return f=c.split(/[?#]/).map(e),b.length>0&&(b=b.reduce(d,null)),g.length>0&&(g=g.reduce(d,null),g.forEach(function(b){a[b.key]=b.value})),c};return{parseURI:c,getURIFragmentData:function(){return a},getURIQueryData:function(){return b},reset:function(){a=new MediaPlayer.vo.URIFragmentData,b=[]}}},MediaPlayer.models.URIQueryAndFragmentModel.prototype={constructor:MediaPlayer.models.URIQueryAndFragmentModel},MediaPlayer.models.VideoModel=function(){"use strict";var a,b=[],c=function(){return b.length>0},d=function(c){null===c||a.seeking||(this.setPlaybackRate(0),b[c]!==!0&&(b.push(c),b[c]=!0))},e=function(a){if(null!==a){b[a]=!1;var d=b.indexOf(a);-1!==d&&b.splice(d,1),c()===!1&&this.setPlaybackRate(1)}},f=function(a,b){b?d.call(this,a):e.call(this,a)};return{system:void 0,play:function(){a.play()},pause:function(){a.pause()},isPaused:function(){return a.paused},getPlaybackRate:function(){return a.playbackRate},setPlaybackRate:function(b){!a||a.readyState<2||(a.playbackRate=b)},getCurrentTime:function(){return a.currentTime},setCurrentTime:function(b){if(a.currentTime!=b)try{a.currentTime=b}catch(c){0===a.readyState&&c.code===c.INVALID_STATE_ERR&&setTimeout(function(){a.currentTime=b},400)}},setStallState:function(a,b){f.call(this,a,b)},listen:function(b,c){a.addEventListener(b,c,!1)},unlisten:function(b,c){a.removeEventListener(b,c,!1)},getElement:function(){return a},setElement:function(b){a=b},setSource:function(b){a.src=b}}},MediaPlayer.models.VideoModel.prototype={constructor:MediaPlayer.models.VideoModel},MediaPlayer.dependencies.protection.CommonEncryption={findCencContentProtection:function(a){for(var b=null,c=0;c<a.length;++c){var d=a[c];"urn:mpeg:dash:mp4protection:2011"===d.schemeIdUri.toLowerCase()&&"cenc"===d.value.toLowerCase()&&(b=d)}return b},getPSSHData:function(a){return a.slice(32)},getPSSHForKeySystem:function(a,b){var c=MediaPlayer.dependencies.protection.CommonEncryption.parsePSSHList(b);return c.hasOwnProperty(a.uuid.toLowerCase())?c[a.uuid.toLowerCase()]:null},parseInitDataFromContentProtection:function(a){return"pssh"in a?BASE64.decodeArray(a.pssh.__text).buffer:null},parsePSSHList:function(a){if(null===a)return[];for(var b=new DataView(a),c=!1,d={},e=0;!c;){var f,g,h,i,j,k=e;if(e>=b.buffer.byteLength)break;if(f=b.getUint32(e),g=e+f,e+=4,1886614376===b.getUint32(e))if(e+=4,h=b.getUint8(e),0===h||1===h){e+=1,e+=3,i="";var l,m;for(l=0;4>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=4,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;6>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;e+=6,i=i.toLowerCase(),j=b.getUint32(e),e+=4,d[i]=b.buffer.slice(k,g),e=g}else e=g;else e=g}return d}},MediaPlayer.dependencies.protection.KeySystem={eventList:{ENAME_LICENSE_REQUEST_COMPLETE:"licenseRequestComplete"}},MediaPlayer.dependencies.protection.KeySystem_Access=function(){"use strict"},MediaPlayer.dependencies.protection.KeySystem_Access.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_Access},MediaPlayer.dependencies.protection.KeySystem_ClearKey=function(){"use strict";var a="org.w3.clearkey",b="1077efec-c0b2-4d02-ace3-3c1e52e2fb4b";return{system:void 0,schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection,getRequestHeadersFromMessage:function(){return null},getLicenseRequestFromMessage:function(a){return new Uint8Array(a)}}},MediaPlayer.dependencies.protection.KeySystem_ClearKey.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_ClearKey},MediaPlayer.dependencies.protection.KeySystem_PlayReady=function(){"use strict";var a="com.microsoft.playready",b="9a04f079-9840-4286-ab92-e65be0885f95",c=function(a){var b,c,d={},e=new DOMParser;b=String.fromCharCode.apply(null,new Uint16Array(a.buffer)),c=e.parseFromString(b,"application/xml");for(var f=c.getElementsByTagName("name"),g=c.getElementsByTagName("value"),h=0;h<f.length;h++)d[f[h].childNodes[0].nodeValue]=g[h].childNodes[0].nodeValue;return d},d=function(a){var b,c,d=new DOMParser,e=null;if(b=String.fromCharCode.apply(null,new Uint16Array(a.buffer)),c=d.parseFromString(b,"application/xml"),c.getElementsByTagName("Challenge")[0]){var f=c.getElementsByTagName("Challenge")[0].childNodes[0].nodeValue;f&&(e=BASE64.decode(f))}return e},e=function(a){var b,c,d,e,f,g=0,h=new Uint8Array([112,115,115,104,0,0,0,0]),i=new Uint8Array([154,4,240,121,152,64,66,134,171,146,230,91,224,136,95,149]),j=null;if("pssh"in a)return MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection(a);if("pro"in a)j=BASE64.decodeArray(a.pro.__text);else{if(!("prheader"in a))return null;j=BASE64.decodeArray(a.prheader.__text)}return b=j.length,c=4+h.length+i.length+4+b,d=new ArrayBuffer(c),e=new Uint8Array(d),f=new DataView(d),f.setUint32(g,c),g+=4,e.set(h,g),g+=h.length,e.set(i,g),g+=i.length,f.setUint32(g,b),g+=4,e.set(j,g),g+=b,e.buffer};return{schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:e,getRequestHeadersFromMessage:c,getLicenseRequestFromMessage:d}},MediaPlayer.dependencies.protection.KeySystem_PlayReady.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_PlayReady},MediaPlayer.dependencies.protection.KeySystem_Widevine=function(){"use strict";var a="com.widevine.alpha",b="edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";return{schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection,getRequestHeadersFromMessage:function(){return null},getLicenseRequestFromMessage:function(a){return new Uint8Array(a)}}},MediaPlayer.dependencies.protection.KeySystem_Widevine.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_Widevine},MediaPlayer.dependencies.protection.servers.ClearKey=function(){"use strict";return{getServerURLFromMessage:function(a,b){var c=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(b)));a+="/?";for(var d=0;d<c.kids.length;d++)a+=c.kids[d]+"&";return a=a.substring(0,a.length-1)},getHTTPMethod:function(){return"GET"},getResponseType:function(){return"json"},getLicenseMessage:function(a){if(!a.hasOwnProperty("keys"))return null;var b,c=[];for(b=0;b<a.keys.length;b++){var d=a.keys[b],e=d.kid.replace(/=/g,""),f=d.k.replace(/=/g,"");c.push(new MediaPlayer.vo.protection.KeyPair(e,f))}return new MediaPlayer.vo.protection.ClearKeyKeySet(c)},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))},getClearKeysFromProtectionData:function(a,b){var c=null;if(a){for(var d=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(b))),e=[],f=0;f<d.kids.length;f++){var g=d.kids[f],h=a.clearkeys.hasOwnProperty(g)?a.clearkeys[g]:null;if(!h)throw new Error("DRM: ClearKey keyID ("+g+") is not known!");e.push(new MediaPlayer.vo.protection.KeyPair(g,h))}c=new MediaPlayer.vo.protection.ClearKeyKeySet(e)}return c}}},MediaPlayer.dependencies.protection.servers.ClearKey.prototype={constructor:MediaPlayer.dependencies.protection.servers.ClearKey},MediaPlayer.dependencies.protection.servers.DRMToday=function(){"use strict";var a={"com.widevine.alpha":{responseType:"json",getLicenseMessage:function(a){return new Uint8Array(BASE64.decodeArray(a.license))},getErrorResponse:function(a){return a}},"com.microsoft.playready":{responseType:"arraybuffer",getLicenseMessage:function(a){return new Uint8Array(a)},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}};return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(b){return a[b].responseType},getLicenseMessage:function(b,c){return a[c].getLicenseMessage(b)},getErrorResponse:function(b,c){return a[c].getErrorResponse(b)}}},MediaPlayer.dependencies.protection.servers.DRMToday.prototype={constructor:MediaPlayer.dependencies.protection.servers.DRMToday},MediaPlayer.dependencies.protection.servers.PlayReady=function(){"use strict";return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(){return"arraybuffer"},getLicenseMessage:function(a){return new Uint8Array(a)},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}},MediaPlayer.dependencies.protection.servers.PlayReady.prototype={constructor:MediaPlayer.dependencies.protection.servers.PlayReady},MediaPlayer.dependencies.protection.servers.Widevine=function(){"use strict";return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(){return"arraybuffer"},getLicenseMessage:function(a){return new Uint8Array(a)},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}},MediaPlayer.dependencies.protection.servers.Widevine.prototype={constructor:MediaPlayer.dependencies.protection.servers.Widevine},MediaPlayer.rules.ABRRulesCollection=function(){"use strict";var a=[],b=[];return{insufficientBufferRule:void 0,bufferOccupancyRule:void 0,throughputRule:void 0,abandonRequestRule:void 0,getRules:function(c){switch(c){case MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES:return a;case MediaPlayer.rules.ABRRulesCollection.prototype.ABANDON_FRAGMENT_RULES:return b;default:return null}},setup:function(){a.push(this.insufficientBufferRule),a.push(this.throughputRule),a.push(this.bufferOccupancyRule),b.push(this.abandonRequestRule)}}},MediaPlayer.rules.ABRRulesCollection.prototype={constructor:MediaPlayer.rules.ABRRulesCollection,QUALITY_SWITCH_RULES:"qualitySwitchRules",ABANDON_FRAGMENT_RULES:"abandonFragmentRules"},MediaPlayer.rules.AbandonRequestsRule=function(){"use strict";var a=500,b=1.5,c={},d={},e=function(a,b){c[a]=c[a]||{},c[a][b]=c[a][b]||{}};return{metricsExt:void 0,log:void 0,execute:function(f,g){var h,i=(new Date).getTime(),j=f.getMediaInfo(),k=j.type,l=f.getCurrentValue(),m=f.getTrackInfo(),n=l.data.request,o=f.getStreamProcessor().getABRController(),p=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);if(!isNaN(n.index)){if(e(k,n.index),h=c[k][n.index],null===h||null===n.firstByteDate||d.hasOwnProperty(h.id))return void g(p);if(void 0===h.firstByteTime&&(h.firstByteTime=n.firstByteDate.getTime(),h.segmentDuration=n.duration,h.bytesTotal=n.bytesTotal,h.id=n.index),h.bytesLoaded=n.bytesLoaded,h.elapsedTime=i-h.firstByteTime,h.bytesLoaded<h.bytesTotal&&h.elapsedTime>=a){if(h.measuredBandwidthInKbps=Math.round(8*h.bytesLoaded/h.elapsedTime),h.estimatedTimeOfDownload=(8*h.bytesTotal*.001/h.measuredBandwidthInKbps).toFixed(2),h.estimatedTimeOfDownload<h.segmentDuration*b||0===m.quality)return void g(p);if(!d.hasOwnProperty(h.id)){var q=o.getQualityForBitrate(j,h.measuredBandwidthInKbps*MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY);p=new MediaPlayer.rules.SwitchRequest(q,MediaPlayer.rules.SwitchRequest.prototype.STRONG),d[h.id]=h,this.log("AbandonRequestsRule ( ",k,"frag id",h.id,") is asking to abandon and switch to quality to ",q," measured bandwidth was",h.measuredBandwidthInKbps),delete c[k][h.id]}}else h.bytesLoaded===h.bytesTotal&&delete c[k][h.id]}g(p)},reset:function(){c={},d={}}}},MediaPlayer.rules.AbandonRequestsRule.prototype={constructor:MediaPlayer.rules.AbandonRequestsRule},MediaPlayer.rules.BufferOccupancyRule=function(){"use strict";var a=0;return{log:void 0,metricsModel:void 0,execute:function(b,c){var d=this,e=(new Date).getTime()/1e3,f=b.getMediaInfo(),g=b.getTrackInfo(),h=f.type,i=isNaN(g.fragmentDuration)?2:g.fragmentDuration/2,j=b.getCurrentValue(),k=b.getStreamProcessor(),l=k.getABRController(),m=this.metricsModel.getReadOnlyMetricsFor(h),n=m.BufferLevel.length>0?m.BufferLevel[m.BufferLevel.length-1]:null,o=m.BufferState.length>0?m.BufferState[m.BufferState.length-1]:null,p=!1,q=f.trackCount-1,r=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);return i>e-a||l.getAbandonmentStateFor(h)===MediaPlayer.dependencies.AbrController.ABANDON_LOAD?void c(r):(null!==n&&null!==o&&n.level>o.target&&(p=n.level-o.target>MediaPlayer.dependencies.BufferController.RICH_BUFFER_THRESHOLD,p&&f.trackCount>1&&(r=new MediaPlayer.rules.SwitchRequest(q,MediaPlayer.rules.SwitchRequest.prototype.STRONG))),r.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&r.value!==j&&d.log("BufferOccupancyRule requesting switch to index: ",r.value,"type: ",h," Priority: ",r.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":r.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak"),void c(r))},reset:function(){a=0}}},MediaPlayer.rules.BufferOccupancyRule.prototype={constructor:MediaPlayer.rules.BufferOccupancyRule},MediaPlayer.rules.InsufficientBufferRule=function(){"use strict";var a={},b=0,c=1e3,d=function(b,c){a[b]=a[b]||{},a[b].state=c,c!==MediaPlayer.dependencies.BufferController.BUFFER_LOADED||a[b].firstBufferLoadedEvent||(a[b].firstBufferLoadedEvent=!0)},e=function(){a={}};return{log:void 0,metricsModel:void 0,playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=e},execute:function(e,f){var g=this,h=(new Date).getTime(),i=e.getMediaInfo().type,j=e.getCurrentValue(),k=g.metricsModel.getReadOnlyMetricsFor(i),l=k.BufferState.length>0?k.BufferState[k.BufferState.length-1]:null,m=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);return c>h-b||null===l?void f(m):(d(i,l.state),l.state===MediaPlayer.dependencies.BufferController.BUFFER_EMPTY&&void 0!==a[i].firstBufferLoadedEvent&&(m=new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.STRONG)),m.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&m.value!==j&&g.log("InsufficientBufferRule requesting switch to index: ",m.value,"type: ",i," Priority: ",m.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":m.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak"),b=h,void f(m))},reset:function(){a={},b=0}}},MediaPlayer.rules.InsufficientBufferRule.prototype={constructor:MediaPlayer.rules.InsufficientBufferRule},MediaPlayer.rules.ThroughputRule=function(){"use strict";var a=[],b=0,c=2,d=3,e=function(b,c){a[b]=a[b]||[],c!==1/0&&c!==a[b][a[b].length-1]&&a[b].push(c)},f=function(b,e){var f=0,g=e?c:d,h=a[b],i=h.length;if(g=g>i?i:g,i>0){for(var j=i-g,k=0,l=j;i>l;l++)k+=h[l];f=k/g}return h.length>g&&h.shift(),f*MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY};return{log:void 0,metricsExt:void 0,metricsModel:void 0,manifestExt:void 0,manifestModel:void 0,execute:function(a,c){var d,g,h,i=this,j=(new Date).getTime()/1e3,k=a.getMediaInfo(),l=k.type,m=a.getCurrentValue(),n=a.getTrackInfo(),o=i.metricsModel.getReadOnlyMetricsFor(l),p=a.getStreamProcessor(),q=p.getABRController(),r=p.isDynamic(),s=i.metricsExt.getCurrentHttpRequest(o),t=isNaN(n.fragmentDuration)?2:n.fragmentDuration/2,u=o.BufferState.length>0?o.BufferState[o.BufferState.length-1]:null,v=o.BufferLevel.length>0?o.BufferLevel[o.BufferLevel.length-1]:null,w=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);if(t>j-b||!o||null===s||s.type!==MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE||null===u||null===v)return void c(w);if(d=(s.tfinish.getTime()-s.tresponse.getTime())/1e3,h=Math.round(8*s.trace[s.trace.length-1].b/d),e(l,h),g=Math.round(f(l,r)),q.getAbandonmentStateFor(l)!==MediaPlayer.dependencies.AbrController.ABANDON_LOAD){if(u.state===MediaPlayer.dependencies.BufferController.BUFFER_LOADED&&(v.level>=2*MediaPlayer.dependencies.BufferController.LOW_BUFFER_THRESHOLD||r)){var x=q.getQualityForBitrate(k,g/1e3);w=new MediaPlayer.rules.SwitchRequest(x,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)}w.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&w.value!==m&&i.log("ThroughputRule requesting switch to index: ",w.value,"type: ",l," Priority: ",w.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":w.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak","Average throughput",Math.round(g/1024),"kbps")}c(w)},reset:function(){a=[],b=0}}},MediaPlayer.rules.ThroughputRule.prototype={constructor:MediaPlayer.rules.ThroughputRule},MediaPlayer.rules.RulesContext=function(a,b){"use strict";var c=a.getCurrentTrack(),d=a;return{getStreamInfo:function(){return c.mediaInfo.streamInfo},getMediaInfo:function(){return c.mediaInfo},getTrackInfo:function(){return c},getCurrentValue:function(){return b},getManifestInfo:function(){return c.mediaInfo.streamInfo.manifestInfo},getStreamProcessor:function(){return d}}},MediaPlayer.rules.RulesContext.prototype={constructor:MediaPlayer.rules.RulesContext},MediaPlayer.rules.RulesController=function(){"use strict";var a={},b=["execute"],c=function(a){return a===this.SCHEDULING_RULE||a===this.ABR_RULE},d=function(a){var c=b.length,d=0;for(d;c>d;d+=1)if(!a.hasOwnProperty(b[d]))return!1;return!0},e=function(a,b){return new MediaPlayer.rules.RulesContext(a,b)},f=function(a){var b=a.execute.bind(a);return a.execute=function(c,d){var e=function(b){d.call(a,new MediaPlayer.rules.SwitchRequest(b.value,b.priority))};b(c,e)},"function"!=typeof a.reset&&(a.reset=function(){}),a},g=function(a,b,c){var e,g,h,i,j,k;for(g in b)if(i=b[g],j=i.length)for(k=0;j>k;k+=1)e=i[k],d.call(this,e)&&(e=f.call(this,e),h=a.getRules(g),c&&(c=!1,h.length=0),this.system.injectInto(e),h.push(e))};return{system:void 0,log:void 0,SCHEDULING_RULE:0,ABR_RULE:1,SYNC_RULE:2,initialize:function(){a[this.ABR_RULE]=this.system.getObject("abrRulesCollection"),a[this.SCHEDULING_RULE]=this.system.getObject("scheduleRulesCollection"),a[this.SYNC_RULE]=this.system.getObject("synchronizationRulesCollection")},setRules:function(b,d){c.call(this,b)&&d&&g.call(this,a[b],d,!0)},addRules:function(b,d){c.call(this,b)&&d&&g.call(this,a[b],d,!1)},applyRules:function(a,b,c,f,g){var h,i,j=a.length,k=j,l={},m=e.call(this,b,f),n=function(a){var b,d;a.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(l[a.priority]=g(l[a.priority],a.value)),--j||(l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.WEAK,b=l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]),l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,b=l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]),l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.STRONG,b=l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]),d!=MediaPlayer.rules.SwitchRequest.prototype.STRONG&&d!=MediaPlayer.rules.SwitchRequest.prototype.WEAK&&(d=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT),c({value:void 0!==b?b:f,confidence:d}))};for(l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,i=0;k>i;i+=1)h=a[i],d.call(this,h)?h.execute(m,n):j--},reset:function(){var b,c,d=a[this.ABR_RULE],e=a[this.SCHEDULING_RULE],f=a[this.SYNC_RULE],g=(d.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES)||[]).concat(f.getRules(MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES)||[]).concat(f.getRules(MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES)||[]),h=g.length;for(c=0;h>c;c+=1)b=g[c],"function"==typeof b.reset&&b.reset();a={}}}},MediaPlayer.rules.RulesController.prototype={constructor:MediaPlayer.rules.RulesController},MediaPlayer.rules.BufferLevelRule=function(){"use strict";var a={},b={},c={},d=function(a){var b=this.metricsExt.getCurrentHttpRequest(a);return null!==b?(b.tresponse.getTime()-b.trequest.getTime())/1e3:0},e=function(a,b,c){var d;return d=c?this.playbackController.getLiveDelay():isNaN(b)||MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME<b&&b>a?Math.max(MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME,a):a>=b?Math.min(b,MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME):Math.min(b,a)},f=function(a,b,c){var f=this,g=c.bufferController.getCriticalBufferLevel(),h=f.metricsModel.getReadOnlyMetricsFor("video"),i=f.metricsModel.getReadOnlyMetricsFor("audio"),j=e.call(this,c.bufferController.getMinBufferTime(),b,a),k=j,l=c.bufferController.bufferMax,m=0;return l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_MIN?m=j:l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_INFINITY?m=b:l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED&&(!a&&f.abrController.isPlayingAtTopQuality(c.streamProcessor.getStreamInfo())&&(k=MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY),m=k+Math.max(d.call(f,h),d.call(f,i))),m=Math.min(m,g)},g=function(a,c){return b[a]&&b[a][c]},h=function(b,c){return a[b]&&a[b][c]},i=function(a){var c=a.data.fragmentModel.getContext().streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.data.request.mediaType]=!0},j=function(b){var c=b.sender.streamProcessor.getStreamInfo().id;a[c]=a[c]||{},a[c][b.sender.streamProcessor.getType()]=!0},k=function(b){var c=b.sender.streamProcessor.getStreamInfo().id;a[c]=a[c]||{},a[c][b.sender.streamProcessor.getType()]=!1};return{metricsExt:void 0,metricsModel:void 0,abrController:void 0,playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN]=j,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=k,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=i},setScheduleController:function(a){var b=a.streamProcessor.getStreamInfo().id;c[b]=c[b]||{},c[b][a.streamProcessor.getType()]=a},execute:function(a,b){var d=a.getStreamInfo(),e=d.id,i=a.getMediaInfo().type;if(h(e,i))return void b(new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.STRONG));

var j,k=this.metricsModel.getReadOnlyMetricsFor(i),l=this.metricsExt.getCurrentBufferLevel(k)?this.metricsExt.getCurrentBufferLevel(k).level:0,m=c[e][i],n=m.streamProcessor.getCurrentTrack(),o=m.streamProcessor.isDynamic(),p=this.metricsExt.getCurrentPlaybackRate(k),q=d.manifestInfo.duration,r=l/Math.max(p,1),s=n.fragmentDuration,t=this.playbackController.getTime(),u=o?Number.POSITIVE_INFINITY:q-t,v=Math.min(f.call(this,o,q,m),u),w=Math.max(v-r,0);j=Math.ceil(w/s),r>=u&&!g(e,i)&&(j=j||1),b(new MediaPlayer.rules.SwitchRequest(j,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT))},reset:function(){a={},b={},c={}}}},MediaPlayer.rules.BufferLevelRule.prototype={constructor:MediaPlayer.rules.BufferLevelRule},MediaPlayer.rules.PendingRequestsRule=function(){"use strict";var a=3,b={};return{metricsExt:void 0,setScheduleController:function(a){var c=a.streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.streamProcessor.getType()]=a},execute:function(c,d){var e=c.getMediaInfo().type,f=c.getStreamInfo().id,g=c.getCurrentValue(),h=b[f][e],i=h.getFragmentModel(),j=i.getRequests({state:[MediaPlayer.dependencies.FragmentModel.states.PENDING,MediaPlayer.dependencies.FragmentModel.states.LOADING]}),k=i.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.REJECTED}),l=k.length,m=j.length,n=Math.max(g-m,0);return l>0?void d(new MediaPlayer.rules.SwitchRequest(l,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)):m>a?void d(new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)):0===g?void d(new MediaPlayer.rules.SwitchRequest(n,MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE)):void d(new MediaPlayer.rules.SwitchRequest(n,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT))},reset:function(){b={}}}},MediaPlayer.rules.PendingRequestsRule.prototype={constructor:MediaPlayer.rules.PendingRequestsRule},MediaPlayer.rules.PlaybackTimeRule=function(){"use strict";var a={},b={},c=function(b){setTimeout(function(){var c=b.data.seekTime;a.audio=c,a.video=c,a.fragmentedText=c},0)};return{adapter:void 0,sourceBufferExt:void 0,playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=c},setScheduleController:function(a){var c=a.streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.streamProcessor.getType()]=a},execute:function(c,d){var e,f,g=c.getMediaInfo().type,h=c.getStreamInfo().id,i=b[h][g],j=.1,k=b[h][g].streamProcessor,l=k.getCurrentTrack(),m=a?a[g]:null,n=void 0!==m&&null!==m,o=n?MediaPlayer.rules.SwitchRequest.prototype.STRONG:MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,p=i.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.REJECTED})[0],q=!!p&&!n,r=this.adapter.getIndexHandlerTime(k),s=this.playbackController.getTime(),t=p?p.startTime+p.duration:null,u=!n&&p&&(t>s&&p.startTime<=r||isNaN(r)),v=k.bufferController.getBuffer(),w=null;if(e=n?m:u?p.startTime:r,p&&i.getFragmentModel().removeRejectedRequest(p),isNaN(e))return void d(new MediaPlayer.rules.SwitchRequest(null,o));for(n&&(a[g]=null),v&&(w=this.sourceBufferExt.getBufferRange(k.bufferController.getBuffer(),e),null!==w&&(e=w.end)),f=this.adapter.getFragmentRequestForTime(k,l,e,{keepIdx:q}),u&&f&&f.index!==p.index&&(f=this.adapter.getFragmentRequestForTime(k,l,p.startTime+p.duration/2+j,{keepIdx:q,timeThreshold:0}));f&&k.getFragmentModel().isFragmentLoadedOrPending(f);){if("complete"===f.action){f=null,this.adapter.setIndexHandlerTime(k,0/0);break}f=this.adapter.getNextFragmentRequest(k,l)}f&&!u&&this.adapter.setIndexHandlerTime(k,f.startTime+f.duration),d(new MediaPlayer.rules.SwitchRequest(f,o))},reset:function(){a={},b={}}}},MediaPlayer.rules.PlaybackTimeRule.prototype={constructor:MediaPlayer.rules.PlaybackTimeRule},MediaPlayer.rules.SameTimeRequestRule=function(){"use strict";var a={},b=function(a,b){var c,e,f,g,h,i=0,j=a.length;for(i;j>i;i+=1)for(f=a[i].getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING}),d.call(this,f,"index"),g=0,h=f.length;h>g;g++){if(c=f[g],isNaN(c.startTime)&&"complete"!==c.action){e=c;break}c.startTime>b&&(!e||c.startTime<e.startTime)&&(e=c)}return e||c},c=function(a,b){var c,d,e=a.length,f=null;for(d=0;e>d;d+=1)c=a[d].getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:b})[0],c&&(!f||c.startTime>f.startTime)&&(f=c);return f},d=function(a,b){var c=function(a,c){return a[b]<c[b]||isNaN(a[b])&&"complete"!==a.action?-1:a[b]>c[b]?1:0};a.sort(c)},e=function(b,c){return a[b]&&a[b][c]?a[b][c]:0/0},f=function(b){var c=b.data.fragmentModel,d=b.data.request,e=c.getContext().streamProcessor.getStreamInfo().id,f=d.mediaType;a[e]=a[e]||{},a[e][f]=d.index-1};return{playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=f},setFragmentModels:function(a,b){this.fragmentModels=this.fragmentModels||{},this.fragmentModels[b]=a},execute:function(a,d){var f,g,h,i,j,k,l,m,n,o=a.getStreamInfo().id,p=a.getCurrentValue(),q=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,r=this.fragmentModels[o],s=new Date,t=null,u=r?r.length:null,v=!1,w=[];if(!r||!u)return void d(new MediaPlayer.rules.SwitchRequest([],q));if(k=this.playbackController.getTime(),l=c(r,k),j=l||b(r,k)||p,!j)return void d(new MediaPlayer.rules.SwitchRequest([],q));for(i=0;u>i;i+=1)if(g=r[i],f=g.getContext().streamProcessor.getType(),("video"===f||"audio"===f||"fragmentedText"===f)&&(m=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING}),n=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}).length,!g.getIsPostponed()||isNaN(j.startTime))){if(n>MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD)return void d(new MediaPlayer.rules.SwitchRequest([],q));if(t=t||(j===l?k:j.startTime),-1===m.indexOf(j)){if(h=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:t})[0],h||0!==j.index||(h=m.filter(function(a){return a.index===j.index})[0]),h)w.push(h);else if(h=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING,time:t})[0]||g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,time:t})[0],!h&&j.index!==e.call(this,o,j.mediaType)){v=!0;break}}else w.push(j)}return w=w.filter(function(a){return"complete"===a.action||s.getTime()>=a.availabilityStartTime.getTime()}),v?void d(new MediaPlayer.rules.SwitchRequest([],q)):void d(new MediaPlayer.rules.SwitchRequest(w,q))},reset:function(){a={}}}},MediaPlayer.rules.SameTimeRequestRule.prototype={constructor:MediaPlayer.rules.SameTimeRequestRule},MediaPlayer.rules.ScheduleRulesCollection=function(){"use strict";var a=[],b=[],c=[];return{bufferLevelRule:void 0,pendingRequestsRule:void 0,playbackTimeRule:void 0,sameTimeRequestRule:void 0,getRules:function(d){switch(d){case MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES:return a;case MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES:return c;case MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES:return b;default:return null}},setup:function(){a.push(this.bufferLevelRule),a.push(this.pendingRequestsRule),c.push(this.playbackTimeRule),b.push(this.sameTimeRequestRule)}}},MediaPlayer.rules.ScheduleRulesCollection.prototype={constructor:MediaPlayer.rules.ScheduleRulesCollection,FRAGMENTS_TO_SCHEDULE_RULES:"fragmentsToScheduleRules",NEXT_FRAGMENT_RULES:"nextFragmentRules",FRAGMENTS_TO_EXECUTE_RULES:"fragmentsToExecuteRules"},MediaPlayer.rules.SwitchRequest=function(a,b){"use strict";this.value=a,this.priority=b,void 0===this.value&&(this.value=999),void 0===this.priority&&(this.priority=.5)},MediaPlayer.rules.SwitchRequest.prototype={constructor:MediaPlayer.rules.SwitchRequest,NO_CHANGE:999,DEFAULT:.5,STRONG:1,WEAK:0},MediaPlayer.rules.LiveEdgeBinarySearchRule=function(){"use strict";var a,b,c,d=43200,e=0/0,f=null,g=0/0,h=null,i=!1,j=0/0,k=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,l=function(a,d,e,f){var g,i=this;if(null===f)g=i.adapter.generateFragmentRequestForTime(c,h,a),l.call(i,a,d,e,g);else{var j=function(c){b.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,i,j),c.data.exists?d.call(i,c.data.request,a):e.call(i,c.data.request,a)};b.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,i,j),b.checkForExistence(f)}},m=function(b,d){var j,p,q;return i?void o.call(this,!1,d):(q=d-e,j=q>0?e-q:e+Math.abs(q)+g,void(j<f.start&&j>f.end?a(new MediaPlayer.rules.SwitchRequest(null,k)):(p=this.adapter.getFragmentRequestForTime(c,h,j,{ignoreIsFinished:!0}),l.call(this,j,n,m,p))))},n=function(b,d){var m,n,p=b.startTime,q=this;if(!i){if(!h.fragmentDuration)return void a(new MediaPlayer.rules.SwitchRequest(p,k));if(i=!0,f.end=p+2*g,d===e)return n=d+j,m=q.adapter.getFragmentRequestForTime(c,h,n,{ignoreIsFinished:!0}),void l.call(q,n,function(){o.call(q,!0,n)},function(){a(new MediaPlayer.rules.SwitchRequest(n,k))},m)}o.call(this,!0,d)},o=function(b,d){var e,g,i;b?f.start=d:f.end=d,e=Math.floor(f.end-f.start)<=j,e?a(new MediaPlayer.rules.SwitchRequest(b?d:d-j,k)):(i=(f.start+f.end)/2,g=this.adapter.getFragmentRequestForTime(c,h,i,{ignoreIsFinished:!0}),l.call(this,i,n,m,g))};return{metricsExt:void 0,adapter:void 0,timelineConverter:void 0,execute:function(i,o){var p,q,r=this;if(a=o,c=i.getStreamProcessor(),b=c.getFragmentLoader(),h=i.getTrackInfo(),j=h.fragmentDuration,q=h.DVRWindow,e=q.end,h.useCalculatedLiveEdgeTime){var s=r.timelineConverter.getExpectedLiveEdge();return r.timelineConverter.setExpectedLiveEdge(e),void a(new MediaPlayer.rules.SwitchRequest(s,k))}f={start:Math.max(0,e-d),end:e+d},g=Math.floor((q.end-q.start)/2),p=r.adapter.getFragmentRequestForTime(c,h,e,{ignoreIsFinished:!0}),l.call(r,e,n,m,p)},reset:function(){e=0/0,f=null,g=0/0,h=null,i=!1,j=0/0,c=null,b=null}}},MediaPlayer.rules.LiveEdgeBinarySearchRule.prototype={constructor:MediaPlayer.rules.LiveEdgeBinarySearchRule},MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule=function(){"use strict";return{timelineConverter:void 0,execute:function(a,b){var c=a.getTrackInfo(),d=c.DVRWindow.end,e=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;if(c.useCalculatedLiveEdgeTime){var f=this.timelineConverter.getExpectedLiveEdge();this.timelineConverter.setExpectedLiveEdge(d),this.timelineConverter.setTimeSyncCompleted(!1),b(new MediaPlayer.rules.SwitchRequest(f,e))}else b(new MediaPlayer.rules.SwitchRequest(d,e))}}},MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule.prototype={constructor:MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule},MediaPlayer.rules.SynchronizationRulesCollection=function(){"use strict";var a=[],b=[];return{liveEdgeBinarySearchRule:void 0,liveEdgeWithTimeSynchronizationRule:void 0,getRules:function(c){switch(c){case MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES:return a;case MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES:return b;default:return null}},setup:function(){a.push(this.liveEdgeWithTimeSynchronizationRule),b.push(this.liveEdgeBinarySearchRule)}}},MediaPlayer.rules.SynchronizationRulesCollection.prototype={constructor:MediaPlayer.rules.SynchronizationRulesCollection,TIME_SYNCHRONIZED_RULES:"withAccurateTimeSourceRules",BEST_GUESS_RULES:"bestGuestRules"},MediaPlayer.utils.Capabilities=function(){"use strict"},MediaPlayer.utils.Capabilities.prototype={constructor:MediaPlayer.utils.Capabilities,system:void 0,log:void 0,supportsMediaSource:function(){"use strict";var a="WebKitMediaSource"in window,b="MediaSource"in window;return a||b},supportsEncryptedMedia:function(){return this.system.hasMapping("protectionModel")},supportsCodec:function(a,b){"use strict";if(!(a instanceof HTMLMediaElement))throw"element must be of type HTMLMediaElement.";var c=a.canPlayType(b);return"probably"===c||"maybe"===c}},MediaPlayer.utils.CustomTimeRanges=function(){return{customTimeRangeArray:[],length:0,add:function(a,b){var c=0;for(c=0;c<this.customTimeRangeArray.length&&a>this.customTimeRangeArray[c].start;c++);for(this.customTimeRangeArray.splice(c,0,{start:a,end:b}),c=0;c<this.customTimeRangeArray.length-1;c++)this.mergeRanges(c,c+1)&&c--;this.length=this.customTimeRangeArray.length},remove:function(a,b){for(var c=0;c<this.customTimeRangeArray.length;c++)if(a<=this.customTimeRangeArray[c].start&&b>=this.customTimeRangeArray[c].end)this.customTimeRangeArray.splice(c,1),c--;else{if(a>this.customTimeRangeArray[c].start&&b<this.customTimeRangeArray[c].end){this.customTimeRangeArray.splice(c+1,0,{start:b,end:this.customTimeRangeArray[c].end}),this.customTimeRangeArray[c].end=a;break}a>this.customTimeRangeArray[c].start&&a<this.customTimeRangeArray[c].end?this.customTimeRangeArray[c].end=a:b>this.customTimeRangeArray[c].start&&b<this.customTimeRangeArray[c].end&&(this.customTimeRangeArray[c].start=b)}this.length=this.customTimeRangeArray.length},mergeRanges:function(a,b){var c=this.customTimeRangeArray[a],d=this.customTimeRangeArray[b];return c.start<=d.start&&d.start<=c.end&&c.end<=d.end?(c.end=d.end,this.customTimeRangeArray.splice(b,1),!0):d.start<=c.start&&c.start<=d.end&&d.end<=c.end?(c.start=d.start,this.customTimeRangeArray.splice(b,1),!0):d.start<=c.start&&c.start<=d.end&&c.end<=d.end?(this.customTimeRangeArray.splice(a,1),!0):c.start<=d.start&&d.start<=c.end&&d.end<=c.end?(this.customTimeRangeArray.splice(b,1),!0):!1},start:function(a){return this.customTimeRangeArray[a].start},end:function(a){return this.customTimeRangeArray[a].end}}},MediaPlayer.utils.CustomTimeRanges.prototype={constructor:MediaPlayer.utils.CustomTimeRanges},MediaPlayer.utils.DOMStorage=function(){var a=!0,b=function(){["video","audio"].forEach(function(b){if(void 0===this.abrController.getInitialBitrateFor(b)){if(this.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)&&a){var c=MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+b.toUpperCase()+"_BITRATE_KEY"],d=JSON.parse(localStorage.getItem(c))||{},e=(new Date).getTime()-parseInt(d.timestamp)>=MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_BITRATE_EXPIRATION||!1,f=parseInt(d.bitrate);isNaN(f)||e?e&&localStorage.removeItem(c):(this.abrController.setInitialBitrateFor(b,f),this.log("Last bitrate played for "+b+" was "+f))}void 0===this.abrController.getInitialBitrateFor(b)&&this.abrController.setInitialBitrateFor(b,MediaPlayer.dependencies.AbrController["DEFAULT_"+b.toUpperCase()+"_BITRATE"])}},this)};return{system:void 0,log:void 0,abrController:void 0,checkInitialBitrate:b,enableLastBitrateCaching:function(b,c){a=b,void 0===c||isNaN(c)||"number"!=typeof c||(MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_BITRATE_EXPIRATION=c)},isSupported:function(a){return a===MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL?window.localStorage||!1:a===MediaPlayer.utils.DOMStorage.STORAGE_TYPE_SESSION?window.sessionStorage||!1:!1}}},MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_VIDEO_BITRATE_KEY="dashjs_vbitrate",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_AUDIO_BITRATE_KEY="dashjs_abitrate",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_BITRATE_EXPIRATION=36e4,MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL="local",MediaPlayer.utils.DOMStorage.STORAGE_TYPE_SESSION="session",MediaPlayer.utils.DOMStorage.prototype={constructor:MediaPlayer.utils.DOMStorage},MediaPlayer.utils.Debug=function(){"use strict";var a,b=!0,c=!1,d=!1,e=(new Date).getTime();return{system:void 0,eventBus:void 0,setup:function(){this.system.mapValue("log",this.log),a=this.eventBus},setLogTimestampVisible:function(a){c=a},showCalleeName:function(a){d=a},setLogToBrowserConsole:function(a){b=a},getLogToBrowserConsole:function(){return b},log:function(){var f="",g=null;c&&(g=(new Date).getTime(),f+="["+(g-e)+"]"),d&&this.getName&&(f+="["+this.getName()+"]"),this.getMediaType&&this.getMediaType()&&(f+="["+this.getMediaType()+"]"),f.length>0&&(f+=" "),Array.apply(null,arguments).forEach(function(a){f+=a+" "}),b&&console.log(f),a.dispatchEvent({type:"log",message:f})}}},MediaPlayer.utils.EventBus=function(){"use strict";var a,b=function(b,c){var d=(c?"1":"0")+b;return d in a||(a[d]=[]),a[d]},c=function(){a={}};return c(),{addEventListener:function(a,c,d){var e=b(a,d),f=e.indexOf(c);-1===f&&e.push(c)},removeEventListener:function(a,c,d){var e=b(a,d),f=e.indexOf(c);-1!==f&&e.splice(f,1)},dispatchEvent:function(a){for(var c=b(a.type,!1).slice(),d=0;d<c.length;d++)c[d].call(this,a);return!a.defaultPrevented}}},MediaPlayer.utils.VirtualBuffer=function(){var a={},b=function(a,b){var c=function(a,c){return a[b]<c[b]?-1:a[b]>c[b]?1:0};a.sort(c)},c=function(b){var c=b.streamId,d=b.mediaType;return a[c]?a[c][d]:null},d=function(){var a={};return a.audio={buffered:new MediaPlayer.utils.CustomTimeRanges},a.audio[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.audio[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a.video={buffered:new MediaPlayer.utils.CustomTimeRanges},a.video[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.video[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a.fragmentedText={buffered:new MediaPlayer.utils.CustomTimeRanges},a.fragmentedText[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.fragmentedText[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a};return{system:void 0,sourceBufferExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,append:function(c){var e=c.streamId,f=c.mediaType,g=c.segmentType,h=c.start,i=c.end;a[e]=a[e]||d(),a[e][f][g].push(c),b(a[e][f][g],"index"),isNaN(h)||isNaN(i)||(a[e][f].buffered.add(h,i),this.notify(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,{chunk:c}))},getChunks:function(a){var b=c.call(this,a),d=a.segmentType,e=a.removeOrigin,f=a.limit||Number.POSITIVE_INFINITY,g=0,h=[];return b?(delete a.streamId,delete a.mediaType,delete a.segmentType,delete a.removeOrigin,delete a.limit,h=b[d].filter(function(c,d,h){if(g>=f)return!1;for(var i in a)if(a.hasOwnProperty(i)&&c[i]!=a[i])return!1;return e&&(b.buffered.remove(c.start,c.end),h.splice(d,1)),g+=1,!0})):h},extract:function(a){return a.removeOrigin=!0,this.getChunks(a)},getTotalBufferLevel:function(b){var c=b.type,d=0;for(var e in a)a.hasOwnProperty(e)&&(d+=this.sourceBufferExt.getTotalBufferedTime(a[e][c]));return d},reset:function(){a={}}}},MediaPlayer.utils.VirtualBuffer.prototype={constructor:MediaPlayer.utils.VirtualBuffer},MediaPlayer.utils.VirtualBuffer.eventList={CHUNK_APPENDED:"chunkAppended"},MediaPlayer.vo.BitrateInfo=function(){"use strict";this.mediaType=null,this.bitrate=null,this.qualityIndex=0/0},MediaPlayer.vo.BitrateInfo.prototype={constructor:MediaPlayer.vo.BitrateInfo},MediaPlayer.vo.DataChunk=function(){"use strict";this.streamId=null,this.mediaType=null,this.segmentType=null,this.quality=0/0,this.index=0/0,this.bytes=null,this.start=0/0,this.end=0/0,this.duration=0/0},MediaPlayer.vo.DataChunk.prototype={constructor:MediaPlayer.vo.DataChunk},MediaPlayer.vo.Error=function(a,b,c){"use strict";this.code=a||null,this.message=b||null,this.data=c||null},MediaPlayer.vo.Error.prototype={constructor:MediaPlayer.vo.Error},MediaPlayer.vo.Event=function(){"use strict";this.type=null,this.sender=null,this.data=null,this.error=null,this.timestamp=0/0},MediaPlayer.vo.Event.prototype={constructor:MediaPlayer.vo.Event},MediaPlayer.vo.FragmentRequest=function(){"use strict";this.action="download",this.startTime=0/0,this.mediaType=null,this.type=null,this.duration=0/0,this.timescale=0/0,this.range=null,this.url=null,this.requestStartDate=null,this.firstByteDate=null,this.requestEndDate=null,this.quality=0/0,this.index=0/0,this.availabilityStartTime=null,this.availabilityEndTime=null,this.wallStartTime=null,this.bytesLoaded=0/0,this.bytesTotal=0/0},MediaPlayer.vo.FragmentRequest.prototype={constructor:MediaPlayer.vo.FragmentRequest,ACTION_DOWNLOAD:"download",ACTION_COMPLETE:"complete"},MediaPlayer.vo.ManifestInfo=function(){"use strict";this.DVRWindowSize=0/0,this.loadedTime=null,this.availableFrom=null,this.minBufferTime=0/0,this.duration=0/0,this.isDynamic=!1,this.maxFragmentDuration=null},MediaPlayer.vo.ManifestInfo.prototype={constructor:MediaPlayer.vo.ManifestInfo},MediaPlayer.vo.MediaInfo=function(){"use strict";this.id=null,this.index=null,this.type=null,this.streamInfo=null,this.trackCount=0,this.lang=null,this.codec=null,this.mimeType=null,this.contentProtection=null,this.isText=!1,this.KID=null,this.bitrateList=null},MediaPlayer.vo.MediaInfo.prototype={constructor:MediaPlayer.vo.MediaInfo},MediaPlayer.models.MetricsList=function(){"use strict";return{TcpList:[],HttpList:[],RepSwitchList:[],BufferLevel:[],BufferState:[],PlayList:[],DroppedFrames:[],SchedulingInfo:[],DVRInfo:[],ManifestUpdate:[]}},MediaPlayer.models.MetricsList.prototype={constructor:MediaPlayer.models.MetricsList},MediaPlayer.vo.StreamInfo=function(){"use strict";this.id=null,this.index=null,this.start=0/0,this.duration=0/0,this.manifestInfo=null,this.isLast=!0},MediaPlayer.vo.StreamInfo.prototype={constructor:MediaPlayer.vo.StreamInfo},MediaPlayer.vo.TrackInfo=function(){"use strict";this.id=null,this.quality=null,this.DVRWindow=null,this.fragmentDuration=null,this.mediaInfo=null,this.MSETimeOffset=null},MediaPlayer.vo.TrackInfo.prototype={constructor:MediaPlayer.vo.TrackInfo},MediaPlayer.vo.URIFragmentData=function(){"use strict";this.t=null,this.xywh=null,this.track=null,this.id=null,this.s=null},MediaPlayer.vo.URIFragmentData.prototype={constructor:MediaPlayer.vo.URIFragmentData},MediaPlayer.vo.metrics.BufferLevel=function(){"use strict";this.t=null,this.level=null},MediaPlayer.vo.metrics.BufferLevel.prototype={constructor:MediaPlayer.vo.metrics.BufferLevel},MediaPlayer.vo.metrics.BufferState=function(){"use strict";this.target=null,this.state=MediaPlayer.dependencies.BufferController.BUFFER_EMPTY},MediaPlayer.vo.metrics.BufferState.prototype={constructor:MediaPlayer.vo.metrics.BufferState},MediaPlayer.vo.metrics.DVRInfo=function(){"use strict";this.time=null,this.range=null,this.manifestInfo=null},MediaPlayer.vo.metrics.DVRInfo.prototype={constructor:MediaPlayer.vo.metrics.DVRInfo},MediaPlayer.vo.metrics.DroppedFrames=function(){"use strict";this.time=null,this.droppedFrames=null},MediaPlayer.vo.metrics.DroppedFrames.prototype={constructor:MediaPlayer.vo.metrics.DroppedFrames},MediaPlayer.vo.metrics.HTTPRequest=function(){"use strict";this.stream=null,this.tcpid=null,this.type=null,this.url=null,this.actualurl=null,this.range=null,this.trequest=null,this.tresponse=null,this.tfinish=null,this.responsecode=null,this.interval=null,this.mediaduration=null,this.responseHeaders=null,this.trace=[]},MediaPlayer.vo.metrics.HTTPRequest.prototype={constructor:MediaPlayer.vo.metrics.HTTPRequest},MediaPlayer.vo.metrics.HTTPRequest.Trace=function(){"use strict";this.s=null,this.d=null,this.b=[]},MediaPlayer.vo.metrics.HTTPRequest.Trace.prototype={constructor:MediaPlayer.vo.metrics.HTTPRequest.Trace},MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE="Media Segment",MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE="Initialization Segment",MediaPlayer.vo.metrics.HTTPRequest.MPD_TYPE="MPD",MediaPlayer.vo.metrics.ManifestUpdate=function(){"use strict";this.mediaType=null,this.type=null,this.requestTime=null,this.fetchTime=null,this.availabilityStartTime=null,this.presentationStartTime=0,this.clientTimeOffset=0,this.currentTime=null,this.buffered=null,this.latency=0,this.streamInfo=[],this.trackInfo=[]},MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo=function(){"use strict";this.id=null,this.index=null,this.start=null,this.duration=null},MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo=function(){"use strict";this.id=null,this.index=null,this.mediaType=null,this.streamIndex=null,this.presentationTimeOffset=null,this.startNumber=null,this.fragmentInfoType=null},MediaPlayer.vo.metrics.ManifestUpdate.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate},MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo},MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo},MediaPlayer.vo.metrics.PlayList=function(){"use strict";this.stream=null,this.start=null,this.mstart=null,this.starttype=null,this.trace=[]},MediaPlayer.vo.metrics.PlayList.Trace=function(){"use strict";this.representationid=null,this.subreplevel=null,this.start=null,this.mstart=null,this.duration=null,this.playbackspeed=null,this.stopreason=null},MediaPlayer.vo.metrics.PlayList.prototype={constructor:MediaPlayer.vo.metrics.PlayList},MediaPlayer.vo.metrics.PlayList.INITIAL_PLAY_START_REASON="initial_start",MediaPlayer.vo.metrics.PlayList.SEEK_START_REASON="seek",MediaPlayer.vo.metrics.PlayList.Trace.prototype={constructor:MediaPlayer.vo.metrics.PlayList.Trace()},MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON="user_request",MediaPlayer.vo.metrics.PlayList.Trace.REPRESENTATION_SWITCH_STOP_REASON="representation_switch",MediaPlayer.vo.metrics.PlayList.Trace.END_OF_CONTENT_STOP_REASON="end_of_content",MediaPlayer.vo.metrics.PlayList.Trace.REBUFFERING_REASON="rebuffering",MediaPlayer.vo.metrics.TrackSwitch=function(){"use strict";this.t=null,this.mt=null,this.to=null,this.lto=null},MediaPlayer.vo.metrics.TrackSwitch.prototype={constructor:MediaPlayer.vo.metrics.TrackSwitch},MediaPlayer.vo.metrics.SchedulingInfo=function(){"use strict";this.mediaType=null,this.t=null,this.type=null,this.startTime=null,this.availabilityStartTime=null,this.duration=null,this.quality=null,this.range=null,this.state=null},MediaPlayer.vo.metrics.SchedulingInfo.prototype={constructor:MediaPlayer.vo.metrics.SchedulingInfo},MediaPlayer.vo.metrics.TCPConnection=function(){"use strict";this.tcpid=null,this.dest=null,this.topen=null,this.tclose=null,this.tconnect=null},MediaPlayer.vo.metrics.TCPConnection.prototype={constructor:MediaPlayer.vo.metrics.TCPConnection},MediaPlayer.vo.protection.ClearKeyKeySet=function(a,b){if(b&&"persistent"!==b&&"temporary"!==b)throw new Error("Invalid ClearKey key set type!  Must be one of 'persistent' or 'temporary'");this.keyPairs=a,this.type=b,this.toJWK=function(){var a,b=this.keyPairs.length,c={};for(c.keys=[],a=0;b>a;a++){var d={kty:"oct",alg:"A128KW",kid:this.keyPairs[a].keyID,k:this.keyPairs[a].key};c.keys.push(d)}this.type&&(c.type=this.type);var e=JSON.stringify(c),f=e.length,g=new ArrayBuffer(f),h=new Uint8Array(g);for(a=0;f>a;a++)h[a]=e.charCodeAt(a);return g}},MediaPlayer.vo.protection.ClearKeyKeySet.prototype={constructor:MediaPlayer.vo.protection.ClearKeyKeySet},MediaPlayer.vo.protection.KeyError=function(a,b){"use strict";this.sessionToken=a,this.error=b},MediaPlayer.vo.protection.KeyError.prototype={constructor:MediaPlayer.vo.protection.KeyError},MediaPlayer.vo.protection.KeyMessage=function(a,b,c,d){"use strict";this.sessionToken=a,this.message=b,this.defaultURL=c,this.messageType=d},MediaPlayer.vo.protection.KeyMessage.prototype={constructor:MediaPlayer.vo.protection.KeyMessage},MediaPlayer.vo.protection.KeyPair=function(a,b){"use strict";this.keyID=a,this.key=b},MediaPlayer.vo.protection.KeyPair.prototype={constructor:MediaPlayer.vo.protection.KeyPair},MediaPlayer.vo.protection.KeySystemAccess=function(a,b){this.keySystem=a,this.ksConfiguration=b},MediaPlayer.vo.protection.KeySystemAccess.prototype={constructor:MediaPlayer.vo.protection.KeySystemAccess},MediaPlayer.vo.protection.KeySystemConfiguration=function(a,b,c,d){this.initDataTypes=["cenc"],this.audioCapabilities=a,this.videoCapabilities=b,this.distinctiveIdentifier=c,this.persistentState=d},MediaPlayer.vo.protection.KeySystemConfiguration.prototype={constructor:MediaPlayer.vo.protection.KeySystemConfiguration},MediaPlayer.vo.protection.LicenseRequestComplete=function(a,b){"use strict";this.message=a,this.requestData=b},MediaPlayer.vo.protection.LicenseRequestComplete.prototype={constructor:MediaPlayer.vo.protection.LicenseRequestComplete},MediaPlayer.vo.protection.MediaCapability=function(a,b){this.contentType=a,this.robustness=b},MediaPlayer.vo.protection.MediaCapability.prototype={constructor:MediaPlayer.vo.protection.MediaCapability},MediaPlayer.vo.protection.NeedKey=function(a,b){this.initData=a,this.initDataType=b},MediaPlayer.vo.protection.NeedKey.prototype={constructor:MediaPlayer.vo.protection.NeedKey},MediaPlayer.vo.protection.ProtectionData=function(a,b,c){this.laURL=a,this.httpRequestHeaders=b,this.clearkeys=c},MediaPlayer.vo.protection.ProtectionData.prototype={constructor:MediaPlayer.vo.protection.ProtectionData},MediaPlayer.models.SessionToken=function(){"use strict"},MediaPlayer.models.SessionToken.prototype={initData:null,getSessionID:function(){return""},getExpirationTime:function(){return 0/0},getKeyStatuses:function(){return null}};
/*! videojs-contrib-dash - v1.1.1 - 2015-08-27
 * Copyright (c) 2015 Brightcove  */
(function(window, videojs) {
  'use strict';

  var
    isArray = function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },
    isObject = function (a) {
      return Object.prototype.toString.call(a) === '[object Object]';
    },
    mergeOptions = function(obj1, obj2){
      var key, val1, val2, res;

      // make a copy of obj1 so we're not overwriting original values.
      // like prototype.options_ and all sub options objects
      res = {};

      for (key in obj2){
        if (obj2.hasOwnProperty(key)) {
          val1 = obj1[key];
          val2 = obj2[key];

          // Check if both properties are pure objects and do a deep merge if so
          if (isObject(val1) && isObject(val2)) {
            obj1[key] = mergeOptions(val1, val2);
          } else {
            obj1[key] = obj2[key];
          }
        }
      }
      return obj1;
    };

  /**
   * videojs-contrib-dash
   *
   * Use Dash.js to playback DASH content inside of Video.js via a SourceHandler
   */
  function Html5DashJS (source, tech) {
    var
      options = tech.options(),
      manifestSource;

    this.tech_ = tech;
    this.el_ = tech.el();
    this.elParent_ = this.el_.parentNode;

    // Do nothing if the src is falsey
    if (!source.src) {
      return;
    }

    // While the manifest is loading and Dash.js has not finished initializing
    // we must defer events and functions calls with isReady_ and then `triggerReady`
    // again later once everything is setup
    tech.isReady_ = false;

    manifestSource = source.src;
    this.keySystemOptions_ = Html5DashJS.buildDashJSProtData(source.keySystemOptions);

    // We have to hide errors since SRC_UNSUPPORTED is thrown by the video element when
    // we set src = '' in order to clear the mediaKeys
    Html5DashJS.hideErrors(this.elParent_);

    // Must be before anything is initialized since we are overridding a global object
    // injection
    if (Html5DashJS.useVideoJSDebug) {
      Html5DashJS.useVideoJSDebug(videojs);
    }

    // Save the context after the first initialization for subsequent instances
    Html5DashJS.context_ = Html5DashJS.context_ || new Dash.di.DashContext();

    // But make a fresh MediaPlayer each time the sourceHandler is used
    this.mediaPlayer_ = new MediaPlayer(Html5DashJS.context_);

    // Must run controller before these two lines or else there is no
    // element to bind to.
    this.mediaPlayer_.startup();
    this.mediaPlayer_.attachView(this.el_);

    // Dash.js autoplays by default
    if (!options.autoplay) {
      this.mediaPlayer_.setAutoPlay(false);
    }

    // Fetches and parses the manifest - WARNING the callback is non-standard "error-last" style
    this.mediaPlayer_.retrieveManifest(manifestSource, videojs.bind(this, this.initializeDashJS));
  }

  Html5DashJS.prototype.initializeDashJS = function (manifest, err) {
    var manifestProtectionData = {};

    if (err) {
      Html5DashJS.showErrors(this.elParent_);
      this.tech_.triggerReady();
      this.dispose();
      return;
    }

    // If we haven't received protection data from the outside world try to get it from the manifest
    // We merge the two allowing the manifest to override any keySystemOptions provided via src()
    if (Html5DashJS.getWidevineProtectionData) {
      manifestProtectionData = Html5DashJS.getWidevineProtectionData(manifest);
      this.keySystemOptions_ = mergeOptions(
        this.keySystemOptions_,
        manifestProtectionData);
    }

    // We have to reset any mediaKeys before the attachSource call below
    this.resetSrc_(videojs.bind(this, function afterMediaKeysReset () {
      Html5DashJS.showErrors(this.elParent_);

      // Attach the source with any protection data
      this.mediaPlayer_.attachSource(manifest, null, this.keySystemOptions_);

      this.tech_.triggerReady();
    }));
  };

  /*
   * Add a css-class that is used to temporarily hide the error dialog while so that
   * we don't see a flash of the dialog box when we remove the video element's src
   * to reset MediaKeys in resetSrc_
   */
  Html5DashJS.hideErrors = function (el) {
    el.className += 'vjs-dashjs-hide-errors';
  };

  /*
   * Remove the css-class above to enable the error dialog to be shown once again
   */
  Html5DashJS.showErrors = function (el) {
    // The video element's src is set asynchronously so we have to wait a while
    // before we unhide any errors
    // 250ms is arbitrary but I haven't seen dash.js take longer than that to initialize
    // in my testing
    setTimeout(function () {
      el.className = el.className.replace('vjs-dashjs-hide-errors', '');
    }, 250);
  };

  /*
   * Iterate over the `keySystemOptions` array and convert each object into
   * the type of object Dash.js expects in the `protData` argument.
   *
   * Also rename 'licenseUrl' property in the options to an 'laURL' property
   */
  Html5DashJS.buildDashJSProtData = function (keySystemOptions) {
    var
      keySystem,
      options,
      i,
      output = {};

    if (!keySystemOptions || !isArray(keySystemOptions)) {
      return output;
    }

    for (i = 0; i < keySystemOptions.length; i++) {
      keySystem = keySystemOptions[i];
      options = mergeOptions({}, keySystem.options);

      if (options.licenseUrl) {
        options.laURL = options.licenseUrl;
        delete options.licenseUrl;
      }

      output[keySystem.name] = options;
    }

    return output;
  };

  /*
   * Helper function to clear any EME keys that may have been set on the video element
   *
   * The MediaKeys has to be explicitly set to null before any DRM content can be loaded into
   * a video element that already contained DRM content.
   */
  Html5DashJS.prototype.resetSrc_ = function (callback) {
    // In Chrome, MediaKeys can NOT be changed when a src is loaded in the video element
    // Dash.js has a bug where it doesn't correctly reset the data so we do it manually
    // The order of these two lines is important. The video element's src must be reset
    // to allow `mediaKeys` to changed otherwise a DOMException is thrown.
    if (this.el_) {
      this.el_.src = '';
      if (this.el_.setMediaKeys) {
        this.el_.setMediaKeys(null).then(callback, callback);
      } else {
        callback();
      }
    }
  };

  Html5DashJS.prototype.dispose = function () {
    if (this.mediaPlayer_) {
      this.mediaPlayer_.reset();
    }
    this.resetSrc_(function noop(){});
  };

  // Only add the SourceHandler if the browser supports MediaSourceExtensions
  if (!!window.MediaSource) {
    videojs.Html5.registerSourceHandler({
      canHandleSource: function (source) {
        var dashTypeRE = /^application\/dash\+xml/i;
        var dashExtRE = /\.mpd/i;

        if (dashTypeRE.test(source.type)) {
          return 'probably';
        } else if (dashExtRE.test(source.src)){
          return 'maybe';
        } else {
          return '';
        }
      },

      handleSource: function (source, tech) {
        return new Html5DashJS(source, tech);
      }
    }, 0);
  }

  videojs.Html5DashJS = Html5DashJS;
})(window, window.videojs);

/*! videojs-chromecast - v1.1.1 - 2015-09-10
* https://github.com/kim-company/videojs-chromecast
* Copyright (c) 2015 KIM Keep In Mind GmbH, srl; Licensed MIT */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  vjs.addLanguage("de", {
    "CASTING TO": "WIEDERGABE AUF"
  });

  vjs.addLanguage("it", {
    "CASTING TO": "PLAYBACK SU"
  });

  vjs.plugin("chromecast", function(options) {
    this.chromecastComponent = new vjs.ChromecastComponent(this, options);
    return this.controlBar.addChild(this.chromecastComponent);
  });

  vjs.ChromecastComponent = (function(superClass) {
    extend(ChromecastComponent, superClass);

    ChromecastComponent.prototype.buttonText = "Chromecast";

    ChromecastComponent.prototype.inactivityTimeout = 2000;

    ChromecastComponent.prototype.apiInitialized = false;

    ChromecastComponent.prototype.apiSession = null;

    ChromecastComponent.prototype.apiMedia = null;

    ChromecastComponent.prototype.casting = false;

    ChromecastComponent.prototype.paused = true;

    ChromecastComponent.prototype.muted = false;

    ChromecastComponent.prototype.currentVolume = 1;

    ChromecastComponent.prototype.currentMediaTime = 0;

    ChromecastComponent.prototype.timer = null;

    ChromecastComponent.prototype.timerStep = 1000;

    function ChromecastComponent(player, settings) {
      this.settings = settings;
      ChromecastComponent.__super__.constructor.call(this, player, this.settings);
      if (!player.controls()) {
        this.disable();
      }
      this.hide();
      this.initializeApi();
    }

    ChromecastComponent.prototype.initializeApi = function() {
      var apiConfig, appId, sessionRequest;
      if (!vjs.IS_CHROME) {
        return;
      }
      if (!chrome.cast || !chrome.cast.isAvailable) {
        vjs.log("Cast APIs not available. Retrying...");
        setTimeout(this.initializeApi.bind(this), 1000);
        return;
      }
      vjs.log("Cast APIs are available");
      appId = this.settings.appId || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      sessionRequest = new chrome.cast.SessionRequest(appId);
      apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionJoinedListener, this.receiverListener.bind(this));
      return chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.castError);
    };

    ChromecastComponent.prototype.sessionJoinedListener = function(session) {
      return console.log("Session joined");
    };

    ChromecastComponent.prototype.receiverListener = function(availability) {
      if (availability === "available") {
        return this.show();
      }
    };

    ChromecastComponent.prototype.onInitSuccess = function() {
      return this.apiInitialized = true;
    };

    ChromecastComponent.prototype.castError = function(castError) {
      return vjs.log("Cast Error: " + (JSON.stringify(castError)));
    };

    ChromecastComponent.prototype.doLaunch = function() {
      vjs.log("Cast video: " + (this.player_.currentSrc()));
      if (this.apiInitialized) {
        return chrome.cast.requestSession(this.onSessionSuccess.bind(this), this.castError);
      } else {
        return vjs.log("Session not initialized");
      }
    };

    ChromecastComponent.prototype.onSessionSuccess = function(session) {
      var image, key, loadRequest, mediaInfo, ref, ref1, value;
      vjs.log("Session initialized: " + session.sessionId);
      this.selectedTrack = null;
      this.apiSession = session;
      this.addClass("connected");
      mediaInfo = new chrome.cast.media.MediaInfo(this.player_.currentSrc(), this.player_.currentType());
      if (this.settings.metadata) {
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        ref = this.settings.metadata;
        for (key in ref) {
          value = ref[key];
          mediaInfo.metadata[key] = value;
        }
        if (this.player_.options_.poster) {
          image = new chrome.cast.Image(this.player_.options_.poster);
          mediaInfo.metadata.images = [image];
        }
      }
      this.plTracks = this.settings.tracks;
      if (this.plTracks) {
        this.tracks = [];
        ref1 = this.plTracks;
        for (key in ref1) {
          value = ref1[key];
          this.track = new chrome.cast.media.Track(value.id, chrome.cast.media.TrackType.TEXT);
          this.track.trackContentId = value.id;
          this.track.trackContentType = value.type;
          this.track.subtype = value.kind;
          this.track.name = value.label;
          this.track.language = value.language;
          if (this.track.mode === 'showing') {
            this.selectedTrack = this.track;
          }
          this.track.customData = null;
          this.tracks.push(this.track);
        }
        mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
        mediaInfo.tracks = this.tracks;
      }
      loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
      loadRequest.autoplay = true;
      loadRequest.currentTime = this.player_.currentTime();
      this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.castError);
      return this.apiSession.addUpdateListener(this.onSessionUpdate.bind(this));
    };

    ChromecastComponent.prototype.onTrackChangeHandler = function() {
      var i, len, ref, track;
      this.activeTrackIds = [];
      ref = this.player_.textTracks();
      for (i = 0, len = ref.length; i < len; i++) {
        track = ref[i];
        if (track['mode'] === 'showing') {
          this.activeTrackIds.push(track.id);
        }
      }
      this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);
      if (this.apiMedia) {
        return this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
    };

    ChromecastComponent.prototype.onTrackSuccess = function() {
      return vjs.log('track added');
    };

    ChromecastComponent.prototype.onTrackError = function() {
      return vjs.log('track error');
    };

    ChromecastComponent.prototype.onMediaDiscovered = function(media) {
      this.apiMedia = media;
      this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      if (this.selectedTrack) {
        this.activeTrackIds = [this.selectedTrack.trackId];
        this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);
      }
      this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      this.startProgressTimer(this.incrementMediaTime.bind(this));
      this.player_.loadTech('ChromecastTech', {
        receiver: this.apiSession.receiver.friendlyName
      });
      this.casting = true;
      this.paused = this.player_.paused();
      this.inactivityTimeout = this.player_.options_.inactivityTimeout;
      this.player_.options_.inactivityTimeout = 0;
      return this.player_.userActive(true);
    };

    ChromecastComponent.prototype.onSessionUpdate = function(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      if (!isAlive) {
        return this.onStopAppSuccess();
      }
    };

    ChromecastComponent.prototype.onMediaStatusUpdate = function(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      this.currentMediaTime = this.apiMedia.currentTime;
      switch (this.apiMedia.playerState) {
        case chrome.cast.media.PlayerState.IDLE:
          this.currentMediaTime = 0;
          this.trigger("timeupdate");
          return this.onStopAppSuccess();
        case chrome.cast.media.PlayerState.PAUSED:
          if (this.paused) {
            return;
          }
          this.player_.pause();
          return this.paused = true;
        case chrome.cast.media.PlayerState.PLAYING:
          if (!this.paused) {
            return;
          }
          this.player_.play();
          return this.paused = false;
      }
    };

    ChromecastComponent.prototype.startProgressTimer = function(callback) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      return this.timer = setInterval(callback.bind(this), this.timerStep);
    };

    ChromecastComponent.prototype.play = function() {
      if (!this.apiMedia) {
        return;
      }
      if (this.paused) {
        this.apiMedia.play(null, this.mediaCommandSuccessCallback.bind(this, "Playing: " + this.apiMedia.sessionId), this.onError);
        return this.paused = false;
      }
    };

    ChromecastComponent.prototype.pause = function() {
      if (!this.apiMedia) {
        return;
      }
      if (!this.paused) {
        this.apiMedia.pause(null, this.mediaCommandSuccessCallback.bind(this, "Paused: " + this.apiMedia.sessionId), this.onError);
        return this.paused = true;
      }
    };

    ChromecastComponent.prototype.seekMedia = function(position) {
      var request;
      request = new chrome.cast.media.SeekRequest();
      request.currentTime = position;
      if (this.player_.controlBar.progressControl.seekBar.videoWasPlaying) {
        request.resumeState = chrome.cast.media.ResumeState.PLAYBACK_START;
      }
      return this.apiMedia.seek(request, this.onSeekSuccess.bind(this, position), this.onError);
    };

    ChromecastComponent.prototype.onSeekSuccess = function(position) {
      return this.currentMediaTime = position;
    };

    ChromecastComponent.prototype.setMediaVolume = function(level, mute) {
      var request, volume;
      if (!this.apiMedia) {
        return;
      }
      volume = new chrome.cast.Volume();
      volume.level = level;
      volume.muted = mute;
      this.currentVolume = volume.level;
      this.muted = mute;
      request = new chrome.cast.media.VolumeRequest();
      request.volume = volume;
      this.apiMedia.setVolume(request, this.mediaCommandSuccessCallback.bind(this, "Volume changed"), this.onError);
      return this.player_.trigger("volumechange");
    };

    ChromecastComponent.prototype.incrementMediaTime = function() {
      if (this.apiMedia.playerState !== chrome.cast.media.PlayerState.PLAYING) {
        return;
      }
      if (this.currentMediaTime < this.apiMedia.media.duration) {
        this.currentMediaTime += 1;
        return this.trigger("timeupdate");
      } else {
        this.currentMediaTime = 0;
        return clearInterval(this.timer);
      }
    };

    ChromecastComponent.prototype.mediaCommandSuccessCallback = function(information, event) {
      return vjs.log(information);
    };

    ChromecastComponent.prototype.onError = function() {
      return vjs.log("error");
    };

    ChromecastComponent.prototype.stopCasting = function() {
      return this.apiSession.stop(this.onStopAppSuccess.bind(this), this.onError);
    };

    ChromecastComponent.prototype.onStopAppSuccess = function() {
      clearInterval(this.timer);
      this.casting = false;
      this.removeClass("connected");
      this.player_.src(this.player_.options_["sources"]);
      if (!this.paused) {
        this.player_.one('seeked', function() {
          return this.player_.play();
        });
      }
      this.player_.currentTime(this.currentMediaTime);
      this.player_.tech.setControls(false);
      this.player_.options_.inactivityTimeout = this.inactivityTimeout;
      this.apiMedia = null;
      return this.apiSession = null;
    };

    ChromecastComponent.prototype.buildCSSClass = function() {
      return ChromecastComponent.__super__.buildCSSClass.apply(this, arguments) + "vjs-chromecast-button";
    };

    ChromecastComponent.prototype.onClick = function() {
      ChromecastComponent.__super__.onClick.apply(this, arguments);
      if (this.casting) {
        return this.stopCasting();
      } else {
        return this.doLaunch();
      }
    };

    return ChromecastComponent;

  })(vjs.Button);

  vjs.ChromecastTech = (function(superClass) {
    extend(ChromecastTech, superClass);

    ChromecastTech.isSupported = function() {
      return this.player_.chromecastComponent.apiInitialized;
    };

    ChromecastTech.canPlaySource = function(source) {
      return source.type === "video/mp4" || source.type === "video/webm" || source.type === "application/x-mpegURL" || source.type === "application/vnd.apple.mpegURL";
    };

    function ChromecastTech(player, options, ready) {
      this.featuresVolumeControl = true;
      this.movingMediaElementInDOM = false;
      this.featuresFullscreenResize = false;
      this.featuresProgressEvents = true;
      this.receiver = options.source.receiver;
      ChromecastTech.__super__.constructor.call(this, player, options, ready);
      this.triggerReady();
    }

    ChromecastTech.prototype.createEl = function() {
      var element;
      element = document.createElement("div");
      element.id = this.player_.id_ + "_chromecast_api";
      element.className = "vjs-tech vjs-tech-chromecast";
      element.innerHTML = "<div class=\"casting-image\" style=\"background-image: url('" + this.player_.options_.poster + "')\"></div>\n<div class=\"casting-overlay\">\n  <div class=\"casting-information\">\n    <div class=\"casting-icon\">&#58880</div>\n    <div class=\"casting-description\"><small>" + (this.localize("CASTING TO")) + "</small><br>" + this.receiver + "</div>\n  </div>\n</div>";
      element.player = this.player_;
      vjs.insertFirst(element, this.player_.el());
      return element;
    };


    /*
    MEDIA PLAYER EVENTS
     */

    ChromecastTech.prototype.play = function() {
      this.player_.chromecastComponent.play();
      return this.player_.onPlay();
    };

    ChromecastTech.prototype.pause = function() {
      this.player_.chromecastComponent.pause();
      return this.player_.onPause();
    };

    ChromecastTech.prototype.paused = function() {
      return this.player_.chromecastComponent.paused;
    };

    ChromecastTech.prototype.currentTime = function() {
      return this.player_.chromecastComponent.currentMediaTime;
    };

    ChromecastTech.prototype.setCurrentTime = function(seconds) {
      return this.player_.chromecastComponent.seekMedia(seconds);
    };

    ChromecastTech.prototype.volume = function() {
      return this.player_.chromecastComponent.currentVolume;
    };

    ChromecastTech.prototype.setVolume = function(volume) {
      return this.player_.chromecastComponent.setMediaVolume(volume, false);
    };

    ChromecastTech.prototype.muted = function() {
      return this.player_.chromecastComponent.muted;
    };

    ChromecastTech.prototype.setMuted = function(muted) {
      return this.player_.chromecastComponent.setMediaVolume(this.player_.chromecastComponent.currentVolume, muted);
    };

    ChromecastTech.prototype.supportsFullScreen = function() {
      return false;
    };

    return ChromecastTech;

  })(vjs.MediaTechController);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  videojs.plugin('ga', function(options) {
    var dataSetupOptions, defaultsEventsToTrack, end, error, eventCategory, eventLabel, eventsToTrack, fullscreen, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, resize, seekEnd, seekStart, seeking, sendbeacon, timeupdate, volumeChange;
    if (options == null) {
      options = {};
    }
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }
    defaultsEventsToTrack = ['loaded', 'percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultsEventsToTrack;
    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video';
    eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
    options.debug = options.debug || false;
    percentsAlreadyTracked = [];
    seekStart = seekEnd = 0;
    seeking = false;
    loaded = function() {
      if (!eventLabel) {
        eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
      }
      if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
        sendbeacon('loadedmetadata', true);
      }
    };
    timeupdate = function() {
      var currentTime, duration, percent, percentPlayed, _i;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      percentPlayed = Math.round(currentTime / duration * 100);
      for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
        if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
          if (__indexOf.call(eventsToTrack, "start") >= 0 && percent === 0 && percentPlayed > 0) {
            sendbeacon('start', true);
          } else if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
            sendbeacon('percent played', true, percent);
          }
          if (percentPlayed > 0) {
            percentsAlreadyTracked.push(percent);
          }
        }
      }
      if (__indexOf.call(eventsToTrack, "seek") >= 0) {
        seekStart = seekEnd;
        seekEnd = currentTime;
        if (Math.abs(seekStart - seekEnd) > 1) {
          seeking = true;
          sendbeacon('seek start', false, seekStart);
          sendbeacon('seek end', false, seekEnd);
        }
      }
    };
    end = function() {
      sendbeacon('end', true);
    };
    play = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('play', true, currentTime);
      seeking = false;
    };
    pause = function() {
      var currentTime, duration;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      if (currentTime !== duration && !seeking) {
        sendbeacon('pause', false, currentTime);
      }
    };
    volumeChange = function() {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      sendbeacon('volume change', false, volume);
    };
    resize = function() {
      sendbeacon('resize - ' + this.width() + "*" + this.height(), true);
    };
    error = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('error', true, currentTime);
    };
    fullscreen = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if ((typeof this.isFullscreen === "function" ? this.isFullscreen() : void 0) || (typeof this.isFullScreen === "function" ? this.isFullScreen() : void 0)) {
        sendbeacon('enter fullscreen', false, currentTime);
      } else {
        sendbeacon('exit fullscreen', false, currentTime);
      }
    };
    sendbeacon = function(action, nonInteraction, value) {
      if (window.ga) {
        ga('send', 'event', {
          'eventCategory': eventCategory,
          'eventAction': action,
          'eventLabel': eventLabel,
          'eventValue': value,
          'nonInteraction': nonInteraction
        });
      } else if (window._gaq) {
        _gaq.push(['_trackEvent', eventCategory, action, eventLabel, value, nonInteraction]);
      } else if (options.debug) {
        console.log("Google Analytics not detected");
      }
    };
    this.ready(function() {
      this.on("loadedmetadata", loaded);
      this.on("timeupdate", timeupdate);
      if (__indexOf.call(eventsToTrack, "end") >= 0) {
        this.on("ended", end);
      }
      if (__indexOf.call(eventsToTrack, "play") >= 0) {
        this.on("play", play);
      }
      if (__indexOf.call(eventsToTrack, "pause") >= 0) {
        this.on("pause", pause);
      }
      if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
        this.on("volumechange", volumeChange);
      }
      if (__indexOf.call(eventsToTrack, "resize") >= 0) {
        this.on("resize", resize);
      }
      if (__indexOf.call(eventsToTrack, "error") >= 0) {
        this.on("error", error);
      }
      if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
        return this.on("fullscreenchange", fullscreen);
      }
    });
    return {
      'sendbeacon': sendbeacon
    };
  });

}).call(this);

  return videojs;
}));
