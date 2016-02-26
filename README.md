Async hook manager built on top of the Q promise library.

Currently only CommonJS support.

## Basic usage
`npm install async-hook-manager`

```javascript
    
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

    // Register a sync hook.
    var syncHookId = myHookManager.registerHook(function () {

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
    myHookManager.unregisterHook(syncHookId);

```

## API instance Methods

### Register a new hook
`.registerHook(hookCallback[, reference])`

Register a hook. The callback passed to this method is called whenever a call to the corresponding AHM instance. The `hookCallback` is passed an object that contains the optional `payload` property that can be passed to `.makeCall`, as well as the `callId`, and callback functions to resolve or reject the call. These callbacks provide the simplest way of performing async work and then resolving/rejecting. Alternatively, the callback can return a boolean to resolve/reject synchronously, or return a promise to later be resolved/rejected.

This method returns the id of the hook that's been registered. This can be used to unregister the hook. The reference argument is optional, and can contains a string or an object to help with identification of the hook.

### Unregister a hook
`.unregisterHook(hookId)`

The hookId corresponds to the return value of `.registerHook`. Unregisters the hook from the instance.

### Unregister all hooks
'.unregisterAllHooks()'

Unregister all hooks registered to the corresponding instance.

### Get all currently registered hooks
`.getAllRegisteredHooks()`

Returns the hook registry. This contains the callback, the hookId and an optional reference for each registered hook.

### Make a call
`.makeCall([thenCallback, ][failCallback, ][options])`

Options:
* `respectPreviousCalls` [boolean]: whether to wait for previous calls to resolve / reject before firing the current call's callback
* `payload` [object/any]: will be passed to each of the registered hooks' callback functions

Can be passed then and fail callbacks directly. Additionally returns a promise that has its own `.then` method. If you are concerned with the order that calls are called in, then avoid using the returned promise's `.fail` method, as this cannot be guaranteed to fire sequentially. You can pass an optional payload to the options argument; this will be delivered to all of the registered hooks.

### Get the ID of the last call.
`.getLastCallId()`

Get the ID of the last call to be made to the instance.

## Development / testing
[Clone the repository][github-repo], and run `npm install` to install dev and runtime dependencies. You can then run `npm test` to run the suite of tests. This includes jshint.

[github-repo]: https://github.com/tomjamesallen/async-hook-manager
