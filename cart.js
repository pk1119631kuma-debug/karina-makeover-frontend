/* ====================================
   CART PAGE JAVASCRIPT
==================================== */

document.addEventListener('DOMContentLoaded', function() {
    renderCartItems();
    updateCartCalculations();
});

function renderCartItems() {
    const cart = getCart();
    const container = document.getElementById('cartItemsList');
    const emptyMessage = document.getElementById('emptyCartMessage');

    if (!cart || cart.length === 0) {
        if (container) container.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }

    if (container) container.style.display = 'block';
    if (emptyMessage) emptyMessage.style.display = 'none';

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="item-image">
            
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-category">Premium Product</div>
                <div class="item-price">₹${item.price}</div>
            </div>
            
            <div class="item-actions">
                <div class="quantity-controls">
                    <button class="qty-btn-small" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <input type="number" class="qty-value" value="${item.quantity}" readonly>
                    <button class="qty-btn-small" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="btn-remove" onclick="removeItemFromCart('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItemFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCalculations();
        }
    }
}

function removeItemFromCart(productId) {
    removeFromCart(productId);
    renderCartItems();
    updateCartCalculations();
    showNotification('Item removed from cart', 'success');
}

function updateCartCalculations() {
    const cart = getCart();
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const tax = Math.round(subtotal * 0.18);
    const shipping = 0;
    const total = subtotal + tax + shipping;

    // Update display
    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString('en-IN')}`;
    document.getElementById('shipping').textContent = 'Free';
    document.getElementById('total').textContent = `₹${total.toLocaleString('en-IN')}`;

    // Store for checkout
    window.cartTotal = { subtotal, tax, shipping, total };
}

function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.toUpperCase();

    // Sample coupon codes
    const coupons = {
        'WELCOME10': 0.10,
        'SAVE15': 0.15,
        'BEAUTY20': 0.20
    };

    if (coupons[couponCode]) {
        const discount = window.cartTotal.subtotal * coupons[couponCode];
        const newTotal = window.cartTotal.subtotal - discount + window.cartTotal.tax;

        document.getElementById('subtotal').textContent = `₹${(window.cartTotal.subtotal - discount).toLocaleString('en-IN')}`;
        document.getElementById('total').textContent = `₹${newTotal.toLocaleString('en-IN')}`;

        showNotification(`Coupon applied! You saved ₹${discount.toLocaleString('en-IN')}`, 'success');
    } else {
        showNotification('Invalid coupon code', 'error');
    }
}

function proceedToCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    openModal('checkoutModal');
}

function closeCheckoutModal() {
    closeModal('checkoutModal');
}

async function submitOrder(event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('checkoutForm'));
    const phone = formData.get('phone') || '';
    
    const orderData = {
        items: getCart(),
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: phone,
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        paymentMethod: formData.get('payment'),
        total: window.cartTotal.total,
        orderDate: new Date().toISOString()
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderId = 'ORD-' + Date.now();
    orders.push({
        id: orderId,
        ...orderData
    });
    localStorage.setItem('orders', JSON.stringify(orders));

    // 📱 Send SMS Notification if phone number is valid
    if (isValidPhoneForSMS(phone)) {
        sendOrderConfirmationSMS(phone, {
            orderId: orderId,
            total: window.cartTotal.total
        });
        showNotification('✅ Order confirmation SMS sent to ' + phone, 'success');
    }

    // Clear cart
    clearCart();

    // Close checkout modal
    closeCheckoutModal();

    // Show success modal
    document.getElementById('orderId').textContent = orderId;
    openModal('successModal');

    // Redirect after 3 seconds
    setTimeout(() => {
        closeModal('successModal');
        window.location.href = 'index.html';
    }, 3000);
}

// Auto-close success modal on click
document.addEventListener('DOMContentLoaded', function() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                closeModal('successModal');
                window.location.href = 'index.html';
            }
        });
    }
});
