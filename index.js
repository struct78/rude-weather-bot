var Twitter = require('twitter');
var request = require('request');
var jsonfile = require('jsonfile');
var _ = require('lodash');
var util = require('util');
var fs = require('fs')

var state = jsonfile.readFileSync('./json/state.json');
var places = jsonfile.readFileSync('./json/places.json');
var descriptors =  [{ text: ['Thunderstorms', 'Rain'], emoji: '☔' },
	{ text: ['Cloudy', 'Mostly Cloudy', 'Showers'], emoji: '☁️' },
	{ text: ['Partly Cloudy', 'Scattered Showers'], emoji: '☂' },
	{ text: ['Mostly Sunny'], emoji: '⛅'},
	{ text: ['Clear', 'Breezy', 'Sunny'], emoji: '☀️' } ]

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY_RWB,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET_RWB,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY_RWB,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_RWB
});

var farenheit_to_celsius = function(temp) {
	return Math.round((temp-32)/1.8);
};

var mph_to_kph = function(speed) {
	return Math.round(speed*1.609344);
}

var next = function() {
	state.id = (state.id==places.length-1) ? 0 : state.id+1;
	jsonfile.writeFileSync('./json/state.json', state);

	var current = places.find(function(d,i) {
		return i === state.id;
	});

	return current;
};

var getweather = function() {
	var current = next();
	var url = 'https://query.yahooapis.com/v1/public/yql';
	var querystring = {
		q: util.format('select * from weather.forecast where woeid=%d', current.woeid),
		format: 'json',
		env: 'store://datatables.org/alltableswithkeys'
	};

	request({ url: url, qs: querystring}, function(err, response, body) {
		if (err) {
			console.error(util.format('[ERROR] %s', err.message));
			return;
		};

		var weather = JSON.parse(response.body);

		if (weather.error) {
			console.error(util.format('[ERROR] %s', weather.error.description));
			return;
		}

		tweet(current, JSON.parse(response.body));
	});
}

var format_time = function(time) {
	var parts = time.split(' ');
	var time = parts[0].split(':');
	var hour = time[0];
	var minutes = time[1];
	var meridian = parts[1];

	return util.format('%s:%s%s %s', hour, minutes.length==1?'0':minutes[0], minutes.length==1?minutes[0]:minutes[1], meridian);
};

var tweet = function(location, weather) {
		var tweet_text = 'Weather for %s\n\n%s %s\n🌡 %d°C | %d°F%s\n💨 %d km/h | %d mi/h\n🌅 %s 🌆 %s';
		var conditions = weather.query.results.channel.item.condition;
		var conditions_text = conditions.text;
		var wind = weather.query.results.channel.wind;
		var astronomy = weather.query.results.channel.astronomy;
		var temp_farenheit = parseInt(conditions.temp);
		var wind_mph = parseInt(wind.speed);
		var temp_celcius = farenheit_to_celsius(temp_farenheit);
		var wind_kph = mph_to_kph(wind_mph);
		var nice = (temp_farenheit == 69) ? ' (nice)':'';
		var sunset = format_time(astronomy.sunset);
		var sunrise = format_time(astronomy.sunrise);
		var descriptor = descriptors.find(function(a) {
			return a.text.find(function(b) {
				return b == conditions_text;
			});
		});

		var emoji = (descriptor ? descriptor.emoji : '📰');

		var formatted_tweet = util.format(tweet_text, location.name, emoji, conditions_text, temp_celcius, temp_farenheit, nice, wind_kph, wind_mph, sunrise, sunset);

		var tweet = {
			status: formatted_tweet,
			lat: location.latitude,
			long: location.longitude,
			display_coordinates: true
		};

		console.log('[INFO] ' + new Date().toUTCString());
		/*
		client.post('statuses/update', tweet, function(err, tweet, response) {
				if (err) {
					console.error(util.format('[ERROR] %s', err.message));
					return;
				}

				console.log(util.format('[INFO] Tweeted weather for %s', location.name));
		});*/
};

getweather();
