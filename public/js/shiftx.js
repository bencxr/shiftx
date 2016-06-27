// public/core.js
var shiftX = angular.module('shiftX', ['ngRoute']);

shiftX.controller('mainController', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
    $scope.formData = {};
    $scope.welcomeMessage = "Welcome to the brand new exchange!"

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
