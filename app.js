// app.js
var app = angular.module('fitnessApp', ['ngRoute']);

app.config(function($routeProvider, $httpProvider) {
    $routeProvider
    .when('/login', { templateUrl: 'views/login.html', controller: 'AuthController' })
    .when('/dashboard', { templateUrl: 'views/dashboard.html', controller: 'DashboardController' })
    .when('/workouts', { templateUrl: 'views/workouts.html', controller: 'WorkoutController' })
    .when('/bmi', { templateUrl: 'views/bmi.html', controller: 'BmiController' })
    .when('/goals', { templateUrl: 'views/goal.html', controller: 'GoalController' }) // <--- New Route
    .otherwise({ redirectTo: '/login' });

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            request: function(config) {
                const token = localStorage.getItem('token');
                if (token) config.headers['Authorization'] = token;
                return config;
            },
            responseError: function(rejection) {
                if (rejection.status === 401) {
                    localStorage.removeItem('token');
                    $location.path('/login');
                }
                return $q.reject(rejection);
            }
        };
    });
});

app.controller('MainController', function($scope, $location) {
    $scope.isLoggedIn = () => !!localStorage.getItem('token');
    $scope.logout = () => {
        localStorage.removeItem('token');
        $location.path('/login');
    };
});