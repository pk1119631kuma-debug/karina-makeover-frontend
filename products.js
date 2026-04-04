/* ====================================
   PRODUCTS PAGE JAVASCRIPT
==================================== */

const API_BASE_URL = 'http://localhost:5000/api';

let allProducts = [];
let filteredProducts = [];
let isAdmin = false;
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();
    renderProducts();
});

function checkAdminStatus() {
    const user = getUser();
    isAdmin = user && (user.role === 'admin' || user.is_admin === true);
    
    // Show add product button for admins
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.style.display = isAdmin ? 'block' : 'none';
    }
}

async function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        // Fetch products from backend API
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        allProducts = Array.isArray(data) ? data : [];
        filteredProducts = [...allProducts];

        if (filteredProducts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products found</p>';
            return;
        }

        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" onclick="openProductModal(${product.id})">
                ${isAdmin ? `
                    <div class="product-card-actions" onclick="event.stopPropagation();">
                        <button class="btn-admin btn-edit" onclick="editProduct(${product.id})">✏️ Edit</button>
                        <button class="btn-admin btn-delete" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                    </div>
                ` : ''}
                <img src="${product.image_url || 'https://via.placeholder.com/200?text=Product'}" alt="${product.name}" class="product-image">
                <span class="product-badge">New</span>
                <div class="product-content">
                    <span class="product-category">${product.category || 'Makeup'}</span>
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-rating">⭐ ${product.rating || 4.5} (${product.reviews_count || 0})</div>
                    <div class="product-footer">
                        <span class="product-price">₹${parseInt(product.price).toLocaleString('en-IN')}</span>
                        <button class="btn-add-cart" onclick="addProductToCart(event, ${product.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e74c3c;">Error loading products. Please try again.</p>';
    }
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const price = document.getElementById('priceFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || '';

    filteredProducts = allProducts.filter(product => {
        // Search filter
        if (searchInput && !product.name.toLowerCase().includes(searchInput)) {
            return false;
        }

        // Category filter
        if (category && product.category !== category) {
            return false;
        }

        // Price filter
        if (price) {
            const [min, max] = price.split('-');
            const productPrice = product.price;
            if (max === '+') {
                if (productPrice < parseInt(min)) return false;
            } else {
                if (productPrice < parseInt(min) || productPrice > parseInt(max)) return false;
            }
        }

        return true;
    });

    // Sorting
    if (sort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts();
}

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Populate modal
    document.getElementById('modalImage').src = product.image_url || 'https://via.placeholder.com/400?text=Product';
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalRating').textContent = `⭐ ${product.rating}`;
    document.getElementById('modalReviews').textContent = `(${product.reviews} reviews)`;
    document.getElementById('modalPrice').textContent = `₹${product.price}`;
    document.getElementById('modalDescription').textContent = `Premium quality ${product.name} for professional makeup application. Long-lasting formula with excellent pigmentation.`;

    // Features
    const features = [
        'Long-lasting formula',
        'Hypoallergenic ingredients',
        'Suitable for sensitive skin',
        'Professional quality',
        'Cruelty-free product'
    ];
    document.getElementById('modalFeatures').innerHTML = features.map(f => `<li>${f}</li>`).join('');

    // Reset quantity
    document.getElementById('quantityInput').value = 1;

    // Store current product for cart addition
    window.currentProduct = product;

    openModal('productModal');
}

function closeProductModal() {
    closeModal('productModal');
}

// Admin Product Management
function openAddProductModal() {
    if (!isAdmin) {
        showNotification('Only admins can add products', 'error');
        return;
    }
    
    editingProductId = null;
    document.getElementById('addProductTitle').textContent = 'Add New Product';
    document.getElementById('addProductForm').reset();
    openModal('addProductModal');
}

function closeAddProductModal() {
    closeModal('addProductModal');
    editingProductId = null;
}

function editProduct(productId) {
    if (!isAdmin) {
        showNotification('Only admins can edit products', 'error');
        return;
    }

    event.stopPropagation();
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('addProductTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImageUrl').value = product.image_url || '';
    document.getElementById('productRating').value = product.rating || '';
    document.getElementById('productStock').value = product.stock || '';

    openModal('addProductModal');
}

async function handleAddProduct(event) {
    event.preventDefault();

    if (!isAdmin) {
        showNotification('Only admins can manage products', 'error');
        return;
    }

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image_url: document.getElementById('productImageUrl').value,
        rating: parseFloat(document.getElementById('productRating').value) || 4.5,
        stock: parseInt(document.getElementById('productStock').value) || 0
    };

    // Validation
    if (!productData.name || !productData.category || !productData.price) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    try {
        const token = getToken();
        const url = editingProductId 
            ? `${API_BASE_URL}/products/${editingProductId}`
            : `${API_BASE_URL}/products`;
        
        const method = editingProductId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || `Failed to ${editingProductId ? 'update' : 'add'} product`, 'error');
            return;
        }

        showNotification(`Product ${editingProductId ? 'updated' : 'added'} successfully!`, 'success');
        closeAddProductModal();
        renderProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product. Please try again.', 'error');
    }
}

async function deleteProduct(productId) {
    if (!isAdmin) {
        showNotification('Only admins can delete products', 'error');
        return;
    }

    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.error || 'Failed to delete product', 'error');
            return;
        }

        showNotification('Product deleted successfully!', 'success');
        renderProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product. Please try again.', 'error');
    }
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addProductToCart(event, productId) {
    if (event) event.stopPropagation();

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    addToCart(product.name, product.price, 1);
    closeProductModal();
}

// Alternative add to cart from modal
function addProductToCart() {
    if (!window.currentProduct) return;

    const quantity = parseInt(document.getElementById('quantityInput').value);
    addToCart(window.currentProduct.name, window.currentProduct.price, quantity);
    closeProductModal();
}
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalRating').textContent = `⭐ ${product.rating}`;
    document.getElementById('modalReviews').textContent = `(${product.reviews} reviews)`;
    document.getElementById('modalPrice').textContent = `₹${product.price}`;
    document.getElementById('modalDescription').textContent = `Premium quality ${product.name} for professional makeup application. Long-lasting formula with excellent pigmentation.`;

    // Features
    const features = [
        'Long-lasting formula',
        'Hypoallergenic ingredients',
        'Suitable for sensitive skin',
        'Professional quality',
        'Cruelty-free product'
    ];
    document.getElementById('modalFeatures').innerHTML = features.map(f => `<li>${f}</li>`).join('');

    // Reset quantity
    document.getElementById('quantityInput').value = 1;

    // Store current product for cart addition
    window.currentProduct = product;

    openModal('productModal');
}

function closeProductModal() {
    closeModal('productModal');
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addProductToCart(event, productId) {
    if (event) event.stopPropagation();

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    addToCart(product.name, product.price, 1);
    closeProductModal();
}

// Alternative add to cart from modal
function addProductToCart() {
    if (!window.currentProduct) return;

    const quantity = parseInt(document.getElementById('quantityInput').value);
    addToCart(window.currentProduct.name, window.currentProduct.price, quantity);
    closeProductModal();
}
