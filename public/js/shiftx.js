// public/core.js
var shiftX = angular.module('shiftX', ['ngRoute']);

shiftX.controller('mainController', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    $scope.formData = {};
    $scope.id = "";
    var conversion = true;

    function getRate() {
        var url;
        if (conversion) {
            $scope.firstImage = "bitcoin";
            $scope.secondImage = "ethereum";
            url = 'http://localhost:4000/api/pair/btceth';
        } else {
            $scope.firstImage = "ethereum";
            $scope.secondImage = "bitcoin";
            url = 'http://localhost:4000/api/pair/ethbtc';   
        }
        $http.get(url)
        .success(function(data) {
            $scope.rate = data.rate;
            $scope.id = data.id;
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

    };

    getRate();
}]);


// configure our routes
shiftX.config(function($routeProvider, $locationProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'templates/home.html',
            controller  : 'mainController'
        });

    $locationProvider.html5Mode(true);
});
