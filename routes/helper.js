/**
 * Created by matthew on 14/01/16.
 */

var url = require('url');

var helpers = {

	associatedGetByType: function (associated, type) {

		return associated.filter(function (assoc) {
			return assoc['annal:type_id'] === type;
		})
	},

	associatedMakeFind: function (keys) {
		var associatedFind = [];

		keys.forEach(function (key) {
			var props = key.split("/");

			associatedFind.push({
				"annal:type_id": props[0],
				"annal:id": props[1]
			})
		});

		return associatedFind;
	},


	 getUrlDisplayName : function( fullUrl ) {
		var hostname = url.parse(fullUrl).hostname;
		 if( hostname ) {
			 return hostname.replace("www.", "");
		 }
		 return null;
	}

};

module.exports = helpers;