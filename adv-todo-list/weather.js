// Weather API Integration for DoIt App
const WEATHER_API_KEY = '8f5841daa1994e2881c64308250803'; // Replace with your actual API key from weatherapi.com

// Function to get weather data based on user's location
async function getWeatherData() {
    try {
        // First try to get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Fetch weather data using coordinates
        const weatherData = await fetchWeatherData(latitude, longitude);
        
        // Display the weather information
        displayWeatherInfo(weatherData);
    } catch (error) {
        console.error('Error getting weather data:', error);
        // If geolocation fails, try with IP-based location
        try {
            const weatherData = await fetchWeatherDataByIP();
            displayWeatherInfo(weatherData);
        } catch (ipError) {
            console.error('Failed to get weather by IP:', ipError);
            displayWeatherError();
        }
    }
}

// Promise wrapper for geolocation API
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

// Fetch weather data using coordinates
async function fetchWeatherData(lat, lon) {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
}

// Fetch weather data using IP-based location
async function fetchWeatherDataByIP() {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=auto:ip&days=3&aqi=no&alerts=no`);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
}

// Display weather information in the sidebar
function displayWeatherInfo(data) {
    // Create or get weather container
    let weatherContainer = document.getElementById('weatherWidget');
    if (!weatherContainer) {
        weatherContainer = createWeatherWidget();
    }
    
    // Current weather
    const current = data.current;
    const location = data.location;
    
    // Update weather widget content
    weatherContainer.innerHTML = `
        <div class="weather-header">
            <h3>${location.name}</h3>
            <div class="weather-current">
                <img src="${current.condition.icon}" alt="${current.condition.text}">
                <span class="temp">${current.temp_c}°C</span>
            </div>
            <div class="weather-condition">${current.condition.text}</div>
        </div>
        <div class="weather-details">
            <div class="weather-detail-item">
                <i class="fas fa-wind"></i>
                <span>${current.wind_kph} km/h</span>
            </div>
            <div class="weather-detail-item">
                <i class="fas fa-tint"></i>
                <span>${current.humidity}%</span>
            </div>
        </div>
        <div class="weather-forecast">
            ${generateForecastHTML(data.forecast.forecastday)}
        </div>
    `;
}

// Generate HTML for forecast
function generateForecastHTML(forecastDays) {
    return forecastDays.slice(1, 3).map(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        return `
            <div class="forecast-day">
                <div class="forecast-date">${dayName}</div>
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                <div class="forecast-temp">${day.day.avgtemp_c}°C</div>
            </div>
        `;
    }).join('');
}

// Create weather widget container
function createWeatherWidget() {
    const weatherWidget = document.createElement('div');
    weatherWidget.id = 'weatherWidget';
    weatherWidget.className = 'weather-widget';
    
    // Find where to insert the weather widget (after today-stats)
    const todayStats = document.querySelector('.today-stats');
    if (todayStats) {
        todayStats.parentNode.insertBefore(weatherWidget, todayStats.nextSibling);
    } else {
        const sidebar = document.querySelector('.sidebar');
        sidebar.appendChild(weatherWidget);
    }
    
    return weatherWidget;
}

// Display error message
function displayWeatherError() {
    let weatherContainer = document.getElementById('weatherWidget');
    if (!weatherContainer) {
        weatherContainer = createWeatherWidget();
    }
    
    weatherContainer.innerHTML = `
        <div class="weather-error">
            <i class="fas fa-cloud-rain"></i>
            <p>Unable to load weather data</p>
        </div>
    `;
}

// Initialize weather data when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the main app page (not login)
    if (document.querySelector('.sidebar')) {
        // Get weather data
        getWeatherData();
        
        // Refresh weather data every 30 minutes
        setInterval(getWeatherData, 30 * 60 * 1000);
    }
});