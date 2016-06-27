'use strict';
// initialization methods

var Pair = require('../models/Pair');

(function initializePrices() {
  // imperfect division. 11 * 0.11 != 1
  Pair.update({ pair: 'btceth' }, { rate: 11 }, { upsert: true });
  Pair.update({ pair: 'ethbtc' }, { rate: 0.11 }, { upsert: true });
})();