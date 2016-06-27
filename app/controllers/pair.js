var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var api = require('../api');
var Pair = require('../models/Pair');

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