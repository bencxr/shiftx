var shiftController = require('../app/controllers/shift');
var server = require('../app');
var request = require('supertest-as-promised');

describe('Shift Controller:', function() {
  it('should test the pair retrieval', function(){
    return request(server)
    .post('/api/shift')
    .send({pair: 'ethbtc', withdrawAddress: '1easdqweasdwqeasd'})
    .then(function(result){
      console.log('here');
    });
  });
});
