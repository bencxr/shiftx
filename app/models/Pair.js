var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
var co = Promise.coroutine;
var _ = require('lodash');

var pairs = ['btc/eth', 'eth/btc'];

// A trading pair that we can shift between
var pairSchema = new mongoose.Schema({
  // Pair of the shift (e.g. ethbtc means it will shift from ETH to BTC)
  pair: { type: String, enum: pairs, unique: true },

  // Rate of the pair
  rate: { type: Number }
});

pairSchema.methods = {
  toJSON: function () {
    var obj = this.toObject();
    obj.id = obj._id;
    delete(obj._id);
    delete(obj.__v);

    return obj;
  }
};

module.exports = mongoose.model('Pair', pairSchema);