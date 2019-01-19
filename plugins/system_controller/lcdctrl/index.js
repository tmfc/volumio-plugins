'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')

module.exports = lcdctrl;
function lcdctrl(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
	this.port = null;

}

function hex(str) {
	    var arr = [];
	    for (var i = 0, l = str.length; i < l; i ++) {
		                var ascii = str.charCodeAt(i);
		                arr.push(ascii);
		        }
	    arr.push(255);
	    arr.push(255);
	    arr.push(255);
	    return new Buffer(arr);
}

lcdctrl.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}

lcdctrl.prototype.onStart = function() {
    var self = this;
	var defer=libQ.defer();
	this.port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

	this.parser = this.port.pipe(new Delimiter({ delimiter: hex('') }));
	this.parser.on('data', function(data){
		var prefix = data.toString('ascii',0,1);
		var command = data.toString('ascii',1);
		if(prefix == "p" || prefix == "q")
		{
			switch(command)
			{
				case "play":
					socket.emit('play');
					break;
				case "next":
					socket.emit('next');
					break;
				case "prev":
					socket.emit('prev');
					break;
				default:
					break;
			}
		}
	});

	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
};

lcdctrl.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

lcdctrl.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

lcdctrl.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

lcdctrl.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

lcdctrl.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

lcdctrl.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

lcdctrl.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};



// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


lcdctrl.prototype.addToBrowseSources = function () {

	// Use this function to add your music service plugin to music sources
    //var data = {name: 'Spotify', uri: 'spotify',plugin_type:'music_service',plugin_name:'spop'};
    this.commandRouter.volumioAddToBrowseSources(data);
};

lcdctrl.prototype.handleBrowseUri = function (curUri) {
    var self = this;

    //self.commandRouter.logger.info(curUri);
    var response;


    return response;
};



// Define a method to clear, add, and play an array of tracks
lcdctrl.prototype.clearAddPlayTrack = function(track) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::clearAddPlayTrack');

	self.commandRouter.logger.info(JSON.stringify(track));

	return self.sendSpopCommand('uplay', [track.uri]);
};

lcdctrl.prototype.seek = function (timepos) {
    this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::seek to ' + timepos);

    return this.sendSpopCommand('seek '+timepos, []);
};

// Stop
lcdctrl.prototype.stop = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::stop');


};

// Spop pause
lcdctrl.prototype.pause = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::pause');


};

// Get state
lcdctrl.prototype.getState = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::getState');


};

//Parse state
lcdctrl.prototype.parseState = function(sState) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::parseState');

	//Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
lcdctrl.prototype.pushState = function(state) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'lcdctrl::pushState');

	return self.commandRouter.servicePushState(state, self.servicename);
};


lcdctrl.prototype.explodeUri = function(uri) {
	var self = this;
	var defer=libQ.defer();

	// Mandatory: retrieve all info for a given URI

	return defer.promise;
};

lcdctrl.prototype.getAlbumArt = function (data, path) {

	var artist, album;

	if (data != undefined && data.path != undefined) {
		path = data.path;
	}

	var web;

	if (data != undefined && data.artist != undefined) {
		artist = data.artist;
		if (data.album != undefined)
			album = data.album;
		else album = data.artist;

		web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
	}

	var url = '/albumart';

	if (web != undefined)
		url = url + web;

	if (web != undefined && path != undefined)
		url = url + '&';
	else if (path != undefined)
		url = url + '?';

	if (path != undefined)
		url = url + 'path=' + nodetools.urlEncode(path);

	return url;
};





lcdctrl.prototype.search = function (query) {
	var self=this;
	var defer=libQ.defer();

	// Mandatory, search. You can divide the search in sections using following functions

	return defer.promise;
};

lcdctrl.prototype._searchArtists = function (results) {

};

lcdctrl.prototype._searchAlbums = function (results) {

};

lcdctrl.prototype._searchPlaylists = function (results) {


};

lcdctrl.prototype._searchTracks = function (results) {

};
