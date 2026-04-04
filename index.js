/* ====================================
   INDEX PAGE JAVASCRIPT
==================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

function initializeHomePage() {
    // Initialize parallax effect
    initializeParallax();
    
    // Smooth scroll for CTA buttons
    document.querySelectorAll('a[href="#booking"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'booking.html';
        });
    });

    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Testimonial carousel auto-rotation
    initializeTestimonialCarousel();
}

// Parallax Scrolling Effect
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', function() {
        parallaxElements.forEach(element => {
            const scrollPosition = window.scrollY;
            const parallaxSpeed = element.getAttribute('data-parallax') || 0.5;
            element.style.transform = `translateY(${scrollPosition * parallaxSpeed}px)`;
        });
    });
}

// Testimonial Carousel
function initializeTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial-slide');
    let currentIndex = 0;

    if (testimonials.length === 0) return;

    function rotateTestimonials() {
        testimonials.forEach(slide => {
            slide.style.opacity = '0.5';
            slide.style.transform = 'scale(0.95)';
        });

        testimonials[currentIndex].style.opacity = '1';
        testimonials[currentIndex].style.transform = 'scale(1)';

        currentIndex = (currentIndex + 1) % testimonials.length;
    }

    // Rotate testimonials every 5 seconds
    setInterval(rotateTestimonials, 5000);
    rotateTestimonials(); // Initialize
}

// Smooth scroll behavior on page load
if (window.location.hash) {
    const id = window.location.hash.substring(1);
    const element = document.getElementById(id);
    if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// Number counter animation
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const current = 0;
        const increment = target / 20;

        let count = 0;
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                counter.textContent = target + '+';
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(count) + '+';
            }
        }, 50);
    });
}

// Call animation when section comes into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            if (entry.target.classList.contains('stats-section')) {
                animateCounters();
            }
        }
    });
});

document.querySelectorAll('.featured-services, .why-us, .testimonials').forEach(section => {
    observer.observe(section);
});
