<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Savory. — Good food. Good mood.')</title>
    <style>
        [hidden] {
    display: none !important;
}
* { box-sizing: border-box; }
        :root {
            --green: #284433;
            --cream: #fbf8f2;
            --orange: #c86640;
            --text: #243329;
            --muted: #777c72;
            --white: #fff;
            --border: #e8e3d9;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
            margin: 0;
            background: var(--cream);
            color: var(--text);
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
        }
        a { color: inherit; text-decoration: none; }
        button, input, select, textarea { font: inherit; }
        button, .button { cursor: pointer; }
        img { max-width: 100%; display: block; }
        .container { width: min(1160px, calc(100% - 40px)); margin: auto; }

        .site-header {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(251,248,242,.96);
            border-bottom: 1px solid var(--border);
            backdrop-filter: blur(12px);
        }
        .header-inner {
            min-height: 82px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
        }
        .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: var(--green);
            font-size: 27px;
            font-weight: 800;
            letter-spacing: -1.5px;
        }
        .brand-mark {
            display: grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--green);
            color: white;
            font-size: 20px;
        }
        .main-nav { display: flex; align-items: center; gap: 30px; }
        .main-nav a { font-size: 14px; font-weight: 600; }
        .main-nav a:hover, .text-link:hover { color: var(--orange); }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .cart-trigger {
            border: 1px solid var(--green);
            border-radius: 30px;
            background: var(--green);
            color: white;
            padding: 10px 17px;
            font-weight: 700;
        }
        .cart-count {
            display: inline-grid;
            place-items: center;
            min-width: 22px;
            height: 22px;
            margin-left: 5px;
            padding: 0 5px;
            border-radius: 20px;
            background: white;
            color: var(--green);
            font-size: 12px;
        }

        main { min-height: 60vh; }
        .section { padding: 76px 0; }
        .eyebrow {
            color: var(--orange);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        h1, h2, h3, p { margin-top: 0; }
        h1, h2, h3 { line-height: 1.15; color: var(--green); }
        h1 { font-size: clamp(40px, 6vw, 70px); letter-spacing: -2.5px; }
        h2 { font-size: clamp(30px, 4vw, 44px); letter-spacing: -1.5px; }
        .muted { color: var(--muted); }
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: 1px solid var(--green);
            border-radius: 30px;
            padding: 12px 22px;
            background: var(--green);
            color: white;
            font-weight: 700;
            transition: transform .2s, background .2s;
        }
        .button:hover { transform: translateY(-2px); background: #1d3527; }
        .button-secondary { background: transparent; color: var(--green); }
        .button-secondary:hover { color: white; }
        .button-orange { background: var(--orange); border-color: var(--orange); }
        .button-small { padding: 8px 15px; font-size: 13px; }
        .page-heading { padding: 60px 0 25px; }
        .page-heading h1 { margin-bottom: 12px; font-size: clamp(36px, 5vw, 54px); }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
        }
        .product-card {
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 18px;
            background: white;
        }
        .product-image {
            display: block;
            width: 100%;
            aspect-ratio: 1.2;
            object-fit: cover;
            background: #eee8dc;
        }
        .product-content { padding: 18px; }
        .product-category {
            color: var(--orange);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }
        .product-content h3 { margin: 7px 0; font-size: 21px; }
        .product-description {
            min-height: 48px;
            margin-bottom: 14px;
            color: var(--muted);
            font-size: 13px;
        }
        .product-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .product-price { color: var(--green); font-size: 19px; font-weight: 800; }
        .product-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }

        .site-footer {
            margin-top: 60px;
            padding: 48px 0 24px;
            background: var(--green);
            color: #f8f5ee;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 40px;
            padding-bottom: 35px;
        }
        .footer-brand { color: white; }
        .site-footer p, .site-footer a { color: #d7dfd7; font-size: 14px; }
        .site-footer h3 { color: white; font-size: 16px; }
        .footer-links { display: grid; gap: 8px; }
        .footer-bottom {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,.2);
            color: #d7dfd7;
            font-size: 12px;
        }

        .cart-overlay {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(15,25,18,.45);
            opacity: 0;
            visibility: hidden;
            transition: .25s;
        }
        .cart-overlay.open { opacity: 1; visibility: visible; }
        .cart-drawer {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            width: min(440px, 100%);
            height: 100%;
            padding: 26px;
            background: var(--cream);
            transform: translateX(100%);
            transition: transform .25s;
        }
        .cart-overlay.open .cart-drawer { transform: translateX(0); }
        .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 18px;
            border-bottom: 1px solid var(--border);
        }
        .cart-header h2 { margin: 0; font-size: 26px; }
        .icon-button {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            border: 1px solid var(--border);
            border-radius: 50%;
            background: white;
            color: var(--green);
            font-size: 22px;
        }
        .cart-items { flex: 1; overflow-y: auto; padding: 12px 0; }
        .cart-item {
            display: grid;
            grid-template-columns: 68px 1fr auto;
            align-items: center;
            gap: 12px;
            padding: 14px 0;
            border-bottom: 1px solid var(--border);
        }
        .cart-item img { width: 68px; height: 68px; object-fit: cover; border-radius: 10px; }
        .cart-item h3 { margin: 0 0 4px; font-size: 15px; }
        .cart-item p { margin: 0; font-size: 13px; color: var(--muted); }
        .quantity-controls { display: flex; align-items: center; gap: 9px; margin-top: 6px; }
        .quantity-controls button {
            width: 25px; height: 25px; border: 1px solid var(--border);
            border-radius: 50%; background: white;
        }
        .remove-item { border: 0; background: transparent; color: var(--orange); font-size: 12px; }
        .cart-summary { padding-top: 18px; border-top: 1px solid var(--border); }
        .cart-total { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 18px; font-weight: 800; }
        .cart-summary .button { width: 100%; }
        .empty-cart { padding: 40px 0; text-align: center; color: var(--muted); }

        .form-card {
            width: min(700px, 100%);
            margin: 20px auto;
            padding: 30px;
            border: 1px solid var(--border);
            border-radius: 18px;
            background: white;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-field { display: grid; gap: 6px; margin-bottom: 16px; }
        .form-field.full { grid-column: 1 / -1; }
        .form-field label { color: var(--green); font-size: 13px; font-weight: 700; }
        .form-field input, .form-field textarea, .form-field select {
            width: 100%;
            padding: 12px 13px;
            border: 1px solid var(--border);
            border-radius: 9px;
            background: #fffdfa;
            color: var(--text);
        }
        .alert { padding: 13px 16px; border-radius: 10px; margin: 16px 0; }
        .alert-error { background: #fff0ed; color: #8e2f20; }
        .alert-success { background: #eaf5eb; color: #235c31; }

        @media (max-width: 850px) {
            .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .main-nav { gap: 14px; }
            .header-inner { flex-wrap: wrap; padding: 14px 0; }
            .footer-grid { grid-template-columns: 1fr 1fr; }
            .footer-about { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
            .container { width: min(100% - 28px, 1160px); }
            .header-inner { gap: 12px; }
            .brand { font-size: 23px; }
            .brand-mark { width: 31px; height: 31px; }
            .main-nav { order: 3; width: 100%; justify-content: space-between; }
            .main-nav a { font-size: 12px; }
            .cart-trigger { padding: 8px 11px; font-size: 12px; }
            .section { padding: 50px 0; }
            .product-grid { gap: 12px; }
            .product-content { padding: 12px; }
            .product-content h3 { font-size: 17px; }
            .product-description { min-height: 0; }
            .product-bottom { align-items: flex-start; flex-direction: column; }
            .footer-grid { grid-template-columns: 1fr; gap: 25px; }
            .footer-about { grid-column: auto; }
            .footer-bottom { flex-direction: column; gap: 5px; }
            .form-card { padding: 20px; }
            .form-grid { grid-template-columns: 1fr; }
            .form-field.full { grid-column: auto; }
        }
    </style>
    @stack('styles')
</head>
<body>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="/">
            <span class="brand-mark">S.</span>
            <span>Savory.</span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/products">Our Menu</a>
            <a href="/#favorites">Favorites</a>
        </nav>


<div class="header-actions">
    <a href="/login" id="header-login-link">Log in</a>

    <a href="/account" id="header-account-link" hidden>
        My Account
    </a>

    <button
        type="button"
        id="header-logout-button"
        class="button button-secondary button-small"
        hidden
    >
        Log out
    </button>

    <button
        type="button"
        class="cart-trigger"
        onclick="openCart()"
        aria-label="Open shopping cart"
    >
        Cart <span class="cart-count" id="header-cart-count">0</span>
    </button>
</div>

    </div>
</header>

<main>
    @if (session('success'))
        <div class="container"><div class="alert alert-success">{{ session('success') }}</div></div>
    @endif
    @yield('content')
</main>

<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-about">
                <a class="brand footer-brand" href="/">
                    <span class="brand-mark" style="background:#fff;color:#284433">S.</span>
                    <span>Savory.</span>
                </a>
                <p style="max-width:360px;margin-top:16px">
                    Discover your favorites, freshly prepared and ready to enjoy.
                    Every bite brings a little happiness.
                </p>
            </div>
            <div>
                <h3>Explore</h3>
                <div class="footer-links">
                    <a href="/">Home</a>
                    <a href="/products">Our Menu</a>
                    <a href="/checkout">Checkout</a>
                </div>
            </div>
            <div>
                <h3>Your order</h3>
                <div class="footer-links">
                    <a href="/products" onclick="return true">Browse menu</a>
                    <a href="/checkout">Shopping cart</a>
                </div>
                <p style="margin-top:14px">Fresh food. Good mood.</p>
            </div>
        </div>
        <div class="footer-bottom">
            <span>© {{ date('Y') }} Savory. All rights reserved.</span>
            <span>Powered by PulseTrack</span>
        </div>
    </div>
</footer>

<div class="cart-overlay" id="cart-overlay" onclick="overlayClose(event)">
    <aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div class="cart-header">
            <h2>Your cart <span id="drawer-cart-count">(0)</span></h2>
            <button type="button" class="icon-button" onclick="closeCart()" aria-label="Close cart">×</button>
        </div>
        <div class="cart-items" id="cart-items">
            <div class="empty-cart">Your cart is empty. Let's find something delicious!</div>
        </div>
        <div class="cart-summary">
            <div class="cart-total"><span>Subtotal</span><span id="cart-total">₹0.00</span></div>
            <a href="/checkout" class="button">Continue to checkout →</a>
        </div>
    </aside>
</div>

<script>
    const CART_STORAGE_KEY = 'savory_cart';

    function readCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        renderCart();
    }

    function addToCart(product) {
        const cart = readCart();
        const existing = cart.find(item => Number(item.id) === Number(product.id));

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: Number(product.id),
                name: String(product.name),
                price: Number(product.price),
                image: String(product.image || ''),
                quantity: 1
            });
        }

        saveCart(cart);
        openCart();
    }

    function changeCartQuantity(id, change) {
        const cart = readCart();
        const item = cart.find(product => Number(product.id) === Number(id));
        if (!item) return;

        item.quantity += change;
        saveCart(cart.filter(product => product.quantity > 0));
    }

    function removeFromCart(id) {
        saveCart(readCart().filter(item => Number(item.id) !== Number(id)));
    }

    function renderCart() {
        const cart = readCart();
        const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

        document.getElementById('header-cart-count').textContent = count;
        document.getElementById('drawer-cart-count').textContent = '(' + count + ')';
        document.getElementById('cart-total').textContent = '₹' + total.toFixed(2);

        const container = document.getElementById('cart-items');
        if (!cart.length) {
            container.innerHTML = `<div class="empty-cart">Your cart is empty. Let's find something delicious!</div>`;
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${escapeHtml(item.image || 'https://placehold.co/100x100?text=Savory')}" alt="${escapeHtml(item.name)}">
                <div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>₹${Number(item.price).toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button type="button" onclick="changeCartQuantity(${Number(item.id)}, -1)" aria-label="Decrease quantity">−</button>
                        <span>${Number(item.quantity)}</span>
                        <button type="button" onclick="changeCartQuantity(${Number(item.id)}, 1)" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button type="button" class="remove-item" onclick="removeFromCart(${Number(item.id)})">Remove</button>
            </div>
        `).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[character]));
    }

    function openCart() {
        document.getElementById('cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        document.getElementById('cart-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    function overlayClose(event) {
        if (event.target.id === 'cart-overlay') closeCart();
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeCart();
    });

    document.addEventListener('DOMContentLoaded', renderCart);
    window.readCart = readCart;
    window.saveCart = saveCart;
    window.addToCart = addToCart;
    window.openCart = openCart;
    window.closeCart = closeCart;
    window.changeCartQuantity = changeCartQuantity;
    window.removeFromCart = removeFromCart;
</script>
<script>
(() => {
    const loginLink = document.getElementById('header-login-link');
    const accountLink = document.getElementById('header-account-link');
    const logoutButton = document.getElementById('header-logout-button');

    function updateAuthHeader() {
        const token = localStorage.getItem('savory_auth_token');

        loginLink.hidden = Boolean(token);
        accountLink.hidden = !token;
        logoutButton.hidden = !token;
    }

    logoutButton.addEventListener('click', async () => {
        const token = localStorage.getItem('savory_auth_token');
        logoutButton.disabled = true;
        logoutButton.textContent = 'Logging out...';

        try {
            if (token) {
                await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
            }
        } finally {
            localStorage.removeItem('savory_auth_token');
            localStorage.removeItem('savory_auth_user');
            window.location.href = '/login';
        }
    });

    updateAuthHeader();

    window.addEventListener('storage', event => {
        if (event.key === 'savory_auth_token') {
            updateAuthHeader();
        }
    });
})();
</script>
@stack('scripts')
</body>
</html>
