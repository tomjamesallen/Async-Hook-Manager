var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('calls all registered hooks', function () {
  
  var myHookManager = AHM();
  var registeredHooksCounter = 0;
  var calledHooksCounter = 0;

  [0,1,2].forEach(function (i) {
    registeredHooksCounter ++;
    myHookManager.registerHook(function () {
      calledHooksCounter ++;
      return true;
    });
  });

  it('should call all registered hooks on making a call to the instance', function (done) {
    myHookManager.makeCall()
      .then(function () {
        try {
          expect(registeredHooksCounter).to.equal(calledHooksCounter, 'number of called hooks does not equal the number of registered hooks');
          done();
        }
        catch (err) {
          done(err);
        }
      }, function () {
        var err = new Error('`makeCall` promise was rejected');
        done(err);
      });
  });
});