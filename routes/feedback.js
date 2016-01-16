var express = require('express');
var router = express.Router();

var multer  = require('multer');
var upload = multer({ dest: 'public/_feedback/' })

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var config = require('../config/config');

//var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('feedback', { uploaded : false } );

});

router.post( '/', upload.single("feedback_file"), function(req, res, next ){

	MongoClient.connect( config.local.databaseUrl, function(error, db) {

		db.createCollection('Feedback', function (err, collection) {

			var obj;

			if( req.file ) {
				obj = req.file;
				obj.type = "File";
			} else {
				obj = {};
				obj.type = "Comment"
			}

			obj.databaseInsertDate = new Date();
			obj.comment = req.body.feedback_text;

			collection.insert(obj,
				function (error, record) {
					if (error) {
						console.error(error);
					}
					else {
						console.log(record);
						res.render('feedback', { uploaded : true } );
					}
				})
		});
	});

});

/*router.post('/file2/', function(req, res, next) {

	console.log("post");
	//res.render('feedback', { title: 'Express', results: result });

//get the file name
	var filename=req.files.file.name;
	var extensionAllowed=[".docx","doc"];
	var maxSizeOfFile=100;
	var msg="";
	var i = filename.lastIndexOf('.');

	// get the temporary location of the file
	var tmp_path = req.files.file.path;

	// set where the file should actually exists - in this case it is in the "images" directory
	var target_path = __dirname +'/upload/' + req.files.file.name;
	var file_extension= (i < 0) ? '' : filename.substr(i);
	if((file_extension in oc(extensionAllowed))&&((req.files.file.size /1024 )< maxSizeOfFile)){
		fs.rename(tmp_path, target_path, function(err) { if (err)
			throw err;

			// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
			});
		});
		msg="File uploaded sucessfully";
	}else{
// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
		fs.unlink(tmp_path, function(err) {
			if (err) throw err;
		});
		msg="File upload failed. File extension not allowed and size must be less than "+maxSizeOfFile;
	}
	res.end(msg);
});*/


module.exports = router;