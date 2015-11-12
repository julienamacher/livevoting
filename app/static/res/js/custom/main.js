var tweb = angular.module('tweb', ['ngRoute', 'ngAnimate', 'chart.js']);

tweb.factory('ServerPushPoll', function () {
	var _sio;
	var _cbOnUserVote = null;

	var _registerOnUserVote = function(cbOnUserVote) {
		_cbOnUserVote = cbOnUserVote;
	};
	
	var _vote = function(voteWhat) {
		_sio.emit('vote', voteWhat);
	};

	var _connect = function(host, port) {
		if (host == null || port == null) {
			_sio = io.connect(); // same host
		} else {
			_sio = io.connect(host + ':' + port);
		}
		
		_sio.on('liveVote', function(data) {
			if (_cbOnUserVote != null) {
				_cbOnUserVote(data);
			}
		});
	};

	return {
		connect: _connect,
		vote: _vote,
		registerOnUserVote: _registerOnUserVote
	}
});

tweb.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'res/partials/home.html',
                    controller: 'home'
                }).
                when('/viewpoll', {
                    templateUrl: 'res/partials/viewpoll.html',
                    controller: 'viewpoll'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }]);

tweb.controller('home', function($scope, $http) {
});

tweb.controller('viewpoll', function($scope, $location, ServerPushPoll) {
	
	ServerPushPoll.connect(null, null);
	
	$scope.labels = [];
	$scope.data = [];
	$scope.options = { animationSteps: 20 };
	
	ServerPushPoll.registerOnUserVote(function(data) {
		$scope.voteResults = data;
		
		var labels = [];
		var datas = [];
		
		for (var i = 0; i < data.length; i++) {
			var currentResult = data[i];
			
			labels.push(currentResult.option);
			datas.push(currentResult.votes);
	   }

	   $scope.labels = labels;
	   $scope.data = datas;
	   $scope.$apply();
	});
	
	$scope.vote = function(voteWhat) {
		ServerPushPoll.vote(voteWhat);
	};
});
