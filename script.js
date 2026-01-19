// Datos de productos
const products = {
    tenderos: [
        {
            id: 1,
            name: "Pimienta Negra",
            price: 12000,
            unit: "docena",
            image: "🌶️",
            category: "tenderos"
        },
        {
            id: 2,
            name: "Comino",
            price: 15000,
            unit: "docena",
            image: "🌿",
            category: "tenderos"
        },
        {
            id: 3,
            name: "Ajo en Polvo",
            price: 18000,
            unit: "docena",
            image: "🧄",
            category: "tenderos"
        },
        {
            id: 4,
            name: "Cúrcuma",
            price: 20000,
            unit: "docena",
            image: "🟡",
            category: "tenderos"
        },
        {
            id: 5,
            name: "Orégano",
            price: 14000,
            unit: "docena",
            image: "🌱",
            category: "tenderos"
        },
        {
            id: 6,
            name: "Pimentón",
            price: 16000,
            unit: "docena",
            image: "🔴",
            category: "tenderos"
        },
        {
            id: 7,
            name: "Canela en Polvo",
            price: 22000,
            unit: "docena",
            image: "🟤",
            category: "tenderos"
        },
        {
            id: 8,
            name: "Clavo de Olor",
            price: 25000,
            unit: "docena",
            image: "🌰",
            category: "tenderos"
        },
        {
            id: 9,
            name: "Nuez Moscada",
            price: 28000,
            unit: "docena",
            image: "🥜",
            category: "tenderos"
        },
        {
            id: 10,
            name: "Laurel",
            price: 13000,
            unit: "docena",
            image: "🍃",
            category: "tenderos"
        },
        {
            id: 11,
            name: "Tomillo",
            price: 17000,
            unit: "docena",
            image: "🌾",
            category: "tenderos"
        },
        {
            id: 12,
            name: "Albahaca",
            price: 15000,
            unit: "docena",
            image: "🌿",
            category: "tenderos"
        }
    ],
    restaurantes: [
        {
            id: 101,
            name: "Pimienta Negra",
            price: 8500,
            unit: "libra",
            image: "🌶️",
            category: "restaurantes"
        },
        {
            id: 102,
            name: "Comino",
            price: 10000,
            unit: "libra",
            image: "🌿",
            category: "restaurantes"
        },
        {
            id: 103,
            name: "Ajo en Polvo",
            price: 12000,
            unit: "libra",
            image: "🧄",
            category: "restaurantes"
        },
        {
            id: 104,
            name: "Cúrcuma",
            price: 13500,
            unit: "libra",
            image: "🟡",
            category: "restaurantes"
        },
        {
            id: 105,
            name: "Orégano",
            price: 9500,
            unit: "libra",
            image: "🌱",
            category: "restaurantes"
        },
        {
            id: 106,
            name: "Pimentón",
            price: 11000,
            unit: "libra",
            image: "🔴",
            category: "restaurantes"
        },
        {
            id: 107,
            name: "Canela en Polvo",
            price: 15000,
            unit: "libra",
            image: "🟤",
            category: "restaurantes"
        },
        {
            id: 108,
            name: "Clavo de Olor",
            price: 17000,
            unit: "libra",
            image: "🌰",
            category: "restaurantes"
        },
        {
            id: 109,
            name: "Nuez Moscada",
            price: 19000,
            unit: "libra",
            image: "🥜",
            category: "restaurantes"
        },
        {
            id: 110,
            name: "Laurel",
            price: 9000,
            unit: "libra",
            image: "🍃",
            category: "restaurantes"
        },
        {
            id: 111,
            name: "Tomillo",
            price: 11500,
            unit: "libra",
            image: "🌾",
            category: "restaurantes"
        },
        {
            id: 112,
            name: "Albahaca",
            price: 10000,
            unit: "libra",
            image: "🌿",
            category: "restaurantes"
        },
        {
            id: 113,
            name: "Cilantro",
            price: 8800,
            unit: "libra",
            image: "🌿",
            category: "restaurantes"
        },
        {
            id: 114,
            name: "Perejil",
            price: 9200,
            unit: "libra",
            image: "🌿",
            category: "restaurantes"
        }
    ]
};

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
    // Mostrar vista de categorías inicialmente
    showCategoriesView();
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
        <div class="product-image">${product.image}</div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${formatPrice(product.price)}</div>
            <div class="product-unit">Por ${product.unit}</div>
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
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
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

