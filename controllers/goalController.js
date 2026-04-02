app.controller('GoalController', function ($scope, $timeout, apiService) {
    // 1. Added missing fields to the default object
    $scope.goals = {
        targetWeight: 75,
        currentWeight: 80,
        startWeight: null,
        targetDate: null,
        dailyCalorieGoal: 2000, 
        weeklyWorkoutGoal: 3
    };

    $scope.progress = 0;
    $scope.daysRemaining = 0;
    $scope.loading = false;
    $scope.message = null;

    $scope.init = function () {
        $scope.loading = true;
        apiService.getGoals()
            .then(data => {
                if (data) {
                    // Convert targetDate string back to Date object for the <input type="date">
                    if (data.targetDate) {
                        data.targetDate = new Date(data.targetDate);
                    }
                    $scope.goals = data;
                    
                    if (!$scope.goals.startWeight) {
                        $scope.goals.startWeight = $scope.goals.currentWeight;
                    }
                }
                $scope.calculateProgress();
                $scope.loading = false;
            })
            .catch(err => {
                $scope.showMessage(err, "error");
                $scope.loading = false;
            });
    };

    $scope.calculateProgress = function () {
        const start = Number($scope.goals.startWeight);
        const current = Number($scope.goals.currentWeight);
        const target = Number($scope.goals.targetWeight);
        if (!start || !current || !target) {
            $scope.progress = 0;
            return;
        }
        let pct = (start > target) 
            ? ((start - current) / (start - target)) * 100 
            : ((current - start) / (target - start)) * 100;

        $scope.progress = Math.max(0, Math.min(100, Math.round(pct)));

        if ($scope.goals.targetDate) {
            const now = new Date();
            const targetD = new Date($scope.goals.targetDate);
            const diff = Math.ceil((targetD - now) / (1000 * 60 * 60 * 24));
            $scope.daysRemaining = diff > 0 ? diff : 0;
        }
    };

    $scope.$watch('goals', function () {
        $scope.calculateProgress();
    }, true);

    $scope.saveGoals = function () {
        $scope.loading = true;

        // ✅ FIX: Sanitize the data before sending to the backend
        // This prevents the "NaN" validation error in MongoDB
        const payload = {
            ...$scope.goals,
            targetWeight: Number($scope.goals.targetWeight) || 0,
            currentWeight: Number($scope.goals.currentWeight) || 0,
            dailyCalorieGoal: Number($scope.goals.dailyCalorieGoal) || 2000, // Fallback to default
            weeklyWorkoutGoal: Number($scope.goals.weeklyWorkoutGoal) || 3   // Fallback to default
        };

        apiService.saveGoals(payload)
            .then(() => {
                $scope.showMessage("Goals saved successfully ✅", "success");
                $scope.loading = false;
            })
            .catch(err => {
                // This will now catch and display any remaining server-side errors
                $scope.showMessage(err, "error");
                $scope.loading = false;
            });
    };

    $scope.getWeightLeft = function () {
        if (!$scope.goals.currentWeight || !$scope.goals.targetWeight) return 0;
        return Math.abs($scope.goals.currentWeight - $scope.goals.targetWeight).toFixed(1);
    };

    $scope.getStatus = function () {
        if ($scope.progress === 100) return "success";
        if ($scope.daysRemaining <= 3) return "danger";
        return "warning";
    };

    $scope.getStatusText = function () {
        if ($scope.progress === 100) return "Goal Achieved 🎉";
        if ($scope.daysRemaining <= 3) return "Deadline Near ⚠️";
        return "In Progress 💪";
    };

    $scope.getDashOffset = function () {
        const circumference = 440;
        return circumference - ($scope.progress / 100) * circumference;
    };

    $scope.showMessage = function (text, type) {
        $scope.message = { text, type };
        $timeout(() => $scope.message = null, 5000);
    };

    $scope.init();
});