/* ====================================
   SERVICES PAGE JAVASCRIPT
==================================== */

const API_BASE_URL = 'http://localhost:5000/api';

let services = [];

document.addEventListener('DOMContentLoaded', function() {
    // Services are now loaded statically from HTML
    // renderServices();
    console.log('Services loaded from HTML');
});

async function renderServices() {
    const container = document.getElementById('servicesContainer');
    
    if (!container) return;

    try {
        // Fetch services from backend API
        const response = await fetch(`${API_BASE_URL}/services`);
        const data = await response.json();
        
        services = Array.isArray(data) ? data : [];

        if (services.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No services available</p>';
            return;
        }

        container.innerHTML = services.map(service => `
            <div class="service-card-large" data-aos="fade-up">
                <div class="service-card-image">
                    <img src="${service.image_url || 'https://via.placeholder.com/400'}" alt="${service.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="service-card-overlay"></div>
                    <div class="service-card-icon">✨</div>
                </div>
                <div class="service-card-content">
                    <h3>${service.name}</h3>
                    <p class="description">${service.description || 'Premium service for a special moment'}</p>
                    
                    <div class="service-details">
                        <p><strong>⏱️ Duration:</strong> ${service.duration || 'Varies'} ${service.duration ? 'minutes' : ''}</p>
                        <p><strong>Price:</strong> ₹${parseInt(service.price).toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div class="service-price-large">₹${parseInt(service.price).toLocaleString('en-IN')}</div>
                    
                    <div class="service-cta">
                        <a href="booking.html?service=${service.slug}" class="btn-book-service">Book Now</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading services:', error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Error loading services. Please try again.</p>';
    }
}
