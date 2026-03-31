app.controller('DashboardController', function($scope, apiService) {
    $scope.stats = {};
    $scope.loading = true;
    $scope.error = null;

    $scope.weeklyData = {};
    $scope.typeData = {};

    $scope.init = function() {
        apiService.getSummary()
            .then(data => {
                $scope.stats = data;
                $scope.weeklyData = data.weeklyData || {};
                $scope.typeData = data.typeDistribution || {};

                setTimeout(() => {
                    drawCharts();
                }, 100);

                $scope.loading = false;
            })
            .catch(() => {
                $scope.error = "Failed to load dashboard data.";
                $scope.loading = false;
            });
    };

    function drawCharts() {

        // 📊 Weekly Calories Chart
        const ctx1 = document.getElementById('calorieChart');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: Object.keys($scope.weeklyData),
                    datasets: [{
                        label: 'Calories Burned',
                        data: Object.values($scope.weeklyData)
                    }]
                }
            });
        }

        // 🍩 Workout Type Chart
        const ctx2 = document.getElementById('typeChart');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: Object.keys($scope.typeData),
                    datasets: [{
                        data: Object.values($scope.typeData)
                    }]
                }
            });
        }
    }

    $scope.init();
});