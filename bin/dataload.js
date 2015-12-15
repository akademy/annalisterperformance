/**
 * Created by matthew on 12/14/15.
 */
var config = require('../lib/config');
var request = require('request');

var dataFile = "entity_data.jsonld";

var MongoClient = require('mongodb').MongoClient;

var dataRoot = 'http://annalist.net/annalist_sitedata/c/Carolan_Guitar/d/';

/*
	Connect to database and request filelist in annalist (via apache2 folder view)
 */
MongoClient.connect( config.local.databaseUrl, function(error, db) {
	if( error ) {
		console.error(error);
	}

	db.createCollection('Carolan', function(err, collection) {

		request(dataRoot, function( error, response, body ) {
			var dataSubs = parseFolderList( body );

			dataSubs.forEach( function ( dataSub ) {

 					request( dataRoot + dataSub, function( error, response, body ) {
				
					var dataUrls = parseFolderList( body );
					console.log( dataUrls );

					jsonldToMongo(collection, dataRoot,dataSub,dataUrls);
				});
			});
		});
	});
});


function jsonldToMongo( collection, dataRoot, dataSub, dataUrls ) {

	dataUrls.forEach(function (dataUrl) {

		var url = dataRoot + dataSub + dataUrl + dataFile;

	//	console.log(url);

		request(url, function (error, response, body) {

			if (error) {
				console.error(error);
			}
			else {
				// TODO: var ok = response.statusCode == 200;
				var bodyJson = null;
				try {
					bodyJson = JSON.parse(body);
				} catch (SyntaxError) {
					console.error("Malformed JSON");
				}
				if (bodyJson) {
					var annalType = bodyJson["annal:type_id"],
						annalId = bodyJson["annal:id"];

					bodyJson["databaseInsertDate"] = new Date() * 1;
					bodyJson["annalistUrl"] = url;

					collection.replaceOne({
						"annal:type_id": annalType,
						"annal_id": annalId
					}, bodyJson, {upsert: true}, function (error, record) {
						if (error) {
							console.error(error);
						}
						console.log(record);
					})
				}
			}
		});
	});
}

function parseFolderListTest() {
	var folderList = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><html><head><title>Index of /annalist_sitedata/c/Carolan_Guitar</title></head><body><h1>Index of /annalist_sitedata/c/Carolan_Guitar</h1><table><tr><th valign="top"><img src="/icons/blank.gif" alt="[ICO]"></th><th><a href="?C=N;O=D">Name</a></th><th><a href="?C=M;O=A">Last modified</a></th><th><a href="?C=S;O=A">Size</a></th><th><a href="?C=D;O=A">Description</a></th></tr><tr><th colspan="5"><hr></th></tr><tr><td valign="top"><img src="/icons/back.gif" alt="[PARENTDIR]"></td><td><a href="/annalist_sitedata/c/">Parent Directory</a></td><td>&nbsp;</td><td align="right">  - </td><td>&nbsp;</td></tr><tr><td valign="top"><img src="/icons/unknown.gif" alt="[   ]"></td><td><a href="README.md">README.md</a></td><td align="right">2015-08-07 17:57  </td><td align="right">1.1K</td><td>&nbsp;</td></tr><tr><td valign="top"><img src="/icons/folder.gif" alt="[DIR]"></td><td><a href="_annalist_collection/">_annalist_collection/</a></td><td align="right">2015-08-07 13:58  </td><td align="right">  - </td><td>&nbsp;</td></tr><tr><td valign="top"><img src="/icons/folder.gif" alt="[DIR]"></td><td><a href="d/">d/</a></td><td align="right">2015-09-18 12:31  </td><td align="right">  - </td><td>&nbsp;</td></tr><tr><th colspan="5"><hr></th></tr></table><address>Apache/2.4.7 (Ubuntu) Server at annalist.net Port 80</address></body></html>';
	var fileList = parseFolderList(folderList);

	if( fileList.length !== 3 && fileList[0] !== "README.md" ) {
		console.error("Problem with parseFolderListTest()");
	}
}

function parseFolderList(folderList) {

	var fileList = [];
	var pos = 0,
		start, file;

	for( var skip = 0; skip < 6; skip++ ) {
		pos = folderList.indexOf('href="',pos+1); 
	}

	while( pos != -1 ) {
		start = pos+6;
		end = folderList.indexOf('"',start);

		file = folderList.substr(start,end-start);
		fileList.push(file);

		pos = folderList.indexOf('href="', end);

	}

	return fileList;
	
}
