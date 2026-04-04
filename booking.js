/* ====================================
   BOOKING PAGE JAVASCRIPT
==================================== */

const API_BASE_URL = 'http://localhost:5000/api';
let currentStep = 1;
let servicesData = [];

const formData = {
    fullName: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    occasion: '',
    skinType: '',
    allergies: '',
    specialRequests: ''
};

// Load services on page load
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/services`);
        const data = await response.json();
        servicesData = Array.isArray(data) ? data : [];
        
        const serviceSelect = document.getElementById('service');
        if (serviceSelect && servicesData.length > 0) {
            serviceSelect.innerHTML = '<option value="">Choose a service</option>' + 
                servicesData.map(service => 
                    `<option value="${service.id}" data-price="${service.price}">${service.name} - ₹${parseInt(service.price).toLocaleString('en-IN')}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadServices();
    initializeBookingForm();
});

function initializeBookingForm() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }

    // Add event listeners to form inputs
    document.querySelectorAll('.form-step input, .form-step select, .form-step textarea').forEach(field => {
        field.addEventListener('change', function() {
            formData[this.name] = this.value;
        });
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function nextStep(step) {
    // Validate current step
    if (!validateStep(step)) {
        return;
    }

    // Hide current step
    document.getElementById(`step-${step}`).classList.remove('active');

    // Show next step
    const nextStep = step + 1;
    if (document.getElementById(`step-${nextStep}`)) {
        document.getElementById(`step-${nextStep}`).classList.add('active');
        updateProgress(nextStep);
        
        if (nextStep === 4) {
            updateSummary();
        }
    }
}

function prevStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    document.getElementById(`step-${step - 1}`).classList.add('active');
    updateProgress(step - 1);
}

function updateProgress(step) {
    document.querySelectorAll('.progress-item').forEach((item, index) => {
        if (index + 1 <= step) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function validateStep(step) {
    let isValid = true;

    if (step === 1) {
        isValid = validateField(document.getElementById('fullName')) &&
                  validateField(document.getElementById('email')) &&
                  validateField(document.getElementById('phone'));
    } else if (step === 2) {
        isValid = validateField(document.getElementById('service')) &&
                  validateField(document.getElementById('date')) &&
                  validateField(document.getElementById('time'));
    }

    return isValid;
}

function validateField(field) {
    if (!field) return true;

    const name = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';

    if (!value) {
        errorMsg = 'This field is required';
        isValid = false;
    } else if (name === 'email' && !validateEmail(value)) {
        errorMsg = 'Please enter a valid email address';
        isValid = false;
    } else if (name === 'phone' && !validatePhone(value)) {
        errorMsg = 'Please enter a valid 10-digit phone number';
        isValid = false;
    } else if (name === 'fullName' && value.length < 3) {
        errorMsg = 'Name must be at least 3 characters';
        isValid = false;
    }

    // Show/hide error message
    const errorElement = document.getElementById(`${name}Error`);
    if (errorElement) {
        if (isValid) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        } else {
            errorElement.textContent = errorMsg;
            errorElement.classList.add('show');
        }
    }

    return isValid;
}

function updateServicePrice() {
    const serviceSelect = document.getElementById('service');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const priceText = selectedOption.text;

    // Extract price from text like "Bridal Makeup - ₹7,999"
    formData.service = selectedOption.value;
}

function updateSummary() {
    const service = servicesData.find(s => s.id === parseInt(formData.service)) || 
                   { name: 'Service', price: 0 };

    // Format date
    const date = new Date(formData.date);
    const dateString = date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Update review section
    document.getElementById('reviewName').textContent = formData.fullName;
    document.getElementById('reviewEmail').textContent = formData.email;
    document.getElementById('reviewPhone').textContent = formData.phone;
    document.getElementById('reviewService').textContent = service.name;
    document.getElementById('reviewDateTime').textContent = `${dateString} at ${formData.time}`;
    document.getElementById('reviewPrice').textContent = `₹${service.price.toLocaleString('en-IN')}`;
}

function handleBookingSubmit(e) {
    e.preventDefault();

    const user = getUser();
    if (!user) {
        showNotification('Please login first to make a booking', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Collect booking data
    const bookingData = {
        service_id: parseInt(formData.service),
        booking_date: formData.date,
        booking_time: formData.time,
        special_requests: formData.specialRequests,
        skin_type: formData.skinType,
        allergies: formData.allergies
    };

    // Submit to backend
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
            return;
        }

        showNotification('✅ Booking confirmed! Check your email for details.', 'success');

        // Reset form and redirect
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    })
    .catch(error => {
        console.error('Booking error:', error);
        showNotification('Failed to create booking. Please try again.', 'error');
    });
}

// Format time display
function formatTime(time) {
    const hour = parseInt(time.split(':')[0]);
    const minute = time.split(':')[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minute} ${ampm}`;
}

// Initialize with progress
document.addEventListener('DOMContentLoaded', function() {
    updateProgress(1);
});
