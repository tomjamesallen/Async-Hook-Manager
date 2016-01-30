var assert = require('assert');
var AHM = require('../index.js');

describe('test call id counter', function () {

  // Create a new instance of AHM.
  var myHookManager = AHM();

  it('should start with a null value', function () {
    // Check that last call id was null.
    assert.equal(null, myHookManager.getLastCallId());
  });

  it('should be 0 after first call', function () {
    // Make a call.
    myHookManager.makeCall();

    // Check that last call id is now 0.
    assert.equal(0, myHookManager.getLastCallId());
  });

  it('should be 1 after second call', function () {    
    // Make another call.
    myHookManager.makeCall();

    // Check that last call id is now 1.
    assert.equal(1, myHookManager.getLastCallId());
  });
});
