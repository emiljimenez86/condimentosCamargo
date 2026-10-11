let auth = null;
let db = null;
let editingProductId = null;
let deferredPrompt = null;

const loginView = document.getElementById('loginView');
const editorView = document.getElementById('editorView');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editImage = document.getElementById('editImage');

document.addEventListener('DOMContentLoaded', () => {
    setupInstall();
    loginForm.addEventListener('submit', signIn);
    document.getElementById('togglePassword').addEventListener('click', togglePassword);
    logoutBtn.addEventListener('click', () => auth && auth.signOut());
    editForm.addEventListener('submit', saveProduct);
    document.getElementById('closeEdit').addEventListener('click', closeEdit);
    editModal.addEventListener('click', (event) => {
        if (event.target === editModal) closeEdit();
    });
    editImage.addEventListener('input', () => updatePreview(editImage.value));
    document.getElementById('createProductBtn').addEventListener('click', openCreate);
    document.getElementById('editCategory').addEventListener('change', updateCategoryHint);
    document.getElementById('tenderosList').addEventListener('click', onEditClick);
    document.getElementById('restaurantesList').addEventListener('click', onEditClick);
    initFirebase();
});

function setupInstall() {
    const installBtn = document.getElementById('installBtn');
    const iosInstructions = document.getElementById('ios-instructions');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const installedKey = 'adminAppInstalled';

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function alreadyInstalled() {
        if (isStandalone()) {
            installBtn.style.display = 'none';
            return true;
        }
        if (localStorage.getItem(installedKey) === 'true') {
            installBtn.style.display = 'none';
            return true;
        }
        return false;
    }

    document.getElementById('closeIosInstructions').addEventListener('click', () => {
        iosInstructions.style.display = 'none';
    });

    if (!alreadyInstalled()) {
        window.addEventListener('beforeinstallprompt', (event) => {
            if (alreadyInstalled()) return;
            event.preventDefault();
            deferredPrompt = event;
            installBtn.style.display = 'block';
        });

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') localStorage.setItem(installedKey, 'true');
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });

        window.addEventListener('appinstalled', () => {
            localStorage.setItem(installedKey, 'true');
            installBtn.style.display = 'none';
            deferredPrompt = null;
        });
    }

    if (isIOS) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!isStandalone()) iosInstructions.style.display = 'flex';
            }, 2000);
        });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' }).then((registration) => {
            const controller = navigator.serviceWorker.controller;
            const adminControlsPage = controller && controller.scriptURL.includes('/admin/sw.js');
            if (registration.active && controller && !adminControlsPage && !sessionStorage.getItem('adminSwReload')) {
                sessionStorage.setItem('adminSwReload', '1');
                window.location.reload();
            }
        }).catch((error) => {
            console.log('No se pudo registrar la app admin:', error);
        });
    }
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

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

function firebaseReady() {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') return false;
    const apiKey = firebaseConfig.apiKey;
    const projectId = firebaseConfig.projectId;
    if (!apiKey || !projectId) return false;
    return !String(apiKey).startsWith('TU_') && !String(projectId).startsWith('TU_');
}

function setLoginMessage(text, type) {
    loginMessage.textContent = text || '';
    loginMessage.className = `message${type ? ` ${type}` : ''}`;
}

function setEditMessage(text, type) {
    const message = document.getElementById('editMessage');
    message.textContent = text || '';
    message.className = `message${type ? ` ${type}` : ''}`;
}

function findProduct(productId) {
    const id = Number(productId);
    for (const category of Object.keys(products)) {
        const found = products[category].find((product) => product.id === id);
        if (found) return found;
    }
    return null;
}

function extractDriveId(value) {
    if (!/drive\.google\.com|docs\.google\.com/i.test(value)) return '';
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match) return match[1];
    }
    return '';
}

