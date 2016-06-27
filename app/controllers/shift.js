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
var validator = require('../utils/validator');

exports.newShift = co(function *newShift(req, res) {
  var pairId = req.body.pair; // TODO better sanitation

  var mongoPair = yield Pair.findOne({ pair: pairId });
  if (!mongoPair) {
    throw api.Error(400, 'pair not found');
  }

  var withdrawAddress = req.body.withdrawAddress; // TODO: validate it?
  bitgo.authenticateWithAccessToken({ accessToken: process.config.BITGO_ACCESS_TOKEN });

  var shiftObject = {
    pair: mongoPair.pair,
    rate: mongoPair.rate,
    state: 'new',
    expires: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes to send
    withdrawAddress: withdrawAddress
  };

  if (mongoPair.pair === 'btceth') {
    if (!validator.isValidEthereumAddress(withdrawAddress)) {
      throw api.Error(400, 'invalid withdraw address');
    }

    // fetch wallet and create deposit address
    var wallet = yield bitgo.wallets().get({ id: process.config.HOUSE_WALLET_BTC });
    if (!wallet) {
      throw api.Error(500, 'error fetching bitgo wallet');
    }
    var depositAddress = yield wallet.createAddress({ chain: 0 }); // TODO check return value
    var webhook = yield wallet.addWebhook({ type: 'transaction', url: req.root + 'api/webhook' });

    shiftObject.depositAddress = depositAddress.address;
    return Shift.create(shiftObject);
  } else if (mongoPair.pair === 'ethbtc') {
    if (!validator.isValidBitcoinAddress(withdrawAddress)) {
      throw api.Error(400, 'invalid withdraw address');
    }

    var generationResult = yield bitgo.eth().wallets().generateWallet({
      label: 'Ether Receptacle',
      passphrase: process.config.HOUSE_WALLET_ETH_PASSPHRASE
    });
    var wallet = generationResult.wallet;
    var webhook = yield wallet.addWebhook({ type: 'transfer', url: req.root + 'api/webhook' });

    shiftObject.depositAddress = wallet.id();
    return Shift.create(shiftObject);
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
  bitgo.authenticateWithAccessToken({ accessToken: process.config.BITGO_ACCESS_TOKEN });
  var receivedCurrency = req.body.coin;

  if (receivedCurrency === 'eth') {
    var walletId = req.body.walletId;
    var wallet = yield bitgo.eth().wallets().get({ id: walletId });
    if (!wallet) {
      throw new Error('wallet not found');
    }

    var shift = yield Shift.findOneAndUpdate({ depositAddress: wallet.id(), state: 'new' }, { state: 'unconfirmed' });
    if (!shift) {
      throw new Error('shift not found');
    }

    var transfer = yield wallet.getTransfer({ id: req.body.transferId });
    if (!transfer) {
      throw new Error('transfer not found');
    }

    var receivedWeiValue = new Big(transfer.transfer.value);
    var receivedEtherValue = receivedWeiValue.times(new Big(10).pow(-18));
    var sentBitcoinValue = receivedEtherValue.times(shift.rate);
    var sentSatoshiValue = sentBitcoinValue.times(new Big(10).pow(8));

    var sendAmount = parseInt(sentSatoshiValue.toFixed());
    var btcHouseWallet = yield bitgo.wallets().get({ id: process.config.HOUSE_WALLET_BTC });
    var conversionTx = yield btcHouseWallet.sendCoins({
      address: shift.withdrawAddress,
      amount: sendAmount,
      walletPassphrase: process.config.HOUSE_WALLET_BTC_PASSPHRASE
    });

    var fetchTx = yield wallet.sendTransaction({
      recipients: [{
        toAddress: process.config.HOUSE_WALLET_ETH,
        value: transfer.transfer.value
      }],
      walletPassphrase: process.config.HOUSE_WALLET_ETH_PASSPHRASE
    });

  } else if (receivedCurrency === 'bitcoin') {
    var walletId = req.body.walletId;
    if (walletId !== process.config.HOUSE_WALLET_BTC) {
      throw new Error('incorrect wallet id');
    }

    var wallet = yield bitgo.wallets().get({ id: process.config.HOUSE_WALLET_BTC });
    if (!wallet) {
      throw new Error('wallet not found');
    }

    var transaction = yield wallet.getTransaction({ id: req.body.hash });

    var outputs = _.filter(transaction.outputs, { chain: 0 });
    if (outputs.length != 1) {
      throw api.Error(500, 'should only be one send output address');
    }

    var output = outputs[0];
    var receptacle = output.account;

    var shift = yield Shift.findOneAndUpdate({ depositAddress: receptacle, state: 'new' }, { state: 'unconfirmed' });
    if (!shift) {
      throw new Error('shift not found');
    }

    var receivedSatoshiValue = new Big(output.value);
    var receivedBitcoinValue = receivedSatoshiValue.times(new Big(10).pow(-8));
    var sentEtherValue = receivedBitcoinValue.times(shift.rate);
    var sentWeiValue = sentEtherValue.times(new Big(10).pow(18));

    var sendAmount = sentWeiValue.toFixed();
    var ethHouseWallet = yield bitgo.eth().wallets().get({ id: process.config.HOUSE_WALLET_ETH });
    var conversionTx = yield ethHouseWallet.sendTransaction({
      recipients: [{
        toAddress: shift.withdrawAddress,
        value: sendAmount
      }],
      walletPassphrase: process.config.HOUSE_WALLET_ETH_PASSPHRASE
    });
  }
});
