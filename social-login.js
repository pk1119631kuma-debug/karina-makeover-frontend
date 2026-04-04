/* ====================================
   SOCIAL LOGIN SERVICE
==================================== */

// Gmail Sign-In (Mock Implementation)
function handleGoogleSignIn() {
    // In production, this would use Google OAuth
    // For demo, we'll simulate Google login
    
    const mockGoogleUsers = [
        { id: 'google-1', email: 'demo@gmail.com', name: 'Demo User', avatar: '👤' },
        { id: 'google-2', email: 'karina@gmail.com', name: 'Karina', avatar: '💄' }
    ];

    // Simulate Google login popup (in reality, would redirect to Google OAuth)
    const email = prompt('👤 Gmail Sign-In\n\nEnter your Gmail address:\n(Try: demo@gmail.com)', 'demo@gmail.com');
    
    if (!email) return;

    // Validate email format
    if (!validateEmail(email)) {
        showNotification('Please enter a valid Gmail address', 'error');
        return;
    }

    // Create user from Google
    const user = {
        id: 'google-' + Date.now(),
        email: email,
        firstName: email.split('@')[0],
        lastName: 'User',
        name: email.split('@')[0],
        provider: 'google',
        avatar: '👤',
        loginDate: new Date().toISOString()
    };

    completeSignIn(user, 'Gmail');
}

// Facebook Sign-In (Mock Implementation)
function handleFacebookSignIn() {
    // In production, this would use Facebook OAuth
    // For demo, we'll simulate Facebook login
    
    const mockFacebookUsers = [
        { id: 'fb-1', email: 'facebook@example.com', name: 'Facebook User', avatar: '👤' },
        { id: 'fb-2', email: 'karina.beauty@facebook.com', name: 'Karina Beauty', avatar: '💄' }
    ];

    // Simulate Facebook login popup
    const email = prompt('👤 Facebook Sign-In\n\nEnter your Facebook email:\n(Try: facebook@example.com)', 'facebook@example.com');
    
    if (!email) return;

    // Validate email format
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Create user from Facebook
    const user = {
        id: 'facebook-' + Date.now(),
        email: email,
        firstName: email.split('@')[0],
        lastName: 'User',
        name: email.split('@')[0],
        provider: 'facebook',
        avatar: '👤',
        loginDate: new Date().toISOString()
    };

    completeSignIn(user, 'Facebook');
}

// WhatsApp Sign-In (Mock Implementation)
function handleWhatsAppSignIn() {
    // Get phone number
    const phone = prompt('💬 WhatsApp Sign-In\n\nEnter your WhatsApp phone number:\n(Format: 10 digits, e.g., 9876543210)', '9876543210');
    
    if (!phone) return;

    // Validate phone
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    // Create user from WhatsApp
    const user = {
        id: 'whatsapp-' + Date.now(),
        email: `user${Math.random().toString(36).substr(2, 9)}@whatsapp.local`,
        firstName: 'WhatsApp User',
        lastName: 'User',
        phone: phone,
        name: 'WhatsApp User',
        provider: 'whatsapp',
        avatar: '👤',
        loginDate: new Date().toISOString()
    };

    completeSignIn(user, 'WhatsApp');
}

// Complete Social Sign-In
function completeSignIn(user, provider) {
    // Save user to localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
        // Update last login
        existingUser.lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        // Add new user
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Set current user
    setUser(user);
    localStorage.setItem('token', 'social-token-' + user.id);

    showNotification(`✅ Signed in with ${provider}! Welcome ${user.firstName}! 🎉`, 'success');

    // Redirect to home
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Set user function (if not in common.js)
function setUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}
