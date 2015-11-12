var express = require('express');
var router = express.Router();
var appjs = require(__dirname + '/../../app.js');
var sio = appjs.sio;

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

module.exports = function (app) {
  app.use('/api/v1', router);
};

// Socket.IO endpoint
sio.sockets.on('connection', function (socket) {
	console.log('New socket.io connection');

	socket.on('vote', function(voteWhat) {
		console.log('Voting: ' + voteWhat);
		
		for (var i = 0; i < votes.length; i++) {
			var currentVote = votes[i];
			
			if (currentVote.option == voteWhat) {
				currentVote.votes++;
				break;
			}
	   }
	   
	   console.log('Emitting votes');
	   sio.sockets.emit('liveVote', votes);
	});
	
	socket.on('reset', function(voteWhat) {
		console.log('Reset');
		
		for (var i = 0; i < votes.length; i++) {
			votes[i].votes = 0;
	   }

	   sio.sockets.emit('liveVote', votes);
	});
});
