<?php
session_start();
require_once 'config.php';
require_once 'vendor/autoload.php'; // Require Google API PHP client library

// Initialize the Google Client
$client = new Google_Client(['client_id' => GOOGLE_CLIENT_ID]);

// Get token from POST request
if (isset($_POST['google_token'])) {
    $id_token = $_POST['google_token'];
    
    try {
        // Verify token
        $payload = $client->verifyIdToken($id_token);
        
        if ($payload) {
            // Get user info from payload
            $google_id = $payload['sub'];
            $email = $payload['email'];
            $name = $payload['name'];
            $picture = $payload['picture'] ?? '';
            
            // Check if user exists in database
            $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = ? OR email = ?");
            $stmt->execute([$google_id, $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // User exists, update Google ID if not set
                if (empty($user['google_id'])) {
                    $update = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                    $update->execute([$google_id, $user['id']]);
                }
                
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['logged_in'] = true;
                
                // Redirect to application
                header("Location: index.html");
                exit;
            } else {
                // User doesn't exist, redirect to registration page with pre-filled Google data
                $_SESSION['google_data'] = [
                    'google_id' => $google_id,
                    'email' => $email,
                    'name' => $name,
                    'picture' => $picture
                ];
                
                $_SESSION['message'] = "Please complete your registration to continue.";
                header("Location: login.html?tab=register&google=1");
                exit;
            }
        } else {
            $_SESSION['error'] = "Invalid Google sign-in token.";
            header("Location: login.html");
            exit;
        }
    } catch (Exception $e) {
        $_SESSION['error'] = "Error verifying Google sign-in: " . $e->getMessage();
        header("Location: login.html");
        exit;
    }
} else {
    // No token received
    $_SESSION['error'] = "No Google sign-in token received.";
    header("Location: login.html");
    exit;
}
?>