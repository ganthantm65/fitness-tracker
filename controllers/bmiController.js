app.controller('BmiController', function ($scope, $timeout, apiService) {
    $scope.bmiHistory = [];
    $scope.system = 'metric'; 
    $scope.calc = { height: null, weight: null }; // Changed to null for better validation
    $scope.preview = null;
    $scope.error = null;
    $scope.loading = false;

    $scope.init = function () {
        $scope.loading = true;
        apiService.getBMIs()
            .then(data => {
                $scope.bmiHistory = data || [];
                $scope.loading = false;
            })
            .catch(err => {
                $scope.error = err;
                $scope.loading = false;
            });
    };

    $scope.getCategoryClass = function (category) {
        if (!category) return 'text-slate-400';
        const cat = category.toLowerCase();
        if (cat === 'underweight') return 'text-amber-400';
        if (cat === 'normal') return 'text-emerald-400';
        if (cat === 'overweight') return 'text-orange-400';
        if (cat === 'obese') return 'text-red-500';
        return 'text-blue-400';
    };

    $scope.toggleSystem = function () {
        $scope.system = $scope.system === 'metric' ? 'imperial' : 'metric';
        $scope.calc = { height: null, weight: null };
        $scope.preview = null;
    };

    $scope.$watchGroup(['calc.height', 'calc.weight', 'system'], function ([h, w, sys]) {
        if (h && w && h > 0 && w > 0) {
            let bmiVal = sys === 'metric'
                ? w / ((h / 100) ** 2)
                : (w * 703) / (h ** 2);

            $scope.preview = {
                bmi: parseFloat(bmiVal.toFixed(1)),
                category: $scope.determineCategory(bmiVal)
            };
        } else {
            $scope.preview = null;
        }
    });

    $scope.determineCategory = (bmi) => {
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    $scope.saveBMI = function () {
        if (!$scope.calc.height || !$scope.calc.weight) {
            $scope.error = "Please enter both height and weight";
            $timeout(() => $scope.error = null, 3000);
            return;
        }
        const payload = {
            height: Number($scope.calc.height),
            weight: Number($scope.calc.weight),
            system: $scope.system || 'metric'
        };
        console.log(payload);
        
        $scope.loading = true;
        
        apiService.addBMI(payload)
            .then(res => {
                if (res && res._id) {
                    $scope.bmiHistory.unshift(res); 
                } else {
                    $scope.init();
                }
                
                $scope.calc = { height: null, weight: null };
                $scope.preview = null;
                $scope.loading = false;
            })
            .catch(err => {
                console.log(err);
                
                $scope.error = (typeof err === 'string') ? err : (err.message || "Error saving record");
                $scope.loading = false;
                $timeout(() => $scope.error = null, 3000);
            });
    };

    $scope.removeBMI = function (id) {
        if (!confirm("Delete this record?")) return;
        apiService.deleteBMI(id)
            .then(() => {
                $scope.bmiHistory = $scope.bmiHistory.filter(b => b._id !== id);
            })
            .catch(err => {
                $scope.error = "Delete failed";
                $timeout(() => $scope.error = null, 3000);
            });
    };

    $scope.init();
});