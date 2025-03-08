// Secure Weather API Integration for DoIt App
// This version uses the PHP proxy to hide the API key

// Function to get weather data based on user's location
async function getWeatherData() {
    try {
        // First try to get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Fetch weather data using coordinates via proxy
        const weatherData = await fetchWeatherData(`${latitude},${longitude}`);
        
        // Display the weather information
        displayWeatherInfo(weatherData);
    } catch (error) {
        console.error('Error getting weather data:', error);
        // If geolocation fails, try with IP-based location
        try {
            const weatherData = await fetchWeatherData('auto:ip');
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

// Fetch weather data using the PHP proxy
async function fetchWeatherData(location) {
    const response = await fetch(`weather_proxy.php?q=${encodeURIComponent(location)}&days=3`);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
}

// Rest of the weather.js file remains the same
// ...