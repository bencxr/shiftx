var express = require('express');
var router = express.Router();

var api = require('./api');
var shiftController = require('./controllers/shift');
var pairController = require('./controllers/pair');

router.post('/shift', api.promiseWrapper(shiftController.newShift));
router.get('/shift/:id', api.promiseWrapper(shiftController.getShift));
router.get('/pair/:id', api.promiseWrapper(pairController.getPair));

module.exports = router;
