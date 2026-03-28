app.controller('WorkoutController', function($scope, apiService, $timeout) {
    // --- 1. Initialization ---
    $scope.workouts = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.success = null;
    
    // Default form state
    $scope.newWorkout = {
        type: 'Running',
        duration: 30,
        calories: 250,
        notes: '',
        date: new Date().toISOString().split('T')[0] // Default to today
    };

    // --- 2. Core Functions ---

    // Fetch all workouts from the API
    $scope.init = function() {
        $scope.loading = true;
        apiService.getWorkouts()
            .then(data => {
                $scope.workouts = data;
                $scope.loading = false;
            })
            .catch(err => {
                $scope.error = "Failed to load workout history: " + err;
                $scope.loading = false;
            });
    };

    // Add a new workout
    $scope.saveWorkout = function() {
        if (!$scope.newWorkout.type || !$scope.newWorkout.duration) {
            $scope.error = "Please fill in the required fields.";
            return;
        }

        $scope.loading = true;
        apiService.addWorkout($scope.newWorkout)
            .then(savedWorkout => {
                // Add to the local list (at the top)
                $scope.workouts.unshift(savedWorkout);
                
                // Show success message
                $scope.showFeedback("Workout logged successfully! 🔥", "success");
                
                // Reset form to defaults
                $scope.resetForm();
                $scope.loading = false;
            })
            .catch(err => {
                $scope.showFeedback(err, "error");
                $scope.loading = false;
            });
    };

    // Delete a workout
    $scope.removeWorkout = function(id, index) {
        if (confirm("Are you sure you want to delete this activity?")) {
            apiService.deleteWorkout(id)
                .then(() => {
                    $scope.workouts.splice(index, 1);
                    $scope.showFeedback("Activity deleted.", "success");
                })
                .catch(err => {
                    $scope.showFeedback("Delete failed: " + err, "error");
                });
        }
    };

    // --- 3. Helper Functions ---

    $scope.resetForm = function() {
        $scope.newWorkout = {
            type: 'Running',
            duration: 30,
            calories: 250,
            notes: '',
            date: new Date().toISOString().split('T')[0]
        };
    };

    // Standardized feedback alerts that disappear after 3 seconds
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

    // Run on startup
    $scope.init();
});