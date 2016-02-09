// Mock functions.
var example = {
  fireTransitionalAnimation: function (callback) {
    console.log('fireTransitionalAnimation');
    setTimeout(callback, 1500);
  },
  updateSomeDataSynchronously: function () {
    console.log('updateSomeDataSynchronously');
  },
  updateTheCurrentRoute: function () {
    console.log('update current route');
  }
};

// We're using Q to return promises to the hook manager.
var Q = require('q');

// Load up AHM.
var AHM = require('async-hook-manager');

// Create a new instance of AHM.
var myHookManager = AHM();

// Register an async hook.
// The return value is the ID of the hook, which can later be used to
// unregister the hook.
var asyncHookId = myHookManager.registerHook(function (call) {
  
  // Do some async stuff...
  example.fireTransitionalAnimation(function () {
    
    // On animation complete.
    call.resolve();

    // Or reject the transition with.
    // call.reject();
  });
});

// Register another async hook, this time using a promise.
var asyncHook2Id = myHookManager.registerHook(function () {

  // Create a new promise.
  var hookPromise = Q.defer();
  
  // Do some aync stuff...
  example.fireTransitionalAnimation(function () {
    
    // On animation complete.
    hookPromise.resolve();
  });

  return hookPromise.promise;
});

// Register a sync hook.
var syncHook = myHookManager.registerHook(function () {

  // Do something synchronously here...
  example.updateSomeDataSynchronously();

  return true;
});

// Make a call via the hook manager instance.
// This will call all of the registered hooks, and wait for all to respond
// before firing its callback.
myHookManager.makeCall(function () {

  // Do something that has to wait for all of the hooks to return.
  example.updateTheCurrentRoute();

}, function () {
  
  // Handle a failed call...

});

// Unregister a hook that is no longer required.
myHookManager.unregisterHook(syncHook);