app.controller('AuthController', function($scope, apiService, $location, $timeout) {
    // Initial State
    $scope.user = {
        username: '',
        email: '',
        password: ''
    };
    $scope.isLoginMode = true; // Toggle between Login and Register views
    $scope.error = null;
    $scope.loading = false;

    // Toggle View Function
    $scope.toggleMode = function() {
        $scope.isLoginMode = !$scope.isLoginMode;
        $scope.error = null; // Clear errors when switching
    };

    // --- Login Logic ---
    $scope.login = function() {
        if (!$scope.user.email || !$scope.user.password) {
            $scope.error = "Please enter both email and password.";
            return;
        }

        $scope.loading = true;
        apiService.login({
            email: $scope.user.email,
            password: $scope.user.password
        })
        .then(data => {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            
            // Redirect to Dashboard
            $location.path('/dashboard');
        })
        .catch(err => {
            $scope.error = err;
            $scope.loading = false;
        });
    };

    // --- Registration Logic ---
    $scope.register = function() {
        if (!$scope.user.username || !$scope.user.email || !$scope.user.password) {
            $scope.error = "All fields are required for registration.";
            return;
        }

        $scope.loading = true;
        apiService.register($scope.user)
            .then(response => {
                alert("Registration successful! You can now log in.");
                $scope.isLoginMode = true; // Switch back to login
                $scope.loading = false;
                $scope.user.password = ''; // Clear password for security
            })
            .catch(err => {
                $scope.error = err;
                $scope.loading = false;
            });
    };
});