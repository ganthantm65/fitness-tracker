app.factory('apiService', function ($http, $q, $location) {
    const BASE_URL = 'http://localhost:5000/api';

    const getToken = () => localStorage.getItem('token');

    const request = (method, url, data = null) => {
        const token = getToken();
        const config = {
            method: method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            },
            data: data
        };

        return $http(config).then(
            res => res.data,
            err => {
                if (err.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    $location.path('/login');
                }

                const msg = err.data?.message || "Network error";
                return $q.reject(msg);
            }
        );
    };

    return {
        // Auth
        login: (data) => request('POST', '/auth/login', data),
        register: (data) => request('POST', '/auth/register', data),

        // Workout
        getWorkouts: () => request('GET', '/workouts'),
        addWorkout: (data) => request('POST', '/workouts', data),
        deleteWorkout: (id) => request('DELETE', `/workouts/${id}`),

        // BMI
        getBMIs: () => request('GET', '/bmi'),
        addBMI: (data) => request('POST', '/bmi', data),
        deleteBMI: (id) => request('DELETE', `/bmi/${id}`), // ✅ FIXED

        // Goals
        getGoals: () => request('GET', '/goals'),
        saveGoals: (data) => request('POST', '/goals', data),

        // Dashboard
        getSummary: () => request('GET', '/analytics/summary')
    };
});