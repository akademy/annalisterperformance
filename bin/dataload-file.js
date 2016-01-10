/**
 * Created by matthew on 12/14/15.
 */
var config = require('../config/config');
var request = require('request');

var fs = require('fs');
var path = require('path');

var dataFile = "entity_data.jsonld";

var MongoClient = require('mongodb').MongoClient;

//var fileRoot = '/home/annalist/annalist_site/c/Performance_defs/d/';
//var fileRoot = '/home/matthew/Dropbox/code/IntelliJ/AnnalistPerformance/node_modules/';
var fileRoot = '/home/matthew/AnnalisterPerformance/temp/data/annalist_site/c/';
var repoRoot = 'Performance_defs/d/'
/*
 Connect to database and request filelist in annalist (via apache2 folder view)
 */
MongoClient.connect( config.local.databaseUrl, function(error, db) {

	if( error ) {
		console.error(error);
	}

	db.createCollection('Performance', function(err, collection) {

		var rootFilesPath = path.join( fileRoot, repoRoot );
		var rootFiles = fs.readdirSync( rootFilesPath );

		rootFiles.forEach( function( file ) {

			var folderPath = path.join( rootFilesPath, file );
			var stat = fs.statSync( folderPath );

			if( stat.isDirectory() ) {

				var pathFiles = fs.readdirSync( folderPath );

				pathFiles.forEach( function( file ) {

					var subPath = path.join( folderPath, file );
					//console.log( subPath );

					var stat = fs.statSync( subPath );

					if( stat.isDirectory() ) {

						var filePath = path.join( subPath, dataFile );
						console.log( filePath );

						var fileContents = fs.readFileSync(filePath,"utf8");
						//console.log(fileContents.substr(0,25));

						var url = filePath.replace( new RegExp("^"+fileRoot),"").replace(new RegExp(dataFile+"$"),"");
						upsertDocument( url, fileContents, collection );
					}
				});


			}
		});

		//todo : FIX THIS! db.close(); -- I need to rewrite it ...
	});
});


function jsonldToMongo( collection, dataRoot, dataSub, dataUrls ) {

	dataUrls.forEach(function (dataUrl) {

		var url = dataRoot + dataSub + dataUrl + dataFile;

//      console.log(url);

		request(url, function (error, response, body) {

			if (error) {
				console.error(error);
			}
			else {
				upsertDocument( body, collection );
			}
		});
	});
}

function upsertDocument( url, document, collection ) {
	// TODO: var ok = response.statusCode == 200;
	var bodyJson = null;
	try {
		bodyJson = JSON.parse( document );
	} catch (SyntaxError) {
		console.error("Malformed JSON");
	}
	if (bodyJson) {
		var annalType = bodyJson["annal:type_id"],
			annalId = bodyJson["annal:id"];

		bodyJson["databaseInsertDate"] = new Date();
		bodyJson["annalistUrl"] = url;

		collection.replaceOne({
				"annalistUrl" : url
			},
			bodyJson,
			{upsert: true},
			function (error, record) {
				if (error) {
					console.error(error);
				}
				console.log(record);
			})
	}
}
