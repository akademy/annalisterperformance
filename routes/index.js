/**
 * Created by matthew on 10/01/16.
 */
var express = require('express');
var router = express.Router();

var routePerformance = require('./performance');

router.use( function(req, res, next) {
    // All will come here
    next();
});

router.use('/:preformId', routePerformance ); // Pass anything with an id.

router.get('/', function(req, res, next) {
    res.send('Home');
});



module.exports = router;
