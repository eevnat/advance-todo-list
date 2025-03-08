<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'doit_app');
define('DB_USER', 'root'); // Change this
define('DB_PASS', ''); // Change this

// Google OAuth configuration
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID'); // Replace with your Google Client ID

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1); // Enable on HTTPS
?>