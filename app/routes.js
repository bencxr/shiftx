var express = require('express');
var router = express.Router();

var api = require('./api');
var shiftController = require('./controllers/shift');

router.post('/shift', api.promiseWrapper(shiftController.newShift));
router.get('/shift/:id', api.promiseWrapper(shiftController.getShift));

module.exports = router;
