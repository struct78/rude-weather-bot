# Rude Weather Bot

RWB is a Node.js application that tweets the weather from rude places from all around the world, every hour, on the hour. The purpose of this app was to become more familiar with the [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) worker environment.

http://twitter.com/rudeweatherbot

### Setup
First you will need to create a [Twitter application](https://dev.twitter.com), then set the following environment variables to their equivalent values.

```js
	var client = new Twitter({
	  consumer_key: process.env.TWITTER_CONSUMER_KEY_RWB,
	  consumer_secret: process.env.TWITTER_CONSUMER_SECRET_RWB,
	  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY_RWB,
	  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET_RWB
	});
```

Now clone the repo, and install the dependencies.

```bash
git clone https://github.com/struct78/rude-weather-bot
cd rude-weather-bot
npm install
```
From here you can start the web server.
```bash
npm start
```

Or if you prefer, you can use something like Nodemon that will restart node when it detects any changes.

```bash
nodemon ./bin/www
```

### How it works

RWB was designed to run on AWS Elastic Beanstalk worker environment, however you can run it anywhere. You will just need to setup a Cron job to call two URLs once every hour, or however often you want.

| URL | Description |
|-----|--------------|
| /tweet | Updates the internal state, and tweets the weather from the next location |
| /location | Updates the Twitter account's location |

RWB reads locations from ```json/places.json```. Each location has the following properties:

| Name | Description |
|------|--------------|
| name | Location Name
| WOEID | Where On Earth Identifier
| Latitude | Latitude of the location
| Longitude | Longitude of the location

##### Example JSON

```json
{
	"name":"Fucking (Austria)",
	"woeid": 545111,
	"latitude": 48.0767635,
	"longitude": 12.8249252
}
```

Weather data is supplied by the [Yahoo Weather API](https://developer.yahoo.com/weather).
WOEID's can easily be looked up by using Ross Elliot's [Yahoo WOEID Lookup](woeid.rosselliot.co.nz/lookup) tool.

##### Tracking state
The bot keeps track of which location it last tweeted from by incrementing a number in json/state.json.

##### cron.yaml
This file tells the Worker Environment how often the URLs should be called, and uses standard crontab syntax.

```yaml
version: 1
cron:
  - name: "tweet"
    url: "/tweet"
    schedule: "0 * * * *"
  - name: "location"
    url: "/location"
    schedule: "0 * * * *"
```
