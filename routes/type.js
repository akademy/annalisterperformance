var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var dateFormat = require('dateformat');

var config = require('../config/config');
var helper = require('./helper');


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


router.get('/performance/:_id', function(req, res, next) {

	// Get a journal :
	MongoClient.connect(config.local.databaseUrl, function(err, db) {

		if (err) {
			throw err;
		}

		db.collection(config.collection)
			.find({ "_id" : new mongodb.ObjectId(req.params._id) })
			.toArray(function(err, performances) {
				var performance = performances[0];

				var neededAssociated = [
					performance["crm:P7_took_place_at"]
				];

				performance["prov:qualifiedAssociation"].forEach( function(qualifiedAssociation) {
					neededAssociated.push( qualifiedAssociation["crm:P12i_was_present_at"] );
				} );

				var finds = helper.associatedMakeFind( neededAssociated );

				db.collection(config.collection)
					.find({
						$or: finds
					})
					.toArray(function ( err, associated ) {

						var datetimeStart = new Date(performance['prov:startedAtTime']);

						var place = helper.associatedGetByType(associated, "Place")[0];
						var ensemble = helper.associatedGetByType(associated, "Ensemble");

						var ensembleLabels = ensemble.map(function (ens) {
							var obj = kv(ens, "rdfs:label");
							obj["_id"] = ens._id;
							return obj;
						});

						var seeAlsos = []
						performance['entity:seeAlso_r'].forEach( function ( also ) {
							var obj = kv( also, "rdfs:seeAlso" );
							obj.name = helper.getUrlDisplayName(obj.v);
							if( obj.name ) {
								seeAlsos.push( obj );
							}
						});

						var render = {
							pagetitle: "Performance",

							performance: performance,

							title: kv(performance, 'rdfs:label'),
							comment: kv(performance, 'rdfs:comment'),

							startISO: datetimeStart.toISOString(),
							startString: kv(performance, 'prov:startedAtTime', dateFormat(datetimeStart, "dddd, mmmm dS, h:MMTT")),

							location: kv(place, "rdfs:label"),
							location_id: place._id,

							ensembled: ensembleLabels,

							seeAlso: seeAlsos
						};

						res.render('types/performance', render);

					});

			});

	});

});



function kv( obj, key, value ) {
	return { k: key, v: (value !== undefined) ? value : obj[key] };
}

module.exports = router;