/**
 * Created by matthew on 10/01/16.
 */
var express = require('express');
var router = express.Router();

var routePerformance = require('./performance');

router.use( function(req, res, next) {
    // All will come here
	if( req.url.length > 1 && req.url.substr(-1) !== '/' ) {
		res.redirect(301,req.url+"/");
	}
    next();
});

router.use('/:performId/', routePerformance ); // Pass anything with an id.


router.get('/', function(req, res, next) {
    res.redirect('/carminalangran/');
});



module.exports = router;
