var assert = require('assert');
var AHM = require('../index.js');
var Q = require('q');

describe('basic single hook case', function () {

  // Create a new instance of AHM.
  var myHookManager = AHM();

  // Keep track of whether the hook has been called.
  var hookCalled = false;

  var hookId = myHookManager.registerHook(function () {
    hookCalled = true;
    return true;
  });

  it('should register a hook and return the hook id', function () {

    // Check that the hook id is 0.
    assert.equal(0, hookId);

    // Get registered hooks.
    var registeredHooks = myHookManager.getAllRegisteredHooks();

    // Check that the hook is in the registered hooks.
    assert.equal(typeof registeredHooks[hookId] === 'object', true);
  });

  // Make a call to the hookManager.
  myHookManager.makeCall().then(function () {
    
  });

  it('should have called the registered hook', function () {
    assert.equal(hookCalled, true);
  });
});
