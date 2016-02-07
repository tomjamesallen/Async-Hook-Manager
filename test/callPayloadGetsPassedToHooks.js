var expect = require('chai').expect;
var AHM = require('../async-hook-manager.js');

describe('call payload gets passed to hooks', function () {
  it('should pass the payload from the current call to the hook', function (done) {
    
    var myHookManager = AHM();

    var FIRST_CALL_PAYLOAD = 'FIRST_CALL_PAYLOAD';
    var SECOND_CALL_PAYLOAD = 'SECOND_CALL_PAYLOAD';

    var callCounter = 0;

    myHookManager.registerHook(function (callData) {
      if (callCounter === 0 &&
          callData.payload === FIRST_CALL_PAYLOAD &&
          callCounter === callData.callId) {
        return true;
      }
      if (callCounter === 1 &&
          callData.payload === SECOND_CALL_PAYLOAD &&
          callCounter === callData.callId) {
        return true;
      }

      var call = callCounter === 0 ? 'first' : 'second';

      var err = new Error(`incorrect payload delivered on ${call} call`);
      throw(err);
    });

    // Make first call, passing first payload.
    myHookManager.makeCall({
      payload: FIRST_CALL_PAYLOAD
    });

    // Increment call counter.
    callCounter ++;

    // Make second call, passing second payload.
    myHookManager.makeCall(function () {
      done();
    }, {
      payload: SECOND_CALL_PAYLOAD
    });
  });
});