<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.html");
    exit;
}

// Get the HTML content
$html_content = file_get_contents('index.html');

// Replace user information in the HTML
$user_name = $_SESSION['user_name'] ?? 'User';
$html_content = str_replace('Hey, ABCD', 'Hey, ' . htmlspecialchars($user_name), $html_content);

// Output modified HTML
echo $html_content;
?>