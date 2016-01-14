var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

	// Get a specific journal entry:
	MongoClient.connect(config.local.databaseUrl, function(err, db) {
		if (err) {
			throw err;
		}
		db.collection(config.collection)
			.find({ "_id" : new mongodb.ObjectId("569683c7d2bee4a7c7a1349f") })
			.toArray(function(err, about) {
				about = about[0];

				var render = {
					journal: about,

					title: kv(about, 'rdfs:label'),
					comment: kv(about, 'rdfs:comment'),

					seeAlso: seeAlsos
				};
			});

	});

	res.send('respond with a resource');

});

function kv( obj, key, value ) {
	return { k: key, v: (value !== undefined) ? value : obj[key] };
}

module.exports = router;
