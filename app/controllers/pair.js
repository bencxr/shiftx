var Promise = require('bluebird');
var co = Promise.coroutine;
var request = require('superagent');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var KrakenClient = require('kraken-api');
var kraken = Promise.promisifyAll(new KrakenClient(process.config.KRAKEN_API_CLIENT, process.config.KRAKEN_API_SECRET));

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

exports.refreshPairs = co(function *refreshPairs() {
  var data = yield kraken.apiAsync('Ticker', {"pair": 'ETHXBT'});

  var ask = data.result.XETHXXBT.a[0]; // how much Ether Kraken asks from us for 1 BTC
  var bid = data.result.XETHXXBT.b[0]; // how much Ether Kraken offers us for 1 BTC

  // BTC -> ETH: user wants to buy Ethereum for one BTC
  // i. e., user is selling BTC to us
  // Kraken offers the bid price for sale
  var ethbtc = parseFloat(bid);
  var ethbtcPromise = Pair.update({ pair: 'ethbtc' }, { rate: ethbtc }, { upsert: true });

  // ETH -> BTC: user wants to buy BTC for one Ether
  // i. e., user is buying BTC from us
  // Kraken asks for ask amount of Ether for one BTC
  var btceth = 1.0/parseFloat(ask);
  var btcethPromise = Pair.update({ pair: 'btceth' }, { rate: btceth }, { upsert: true });

  // yield them at once to pretend there's atomicity, though there's really not
  yield btcethPromise;
  yield ethbtcPromise;

  return data.result.XETHXXBT;
});
