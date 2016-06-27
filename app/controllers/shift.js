var Promise = require('bluebird');
var co = Promise.coroutine;
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var BitGoJS = require('bitgo');
var bitgo = new BitGoJS.BitGo();
var Big = require('big.js');
var _ = require('lodash');

var api = require('../api');
var Shift = require('../models/Shift');
var Pair = require('../models/Pair');

exports.newShift = co(function *newShift(req, res) {
  var pairId = req.body.pair; // TODO better sanitation

  var mongoPair = yield Pair.findOne({ pair: pairId });
  if (!mongoPair) {
    throw api.Error(400, 'pair not found');
  }

  var withdrawAddress = req.body.withdrawAddress; // TODO: validate it?

  var rate = mongoPair.rate; // get rate!

  bitgo.authenticateWithAccessToken({ accessToken: process.config.BITGO_ACCESS_TOKEN });

  if (mongoPair.pair === 'btceth') {
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
  } else if (mongoPair.pair === 'ethbtc') {
    var wallet = yield bitgo.eth().wallets().generateWallet({ passphrase: 'secretbitgopass' });
    var depositAddress = wallet.wallet.id();

    var shift = yield Shift.create({
      pair: pairId,
      rate: rate,
      state: 'new',
      expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes to send
      depositAddress: depositAddress,
      withdrawAddress: withdrawAddress
    });

    return shift;
  }

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

exports.handleWebhook = co(function *handleWebhook(req, res) {
  if (req.body.type !== 'transaction') {
    throw api.Error('unexpected webhook received');
  }

  var walletId = req.body.walletId;

  // is this a webhook alerting us of an ethereum transaction or a bitcoin transaction?
  if (walletId == process.config.HOUSE_WALLET_BTC) { // btc
    var txHash = req.body.hash; // TODO validate

    var wallet = yield bitgo.wallets().get({ id: process.config.HOUSE_WALLET_BTC });
    if (!wallet) {
      throw api.Error(500, 'error fetching bitgo wallet');
    }

    var tx = wallet.getTransaction({ "id": txHash });
    if (!tx) {
      throw api.Error(400, 'transaction does not exist');
    }

    // check number of confirmations

    if (tx.confirmations > 1) {
      // short circuit, because we don't want to send multiple cross-currency transfers
      return;
    }

    var outputAddresses = _.filter(tx.outputs, function(out) {
      return out.chain === 0; // we don't want change outputs, only the single send output
    });
    if (!outputAddresses || outputAddresses.length > 1) {
      throw api.Error(500, 'should only be one send output address');
    }
    
    var outputAddress = outputAddress[0].account;
    var outputValue = outputAddress[0].value;

    var shift = yield Shift.findOne({ state: Shift.states.new, depositAddress: outputAddress });
    if (!shifts) {
      throw api.Error(400, 'no shifts found');
    }

    // if it has more than 1 confirmation, then we send out the transaction
    if (tx.confirmations === 1) {
      // since we received a webhook for a bitcoin transaction, that must mean
      // we're supposed to send out a transaction to an ethereum withdraw address
      var multiplier = 1e10 * shift.rate;
      sendAmountInWei = new Big(outputValue).multiply(new Big(multiplier));

      var ethWallet = yield bitgo.eth().wallets().get({ id: process.config.HOUSE_WALLET_ETH });
      if (!ethWallet) {
        throw api.Error(500, 'could not find house eth wallet');
      }
      var txSendResult = yield ethWallet.sendTransaction(
        { recipients: [ { toAddress: shift.withdrawAddress, value: sendAmountInWei }], walletPassphrase: process.config.HOUSE_WALLET_BTC_PASSPHRASE }
      );

      if (!txSendResult) {
        throw api.Error(500, 'error sending transaction to ethereum address');
      }
      return txSendResult;
    }

    // if it has 0 confirmations, then we simply update the shift and wait for it to be confirmed
    if (tx.confirmations === 0) {
      return yield shift.update({ state: Shift.states.unconfirmed });
    }

  } else if (walletId == process.config.HOUSE_WALLET_ETH) { // eth

  }
  throw api.Error('webhook for unknown walletId' + req.body.walletId);
});
