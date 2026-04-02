app.factory('DashboardService', function() {
    
    const motivations = [
        "Push harder than yesterday if you want a different tomorrow. 💪",
        "Success starts with self-discipline. 🚀",
        "It never gets easier, you just get stronger. 🏋️",
        "The only bad workout is the one that didn't happen. 🏃",
        "Believe in yourself and all that you are. 🌟",
        "Sweat is just fat crying. 💧"
    ];

    return {
        getDailyMotivation: function() {
            const today = new Date().toDateString();
            const index = today.length % motivations.length;
            return motivations[index];
        },

        getTodayCalorieSummary: function() {
            const workoutsStr = localStorage.getItem('workouts');
            let workouts = [];
            if (workoutsStr) {
                try {
                    workouts = JSON.parse(workoutsStr);
                } catch(e) { }
            }

            const today = new Date().toISOString().split('T')[0];
            let total = 0;
            
            workouts.forEach(w => {
                if (w.date === today && w.calories) {
                    total += parseFloat(w.calories);
                }
            });

            return total;
        },

        getWeeklyData: function() {
            const workoutsStr = localStorage.getItem('workouts');
            let workouts = [];
            if (workoutsStr) {
                try { workouts = JSON.parse(workoutsStr); } catch(e) { }
            }

            // Group by last 7 days
            const data = {};
            for(let i=6; i>=0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                data[dateStr] = 0;
            }

            workouts.forEach(w => {
                if(data[w.date] !== undefined) {
                    data[w.date] += parseFloat(w.calories || 0);
                }
            });

            return data;
        },

        getTypeDistribution: function() {
            const workoutsStr = localStorage.getItem('workouts');
            let workouts = [];
            if (workoutsStr) {
                try { workouts = JSON.parse(workoutsStr); } catch(e) { }
            }

            const counts = {};
            workouts.forEach(w => {
                counts[w.type] = (counts[w.type] || 0) + 1;
            });
            return counts;
        }
    };
});
