var expect = require('chai').expect;

var Q = require('q');
var AHM = require('../async-hook-manager.js');

describe('hooks return values', function () {
  describe('hook that returns true', function () {
    var myHookManager = AHM();

    myHookManager.registerHook(function () {
      return true;
    });

    it('should call the call promise`s `then` method', function (done) {

      var callPromise = myHookManager.makeCall();
      callPromise
        .then(function () {
          done();
        }, function () {
          var err = new Error('call was rejected');
          done(err);
        })
    });
  });

  describe('hook that returns false', function () {
    var myHookManager = AHM();

    myHookManager.registerHook(function () {
      return false;
    });

    it('should call the call promise`s `fail` callback', function (done) {

      var callPromise = myHookManager.makeCall();
      callPromise
        .then(function () {
          var err = new Error('call was not rejected');
          done(err);
        }, function () {
          done();
        })
    });
  });

  describe('hook that returns a resolving promise', function () {
    var myHookManager = AHM();

    myHookManager.registerHook(function () {
      var qPromise = Q.defer();

      setTimeout(function () {
        qPromise.resolve();
      }, 3);

      return qPromise.promise;
    });

    it('should call the call promise`s `then` method', function (done) {

      var callPromise = myHookManager.makeCall();
      callPromise
        .then(function () {
          done();
        }, function () {
          var err = new Error('call was rejected');
          done(err);
        })
    });
  });

  describe('hook that returns a rejected promise', function () {
    var myHookManager = AHM();

    myHookManager.registerHook(function () {
      var qPromise = Q.defer();

      setTimeout(function () {
        qPromise.reject();
      }, 3);

      return qPromise.promise;
    });

    it('should call the call promise`s `fail` callback', function (done) {

      var callPromise = myHookManager.makeCall();
      callPromise
        .then(function () {
          var err = new Error('call was not rejected');
          done(err);
        }, function () {
          done();
        })
    });
  });
});
