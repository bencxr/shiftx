var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var api = require('../api');
var Shift = require('../models/Shift');
var Pair = require('../models/Pair');

exports.newShift = co(function *newShift(req, res) {
  var pair = req.body.pair;
  // TODO: Check if pair exists in pair table

  var withdrawAddress = req.body.withdrawAddress; // todo: validate?

  var rate = 0.21; // get rate!
  var depositAddress = 'bitcoinorethaddress'; // get this from bitgojs!

  var shift = yield Shift.create({
    pair: pair,
    rate: rate,
    state: 'new',
    expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes to send
    depositAddress: depositAddress,
    withdrawAddress: withdrawAddress
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