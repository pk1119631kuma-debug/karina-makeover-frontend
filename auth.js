/* ====================================
   AUTHENTICATION JAVASCRIPT
==================================== */

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPages();
});

function initializeAuthPages() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);

        // Password strength indicator
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }

    if (!password) {
        showNotification('Password is required', 'error');
        return;
    }

    // Call backend API
    fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
            return;
        }

        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        showNotification('Login successful!', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    });
}

function handleRegister(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const name = `${firstName} ${lastName}`.trim();
    const email = document.getElementById('registerEmail')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const termsCheckbox = document.getElementById('termsRegister');

    // Validations
    if (!firstName || firstName.length < 2) {
        showNotification('First name must be at least 2 characters', 'error');
        return;
    }

    if (!lastName || lastName.length < 2) {
        showNotification('Last name must be at least 2 characters', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (!termsCheckbox || !termsCheckbox.checked) {
        showNotification('Please accept terms and conditions', 'error');
        return;
    }

    // Call backend API
    fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
            return;
        }

        // Save token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        showNotification('Registration successful! Welcome to Karina Makeover', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    });
}

function updatePasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthLevel = strengthDiv.querySelector('.strength-level');
    const strengthText = strengthDiv.querySelector('.strength-text');

    if (!password) {
        strengthDiv.classList.remove('show');
        return;
    }

    strengthDiv.classList.add('show');

    let strength = 0;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;
    if (password.length >= 12) strength++;

    let levelClass = '';
    let levelText = '';

    if (strength <= 1) {
        levelClass = '';
        levelText = 'Weak';
        strengthLevel.style.width = '25%';
        strengthLevel.style.background = '#e74c3c';
    } else if (strength === 2) {
        levelClass = 'medium';
        levelText = 'Fair';
        strengthLevel.style.width = '50%';
        strengthLevel.style.background = '#f39c12';
    } else if (strength === 3) {
        levelClass = 'strong';
        levelText = 'Good';
        strengthLevel.style.width = '75%';
        strengthLevel.style.background = '#f1c40f';
    } else {
        levelClass = 'very-strong';
        levelText = 'Strong';
        strengthLevel.style.width = '100%';
        strengthLevel.style.background = '#2ecc71';
    }

    strengthText.textContent = levelText;
}

function togglePasswordVisibility(button) {
    const input = button.previousElementSibling;
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? '🙈' : '👁️';
}

// Social login handlers (mock)
function loginWithGoogle() {
    showNotification('Google login is not configured. Use email/password login.', 'error');
}

function loginWithFacebook() {
    showNotification('Facebook login is not configured. Use email/password login.', 'error');
}

function signupWithGoogle() {
    showNotification('Google signup is not configured. Use email/password signup.', 'error');
}

function signupWithFacebook() {
    showNotification('Facebook signup is not configured. Use email/password signup.', 'error');
}
