Async hook manager built on top of the Q promise library.

Currently only CommonJS support.

## Basic usage

`npm install async-hook-manager`

```javascript

    // We're using Q to return promises to the hook manager.
    var Q = require('q');
    
    // Load up AHM.
    var AHM = require('async-hook-manager');

    // Create a new instance of AHM.
    var myHookManager = AHM();

    // Register an async hook.
    // The return value is the ID of the hook, which can later be used to
    // unregister the hook.
    var asyncHookId = myHookManager.registerHook(function () {

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

Register a hook. The callback passed to this method is called whenever a call to the corresponding AHM instance is made. The callback should return `true`, `false` (synchronous) or a promise (asynchronous). This method returns the id of the hook that's been registered. This can be used to unregister the hook. The reference argument is optional, and can contains a string or an object to help with identification of the hook.

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

Can be passed then and fail callbacks directly. Additionally returns a promise that has its own `.then` method. If you are concerned with the order that calls are called in, then avoid using the returned promise's `.fail` method, as this cannot be guaranteed to fire sequentially. 

### Get the ID of the last call.
`.getLastCallId()`
