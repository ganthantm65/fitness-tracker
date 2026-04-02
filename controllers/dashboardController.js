app.controller('DashboardController', function ($scope, $timeout, apiService) {

    $scope.dailyMotivation = "";
    $scope.todayCalories = 0;

    $scope.weeklyData = {};
    $scope.typeData = {};
    $scope.loading = false;

    // ================= INIT (API) =================
    $scope.init = function () {
        $scope.loading = true;

        // Static motivation (you can also move to backend later)
        $scope.dailyMotivation = getMotivation();

        apiService.getSummary()
            .then(data => {
                // Expected backend response structure
                $scope.todayCalories = data.todayCalories || 0;
                $scope.weeklyData = data.weeklyData || {};
                $scope.typeData = data.typeDistribution || {};

                $timeout(() => {
                    drawCharts();
                }, 100);

                $scope.loading = false;
            })
            .catch(err => {
                console.error(err);
                $scope.loading = false;
            });
    };

    // ================= MOTIVATION =================
    function getMotivation() {
        const motivations = [
            "Push harder than yesterday 💪",
            "Discipline = Results 🚀",
            "You are stronger than you think 🏋️",
            "No excuses. Just results 🔥",
            "Consistency is key 🔑"
        ];
        return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // ================= CHARTS =================
    function drawCharts() {

        // 📊 Weekly Calories Chart
        const ctx1 = document.getElementById('calorieChart');
        if (ctx1) {
            let chartStatus = Chart.getChart("calorieChart");
            if (chartStatus) chartStatus.destroy();

            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: Object.keys($scope.weeklyData).map(d => {
                        const dat = new Date(d);
                        return dat.toLocaleDateString([], { weekday: 'short' });
                    }),
                    datasets: [{
                        label: 'Calories Burned',
                        data: Object.values($scope.weeklyData),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: '#f8fafc' } }
                    },
                    scales: {
                        x: { ticks: { color: '#94a3b8' } },
                        y: { ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // 🍩 Workout Type Chart
        const ctx2 = document.getElementById('typeChart');
        if (ctx2) {
            let chartStatus = Chart.getChart("typeChart");
            if (chartStatus) chartStatus.destroy();

            const keys = Object.keys($scope.typeData);
            const vals = Object.values($scope.typeData);

            if (keys.length === 0) {
                keys.push('No Data');
                vals.push(1);
            }

            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: keys,
                    datasets: [{
                        data: vals,
                        backgroundColor: [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#f8fafc' }
                        }
                    }
                }
            });
        }
    }

    // ================= START =================
    $scope.init();
});