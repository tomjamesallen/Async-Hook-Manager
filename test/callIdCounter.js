var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('test call id counter', function () {

  // Create a new instance of AHM.
  var myHookManager = AHM();

  it('should start with a null value', function () {
    // Check that last call id was null.
    expect(myHookManager.getLastCallId()).to.equal.null;
  });

  it('should be 0 after first call', function () {
    // Make a call.
    myHookManager.makeCall();

    // Check that last call id is now 0.
    expect(myHookManager.getLastCallId()).to.equal(0);
  });

  it('should be 1 after second call', function () {    
    // Make another call.
    myHookManager.makeCall();

    // Check that last call id is now 1.
    expect(myHookManager.getLastCallId()).to.equal(1);
  });
});
