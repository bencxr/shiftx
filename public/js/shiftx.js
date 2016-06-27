// public/core.js
var shiftX = angular.module('shiftX', ['ngRoute']);

shiftX.controller('mainController', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    $scope.formData = {};
    $rootScope.id = "";
    var conversion = true;
    var pair = 'btceth';
    $scope.address=''

    function getRate() {
        var url;
        if (conversion) {
            $scope.firstImage = "bitcoin";
            $scope.secondImage = "ethereum";
            pair = 'btceth';
            url = 'http://localhost:4000/api/pair/btceth';
        } else {
            $scope.firstImage = "ethereum";
            $scope.secondImage = "bitcoin";
            pair = 'ethbtc';
            url = 'http://localhost:4000/api/pair/ethbtc';   
        }
        $http.get(url)
        .success(function(data) {
            $scope.rate = Math.round(data.rate*10000)/10000;
            $rootScope.id = data.id;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

    $scope.convert = function() {
        conversion = !conversion;
        getRate();
    };

    $scope.startShift = function() {
        var params = {
            pair: pair,
            withdrawAddress: $scope.address
        };
        $http.post('http://localhost:4000/api/shift', params)
        .success(function(data) {
            $rootScope.id = data.id;
            console.log(data);
            $location.path('/shift/'+ $rootScope.id);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };

    getRate();
}]);

shiftX.controller('shiftController', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

    $scope.conversionDirection = "bitcoin";

    var getIdFromUrl = function() {
        var url = $location.path().split('/');
        var curIdIdx = url.indexOf("shift") + 1;
        return url[curIdIdx];
    }

    function getConversion() {
        var id = getIdFromUrl();
        var url = 'http://localhost:4000/api/shift/' + id;
        $http.get(url)
        .success(function(data) {
            $rootScope.expires = moment(data.expires).format('MMMM Do YYYY, h:mm:ss A');
            $rootScope.depositAddress = data.depositAddress;
            // change conversion direction here
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
            // just redirect to home page incase of error (possibly cause of wrong id)
            //$location.path('/');
        });
    }

    getConversion();
}]);


// configure our routes
shiftX.config(function($routeProvider, $locationProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'templates/home.html',
            controller  : 'mainController'
        })

        // route for the home page
        .when('/shift/:id', {
            templateUrl : 'templates/shift.html',
            controller  : 'shiftController'
        });

    $locationProvider.html5Mode(true);
});
