var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('hook resolved / rejected callbacks API', function () {
  it('should be able to resolve a hook via the hook callback`s `resolve` method', function (done) {
    var myHookManager = AHM();

    myHookManager.registerHook(function (call) {
      setTimeout(function () {
        call.resolve();
      }, 3)
    });

    myHookManager.makeCall(function () {
      done();
    }, function () {
      var err = new Error('call was rejected');
      done(err);
    });
  });

  it('should be able to reject a hook via the hook callback`s `reject` method', function (done) {
    var myHookManager = AHM();

    myHookManager.registerHook(function (call) {
      setTimeout(function () {
        call.reject();
      }, 3)
    });

    myHookManager.makeCall(function () {
      var err = new Error('call was resolved');
      done(err);
    }, function () {
      done();
    });
  });
});