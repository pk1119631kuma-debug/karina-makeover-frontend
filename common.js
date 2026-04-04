/* ====================================
   COMMON FUNCTIONALITY
==================================== */

const API_BASE_URL = 'http://localhost:5000/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    updateCartCount();
    initializeProfileNavigation();
});

// Set minimum date for booking
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
});

// Get user from localStorage
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Set user in localStorage
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Initialize Profile Navigation
function initializeProfileNavigation() {
    const user = getUser();
    const signInLink = document.getElementById('signInLink');
    const profileSection = document.getElementById('profileSection');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        // User is logged in
        if (signInLink) signInLink.style.display = 'none';
        if (profileSection) profileSection.style.display = 'flex';
        if (profileName) profileName.textContent = user.name || user.email.split('@')[0];
        if (profileEmail) profileEmail.textContent = user.email;

        // Toggle profile dropdown
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (profileDropdown) {
                    profileDropdown.classList.toggle('active');
                }
            });
        }

        // Close dropdown when link is clicked
        const profileLinks = profileDropdown?.querySelectorAll('a');
        profileLinks?.forEach(link => {
            link.addEventListener('click', () => {
                if (profileDropdown) {
                    profileDropdown.classList.remove('active');
                }
            });
        });
    } else {
        // User is not logged in
        if (signInLink) signInLink.style.display = 'block';
        if (profileSection) profileSection.style.display = 'none';
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Mobile Menu Toggle
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// Simple Animation on Scroll
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('[data-aos]').forEach(element => {
        observer.observe(element);
    });
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Cart Management - LocalStorage
function addToCart(productName, price, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === productName);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productName,
            name: productName,
            price: price,
            quantity: quantity,
            image: 'https://via.placeholder.com/100?text=Product'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Item added to cart!');
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartItemQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }
    updateCartCount();
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems > 0 ? totalItems : '0';
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

// Notification System
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? '✓' : '✕'} ${message}
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// API Helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 300);
    }
});

// Format Price
function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

// Add CSS animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Prevent form submission on Enter in certain fields
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'text') {
        e.preventDefault();
    }
});
