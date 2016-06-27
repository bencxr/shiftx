var shiftController = require('../app/controllers/shift');
var assert = require('assert');
var should = require('should');
var server = require('../app');
var request = require('supertest-as-promised');
var validator = require('../app/utils/validator');

describe('Shift Controller:', function() {

  it('should fail shift generation BTC->ETH', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'btceth', withdrawAddress: '0x12345' })
    .then(function(result) {
      result.statusCode.should.equal(400);
      result.body.error.should.equal('invalid withdraw address');
    });
  });

  it('should fail shift generation ETH->BTC', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'ethbtc', withdrawAddress: '2Mfiw12345' })
    .then(function(result) {
      result.statusCode.should.equal(400);
      result.body.error.should.equal('invalid withdraw address');
    });
  });

  it('should test shift generation BTC->ETH', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'btceth', withdrawAddress: '0x63830046c579fb7a3d942656044c13d8dbe9ed16' })
    .then(function(result) {
      result.statusCode.should.equal(200);
      result.body.pair.should.equal('btceth');
      result.body.state.should.equal('new');
      result.body.withdrawAddress.should.equal('0x63830046c579fb7a3d942656044c13d8dbe9ed16');
      result.body.depositAddress.should.startWith('2');
      assert(validator.isValidBitcoinAddress(result.body.depositAddress));
      // BTC is more valuable than Ether
      result.body.rate.should.be.above(1);
    });
  });

  it('should test shift generation ETH->BTC', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'ethbtc', withdrawAddress: '2N4NS2oHFBF6U4Woh9pMpmqA5tnVm3fupmB' })
    .then(function(result) {
      result.statusCode.should.equal(200);
      result.body.pair.should.equal('ethbtc');
      result.body.state.should.equal('new');
      result.body.withdrawAddress.should.equal('2N4NS2oHFBF6U4Woh9pMpmqA5tnVm3fupmB');
      result.body.depositAddress.should.startWith('0x');
      assert(validator.isValidEthereumAddress(result.body.depositAddress));
      // Ether is less valuable than BTC
      result.body.rate.should.be.below(1);
    });
  });

});
