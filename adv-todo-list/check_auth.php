<?php
session_start();

// Function to check if user is logged in
function is_logged_in() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

// Function to redirect to login page
function redirect_to_login() {
    header("Location: login.html");
    exit;
}

// For AJAX requests requiring authentication
function json_unauthorized() {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
?>