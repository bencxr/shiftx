/**
 * Created by arik on 6/27/16.
 */

var ethereumJS = require('ethereumjs-util');
var bitcoinJS = require('bitcoinjs-lib');

module.exports.isValidEthereumAddress = function(address) {
  return ethereumJS.isValidAddress(address);
};

module.exports.isValidBitcoinAddress = function(address) {
  try {
    bitcoinJS.address.fromBase58Check(address);
    return true;
  } catch (e) {
    return false;
  }
};