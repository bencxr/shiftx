var _ = require('lodash');

var defaults = {
  BITGO_ENV: 'test',
  BITGO_USERNAME: 'bencxr+test@fragnetics.com',
  BITGO_ACCESS_TOKEN: 'changeme', // change me or override environment
  HOUSE_WALLET_BTC: '2MwAcnQHGJkLqPVcD9fiBrvGaDeESEqHBzV',
  HOUSE_WALLET_BTC_PASSPHRASE: 'daodaodao',
  HOUSE_WALLET_ETH: '0x328e120d3aea1bc680caa23f3d2c0f0673468f7b',
  HOUSE_WALLET_ETH_PASSPHRASE: 'daodaodao',
  KRAKEN_API_CLIENT: '5tqOgEEomhNaw20+ocuTf6tGFuxYCGPKgp/riIreCc1Vpc3AoyBkj/8k',
  KRAKEN_API_SECRET: 'changeme' // change me or override environment
};

// Load either the env value or else the default value
process.config = _.mapValues(defaults, function(value, key) {
  return process.env[key] || value;
});