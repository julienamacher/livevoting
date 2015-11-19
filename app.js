var express = require('express');
var glob = require('glob');
var bodyParser = require('body-parser');

// Listening port. Is the same for the Web server and the Socket.IO server
var appListenOnPortConfig = process.env.PORT || 8080;

// Express configuration
var app = express();

app.use(bodyParser.json());

// Setting our view parameters
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

// Binding the listening socket
var server = app.listen(appListenOnPortConfig, function () {
  console.log('Express server listening on port ' + appListenOnPortConfig);
});

// Socket.IO will listen on the same port as our Web server
var sio = require('socket.io').listen(server);

// We export the socket.io config
// as well as the secret used to sign the sessions (so we can use them in our api file)
module.exports = {
	'sio': sio
};

// Including all constrollers in our controllers folder
var controllers = glob.sync(__dirname + '/app/controllers/*.js');
controllers.forEach(function (controller) {
	require(controller)(app);
});

// Static pages (such as angularjs, css and client-side js) are statically served
app.use('/sp', express.static(__dirname + '/app/static'));

var title = "Are you happy ?";
var votes = [
	{
	   'option': 'yes',
	   'votes': 0
	},
	{
	   'option': 'no',
	   'votes': 0
	},
	{
	   'option': 'maybe',
	   'votes': 0
	}
];

function sendVotes() {
	sio.sockets.emit('liveVote', { 'votes': votes,
	                               'title': title });
}

// Socket.IO endpoint
sio.sockets.on('connection', function (socket) {
	console.log('New socket.io connection');

	socket.on('vote', function(voteIndex) {
		if (voteIndex >= 0 && voteIndex < votes.length) {
			console.log('Voting: ' + voteIndex);
			votes[voteIndex].votes++;

		   console.log('Emitting votes');
		   sendVotes()
	   }
	});
	
	socket.on('reset', function(voteWhat) {
		console.log('Reset');
		
		for (var i = 0; i < votes.length; i++) {
			votes[i].votes = 0;
	   }

	   sendVotes();
	});
	
	socket.on('getResults', function() {
		console.log('Emitting votes');
		sendVotes();
	});
});
