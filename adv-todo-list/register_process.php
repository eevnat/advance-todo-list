<?php
session_start();
require_once 'config.php';

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $google_id = filter_input(INPUT_POST, 'google_id', FILTER_SANITIZE_STRING);
    $google_picture = filter_input(INPUT_POST, 'google_picture', FILTER_SANITIZE_URL);
    
    // Validate inputs
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        $_SESSION['error'] = "Please fill in all required fields";
        header("Location: login.html?tab=register");
        exit;
    }
    
    if ($password !== $confirm_password) {
        $_SESSION['error'] = "Passwords do not match";
        header("Location: login.html?tab=register");
        exit;
    }
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            $_SESSION['error'] = "Email already registered. Please login instead.";
            header("Location: login.html");
            exit;
        }
        
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        if (!empty($google_id)) {
            // User registering with Google data
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, google_id, profile_picture, created_at) 
                                  VALUES (?, ?, ?, ?, ?, NOW())");
            $result = $stmt->execute([$name, $email, $hashed_password, $google_id, $google_picture]);
        } else {
            // Standard registration
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())");
            $result = $stmt->execute([$name, $email, $hashed_password]);
        }
        
        if ($result) {
            // Get the user ID
            $user_id = $pdo->lastInsertId();
            
            // Set session variables
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['logged_in'] = true;
            
            // Clear any Google data in session storage
            echo "<script>sessionStorage.removeItem('googleData');</script>";
            
            // Redirect to application
            header("Location: index.html");
            exit;
        } else {
            $_SESSION['error'] = "Registration failed";
            header("Location: login.html?tab=register");
            exit;
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
        header("Location: login.html?tab=register");
        exit;
    }
} else {
    // Not a POST request, redirect to login page
    header("Location: login.html");
    exit;
}
?>