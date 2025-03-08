// Weather-based task recommendations
function suggestTasksBasedOnWeather(weatherData) {
    const taskSuggestions = document.getElementById('taskSuggestions');
    if (!taskSuggestions) {
        return;
    }
    
    const weatherCondition = weatherData.current.condition.text.toLowerCase();
    const tempC = weatherData.current.temp_c;
    const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle');
    const isSnowing = weatherCondition.includes('snow');
    const isSunny = weatherCondition.includes('sunny') || weatherCondition.includes('clear');
    const isHot = tempC > 28;
    const isCold = tempC < 5;
    
    let suggestedTasks = [];
    
    // Generate task suggestions based on weather
    if (isRaining) {
        suggestedTasks.push(
            'Remember to take an umbrella when going out',
            'Indoor activities: read a book or clean the house',
            'Check gutters and drains'
        );
    } else if (isSnowing) {
        suggestedTasks.push(
            'Clear snow from driveway',
            'Check heating system',
            'Wear warm clothes when going out'
        );
    } else if (isSunny && isHot) {
        suggestedTasks.push(
            'Stay hydrated - drink plenty of water',
            'Use sunscreen when going outside',
            'Consider outdoor exercise in the early morning'
        );
    } else if (isSunny) {
        suggestedTasks.push(
            'Great day for outdoor activities!',
            'Consider a walk or run in the park',
            'Good time for gardening or yard work'
        );
    } else if (isCold) {
        suggestedTasks.push(
            'Check heating system',
            'Wear warm clothes when going out',
            'Consider indoor exercises'
        );
    }
    
    // Generate HTML for suggestions
    if (suggestedTasks.length > 0) {
        taskSuggestions.innerHTML = `
            <div class="suggestions-header">
                <i class="fas fa-lightbulb"></i>
                <h3>Weather-based Suggestions</h3>
            </div>
            <ul class="suggestions-list">
                ${suggestedTasks.map(task => `
                    <li>
                        <button class="add-suggestion-btn" data-task="${task}">
                            <i class="fas fa-plus"></i>
                        </button>
                        ${task}
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Add event listeners for adding suggestions
        document.querySelectorAll('.add-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskText = this.getAttribute('data-task');
                document.getElementById('taskInput').value = taskText;
                // Focus on the input
                document.getElementById('taskInput').focus();
            });
        });
    } else {
        taskSuggestions.innerHTML = '';
    }
}

// Modify the displayWeatherInfo function to also suggest tasks
function displayWeatherInfo(data) {
    // Original weather display code...
    
    // Additionally, suggest tasks based on weather
    suggestTasksBasedOnWeather(data);
}

// Create task suggestions container
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.add-task-section')) {
        const taskSection = document.querySelector('.add-task-section');
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.id = 'taskSuggestions';
        suggestionsDiv.className = 'task-suggestions';
        taskSection.appendChild(suggestionsDiv);
    }
});