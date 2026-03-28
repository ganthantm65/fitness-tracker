app.factory('apiService', function($http, $q, $location) {
    const BASE_URL = 'http://localhost:5000/api';

    // Helper to get the token from local storage
    const getToken = () => localStorage.getItem('token');

    // Centralized Request Handler
    const request = (method, url, data = null) => {
        const config = {
            method: method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Authorization': getToken(),
                'Content-Type': 'application/json'
            },
            data: data
        };

        return $http(config).then(
            (response) => response.data,
            (rejection) => {
                // Global Error Handling
                if (rejection.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    $location.path('/login');
                }
                
                // Return a user-friendly error message
                const errorMsg = rejection.data && rejection.data.message 
                                 ? rejection.data.message 
                                 : "A network error occurred. Please try again.";
                
                return $q.reject(errorMsg);
            }
        );
    };

    return {
        // Auth Endpoints
        login: (credentials) => request('POST', '/auth/login', credentials),
        register: (userData) => request('POST', '/auth/register', userData),

        // Workout Endpoints
        getWorkouts: () => request('GET', '/workouts'),
        addWorkout: (workout) => request('POST', '/workouts', workout),
        deleteWorkout: (id) => request('DELETE', `/workouts/${id}`),

        // BMI Endpoints
        getBMIs: () => request('GET', '/bmi'),
        addBMI: (data) => request('POST', '/bmi', data),

        // Goal Endpoints
        getGoals: () => request('GET', '/goals'),
        saveGoals: (goals) => request('POST', '/goals', goals),

        // Analytics
        getSummary: () => request('GET', '/analytics/summary')
    };
});