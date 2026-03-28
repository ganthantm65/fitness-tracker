app.controller('DashboardController', function($scope, apiService) {
    $scope.stats = {};
    $scope.loading = true;
    $scope.error = null;

    $scope.init = function() {
        apiService.getSummary()
            .then(data => {
                $scope.stats = data;
                $scope.loading = false;
            })
            .catch(err => {
                $scope.error = "Failed to load dashboard data.";
                $scope.loading = false;
            });
    };

    $scope.init();
});