var expect = require('chai').expect;

var Q = require('q');
var AHM = require('../async-hook-manager.js');

/**
 * We want to test that if we have a call that is rejected because a registered
 * hooks rejects it, that a subsequent call with no rejecting hooks will be
 * resolved, in-spite of the call log containing a rejected call.
 */

describe('will call a call`s callback when all hooks resolve, even if a previous call was rejected.', function () {

  it('should reject the first call, and accept the second', function (done) {
    var myHookManager = AHM();

    // Initially set `shouldRejectHook` to true.
    var shouldRejectHook = true;

    // Keep track of whether the first call has been rejected.
    var firstCallSettled = false;

    // Create a hook that will reject/resolve based on the value of
    // `shouldRejectHook`.
    myHookManager.registerHook(function () {
      return !shouldRejectHook;
    });

    // Make the first call (this should be rejected).
    myHookManager.makeCall()
      .then(function () {
        var err = new Error('first call was not rejected');
        firstCallSettled = true;
        done(err);
      }, function () {
        firstCallSettled = true;
      });

    // We wish to accept the second call, so set `shouldRejectHook` to false.
    shouldRejectHook = false;

    // Make the second call (this should be resolved).
    myHookManager.makeCall()
      .then(function () {
        if (firstCallSettled === true) {
          done();
        }
        else {
          var err = new Error('first call was not settled');
          done(err);
        }
      }, function () {
        var err = new Error('second call was rejected');
        done(err);
      });
  });
});
