// Estado de la aplicación
let currentCategory = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const categoriesView = document.getElementById('categoriesView');
const productsView = document.getElementById('productsView');
const categoryCards = document.querySelectorAll('.category-card');
const backBtn = document.getElementById('backBtn');
const currentCategoryDisplay = document.getElementById('currentCategory');
const productsContainer = document.getElementById('productsContainer');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeModal = document.getElementById('closeModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const closeProductModal = document.getElementById('closeProductModal');
const productModalContent = document.getElementById('productModalContent');
const cartFloat = document.getElementById('cartFloat');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    setupEventListeners();
    showCategoriesView();
    initFirebase();
});

// Event Listeners
function setupEventListeners() {
    // Selección de categoría desde la vista inicial
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            selectCategory(category);
        });
    });

    // Botón para volver a categorías
    backBtn.addEventListener('click', () => {
        showCategoriesView();
    });

    // Carrito
    cartButton.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    closeProductModal.addEventListener('click', () => {
        productModal.classList.remove('active');
    });

    checkoutBtn.addEventListener('click', sendToWhatsApp);

    // Cerrar modal al hacer clic fuera
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('active');
        }
    });
}

// Mostrar vista de categorías
function showCategoriesView() {
    categoriesView.style.display = 'block';
    productsView.style.display = 'none';
    currentCategory = null;
    // Ocultar carrito flotante cuando volvemos a categorías
    cartFloat.style.display = 'none';
    updateCartUI();
}

// Seleccionar categoría y mostrar productos
function selectCategory(category) {
    currentCategory = category;
    categoriesView.style.display = 'none';
    productsView.style.display = 'block';
    
    // Actualizar display de categoría actual
    const categoryName = category === 'tenderos' ? 'Tenderos' : 'Restaurantes';
    const categoryDesc = category === 'tenderos' ? 'Productos por docena' : 'Productos por libras';
    const categoryIcon = category === 'tenderos' ? '🏪' : '🍽️';
    
    currentCategoryDisplay.innerHTML = `
        <div class="current-category-content">
            <span class="current-category-icon">${categoryIcon}</span>
            <div class="current-category-info">
                <h2 class="current-category-name">${categoryName}</h2>
                <p class="current-category-desc">${categoryDesc}</p>
            </div>
        </div>
    `;
    
    // Cargar productos
    loadProducts();
    
    // Actualizar UI del carrito (mostrar si hay productos)
    updateCartUI();
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cargar productos
function loadProducts() {
    const categoryProducts = products[currentCategory];
    productsContainer.innerHTML = '';

    if (categoryProducts.length === 0) {
        productsContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--gray);">No hay productos disponibles</p>';
        return;
    }

    categoryProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const quantity = getCartQuantity(product.id);
    
    card.innerHTML = `
        <div class="product-image">${productImageMarkup(product.image, product.name)}</div>
        <div class="product-info">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">$${formatPrice(product.price)}</div>
            <div class="product-unit">Por ${escapeHtml(product.unit)}</div>
            <div class="product-actions">
                ${quantity > 0 ? `
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="decreaseQuantity(${product.id})">-</button>
                        <span class="quantity-value">${quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${product.id})">+</button>
                    </div>
                ` : `
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Agregar
                    </button>
                `}
            </div>
        </div>
    `;
    
    return card;
}

// Funciones del carrito
function addToCart(productId) {
    const product = products[currentCategory].find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId && item.category === currentCategory);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    loadProducts();
    
    // Animación
    cartButton.classList.add('pulse');
    setTimeout(() => cartButton.classList.remove('pulse'), 500);
}

function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId && item.category === currentCategory);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
        loadProducts();
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId && item.category === currentCategory);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
            loadProducts();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => !(item.id === productId && item.category === currentCategory));
    saveCart();
    updateCartUI();
    loadProducts();
}

function removeFromCartModal(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    if (currentCategory) {
        loadProducts();
    }
}

