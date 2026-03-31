app.controller('BmiController', function($scope, apiService) {

    $scope.bmiHistory = [];
    $scope.calc = { height: '', weight: '' };
    $scope.result = null;
    $scope.preview = null;
    $scope.error = null;

    // ================= CATEGORY =================
    const getCategory = (bmi) => {
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    // ================= LIVE PREVIEW =================
    $scope.$watchGroup(['calc.height', 'calc.weight'], function(values) {
        const [h, w] = values;

        if (h && w) {
            const bmi = w / ((h / 100) ** 2);
            $scope.preview = {
                bmi: bmi,
                category: getCategory(bmi)
            };
        } else {
            $scope.preview = null;
        }
    });

    // ================= SAVE BMI =================
    $scope.calculateBMI = function() {

        if (!$scope.calc.height || !$scope.calc.weight) {
            return $scope.error = "Enter height & weight";
        }

        apiService.addBMI($scope.calc)
            .then(data => {
                $scope.result = data;

                // Add latest on top
                $scope.bmiHistory.unshift(data);

                $scope.calc = { height: '', weight: '' };
                $scope.preview = null;
                $scope.error = null;
            })
            .catch(err => {
                $scope.error = "Error saving BMI: " + err;
            });
    };

    // ================= FETCH =================
    $scope.fetchHistory = function() {
        apiService.getBMIs()
            .then(data => {
                // latest first
                $scope.bmiHistory = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            })
            .catch(err => console.error(err));
    };

    // ================= STYLE =================
    $scope.getCategoryClass = function(cat) {
        const classes = {
            'Underweight': 'text-yellow-400',
            'Normal': 'text-emerald-400',
            'Overweight': 'text-orange-400',
            'Obese': 'text-red-500'
        };
        return classes[cat] || 'text-white';
    };

    // ================= START =================
    $scope.fetchHistory();
});