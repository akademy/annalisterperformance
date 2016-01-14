var express = require('express');
var router = express.Router();

var config = require('../config/config');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

/* GET users listing. */
router.get('/journal/:_id', function(req, res, next) {

	// Get a journal :
	MongoClient.connect(config.local.databaseUrl, function(err, db) {

		if (err) {
			throw err;
		}

		db.collection(config.collection)
			.find({ "_id" : new mongodb.ObjectId(req.params._id) }) //new mongodb.ObjectId("569683c7d2bee4a7c7a1349f")
			.toArray(function(err, journals) {
				var journal = journals[0];

				var render = {
					journal: journal,

					title: kv(journal, 'rdfs:label'),
					comment: kv(journal, 'rdfs:comment')
				};

				res.render('types/journal', render);
			});

	});

});

function kv( obj, key, value ) {
	return { k: key, v: (value !== undefined) ? value : obj[key] };
}

module.exports = router;