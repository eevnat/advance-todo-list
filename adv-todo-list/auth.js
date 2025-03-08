document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signupBtn = document.getElementById('signupBtn');
    const authOverlay = document.getElementById('authOverlay');
    const closeAuth = document.getElementById('closeAuth');
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    const googleSignInWrapper = document.getElementById('googleSignInWrapper');
    
    // Show auth overlay when Sign Up button is clicked
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            authOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
    
    // Close auth overlay
    if (closeAuth) {
        closeAuth.addEventListener('click', function() {
            authOverlay.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }
    
    // Close auth overlay when clicking outside the auth container
    authOverlay.addEventListener('click', function(e) {
        if (e.target === authOverlay) {
            authOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to selected tab and form
            tab.classList.add('active');
            document.getElementById(tabId + 'Form').classList.add('active');
        });
    });

    // Form validation for register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                const authError = document.getElementById('authError');
                authError.innerHTML = '<div class="error-message">Passwords do not match!</div>';
            }
        });
    }
    
    // Handle Google Sign In buttons
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            // Show the hidden Google Sign In button and programmatically click it
            googleSignInWrapper.style.display = 'block';
            // Use setTimeout to ensure the button is rendered
            setTimeout(() => {
                const googleButton = document.querySelector('.g_id_signin div[role=button]');
                if (googleButton) {
                    googleButton.click();
                }
            }, 100);
        });
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', function() {
            // Show the hidden Google Sign In button and programmatically click it
            googleSignInWrapper.style.display = 'block';
            // Use setTimeout to ensure the button is rendered
            setTimeout(() => {
                const googleButton = document.querySelector('.g_id_signin div[role=button]');
                if (googleButton) {
                    googleButton.click();
                }
            }, 100);
        });
    }
    
    // Check login status on page load
    checkLoginStatus();
});

// Check if user is logged in
function checkLoginStatus() {
    fetch('check_login.php')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                // User is logged in
                document.getElementById('userGreeting').textContent = 'Hey, ' + data.user_name;
                document.getElementById('signupBtn').textContent = 'Logout';
                document.getElementById('signupBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'logout.php';
                });
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

// Google Sign-In callback function
function handleGoogleLogin(response) {
    // Hide the Google wrapper again
    document.getElementById('googleSignInWrapper').style.display = 'none';
    
    // Send the ID token to the server
    const token = response.credential;
    
    // Create a form to submit the token to the server
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'google_auth.php';
    
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'google_token';
    tokenInput.value = token;
    
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
}