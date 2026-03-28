app.controller('GoalController', function($scope, apiService, $timeout) {
    $scope.goals = {
        dailyCalorieGoal: 2000,
        weeklyWorkoutGoal: 5
    };
    $scope.loading = true;
    $scope.message = null;

    $scope.init = function() {
        apiService.getGoals()
            .then(data => {
                if (data) $scope.goals = data;
                $scope.loading = false;
            })
            .catch(err => {
                $scope.loading = false;
                console.error(err);
            });
    };

    $scope.saveGoals = function() {
        $scope.loading = true;
        apiService.saveGoals($scope.goals)
            .then(data => {
                $scope.goals = data;
                $scope.message = { type: 'success', text: 'Goals updated successfully! 🎯' };
                $scope.loading = false;
                
                $timeout(() => { $scope.message = null; }, 3000);
            })
            .catch(err => {
                $scope.message = { type: 'error', text: err };
                $scope.loading = false;
            });
    };

    $scope.init();
});