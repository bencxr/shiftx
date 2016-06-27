var shiftController = require('../app/controllers/shift');
var assert = require('assert');
var should = require('should');
var server = require('../app');
var request = require('supertest-as-promised');

describe('Shift Controller:', function() {
  it('should test shift generation', function(){
    return request(server)
    .post('/api/shift')
    .send({pair: 'ethbtc', withdrawAddress: '1easdqweasdwqeasd'})
    .then(function(result){
      result.status.should.equal(200);
      result.body.pair.should.equal('ethbtc');
      result.body.state.should.equal('new');
      result.body.withdrawAddress.should.equal('1easdqweasdwqeasd');
      // Ether is less valuable than BTC
      result.body.rate.should.be.below(1);
    });
  });
});
