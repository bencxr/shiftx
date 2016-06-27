var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
var co = Promise.coroutine;
var _ = require('lodash');

var states = {
  new: 'new',
  unconfirmed: 'unconfirmed',
  completed: 'completed',
  error: 'error'
};
var reasons = ['waiting', 'mismatchedamount'];

// A shift represents a trade request
var shiftSchema = new mongoose.Schema({
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
  depositAddress: { type: String },

  // The address provided by the customer to send the converted funds to
  withdrawAddress: { type: String }
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
  states: _.zipObject(states, states),
  reasons: _.zipObject(reasons, reasons),
};

module.exports = mongoose.model('Shift', shiftSchema);