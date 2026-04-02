app.controller('WaterTrackerController', function($scope, $timeout) {
    const GOAL_ML = 3000;
    const STORAGE_KEY = 'water_intake_data';
    
    $scope.dailyGoal = GOAL_ML;
    $scope.currentIntake = 0;
    $scope.history = [];
    $scope.animatedPercentage = 0;
    
    $scope.init = function() {
        const today = new Date().toISOString().split('T')[0];
        
        let stored = localStorage.getItem(STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : {};
        
        if (data[today]) {
            $scope.currentIntake = data[today].total;
            $scope.history = data[today].logs || [];
        } else {
            $scope.currentIntake = 0;
            $scope.history = [];
            data[today] = { total: 0, logs: [] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        
        $scope.updateUI();
    };
    
    $scope.addWater = function(amount) {
        $scope.currentIntake += amount;
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        $scope.history.unshift({ time: timestamp, amount: amount });
        
        $scope.saveToStorage();
        $scope.updateUI();
    };
    
    $scope.resetWater = function() {
        if(confirm("Are you sure you want to reset today's water intake?")) {
            $scope.currentIntake = 0;
            $scope.history = [];
            $scope.saveToStorage();
            $scope.updateUI();
        }
    };

    $scope.saveToStorage = function() {
        const today = new Date().toISOString().split('T')[0];
        let stored = localStorage.getItem(STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : {};
        
        data[today] = {
            total: $scope.currentIntake,
            logs: $scope.history
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    $scope.updateUI = function() {
        let percent = ($scope.currentIntake / $scope.dailyGoal) * 100;
        if (percent > 100) percent = 100;
        
        // Timeout to allow DOM/digest cycle before animating if needed
        $timeout(() => {
            $scope.animatedPercentage = percent;
        }, 50);
    };
    
    $scope.getProgressStyle = function() {
        return {
            'height': $scope.animatedPercentage + '%',
            'transition': 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
        };
    };

    $scope.init();
});
