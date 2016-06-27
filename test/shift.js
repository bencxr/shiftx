var shiftController = require('../app/controllers/shift');
var assert = require('assert');
var should = require('should');
var server = require('../app');
var request = require('supertest-as-promised');

describe('Shift Controller:', function() {

  it('should test shift generation BTC->ETH', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'btceth', withdrawAddress: '0x123456' })
    .then(function(result) {
      result.status.should.equal(200);
      result.body.pair.should.equal('btceth');
      result.body.state.should.equal('new');
      result.body.withdrawAddress.should.equal('0x123456');
      result.body.depositAddress.should.startWith('2');
      // BTC is more valuable than Ether
      result.body.rate.should.be.above(1);
    });
  });

  it('should test shift generation ETH->BTC', function() {
    return request(server)
    .post('/api/shift')
    .send({ pair: 'ethbtc', withdrawAddress: '1easdqweasdwqeasd' })
    .then(function(result) {
      result.status.should.equal(200);
      result.body.pair.should.equal('ethbtc');
      result.body.state.should.equal('new');
      result.body.withdrawAddress.should.equal('1easdqweasdwqeasd');
      result.body.depositAddress.should.startWith('0x');
      // Ether is less valuable than BTC
      result.body.rate.should.be.below(1);
    });
  });

});
