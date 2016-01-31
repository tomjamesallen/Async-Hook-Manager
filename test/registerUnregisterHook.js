var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('register and unregister hooks', function () {

  var myHookManager = AHM();
  var hookId;
  var noop = function () {};

  it('should not register an empty hook', function () {
    myHookManager.registerHook();
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(hookRegistry).to.be.empty;
  });

  it('should register a hook that passes a callback', function () {
    hookId = myHookManager.registerHook(noop);
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(Object.keys(hookRegistry).length).to.equal(1);
  });

  it('should unregister a valid hook', function () {
    myHookManager.unregisterHook(hookId);
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(hookRegistry).to.be.empty;
  });

  it('should be able to unregister all registered hooks with `unregisterAllHooks()`', function () {
    myHookManager.registerHook(noop);
    myHookManager.registerHook(noop);
    myHookManager.registerHook(noop);
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(Object.keys(hookRegistry).length).to.equal(3);
    myHookManager.unregisterAllHooks();
    expect(hookRegistry).to.be.empty;
  });
});