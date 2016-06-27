var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var api = require('../api');
var Shift = require('../models/Shift');

exports.newShift = co(function *newShift(req, res) {
  var pair = req.body.pair;
  if (!pair || !Shift.pairs[pair]) {
    throw api.Error(400, "invalid pair");
  }

  var rate = 0.21; // get rate!
  var depositAddress = 'bitcoinorethaddress'; // get this from bitgojs!

  var shift = yield Shift.create({
    pair: pair,
    rate: rate,
    state: 'new',
    expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 10 minutes to send
    depositAddress: depositAddress
  });

  return shift;
});

exports.getShift = co(function *getShift(req, res) {
  try {
    var id = mongoose.Types.ObjectId(req.params.id);
  } catch(e) {
  }

  if (!id) {
    throw api.Error(400, "invalid id");
  }

  var shift = yield Shift.findOne({ _id: id });
  if (!shift) {
    throw api.Error(404, "shift not found");
  }

  return shift;
});