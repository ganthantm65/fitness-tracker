app.controller('BmiController', function($scope, apiService) {
    $scope.bmiHistory = [];
    $scope.calc = { height: '', weight: '' };
    $scope.result = null;
    $scope.error = null;

    $scope.calculateBMI = function() {
        if (!$scope.calc.height || !$scope.calc.weight) return;

        apiService.addBMI($scope.calc)
            .then(data => {
                $scope.result = data;
                $scope.fetchHistory(); 
                $scope.calc = { height: '', weight: '' }; 
            })
            .catch(err => {
                $scope.error = "Error saving BMI data: " + err;
            });
    };

    $scope.fetchHistory = function() {
        apiService.getBMIs()
            .then(data => {
                $scope.bmiHistory = data;
            })
            .catch(err => console.error(err));
    };

    $scope.getCategoryClass = function(cat) {
        const classes = {
            'Underweight': 'text-yellow-400',
            'Normal': 'text-emerald-400',
            'Overweight': 'text-red-400',
            'Obese': 'text-red-600'
        };
        return classes[cat] || 'text-white';
    };

    $scope.fetchHistory();
});