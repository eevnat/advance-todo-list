<?php
// This proxy script helps avoid exposing your API key in the frontend
// It also handles caching to reduce the number of API calls

session_start();

// API Constants
define('WEATHER_API_KEY', '8f5841daa1994e2881c64308250803'); // Replace with your actual API key
define('CACHE_DURATION', 1800); // Cache duration in seconds (30 minutes)

// Get query parameters
$query = $_GET['q'] ?? null;
$days = $_GET['days'] ?? 3;

// Validate input
if (!$query) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing location parameter']);
    exit;
}

// Cache key
$cacheKey = 'weather_' . md5($query . '_' . $days);

// Check if we have cached data
if (isset($_SESSION[$cacheKey]) && 
    $_SESSION[$cacheKey]['timestamp'] > (time() - CACHE_DURATION)) {
    // Return cached data
    header('Content-Type: application/json');
    echo json_encode($_SESSION[$cacheKey]['data']);
    exit;
}

// Build API URL
$apiUrl = 'https://api.weatherapi.com/v1/forecast.json?' . http_build_query([
    'key' => WEATHER_API_KEY,
    'q' => $query,
    'days' => $days,
    'aqi' => 'no',
    'alerts' => 'no'
]);

// Make API request
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json']
]);

$response = curl_exec($curl);
$err = curl_error($curl);
$statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Handle errors
if ($err) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL Error: ' . $err]);
    exit;
}

// Forward API response status and data
http_response_code($statusCode);
header('Content-Type: application/json');

// Cache successful responses
if ($statusCode == 200) {
    $data = json_decode($response, true);
    $_SESSION[$cacheKey] = [
        'timestamp' => time(),
        'data' => $data
    ];
}

echo $response;
?>