var Promise = require('bluebird');
var co = Promise.coroutine;

exports.promiseWrapper = function(promiseRequestHandler) {
  return co(function *(req, res, next) {
    var start = new Date();
    try {
      var result = yield Promise.try(function() { return promiseRequestHandler(req, res, next); });
      var status = 200;
      if (result.__redirect) {
        res.redirect(result.url);
        status = 302;
      } else {
        res.status(status).send(result);
      }
    } catch (err) {
      console.log(err.stack);
      var status = err.status || 500;
      res.status(status).send({ error: err.message });
    }
  });
};

// A basic Error, with status code attached
exports.Error = function(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
};