function resolveImageUrl(input) {
    let value = String(input || '').trim();
    if (!value) return '';
    if (/^(www\.)?drive\.google\.com/i.test(value)) value = `https://${value}`;
    const driveId = extractDriveId(value);
    if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}`;
    if (isHttpUrl(value)) return value;
    return null;
}

function applyRemoteProduct(data) {
    if (!data || (data.category !== 'tenderos' && data.category !== 'restaurantes')) return false;
    const id = Number(data.id);
    const list = products[data.category];
    if (!list || !Number.isFinite(id)) return false;
    const price = Number(data.price);
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name || !Number.isFinite(price) || price < 0) return false;
    const index = list.findIndex((product) => product.id === id);
    const fallbackUnit = data.category === 'tenderos' ? 'docena' : 'libra';
    const next = {
        id,
        name,
        price,
        unit: typeof data.unit === 'string' && data.unit.trim() ? data.unit.trim() : fallbackUnit,
        image: typeof data.image === 'string' && data.image.trim() ? data.image.trim() : '🌶️',
        imageLink: typeof data.imageLink === 'string' ? data.imageLink : '',
        category: data.category
    };
    if (index === -1) list.push(next);
    else list[index] = { ...list[index], ...next };
    return true;
}

function renderProducts() {
    renderList('tenderosList', products.tenderos);
    renderList('restaurantesList', products.restaurantes);
}

function renderList(elementId, items) {
    document.getElementById(elementId).innerHTML = items.map((product) => `
        <article class="product-row">
            <div class="thumb">${productImageMarkup(product.image, product.name)}</div>
            <div class="product-copy">
                <h3>${escapeHtml(product.name)}</h3>
                <p>$${formatPrice(product.price)} <small>por ${escapeHtml(product.unit)}</small></p>
            </div>
            <button type="button" class="edit-btn" data-edit="${product.id}">Editar</button>
        </article>
    `).join('');
}

function showEditor(email) {
    loginView.hidden = true;
    editorView.hidden = false;
    logoutBtn.hidden = false;
    document.getElementById('sessionLine').textContent = `Sesión de ${email}`;
    renderProducts();
}

function showLogin() {
    loginView.hidden = false;
    editorView.hidden = true;
    logoutBtn.hidden = true;
    closeEdit();
}

function togglePassword() {
    const input = document.getElementById('adminPassword');
    const button = document.getElementById('togglePassword');
    const willShow = input.type === 'password';
    input.type = willShow ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(willShow));
    button.setAttribute('aria-label', willShow ? 'Ocultar contraseña' : 'Mostrar contraseña');
    button.querySelector('.eye-open').hidden = willShow;
    button.querySelector('.eye-closed').hidden = !willShow;
}

function authErrorMessage(error) {
    const code = error && error.code;
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        return 'Correo o contraseña incorrectos.';
    }
    if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    if (code === 'auth/unauthorized-domain') return 'Agrega este dominio en Firebase, Authentication, Settings, Authorized domains.';
    if (code === 'auth/network-request-failed') return 'No hay conexión con Firebase.';
    return 'No se pudo iniciar sesión.';
}

async function signIn(event) {
    event.preventDefault();
    if (!firebaseReady()) {
        setLoginMessage('Falta la configuración de Firebase.', 'error');
        return;
    }
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const button = document.getElementById('loginBtn');
    button.disabled = true;
    setLoginMessage('Entrando...');
    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('adminPassword').value = '';
        setLoginMessage('');
    } catch (error) {
        setLoginMessage(authErrorMessage(error), 'error');
    } finally {
        button.disabled = false;
    }
}

function onEditClick(event) {
    const button = event.target.closest('[data-edit]');
    if (!button) return;
    openEdit(Number(button.dataset.edit));
}

function updatePreview(value) {
    const preview = document.getElementById('editPreview');
    const trimmed = String(value || '').trim();
    if (!trimmed) {
        const product = findProduct(editingProductId);
        preview.innerHTML = productImageMarkup(product ? product.image : '🌶️', 'Vista previa');
        return;
    }
    const resolved = resolveImageUrl(trimmed);
    if (!resolved) {
        preview.textContent = 'El enlace no es válido';
        return;
    }
    preview.innerHTML = productImageMarkup(resolved, 'Vista previa');
}

function updateCategoryHint() {
    const category = document.getElementById('editCategory').value;
    document.getElementById('categoryHint').textContent = category === 'restaurantes'
        ? 'Se vende por libra.'
        : 'Se vende por docena.';
}

function setEditorMode(creating) {
    document.getElementById('editTitle').textContent = creating ? 'Nuevo producto' : 'Editar producto';
    document.getElementById('saveBtn').textContent = creating ? 'Crear producto' : 'Guardar cambios';
    document.getElementById('categoryField').hidden = !creating;
    document.getElementById('editImageHelp').textContent = creating
        ? 'Opcional. Si lo dejas vacío, el producto se muestra con un ícono.'
        : 'Si lo dejas vacío, se conserva la imagen actual.';
}

function nextProductId() {
    const used = new Set([...products.tenderos, ...products.restaurantes].map((product) => Number(product.id)));
    let id = Date.now();
    while (used.has(id)) id += 1;
    return id;
}

function removeProduct(id, category) {
    if (!products[category]) return;
    products[category] = products[category].filter((product) => product.id !== id);
}

function openCreate() {
    editingProductId = null;
    setEditorMode(true);
    document.getElementById('editCategory').value = 'tenderos';
    updateCategoryHint();
    document.getElementById('editName').value = '';
    document.getElementById('editPrice').value = '';
    editImage.value = '';
    setEditMessage('');
    updatePreview('');
    editModal.classList.add('active');
}

function openEdit(productId) {
    const product = findProduct(productId);
    if (!product) return;
    editingProductId = product.id;
    setEditorMode(false);
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    const link = product.imageLink || (isHttpUrl(product.image) ? product.image : '');
    editImage.value = link;
    setEditMessage('');
    updatePreview(link);
    editModal.classList.add('active');
}

function closeEdit() {
    editModal.classList.remove('active');
}

async function saveProduct(event) {
    event.preventDefault();
    if (!db || !auth || !auth.currentUser) {
        setEditMessage('Inicia sesión como administrador para guardar.', 'error');
        return;
    }
    const creating = editingProductId == null;
    const existing = creating ? null : findProduct(editingProductId);
    if (!creating && !existing) return;

    const name = document.getElementById('editName').value.replace(/\s+/g, ' ').trim();
    const price = Number(document.getElementById('editPrice').value);
    const imageInput = editImage.value.trim();
    const category = creating ? document.getElementById('editCategory').value : existing.category;
    if (!name) {
        setEditMessage('Escribe el nombre del producto.', 'error');
        return;
    }
    if (!Number.isFinite(price) || price < 0) {
        setEditMessage('Escribe un precio válido.', 'error');
        return;
    }
    if (category !== 'tenderos' && category !== 'restaurantes') {
        setEditMessage('Elige Tenderos o Restaurantes.', 'error');
        return;
    }

    let image = creating ? '🌶️' : existing.image;
    let imageLink = creating ? '' : (existing.imageLink || '');
    if (imageInput) {
        const resolved = resolveImageUrl(imageInput);
        if (!resolved) {
            setEditMessage('Pega un enlace https de Google Drive o de una imagen.', 'error');
            return;
        }
        image = resolved;
        imageLink = imageInput;
    }

    const payload = {
        id: creating ? nextProductId() : existing.id,
        name,
        price: Math.round(price),
        unit: category === 'tenderos' ? 'docena' : 'libra',
        image,
        imageLink,
        category
    };
    const button = document.getElementById('saveBtn');
    button.disabled = true;
    button.textContent = 'Guardando...';
    applyRemoteProduct(payload);
    renderProducts();

    try {
        await db.collection('products').doc(String(payload.id)).set(payload);
        setEditMessage(creating ? 'Producto creado. Ya se ve en la app de pedidos.' : 'Guardado. Ya se ve en la app de pedidos.', 'ok');
        closeEdit();
    } catch (error) {
        if (creating) removeProduct(payload.id, payload.category);
        else applyRemoteProduct(existing);
        renderProducts();
        const denied = error && (error.code === 'permission-denied' || error.code === 'unauthenticated');
        setEditMessage(denied
            ? 'No se pudo guardar. Publica firestore.rules para permitir usuarios autenticados.'
            : 'No se pudo guardar. Revisa tu conexión.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = creating ? 'Crear producto' : 'Guardar cambios';
    }
}

function initFirebase() {
    if (!firebaseReady()) {
        setLoginMessage('Falta la configuración de Firebase.', 'error');
        return;
    }
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    auth.onAuthStateChanged((user) => {
        if (user) showEditor(user.email);
        else showLogin();
    });

    db.collection('products').onSnapshot((snapshot) => {
        snapshot.forEach((doc) => applyRemoteProduct(doc.data()));
        if (!editorView.hidden) renderProducts();
    }, () => {
        setLoginMessage('No se pudieron leer los productos. Revisa que Firestore esté creado.', 'error');
    });
}
