var _ = require('lodash');

var defaults = {
  BITGO_ENV: 'test',
  BITGO_USERNAME: 'bencxr+test@fragnetics.com',
  BITGO_ACCESS_TOKEN: 'changeme', // change me or override environment
  HOUSE_WALLET_BTC: '2MwAcnQHGJkLqPVcD9fiBrvGaDeESEqHBzV',
  HOUSE_WALLET_ETH: '0x57d852093ebef19b5a0b36c343476815e51025fd',
  KRAKEN_API_CLIENT: '5tqOgEEomhNaw20+ocuTf6tGFuxYCGPKgp/riIreCc1Vpc3AoyBkj/8k',
  KRAKEN_API_SECRET: 'changeme' // change me or override environment
};

// Load either the env value or else the default value
process.config = _.mapValues(defaults, function(value, key) {
  return process.env[key] || value;
});