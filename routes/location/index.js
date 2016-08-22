var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var request = require('request');
var jsonfile = require('jsonfile');
var _ = require('lodash');
var util = require('util');
var fs = require('fs')

/* POST */
router.post('/', function(req, res, next) {
	var state = jsonfile.readFileSync('./json/state.json');
	var places = jsonfile.readFileSync('./json/places.json');

	var client = new Twitter({
	  consumer_key: process.env.TWITTER_CONSUMER_KEY_RWB,
	  consumer_secret: process.env.TWITTER_CONSUMER_SECRET_RWB,
	  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY_RWB,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_RWB
	});

	var current = places.find(function(d,i) {
		return i === state.id;
	});

	var profile = {
		location: current.name,
		skip_status: true
	};

	client.post('account/update_profile', profile, function(err, tweet, response) {
			if (err) {
				console.error(util.format('[ERROR] %s', err.message));
				return;
			}

			console.log('[INFO] ' + new Date().toUTCString());
			console.log(util.format('[INFO] Updated profile to %s', location.name));
	});
  res.json({ status: 'success'});
});

module.exports = router;
