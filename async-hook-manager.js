var Q = require('q');
var clone = require('clone');

// Return a constructor function.
module.exports = function () {

  // Keep a counter of the hookIds.
  var hookIdCounter = 0;

  // Keep a counter of the callId.
  var callIdCounter = null;

  // Object to store the registered hooks.
  var hookRegistry = {};

  // Array of previous hook promises.
  var callHooksPromiseLog = [];

  // Rejected return message.
  var REJECTED_ERROR = 'a hook rejected the call';

  var noop = function () {};

  /**
   * Get a new call Id.
   */
  function newCallId() {
    if (callIdCounter === null) {
      callIdCounter = 0;
      return callIdCounter;
    }
    else {
      callIdCounter ++;
      return callIdCounter;
    }
  }

  /**
   * Check in an array of settled promises whether any have been rejected.
   * @param  {array}  promises
   * @return {Boolean}
   */
  function hasRejectedPromise(promises) {
    var _hasRejectedPromise = false;

    var promise;
    for (var i in promises) {
      if (!promises.hasOwnProperty(i)) continue;
      promise = promises[i];
      if (promise.state === 'rejected') {
        _hasRejectedPromise = true;
      }
    }

    return _hasRejectedPromise;
  }
  
  /**
   * Return our API.
   */
  return {

    /**
     * Register a new hook.
     * @param  {function} hookCallback
     *         A function that returns a bool or a promise. 
     *
     * @param  {string} reference
     *         A reference that is saved with the hook.
     * 
     * @return {number}   hookId 
     *         We can use this ID later to unregister the hook.
     */
    registerHook: function(hookCallback, reference) {
      if (typeof hookCallback !== 'function') return;

      var hookId = hookIdCounter.toString();
      
      hookRegistry[hookIdCounter] = {
        callback: hookCallback,
        hookId: hookId
      };

      if (reference) {
        hookRegistry[hookIdCounter].reference = reference;
      }

      hookIdCounter ++;

      return hookId;
    },

    /**
     * Unregister a hook.
     * @param {number} hookId the ID of the hook to unregister.
     */
    unregisterHook: function(hookId) {
      hookId = hookId.toString();
      delete hookRegistry[hookId];
    },

    /**
     * Unregister all registered hooks.
     */
    unregisterAllHooks: function() {

      // Get the IDs of all hooks in the hookRegistry.
      var hookIds = Object.keys(hookRegistry);

      // Loop through hooks and unregister each one.
      for (var i in hookIds) {
        if (!hookIds.hasOwnProperty(i)) continue;
        hookId = hookIds[i];
        this.unregisterHook(hookId);
      }
    },

    /**
     * Get all the currently registered hooks.
     */
    getAllRegisteredHooks: function() {
      return hookRegistry;
    },

    /**
     * Make a call.
     *
     * `makeCall([thenCallback,][failCallback,][options])`
     *
     * This will call all of the hooks, and once their promises have resolved.
     * This method returns a promise which will resolve when all of the hooks'
     * promises have resolved.
     *
     * @param {function} thenCallback [/options]
     *                   Provide the callback to be fired when all of the hooks
     *                   have been resolved.
     *                   Alternatively if no callback is provided, the options
     *                   object can be passed to this argument.
     * 
     * @param {function} failCallback [/options]
     *                   Provide the callback to be fired if a hook is rejected.
     *                   Alternatively if no callback is provided, the options
     *                   object can be passed to this argument.
     *
     * @param {function} options
     *                   Pass options to the method if both of the first
     *                   arguments have been passed callbacks.
     * 
     * @return {promise} Returns a promise, with a `then` method, which can be
     *                   used to fire anything that has to happen when once all
     *                   the hooks have returned their promises.
     */
    makeCall: function(thenCallback, failCallback, options) {

      if (typeof thenCallback === 'object') {
        options = thenCallback;
        thenCallback = undefined;
      }
      else if (typeof failCallback === 'object') {
        options = failCallback;
        failCallback = undefined;
      }

      var thisCallHooksPromiseLog = clone(callHooksPromiseLog);

      // Keep track of whether all the hooks for the current call are settled.
      var allHooksSettled = Q.defer();

      // The promise that this method returns.
      var returnPromise = Q.defer();

      // Keep track of whether we've had a rejected hook for this call.
      var rejected = false;

      // Options.
      options = options || {};

      // Get the call payload.
      var callPayload = options.payload || null;

      // Get the call Id.
      var thisCallId = newCallId();

      // Respect previous hook calls.
      var respectPreviousCalls = true;
      if (typeof options.respectPreviousCalls === 'boolean') {
        respectPreviousCalls = options.respectPreviousCalls;
      }
            
      // Create array to hold hook promises.
      var hookPromises = [];

      // We're going to loop through all the hooks and retrieve the return
      // value from the callback.
      var checkHookReturnValue = function (hook) {

        // Default done promise and callback.
        var defaultPromise = Q.defer();
        var resolveDefaultPromise = function () {
          defaultPromise.resolve();
        };
        var rejectDefaultPromise = function () {
          defaultPromise.reject();
        };

        // Get hook and hook return value.
        var hookReturnVal = hook.callback({
          payload: callPayload,
          callId: thisCallId,
          resolve: resolveDefaultPromise,
          reject: rejectDefaultPromise
        });

        // Reset promise values.
        var qPromise = null;
        var hookPromise = null;        

        // If we have a true, then we push a resolved promise to the
        // hookPromises.
        if (hookReturnVal === true) {
          qPromise = Q.defer();
          qPromise.resolve();
          hookPromise = qPromise.promise;
        }

        // Else we have a promise, so push to hookPromises.
        else if (typeof hookReturnVal === 'object' &&
            typeof hookReturnVal.then === 'function') {
          hookPromise = hookReturnVal;
        }

        // If we have a false return value then push a rejected promise to the
        // hookPromises.
        else if (hookReturnVal === false) {
          qPromise = Q.defer();
          qPromise.reject();
          hookPromise = qPromise.promise;
        }

        // Else if we have no return value, we'll default to a generated promise
        // that gets resolved by the `done` callback.
        else {
          hookPromise = defaultPromise.promise;
        }

        // Save the most recent promise to the hook registry.
        hook.lastPromise = {
          callId: thisCallId,
          promise: hookPromise
        };

        // If we have a promise, then add it to the array of promises.
        hookPromises.push(hookPromise);
      };

      // Loop over all registered hooks and call `checkHookReturnValue`.
      for (var hookId in hookRegistry) {
        if (!hookRegistry.hasOwnProperty(hookId)) continue;
        checkHookReturnValue(hookRegistry[hookId]);
      }

      // Return the allSettled promise.
      Q.allSettled(hookPromises).then(function (promises) {
        var hasRejected = hasRejectedPromise(promises);
        if (hasRejected === false) {
          allHooksSettled.resolve();
        }
        else {
          allHooksSettled.reject();
          rejected = true;
        }
      });
      
      // Save the allHooksSettled promise to the callHooksPromiseLog.
      callHooksPromiseLog.push(allHooksSettled.promise);
      thisCallHooksPromiseLog.push(allHooksSettled.promise);

      // If we are to respect previous calls, then wait for all calls in the
      // callHooksPromiseLog to resolve before resolving out return promise.
      if (respectPreviousCalls) {
        Q.allSettled(thisCallHooksPromiseLog).then(function () {
          
          // Check whether we have a rejected promise from this call. If not
          // then resolve the returnPromise, otherwise reject it.
          if (!rejected) {
            returnPromise.resolve({
              callId: thisCallId,
              hooks: hookRegistry
            });
          }
          else {
            returnPromise.reject({
              reason: REJECTED_ERROR,
              callId: thisCallId,
              hooks: hookRegistry
            });
          }
        });
      }

      // If we are not interested in promises belonging to previous calls then
      // only wait for `allHooksSettled` to resolve.
      else {

        // Check whether we have a rejected promise from this call. If not
        // then resolve the returnPromise, otherwise reject it.
        allHooksSettled.promise.then(function () {
          if (!rejected) {
            returnPromise.resolve({
              callId: thisCallId,
              hooks: hookRegistry
            });
          }
          else {
            returnPromise.reject({
              reason: REJECTED_ERROR,
              callId: thisCallId,
              hooks: hookRegistry
            });
          }
        });
      }

      // Set callback defaults.
      if (typeof thenCallback !== 'function') {
        thenCallback = noop;
      }
      if (typeof failCallback !== 'function') {
        failCallback = noop;
      }

      // Assign callbacks to promise.
      returnPromise.promise.then(thenCallback, failCallback);

      // Return the promise.
      return returnPromise.promise;
    },

    /**
     * Get the Id of the last call made.
     * @return {number}
     */
    getLastCallId: function() {
      return callIdCounter;
    },
  };
};
