var expect = require('chai').expect;

var Q = require('q');
var AHM = require('../async-hook-manager.js');

describe('ignores call order when `respectPreviousCalls` is false', function () {

  // This has to be contained in one test so that the callbacks fire in the
  // expected order.
  it('should call the second callback before the first', function (done) {

    var myHookManager = AHM();

    // Keep track of whether the first hook has been called.
    var firstCallCalled = false;

    // Register first hook and introduce a delay.
    var firstHookRef = myHookManager.registerHook(function () {
      var qPromise = Q.defer();

      setTimeout(function () {
        qPromise.resolve();
      }, 3);

      return qPromise.promise;
    });

    // Make the first call.  
    myHookManager.makeCall()
      .then(function () {
        firstCallCalled = true;
      })
      .fail(function () {
        var err = new Error('first call was rejected');
        done(err);
      });

    // Unregister the first hook.
    myHookManager.unregisterHook(firstHookRef);

    // Register a second hook that has no delay.
    myHookManager.registerHook(function () {
      var qPromise = Q.defer();
      qPromise.resolve();
      return qPromise.promise;
    });

    // Make a second call (this call should only call the second hook).
    var secondCallPromise = myHookManager.makeCall({
      respectPreviousCalls: false
    })
      .then(function () {
        if (firstCallCalled === false) {
          done();
        }
        else {
          var err = new Error('second call fired after first');
          done(err);
        }
      })
      .fail(function () {
        var err = new Error('second call was rejected');
        done(err);
      });
  });
});
