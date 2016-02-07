var expect = require('chai').expect;

var Q = require('q');
var AHM = require('../async-hook-manager.js');

describe('will manage multiple hooks', function () {
  it('should resolve a call if all registered hooks resolve', function (done) {
    var myHookManager = AHM();

    // Register a resolving hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.resolve();
      }, 3)
      return hookPromise.promise;
    });

    // Register another resolving hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.resolve();
      }, 3)
      return hookPromise.promise;
    });

    // Make a call - this should be resolved.
    myHookManager.makeCall(function () {
      done();
    }, function () {
      var err = new Error('call rejected');
      done(err);
    })
  });

  it('should reject a call if any registered hook is rejected', function (done) {
    var myHookManager = AHM();

    // Register a resolving hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.resolve();
      }, 3)
      return hookPromise.promise;
    });

    // Register a rejecting hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.reject();
      }, 3)
      return hookPromise.promise;
    });

    // Make a call - this should be rejected.
    myHookManager.makeCall(function () {
      var err = new Error('call resolved');
      done(err);
    }, function () {
      done();
    })
  });

  it('should reject a call if multiple hooks are rejected', function (done) {
    var myHookManager = AHM();

    // Register a rejecting hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.reject();
      }, 3)
      return hookPromise.promise;
    });

    // Register another rejecting hook.
    myHookManager.registerHook(function () {
      var hookPromise = Q.defer();
      setTimeout(function () {
        hookPromise.reject();
      }, 3)
      return hookPromise.promise;
    });

    // Make a call - this should be rejected.
    myHookManager.makeCall(function () {
      var err = new Error('call resolved');
      done(err);
    }, function () {
      done();
    })
  });
});
