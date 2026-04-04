/* ====================================
   SMS & NOTIFICATION SERVICE
==================================== */

// SMS Service - Simulates sending SMS to user's phone
async function sendSMS(phone, message) {
    try {
        // In production, this would call a backend API (Twilio, AWS SNS, etc.)
        // For demo, we'll simulate sending SMS
        
        const smsData = {
            phone: phone,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Save SMS log to localStorage
        let smsLog = JSON.parse(localStorage.getItem('smsLog')) || [];
        smsLog.push(smsData);
        localStorage.setItem('smsLog', JSON.stringify(smsLog));

        // Log to console for debugging
        console.log('📱 SMS Sent:', { phone, message });

        return true;
    } catch (error) {
        console.error('SMS Error:', error);
        return false;
    }
}

// Send order confirmation SMS
function sendOrderConfirmationSMS(phone, orderData) {
    const message = `✅ ORDER CONFIRMED! Your order #${orderData.orderId} is confirmed. Total: ₹${orderData.total}. We'll deliver within 3-5 business days. Thank you for shopping at Karina Makeover! 🎁`;
    sendSMS(phone, message);
}

// Send booking confirmation SMS
function sendBookingConfirmationSMS(phone, bookingData) {
    const serviceMap = {
        'bridal': 'Bridal Makeup',
        'party': 'Party Makeup',
        'engagement': 'Engagement Makeup',
        'birthday': 'Birthday Makeup'
    };

    const serviceName = serviceMap[bookingData.service] || 'Makeup Service';
    const message = `✅ BOOKING CONFIRMED! Your ${serviceName} is booked for ${bookingData.date} at ${bookingData.time}. Karina will be there on time! Contact: +91 98765 43210. Thank you! 💄`;
    sendSMS(phone, message);
}

// Send order status update SMS
function sendOrderStatusSMS(phone, orderId, status) {
    const statusMessages = {
        'processing': '⏳ Your order is being processed.',
        'shipped': '📦 Your order has been shipped!',
        'delivered': '✅ Your order has been delivered. Thank you! 🙏',
        'cancelled': '❌ Your order has been cancelled.'
    };

    const message = `${statusMessages[status] || 'Order status updated.'} Order ID: ${orderId}. -Karina Makeover`;
    sendSMS(phone, message);
}

// Send booking reminder SMS (24 hours before)
function sendBookingReminderSMS(phone, bookingData) {
    const serviceMap = {
        'bridal': 'Bridal Makeup',
        'party': 'Party Makeup',
        'engagement': 'Engagement Makeup',
        'birthday': 'Birthday Makeup'
    };

    const serviceName = serviceMap[bookingData.service] || 'Makeup Service';
    const message = `⏰ REMINDER: Your ${serviceName} booking is tomorrow at ${bookingData.time}. Karina is looking forward to making you beautiful! 💄✨`;
    sendSMS(phone, message);
}

// Verify phone number format
function isValidPhoneForSMS(phone) {
    // Indian phone number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Format phone number to Indian format
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }
    return phone;
}
