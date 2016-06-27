'use strict';
// methods that get called repeatedly in the background

var Promise = require('bluebird');

var pairController = require('../controllers/pair');

(function refreshPrices() {
  return pairController.refreshPairs()
  .then(function() {
    return Promise.delay(1000); // wait for one second
  })
  .then(refreshPrices);
})();
