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
  };

  /**
   * Check in an array of settled promises whether any have been rejected.
   * @param  {array}  promises
   * @return {Boolean}
   */
  function hasRejectedPromise(promises) {
    var hasRejectedPromise = false;
    promises.forEach(function (promise) {
      if (promise.state === 'rejected') {
        hasRejectedPromise = true;
      }
    });
    return hasRejectedPromise;
  };
  
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
    registerHook(hookCallback, reference) {
      if (typeof hookCallback !== 'function') return;

      var hookId = hookIdCounter.toString();
      
      hookRegistry[hookIdCounter] = {
        callback: hookCallback
      }

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
    unregisterHook(hookId) {
      var hookId = hookId.toString();
      delete hookRegistry[hookId];
    },

    /**
     * Unregister all registered hooks.
     */
    unregisterAllHooks() {
      var that = this;

      // Get the IDs of all hooks in the hookRegistry.
      var hookIds = Object.keys(hookRegistry);

      // Loop through hooks and unregister each one.
      hookIds.forEach(function (hookId) {
        that.unregisterHook(hookId);
      });
    },

    /**
     * Get all the currently registered hooks.
     */
    getAllRegisteredHooks() {
      return hookRegistry;
    },

    /**
     * Make a call.
     *
     * This will call all of the hooks, and once their promises have resolved.
     * This method returns a promise which will resolve when all of the hooks'
     * promises have resolved.
     * 
     * @return {promise} Returns a promise, with a `then` method, which can be
     *                   used to fire anything that has to happen when once all
     *                   the hooks have returned their promises.
     */
    makeCall(options) {

      var thisCallHooksPromiseLog = clone(callHooksPromiseLog);

      // Keep track of whether all the hooks for the current call are settled.
      var allHooksSettled = Q.defer();

      // The promise that this method returns.
      var returnPromise = Q.defer();

      // Keep track of whether we've had a rejected hook for this call.
      var rejected = false;

      // Options.
      var options = options || {};

      // Get the call Id.
      var thisCallId = newCallId();

      // Respect previous hook calls.
      var respectPreviousCalls = true;
      if (typeof options.respectPreviousCalls === 'boolean') {
        respectPreviousCalls = options.respectPreviousCalls;
      }
            
      // Create array to hold hook promises.
      var hookPromises = [];
      
      // Place holder for hook and hook return value and promise.
      var hook,
          hookReturnVal,
          qPromise,
          hookPromise;

      // We're going to loop through all the hooks and retrieve the return
      // value from the callback.
      for (var hookId in hookRegistry) {

        // Get hook and hook return value.
        hook = hookRegistry[hookId]
        hookReturnVal = hook.callback();

        // Reset promise values.
        qPromise = null;
        hookPromise = null;

        // If we have a true, then we push a resolved promise to the
        // hookPromises.
        if (hookReturnVal === true) {
          qPromise = Q.defer();
          qPromise.resolve();
          hookPromise = qPromise.promise;
        }

        // Else we have a promise, so push to hookPromises.
        else if (typeof hookPromise === 'object' && hookPromise) {
          hookPromise = hookReturnVal;
        }

        // If we don't have a true return value or a promise then push a
        // rejected promise to the hookPromises.
        else {
          qPromise = Q.defer();
          qPromise.reject();
          hookPromise = qPromise.promise;
        }

        // Save the most recent promise to the hook registry.
        hook.lastPromise = {
          callId: thisCallId,
          promise: hookPromise
        };

        // If we have a promise, then add it to the array of promises.
        hookPromises.push(hookPromise);
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
        allHooksSettled.then(function () {
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

      return returnPromise.promise;
    },

    /**
     * Get the Id of the last call made.
     * @return {number}
     */
    getLastCallId() {
      return callIdCounter;
    },
  }
}
