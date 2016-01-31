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
    hookId = myHookManager.registerHook(function () {});
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(hookRegistry).to.have.all.keys('0');
  });

  it('should unregister a valid hook', function () {
    myHookManager.unregisterHook(hookId);
    var hookRegistry = myHookManager.getAllRegisteredHooks();
    expect(hookRegistry).to.be.empty;
  });

  // it('should be able to unregister all hooks', function () {
  //   // Method needs writing.
  //   expect(true).to.equal(false, 'method needs writing');
  // });
});