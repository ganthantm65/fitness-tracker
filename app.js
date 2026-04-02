var app = angular.module('fitnessApp', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'views/login.html', controller: 'AuthController' })
        .when('/dashboard', { templateUrl: 'views/dashboard.html', controller: 'DashboardController' })
        .when('/workouts', { templateUrl: 'views/workouts.html', controller: 'WorkoutController' })
        .when('/bmi', { templateUrl: 'views/bmi.html', controller: 'BmiController' })
        .when('/goals', { templateUrl: 'views/goal.html', controller: 'GoalController' })
        .when('/water', { templateUrl: 'views/water.html', controller: 'WaterTrackerController' })
        .otherwise({ redirectTo: '/login' });
}]);

app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        const token = localStorage.getItem('token');
        if (!token && next.originalPath !== '/login') {
            $location.path('/login');
        }
        if (token && next.originalPath === '/login') {
            $location.path('/dashboard');
        }
    });
}]);

app.controller('MainController', ['$scope', '$location', function ($scope, $location) {

    $scope.isLoggedIn = function () {
        return !!localStorage.getItem('token');
    };

    $scope.$watch(function () {
        return localStorage.getItem('username');
    }, function (newVal) {
        $scope.username = newVal || 'Athlete';
    });

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.logout = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        $location.path('/login');
    };
}]);