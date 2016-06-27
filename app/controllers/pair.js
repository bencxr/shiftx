var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var api = require('../api');
var Pair = require('../models/Pair');

// initialize initial pair

co(function *initializePairs() {
  // imperfect division. 11 * 0.11 != 1
  yield Pair.update({pair: 'btceth'}, {rate: 11}, {upsert: true});
  yield Pair.update({pair: 'ethbtc'}, {rate: 0.11}, {upsert: true});
})();

exports.getPair = co(function *getPair(req, res) {
  var pairId = req.params.id;
  if (typeof(pairId) !== 'string') {
    throw api.Error(400, "invalid pair");
  }

  var pair = yield Pair.findOne({ pair: pairId.toLowerCase() });
  if (!pair) {
    throw api.Error(404, "pair not found");
  }

  return pair;
});

// allow overwrites
exports.createPair = co(function *createPair(req) {
  var pairName = req.params.pair;
  var pairValue = req.params.value;

  return Pair.update({pair: pairName}, {rate: pairValue}, {upsert: true});
});
