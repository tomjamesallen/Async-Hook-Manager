var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('call callbacks should behave the same as the returned promise callbacks', function () {
  it('should call both `resolved` callbacks when call is accepted', function (done) {

    // Create a new instance of AHM.
    var myHookManager = AHM();

    // Create a hook that will resolve.
    myHookManager.registerHook(function () {
      return true;
    });

    var resolvedMethodCallbackCalled = false;
    var resolvedPromiseCallbackCalled = false;
    var rejectedMethodCallbackCalled = false;
    var rejectedPromiseCallbackCalled = false;

    function resolvedCallback() {
      if (resolvedMethodCallbackCalled &&
          resolvedPromiseCallbackCalled &&
          !rejectedMethodCallbackCalled &&
          !rejectedPromiseCallbackCalled) {
        done();
      }
      else {
        var err = new Error('incorrect callbacks called');
        done(err);
      }
    }

    myHookManager
      .makeCall(function () {
        resolvedMethodCallbackCalled = true;
      }, function () {
        rejectedMethodCallbackCalled = true;
      })
      .then(function () {
        resolvedPromiseCallbackCalled = true;
        resolvedCallback();
      }, function () {
        rejectedPromiseCallbackCalled = true;
        resolvedCallback();
      })
  });

  it('should call both `fail` callbacks when call is rejected', function (done) {

    // Create a new instance of AHM.
    var myHookManager = AHM();

    // Create a hook that will reject.
    myHookManager.registerHook(function () {
      return false;
    });

    var resolvedMethodCallbackCalled = false;
    var resolvedPromiseCallbackCalled = false;
    var rejectedMethodCallbackCalled = false;
    var rejectedPromiseCallbackCalled = false;

    function resolvedCallback() {
      if (!resolvedMethodCallbackCalled &&
          !resolvedPromiseCallbackCalled &&
          rejectedMethodCallbackCalled &&
          rejectedPromiseCallbackCalled) {
        done();
      }
      else {
        var err = new Error('incorrect callbacks called');
        done(err);
      }
    }

    myHookManager
      .makeCall(function () {
        resolvedMethodCallbackCalled = true;
      }, function () {
        rejectedMethodCallbackCalled = true;
      })
      .then(function () {
        resolvedPromiseCallbackCalled = true;
        resolvedCallback();
      }, function () {
        rejectedPromiseCallbackCalled = true;
        resolvedCallback();
      })
  });
});
