app.controller('WorkoutController', function ($scope, $timeout, $interval, apiService) {

    // ================= INIT =================
    $scope.workouts = [];
    $scope.filteredWorkouts = [];
    $scope.search = '';
    $scope.filterType = '';
    $scope.feedback = null;
    $scope.loading = false;

    $scope.newWorkout = {
        type: 'Running',
        duration: 30,
        notes: '',
        date: new Date().toISOString().split('T')[0]
    };

    // ================= TIMER =================
    $scope.isTimerRunning = false;
    $scope.timerSeconds = 0;
    let timerInterval = null;

    // ================= MET CALC =================
    const MET_MAP = {
        'Running': 9.8,
        'Cycling': 7.5,
        'Gym': 3.0,
        'Yoga': 2.5,
        'Swimming': 6.0
    };

    const estimateCalories = (type, durationMins) => {
        const met = MET_MAP[type] || 5.0;
        const weightKg = 70;
        const durationHrs = durationMins / 60;
        return Math.round(met * weightKg * durationHrs);
    };

    // ================= FETCH (API) =================
    $scope.init = function () {
        $scope.loading = true;

        apiService.getWorkouts()
            .then(data => {
                $scope.workouts = (data || []).sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                $scope.applyFilters();
                $scope.loading = false;
            })
            .catch(err => {
                $scope.showFeedback(err, "error");
                $scope.loading = false;
            });
    };

    // ================= TIMER =================
    $scope.toggleTimer = function () {
        if ($scope.isTimerRunning) {
            $interval.cancel(timerInterval);
            $scope.isTimerRunning = false;
            $scope.newWorkout.duration = Math.max(1, Math.round($scope.timerSeconds / 60));
        } else {
            $scope.isTimerRunning = true;
            timerInterval = $interval(() => {
                $scope.timerSeconds++;
            }, 1000);
        }
    };

    $scope.resetTimer = function () {
        $interval.cancel(timerInterval);
        $scope.isTimerRunning = false;
        $scope.timerSeconds = 0;
    };

    $scope.formatTime = function (totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ================= ADD (API) =================
    $scope.saveWorkout = function () {
        if (!$scope.newWorkout.type || !$scope.newWorkout.duration) {
            return $scope.showFeedback("Fill required fields", "error");
        }

        const payload = {
            ...$scope.newWorkout,
            calories: estimateCalories(
                $scope.newWorkout.type,
                $scope.newWorkout.duration
            )
        };

        $scope.loading = true;

        apiService.addWorkout(payload)
            .then(response => {
                // Add to UI instantly
                $scope.workouts.unshift(response);

                $scope.applyFilters();
                $scope.showFeedback("Workout logged 🔥", "success");
                $scope.resetForm();
                $scope.loading = false;
            })
            .catch(err => {
                $scope.showFeedback(err, "error");
                $scope.loading = false;
            });
    };

    // ================= DELETE (API) =================
    $scope.removeWorkout = function (id) {
        if (!confirm("Delete this workout?")) return;

        apiService.deleteWorkout(id)
            .then(() => {
                $scope.workouts = $scope.workouts.filter(w => w._id !== id);
                $scope.applyFilters();
                $scope.showFeedback("Deleted ✅", "success");
            })
            .catch(err => {
                $scope.showFeedback(err, "error");
            });
    };

    // ================= FILTER =================
    $scope.applyFilters = function () {
        $scope.filteredWorkouts = $scope.workouts.filter(w =>
            (!$scope.filterType || w.type === $scope.filterType) &&
            (!$scope.search || w.type.toLowerCase().includes($scope.search.toLowerCase()))
        );
    };

    // ================= UTIL =================
    $scope.resetForm = function () {
        $scope.newWorkout = {
            type: 'Running',
            duration: 30,
            notes: '',
            date: new Date().toISOString().split('T')[0]
        };
        $scope.resetTimer();
    };

    $scope.showFeedback = function (msg, type) {
        $scope.feedback = { text: msg, type: type };
        $timeout(() => { $scope.feedback = null; }, 3000);
    };

    // ================= START =================
    $scope.init();

    // Cleanup
    $scope.$on('$destroy', function () {
        if (timerInterval) $interval.cancel(timerInterval);
    });
});