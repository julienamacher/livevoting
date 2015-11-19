var tweb = angular.module('tweb', ['ngRoute', 'ngAnimate', 'chart.js']);

tweb.controller('HeaderController', function($scope, $location) {
	$scope.isActive = function (viewLocation) {
        return viewLocation == $location.path();
    };
});


tweb.factory('ServerPushPoll', function () {
	var _sio = null;
	var _cbOnUserVote = [];

	var _registerOnUserVote = function(cbOnUserVote) {
		_cbOnUserVote.push(cbOnUserVote);
	};

	var _vote = function(voteWhat) {
		_sio.emit('vote', voteWhat);
	};
	
	var _reset = function() {
		_sio.emit('reset');
	};
	
	var _getResults = function() {
		_sio.emit('getResults');
	};

	var _connectIfNecessary = function(host, port) {
		_cbOnUserVote = [];
		
		if (_sio !== null) {
			return;
		}
		
		if (host == null || port == null) {
			_sio = io.connect(); // same host
		} else {
			_sio = io.connect(host + ':' + port);
		}
		
		_sio.on('liveVote', function(data) {
			for (var i=0;i<_cbOnUserVote.length;i++) {
				_cbOnUserVote[i](data);
			}
		});
	};

	return {
		connectIfNecessary: _connectIfNecessary,
		vote: _vote,
		registerOnUserVote: _registerOnUserVote,
		reset: _reset,
		getResults: _getResults
	}
});

tweb.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/pollparticipate', {
				templateUrl: 'res/partials/pollparticipate.html',
				controller: 'pollparticipate'
			}).
			when('/polladmin', {
				templateUrl: 'res/partials/polladmin.html',
				controller: 'polladmin'
			}).
			otherwise({
				redirectTo: '/pollparticipate'
			});
	}]);

tweb.controller('pollparticipate', function($scope, ServerPushPoll) {
	$scope.labels = [];
	$scope.title = '';
	
	ServerPushPoll.connectIfNecessary(null, null);
	
	ServerPushPoll.registerOnUserVote(function(data) {
		var labels = [];

		var optionsLength = data.votes.length;
		for (var i = 0; i < optionsLength; i++) {
			labels.push(data.votes[i].option);
		}

		$scope.title = data.title;
		$scope.labels = labels;
		$scope.$apply();
	});
	
	ServerPushPoll.getResults();
	
	$scope.vote = function(voteWhat) {
		ServerPushPoll.vote(voteWhat);
	};
});

tweb.controller('polladmin', function($scope, ServerPushPoll) {
	$scope.labels = [];
	$scope.title = '';
	
	
	ServerPushPoll.connectIfNecessary(null, null);
	
	$scope.data = [];
	$scope.options = { "animationSteps": 20 };

	ServerPushPoll.registerOnUserVote(function(data) {
		var labels = [];
		var datas = [];
		
		var optionsLength = data.votes.length;
		for (var i = 0; i < optionsLength; i++) {
			var currentResult = data.votes[i];
			
			labels.push(currentResult.option);
			datas.push(currentResult.votes);
	   }

	   $scope.title = data.title;
	   $scope.labels = labels;
	   $scope.data = datas;
	   $scope.$apply();
	});
	
	ServerPushPoll.getResults();
	
	$scope.vote = function(voteWhat) {
		ServerPushPoll.vote(voteWhat);
	};
	
	$scope.reset = function() {
		ServerPushPoll.reset();
	};
});
