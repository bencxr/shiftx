var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Promise = require('bluebird');
var co = Promise.coroutine;

var pairs = ['ethbtc', 'btceth'];
var states = ['new', 'unconfirmed', 'completed', 'error'];
var reasons = ['waiting', 'mismatchedamount'];

// A shift represents a trade request
var shiftSchema = new mongoose.Schema({
  // Pair of the shift (e.g. ethbtc means it will shift from ETH to BTC)
  pair: { type: String, enum: pairs },

  // Rate of the shift, e.g. for ethbtc it's going to be number of btc that 1 eth will buy
  rate: { type: Number },

  // State of the shift
  state: { type: String, enum: states },

  // Reason if in an error state
  reason: { type: String, enum: reasons },

  // Timestamp this shift was created
  created: { type: Date, default: Date.now },

  // Timestamp this shift expires (will not pay out the tokens)
  expires: { type: Date },

  // The address the customer is supposed to deposit to in order to perform the shift
  depositAddress: { type: String }
});

shiftSchema.methods = {
  toJSON: function () {
    var obj = this.toObject();
    obj.id = obj._id;
    delete(obj._id);
    delete(obj.__v);

    return obj;
  }
};

shiftSchema.statics = {
  pairs: _.zipObject(pairs, pairs),
  states: _.zipObject(states, states),
  reasons: _.zipObject(reasons, reasons),
};

module.exports = mongoose.model('Shift', shiftSchema);