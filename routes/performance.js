/**
 * Created by matthew on 10/01/16.
 */
var express = require('express');
var router = express.Router( {mergeParams: true} );

var config = require('../config/config');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var dateFormat = require('dateformat');

/* GET users listing. */
router.get('/', function(req, res, next) {

	MongoClient.connect(config.local.databaseUrl, function(err, db) {
		if (err) {
			throw err;
		}

		db.collection(config.collection)
			.find({
				"annal:type_id" : "Performance",
				"prov:startedAtTime" : { "$gt" : new Date().toISOString() }
			})
			.sort({"prov:starterAtTime":1})
			.toArray(function(err, performance) {

				if (err) {
					throw err;
				}
				var perf = performance[0];
				//console.log( performance );

				var neededAssociated = [
					perf["crm:P7_took_place_at"]
				];

				perf["prov:qualifiedAssociation"].forEach( function(qualifiedAssociation) {
					neededAssociated.push( qualifiedAssociation["crm:P12i_was_present_at"] );
				} );

				var finds = associatedMakeFind( neededAssociated );

				db.collection(config.collection)
					.find({
						$or: finds
					})
					.toArray(function ( err, associated ) {

						var datetimeStart = new Date(perf['prov:startedAtTime']);

						var place = associatedGetByType(associated, "Place")[0];
						var ensemble = associatedGetByType(associated, "Ensemble");

						var ensembleLabels = ensemble.map( function ( ens ) {
								return kv( ens, "rdfs:label" );
						});

						var render = {
							pagetitle: "Performance",

							performance: perf,
							title: kv(perf, 'rdfs:label'),

							startISO: datetimeStart.toISOString(),
							startString: kv(perf, 'prov:startedAtTime', dateFormat(datetimeStart, "dddd, mmmm dS, yyyy, h:MM:ss TT") ),

							location: kv( place, "rdfs:label" ),
							location_id: place._id,

							ensembled: ensembleLabels
						};

						res.render('perform/index', render);
					});

			})
	});
});

router.get('/place/:_id', function(req, res, next) {
	MongoClient.connect(config.local.databaseUrl, function(err, db) {
		if (err) {
			throw err;
		}

		db.collection(config.collection)
			.find( {_id: new mongodb.ObjectId(req.params._id)} )
			.toArray(function(err, place) {

				place = place[0];

				var seeAlsos = place['entity:seeAlso_r'].map( function ( also ) {
					console.log(also);
					console.log(also['rdfs:seeAlso']);
					return kv( also, "rdfs:seeAlso" );
				});

				console.log(seeAlsos);

				var render = {
					place: place,

					title: kv(place, 'rdfs:label'),
					comment: kv(place, 'rdfs:comment'),

					seeAlso: seeAlsos
				};

				res.render('perform/place', render);

			});
	});
});

function kv( obj, key, value ) {
	return { k: key, v: (value !== undefined) ? value : obj[key] };
}

function associatedGetByType( associated, type ) {

	return associated.filter( function( assoc ) {
		return assoc['annal:type_id'] === type;
	} )
}

function associatedMakeFind( keys ) {
	var associatedFind = [];

	keys.forEach( function( key ) {
		var props = key.split("/");

		associatedFind.push( {
			"annal:type_id" : props[0],
			"annal:id" : props[1]
		})
	} );

	return associatedFind;
}

module.exports = router;
