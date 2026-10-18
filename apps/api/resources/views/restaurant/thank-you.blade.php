@extends('layouts.restaurant')

@section('title', 'Order Confirmed — Savory.')

@section('content')
<section class="section">
    <div class="container">
        <div class="form-card" style="max-width:680px;margin:30px auto;text-align:center">
            <div style="font-size:58px;margin-bottom:16px">✓</div>

            <p class="eyebrow">THANK YOU FOR YOUR ORDER</p>
            <h1 style="margin:12px 0">You're all set!</h1>

            <p class="muted">
                Thank you for choosing Savory. Your order has been received.
            </p>

            <div style="margin:28px 0;padding:20px;background:var(--cream);border-radius:12px">
                <p class="muted">Order reference</p>

                <strong id="order-reference"
                        style="display:block;margin-top:8px;overflow-wrap:anywhere">
                    Loading...
                </strong>

                <p style="margin-top:20px">
                    Payment method: <strong>Cash on Delivery</strong>
                </p>

                <p class="muted" style="margin-top:6px">
                    Please pay when your order arrives.
                </p>

                <p style="margin-top:20px">Order total</p>
                <strong id="order-total" style="font-size:24px">—</strong>
            </div>

            <p id="confirmation-message" class="muted">
                Checking your order details...
            </p>

            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px">
                <a href="/products" class="button">Explore our menu</a>
                <a href="/account" class="button button-secondary">My account</a>
            </div>
        </div>
    </div>
</section>

<script>
(async () => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const orderId = parts[parts.length - 1];

    const reference = document.getElementById('order-reference');
    const total = document.getElementById('order-total');
    const message = document.getElementById('confirmation-message');

    // Clear the cart immediately after arriving on the successful
    // checkout redirect. Do not depend on the order-details API.
    try {
        localStorage.removeItem('savory_cart');
    } catch (error) {
        console.error('Could not clear the cart:', error);
    }

    // Refresh the cart UI using the layout's existing function,
    // if it is globally accessible.
    if (typeof window.renderCart === 'function') {
        window.renderCart();
    }

    // Explicitly reset the visible cart count and drawer.
    const headerCount = document.getElementById('header-cart-count');
    if (headerCount) {
        headerCount.textContent = '0';
    }

    const drawerCount = document.getElementById('drawer-cart-count');
    if (drawerCount) {
        drawerCount.textContent = '(0)';
    }

    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        cartTotal.textContent = '₹0.00';
    }

    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        cartItems.innerHTML =
            `<div class="empty-cart">Your cart is empty. Let's find something delicious!</div>`;
    }

    if (!orderId || orderId === 'thank-you') {
        reference.textContent = 'Not available';
        message.textContent = 'No order reference was provided.';
        return;
    }

    try {
        const token = localStorage.getItem('savory_auth_token');
        const headers = {
            Accept: 'application/json'
        };

        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        const response = await fetch(
            '/api/v1/orders/' + encodeURIComponent(orderId),
            { headers }
        );

        if (!response.ok) {
            throw new Error(
                'Your order reference is available, but the order details could not be loaded.'
            );
        }

        const result = await response.json();
        const order = result.order ?? result;

        reference.textContent =
            order.order_number ?? order.id ?? orderId;

        total.textContent =
            '₹' + Number(order.total_amount ?? 0).toFixed(2);

        message.textContent =
            'Your order has been recorded. Keep your order reference for future enquiries.';

    } catch (error) {
        // The order may still be valid even if the details API fails.
        reference.textContent = orderId;
        message.textContent = error.message;
    }
})();
</script>
@endsection