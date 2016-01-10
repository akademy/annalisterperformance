var express = require('express');
var router = express.Router();
var config = require('../config/config');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
	MongoClient.connect(config.local.databaseUrl, function(err, db) {
		if (err) {
			throw err;
		}
		db.collection(config.collection).find({}).sort({"annal:type_id":1,"rdfs:label":1}).toArray(function(err, result) {
			if (err) {
				throw err;
			}
			res.render('index', { title: 'Express', results: result });
		});
	});
});

/* GET home page. */
router.get('/:id', function(req, res, next) {
	MongoClient.connect(config.local.databaseUrl, function(err, db) {
		if (err) {
			throw err;
		}
		db.collection(config.collection).find({_id:new mongodb.ObjectId(req.params.id)}).toArray(function(err, results) {
			if (err) {
				throw err;
			}
			if( results.length > 0 ) {
				res.render('item', { found: true, result: results[0] } );
			}
			else {
				res.render('item', {found:false, result:null} );
			}
		});
	});
});
module.exports = router;
