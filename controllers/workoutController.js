app.controller('WorkoutController', function($scope, apiService, $timeout) {

    // ================= INIT =================
    $scope.workouts = [];
    $scope.filteredWorkouts = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.success = null;

    $scope.search = '';
    $scope.filterType = '';

    // Default form
    $scope.newWorkout = {
        type: 'Running',
        duration: 30,
        calories: null,
        notes: '',
        date: new Date().toISOString().split('T')[0]
    };

    // ================= HELPERS =================

    const calorieMap = {
        Running: 10,
        Cycling: 8,
        Gym: 6,
        Yoga: 4
    };

    const estimateCalories = (type, duration) => {
        return (calorieMap[type] || 5) * duration;
    };

    // ================= FETCH =================

    $scope.init = function() {
        $scope.loading = true;

        apiService.getWorkouts()
            .then(data => {
                // Sort latest first
                $scope.workouts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                $scope.applyFilters();
                $scope.loading = false;
            })
            .catch(err => {
                $scope.error = "Failed to load workouts: " + err;
                $scope.loading = false;
            });
    };

    // ================= ADD =================

    $scope.saveWorkout = function() {

        if (!$scope.newWorkout.type || !$scope.newWorkout.duration) {
            return $scope.showFeedback("Fill required fields", "error");
        }

        // Auto-calc calories
        if (!$scope.newWorkout.calories) {
            $scope.newWorkout.calories =
                estimateCalories($scope.newWorkout.type, $scope.newWorkout.duration);
        }

        // Optimistic UI
        const tempWorkout = { ...$scope.newWorkout, _id: Date.now() };
        $scope.workouts.unshift(tempWorkout);
        $scope.applyFilters();

        apiService.addWorkout($scope.newWorkout)
            .then(saved => {
                // Replace temp with real
                const index = $scope.workouts.findIndex(w => w._id === tempWorkout._id);
                if (index !== -1) $scope.workouts[index] = saved;

                $scope.showFeedback("Workout added 🔥", "success");
                $scope.resetForm();
            })
            .catch(err => {
                // rollback
                $scope.workouts = $scope.workouts.filter(w => w._id !== tempWorkout._id);
                $scope.applyFilters();
                $scope.showFeedback(err, "error");
            });
    };

    // ================= DELETE =================

    $scope.removeWorkout = function(id, index) {

        if (!confirm("Delete this workout?")) return;

        const removed = $scope.filteredWorkouts[index];

        // Optimistic remove
        $scope.filteredWorkouts.splice(index, 1);
        $scope.workouts = $scope.workouts.filter(w => w._id !== id);

        apiService.deleteWorkout(id)
            .then(() => {
                $scope.showFeedback("Deleted ✅", "success");
            })
            .catch(err => {
                // rollback
                $scope.workouts.unshift(removed);
                $scope.applyFilters();
                $scope.showFeedback(err, "error");
            });
    };

    // ================= FILTER =================

    $scope.applyFilters = function() {
        $scope.filteredWorkouts = $scope.workouts.filter(w =>
            (!$scope.filterType || w.type === $scope.filterType) &&
            (!$scope.search || w.type.toLowerCase().includes($scope.search.toLowerCase()))
        );
    };

    // ================= UTIL =================

    $scope.resetForm = function() {
        $scope.newWorkout = {
            type: 'Running',
            duration: 30,
            calories: null,
            notes: '',
            date: new Date().toISOString().split('T')[0]
        };
    };

    $scope.showFeedback = function(msg, type) {
        if (type === 'success') {
            $scope.success = msg;
            $scope.error = null;
        } else {
            $scope.error = msg;
            $scope.success = null;
        }

        $timeout(() => {
            $scope.success = null;
            $scope.error = null;
        }, 3000);
    };

    // ================= START =================
    $scope.init();
});