function getCartQuantity(productId) {
    const item = cart.find(item => item.id === productId && item.category === currentCategory);
    return item ? item.quantity : 0;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${formatPrice(totalPrice)}`;
    
    // Mostrar/ocultar carrito flotante solo si hay productos y estamos en vista de productos
    if (totalItems > 0 && currentCategory !== null) {
        cartFloat.style.display = 'block';
    } else {
        cartFloat.style.display = 'none';
    }

    // Actualizar items del carrito
    updateCartItems();
}

function updateCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">Tu carrito está vacío</div>
            </div>
        `;
        checkoutBtn.disabled = true;
        return;
    }

    checkoutBtn.disabled = false;
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${productImageMarkup(item.image, item.name)}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-details">${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''}</div>
                <div class="cart-item-price">$${formatPrice(item.price * item.quantity)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="cart-item-remove" onclick="removeFromCartModal(${item.id})">×</button>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="decreaseCartQuantity(${item.id})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseCartQuantity(${item.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function increaseCartQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

function decreaseCartQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCartModal(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Enviar a WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) return;

    const phoneNumber = '+573217733629';
    
    // Agrupar productos por categoría
    const tenderosItems = cart.filter(item => item.category === 'tenderos');
    const restaurantesItems = cart.filter(item => item.category === 'restaurantes');
    
    let message = `🍽️ *PEDIDO - CAMARGO DISTRIBUIDORA DE CONDIMENTOS*\n\n`;
    
    if (tenderosItems.length > 0) {
        message += `📋 *CATEGORÍA: TENDEROS (Por docena)*\n\n`;
        tenderosItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Cantidad: ${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''}\n`;
            message += `   Precio unitario: $${formatPrice(item.price)}\n`;
            message += `   Subtotal: $${formatPrice(item.price * item.quantity)}\n`;
            if (index < tenderosItems.length - 1 || restaurantesItems.length > 0) {
                message += `------------\n`;
            }
        });
    }
    
    if (restaurantesItems.length > 0) {
        if (tenderosItems.length > 0) message += `\n`;
        message += `📋 *CATEGORÍA: RESTAURANTES (Por libras)*\n\n`;
        restaurantesItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Cantidad: ${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''}\n`;
            message += `   Precio unitario: $${formatPrice(item.price)}\n`;
            message += `   Subtotal: $${formatPrice(item.price * item.quantity)}\n`;
            if (index < restaurantesItems.length - 1) {
                message += `------------\n`;
            }
        });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `💰 *TOTAL: $${formatPrice(total)}*\n\n`;
    message += `Presiona enviar para finalizar tu pedido! 📤`;

    const encodedMessage = encodeURIComponent(message);
    // wa.me requiere el número sin el +, solo con código de país
    const whatsappNumber = phoneNumber.replace('+', '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isHttpUrl(value) {
    return typeof value === 'string' && /^https:\/\//i.test(value);
}

function productImageMarkup(image, alt) {
    if (isHttpUrl(image)) {
        return `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt || '')}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🌶️'}))">`;
    }
    return escapeHtml(image || '🌶️');
}

function applyRemoteProduct(data) {
    if (!data || (data.category !== 'tenderos' && data.category !== 'restaurantes')) return false;
    const id = Number(data.id);
    const list = products[data.category];
    const index = list.findIndex((product) => product.id === id);
    if (index === -1) return false;
    const price = Number(data.price);
    const current = list[index];
    list[index] = {
        ...current,
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : current.name,
        price: Number.isFinite(price) && price >= 0 ? price : current.price,
        image: typeof data.image === 'string' && data.image.trim() ? data.image.trim() : current.image,
        imageLink: typeof data.imageLink === 'string' ? data.imageLink : (current.imageLink || '')
    };
    return true;
}

function syncCartWithCatalog() {
    let changed = false;
    cart = cart.map((item) => {
        const source = products[item.category]?.find((product) => product.id === item.id);
        if (!source) return item;
        if (source.name === item.name && source.price === item.price && source.image === item.image) return item;
        changed = true;
        return { ...item, name: source.name, price: source.price, image: source.image, unit: source.unit };
    });
    if (changed) saveCart();
}

function refreshVisibleProducts() {
    if (currentCategory) loadProducts();
    updateCartUI();
}

function catalogFirebaseReady() {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') return false;
    const apiKey = firebaseConfig.apiKey;
    const projectId = firebaseConfig.projectId;
    if (!apiKey || !projectId) return false;
    return !String(apiKey).startsWith('TU_') && !String(projectId).startsWith('TU_');
}

function initFirebase() {
    if (!catalogFirebaseReady()) return;
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    firebase.firestore().collection('products').onSnapshot((snapshot) => {
        snapshot.forEach((doc) => applyRemoteProduct(doc.data()));
        syncCartWithCatalog();
        refreshVisibleProducts();
    }, (error) => {
        console.error('No se pudo leer el catálogo:', error);
    });
}
