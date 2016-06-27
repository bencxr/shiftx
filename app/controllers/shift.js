var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var BitGoJS = require('bitgo');
var bitgo = new BitGoJS.BitGo();

var api = require('../api');
var Shift = require('../models/Shift');
var Pair = require('../models/Pair');

exports.newShift = co(function *newShift(req, res) {
  var pairId = req.body.pair; // TODO better sanitation

  var mongoPair = yield Pair.findOne({ _id: pairId });
  if (!mongoPair) {
    throw api.Error(400, 'pair not found');
  }

  var withdrawAddress = req.body.withdrawAddress; // TODO: validate it?

  var rate = mongoPair.rate; // get rate!

  bitgo.authenticateWithAccessToken({ accessToken: process.config.BITGO_ACCESS_TOKEN });

  // fetch wallet and create deposit address
  var wallet = yield bitgo.wallets().get({ id: process.config.HOUSE_WALLET_BTC });
  if (!wallet) {
    throw api.Error(500, 'error fetching bitgo wallet');
  }
  var depositAddress = yield wallet.createAddress({ chain: 0 }); // TODO check return value

  var shift = yield Shift.create({
    pair: pairId,
    rate: rate,
    state: 'new',
    expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes to send
    depositAddress: depositAddress.address,
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